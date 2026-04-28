from datetime import datetime
from decimal import Decimal

import stripe
from django.conf import settings as django_settings
from django.db import transaction
from django.db.models import Sum, Q
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, permissions, parsers, status, generics
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.permissions import IsProductionAdmin, IsTalent
from .models import (
    TalentProfile,
    TalentPhoto,
    Booking,
    PerformanceRecord,
    TalentTimeLog,
    TalentPayment,
    TalentAvailability,
)
from .serializers import (
    TalentProfileSerializer,
    TalentProfileListSerializer,
    TalentPhotoSerializer,
    BookingSerializer,
    PerformanceRecordSerializer,
    TalentTimeLogSerializer,
    TalentPaymentSerializer,
    TalentPaymentSummarySerializer,
    TalentAvailabilitySerializer,
)
from .emails import (
    send_booking_notification,
    send_time_logged_notification,
    send_payment_confirmation,
    send_profile_approved_notification,
)


class TalentProfileViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = TalentProfile.objects.select_related("user").prefetch_related("photos")
        availability = self.request.query_params.get("availability")
        if availability:
            qs = qs.filter(availability=availability)
        talent_type = self.request.query_params.get("talent_type")
        if talent_type:
            qs = qs.filter(talent_type=talent_type)
        approval = self.request.query_params.get("approval_status")
        if approval:
            qs = qs.filter(approval_status=approval)
        approved_only = self.request.query_params.get("approved_only")
        if approved_only == "true":
            qs = qs.filter(approval_status="approved")
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return TalentProfileListSerializer
        return TalentProfileSerializer

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @action(detail=True, methods=["post"])
    def submit_for_review(self, request, pk=None):
        profile = self.get_object()
        if profile.photos.count() == 0:
            return Response(
                {"detail": "Please upload a headshot before submitting your profile for review."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        profile.approval_status = TalentProfile.ApprovalStatus.PENDING
        profile.profile_submitted_at = timezone.now()
        profile.save()
        return Response(TalentProfileSerializer(profile, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        profile = self.get_object()
        profile.approval_status = TalentProfile.ApprovalStatus.APPROVED
        profile.approved_at = timezone.now()
        profile.admin_notes = request.data.get("admin_notes", "")
        profile.save()
        send_profile_approved_notification(profile)
        return Response(TalentProfileSerializer(profile, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        profile = self.get_object()
        profile.approval_status = TalentProfile.ApprovalStatus.REJECTED
        profile.admin_notes = request.data.get("admin_notes", "")
        profile.save()
        return Response(TalentProfileSerializer(profile, context={"request": request}).data)

    @action(detail=True, methods=["post"])
    def create_stripe_account(self, request, pk=None):
        profile = self.get_object()
        user = request.user
        if user.role == "talent" and profile.user_id != user.id:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        stripe.api_key = django_settings.STRIPE_SECRET_KEY
        try:
            if not profile.stripe_account_id:
                account = stripe.Account.create(
                    type="express",
                    country="US",
                    email=profile.user.email,
                    capabilities={
                        "card_payments": {"requested": True},
                        "transfers": {"requested": True},
                    },
                )
                profile.stripe_account_id = account["id"]
                profile.save(update_fields=["stripe_account_id"])
            if user.role == "talent":
                refresh_url = f"{django_settings.FRONTEND_URL}/talent/payments?tab=payout&refresh=1"
                return_url = f"{django_settings.FRONTEND_URL}/talent/payments?tab=payout&success=1"
            else:
                refresh_url = f"{django_settings.FRONTEND_URL}/production/talent-payments"
                return_url = f"{django_settings.FRONTEND_URL}/production/talent-payments"
            link = stripe.AccountLink.create(
                account=profile.stripe_account_id,
                refresh_url=refresh_url,
                return_url=return_url,
                type="account_onboarding",
            )
        except stripe.error.StripeError as e:
            return Response({"detail": str(e.user_message or e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"url": link["url"], "stripe_account_id": profile.stripe_account_id})

    @action(detail=True, methods=["get"])
    def stripe_account_status(self, request, pk=None):
        profile = self.get_object()
        user = request.user
        if user.role == "talent" and profile.user_id != user.id:
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        if not profile.stripe_account_id:
            return Response({"stripe_account_id": None, "onboarding_complete": False})
        stripe.api_key = django_settings.STRIPE_SECRET_KEY
        account = stripe.Account.retrieve(profile.stripe_account_id)
        complete = bool(
            account.get("details_submitted")
            and account.get("payouts_enabled")
        )
        if complete != profile.stripe_onboarding_complete:
            profile.stripe_onboarding_complete = complete
            profile.save(update_fields=["stripe_onboarding_complete"])
        return Response({
            "stripe_account_id": profile.stripe_account_id,
            "onboarding_complete": complete,
            "details_submitted": account.get("details_submitted"),
            "payouts_enabled": account.get("payouts_enabled"),
        })

    @action(detail=False, methods=["get"], url_path="mine")
    def mine(self, request):
        """Return (or auto-create) the calling talent user's profile."""
        if request.user.role != "talent":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        TalentProfile.objects.get_or_create(user=request.user)
        profile = (
            TalentProfile.objects
            .select_related("user")
            .prefetch_related("photos")
            .get(user=request.user)
        )
        return Response(TalentProfileSerializer(profile, context={"request": request}).data)

    def perform_update(self, serializer):
        """When a talent edits their own profile, reset approval to pending.
        Block save if no headshot has been uploaded."""
        if self.request.user.role == "talent":
            if serializer.instance.photos.count() == 0:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({"detail": "Please upload a headshot before saving your profile."})
        instance = serializer.save()
        if self.request.user.role == "talent":
            instance.approval_status = TalentProfile.ApprovalStatus.PENDING
            instance.profile_submitted_at = timezone.now()
            instance.save(update_fields=["approval_status", "profile_submitted_at"])

    @action(
        detail=True,
        methods=["post"],
        parser_classes=[parsers.MultiPartParser, parsers.FormParser],
    )
    def upload_photo(self, request, pk=None):
        profile = self.get_object()
        image = request.FILES.get("image")
        if not image:
            return Response({"detail": "No image provided"}, status=status.HTTP_400_BAD_REQUEST)
        caption = request.data.get("caption", "")
        is_primary = request.data.get("is_primary", "false").lower() == "true"
        if is_primary:
            profile.photos.update(is_primary=False)
        photo = TalentPhoto.objects.create(
            profile=profile, image=image, caption=caption, is_primary=is_primary
        )
        return Response(
            TalentPhotoSerializer(photo, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="photos/(?P<photo_id>[^/.]+)/set_primary")
    def set_primary_photo(self, request, pk=None, photo_id=None):
        profile = self.get_object()
        try:
            photo = profile.photos.get(id=photo_id)
            profile.photos.update(is_primary=False)
            photo.is_primary = True
            photo.save()
            return Response(TalentPhotoSerializer(photo, context={"request": request}).data)
        except TalentPhoto.DoesNotExist:
            return Response({"detail": "Photo not found"}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=["delete"], url_path="photos/(?P<photo_id>[^/.]+)")
    def delete_photo(self, request, pk=None, photo_id=None):
        profile = self.get_object()
        try:
            photo = profile.photos.get(id=photo_id)
            photo.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except TalentPhoto.DoesNotExist:
            return Response({"detail": "Photo not found"}, status=status.HTTP_404_NOT_FOUND)


class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Booking.objects.select_related("talent__user", "shoot__project")
        user = self.request.user
        if user.role == "talent":
            qs = qs.filter(talent__user=user)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(shoot__project_id=project)
        talent = self.request.query_params.get("talent")
        if talent:
            qs = qs.filter(talent_id=talent)
        return qs

    def perform_create(self, serializer):
        booking = serializer.save()
        send_booking_notification(booking)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        booking = self.get_object()
        booking.status = Booking.Status.ACCEPTED
        booking.save()
        return Response(BookingSerializer(booking).data)

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        booking = self.get_object()
        booking.status = Booking.Status.DECLINED
        booking.save()
        return Response(BookingSerializer(booking).data)


class PerformanceRecordViewSet(viewsets.ModelViewSet):
    serializer_class = PerformanceRecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = PerformanceRecord.objects.select_related("talent__user", "project")
        user = self.request.user
        if user.role == "talent":
            qs = qs.filter(talent__user=user)
        talent = self.request.query_params.get("talent")
        if talent:
            qs = qs.filter(talent_id=talent)
        record_type = self.request.query_params.get("record_type")
        if record_type:
            qs = qs.filter(record_type=record_type)
        return qs

    def perform_create(self, serializer):
        talent_id = self.request.data.get("talent")
        talent = TalentProfile.objects.get(id=talent_id)
        serializer.save(talent=talent)


class TalentTimeLogViewSet(viewsets.ModelViewSet):
    serializer_class = TalentTimeLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = TalentTimeLog.objects.select_related(
            "talent__user", "project", "shoot", "booking__shoot__project"
        )
        user = self.request.user
        if user.role == "talent":
            qs = qs.filter(talent__user=user)
        talent = self.request.query_params.get("talent")
        if talent:
            qs = qs.filter(talent_id=talent)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        booking = self.request.query_params.get("booking")
        if booking:
            qs = qs.filter(booking_id=booking)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        extra = {}

        if user.role == "talent":
            profile = user.talent_profile
            extra["talent"] = profile
            extra["log_status"] = TalentTimeLog.LogStatus.PENDING

            # Auto-fill from booking if provided
            booking_id = self.request.data.get("booking")
            if booking_id:
                booking = Booking.objects.select_related("shoot__project").get(
                    id=booking_id, talent=profile
                )
                extra["booking"] = booking
                extra["shoot"] = booking.shoot
                extra["project"] = booking.shoot.project
                extra["date"] = booking.shoot.shoot_date
                if not self.request.data.get("rate_applied"):
                    extra["rate_applied"] = profile.hourly_rate
        else:
            extra["log_status"] = TalentTimeLog.LogStatus.APPROVED

        log = serializer.save(**extra)
        if not log.notified:
            send_time_logged_notification(log)
            log.notified = True
            log.save()

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        log = self.get_object()
        log.log_status = TalentTimeLog.LogStatus.APPROVED
        log.save()
        return Response(TalentTimeLogSerializer(log).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        log = self.get_object()
        log.log_status = TalentTimeLog.LogStatus.REJECTED
        log.save()
        return Response(TalentTimeLogSerializer(log).data)


class TalentPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = TalentPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = TalentPayment.objects.select_related("talent__user", "project")
        user = self.request.user
        if user.role == "talent":
            qs = qs.filter(talent__user=user)
        talent = self.request.query_params.get("talent")
        if talent:
            qs = qs.filter(talent_id=talent)
        return qs

    def perform_create(self, serializer):
        payment = serializer.save()
        # Auto-create finance Expense when linked to a project
        if payment.project:
            from apps.finance.models import Expense
            import calendar as cal
            month_name = cal.month_name[payment.period_month]
            Expense.objects.create(
                project=payment.project,
                category="talent",
                amount=payment.total_amount,
                description=f"Talent payment: {payment.talent.user.get_full_name()} \u2013 {month_name} {payment.period_year}",
                date=timezone.now().date(),
            )

    @action(detail=True, methods=["post"])
    def mark_paid(self, request, pk=None):
        payment = self.get_object()
        payment.status = TalentPayment.Status.PAID
        payment.paid_at = timezone.now()
        payment.payment_reference = request.data.get("payment_reference", "")
        payment.save()
        send_payment_confirmation(payment)
        return Response(TalentPaymentSerializer(payment).data)

    @action(detail=True, methods=["post"])
    def initiate_stripe_payout(self, request, pk=None):
        payment = self.get_object()
        if payment.status == TalentPayment.Status.PAID:
            return Response({"detail": "Payment already completed."}, status=status.HTTP_400_BAD_REQUEST)
        if payment.stripe_transfer_id:
            return Response(
                {"detail": f"A Stripe transfer has already been initiated (ID: {payment.stripe_transfer_id}). Check the Stripe dashboard for its status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        profile = payment.talent
        if not profile.stripe_account_id or not profile.stripe_onboarding_complete:
            return Response(
                {"detail": "Talent's Stripe account is not set up or onboarding is incomplete."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        stripe.api_key = django_settings.STRIPE_SECRET_KEY
        amount_cents = int(payment.total_amount * 100)
        try:
            transfer = stripe.Transfer.create(
                amount=amount_cents,
                currency="usd",
                destination=profile.stripe_account_id,
                metadata={
                    "talent_payment_id": payment.id,
                    "talent_name": profile.user.get_full_name(),
                    "project": payment.project.name if payment.project else "",
                },
            )
        except stripe.error.StripeError as e:
            if getattr(e, "code", None) in {"balance_insufficient", "insufficient_funds"}:
                return Response(
                    {
                        "detail": (
                            "Stripe reported that the platform balance is insufficient for this payout. "
                            "Please confirm the available live USD balance in the Stripe platform account "
                            "and try again."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(
                {"detail": str(e.user_message or e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Transfer created — save to DB. Wrap separately so a DB failure doesn't
        # hide the fact that money was already sent.
        try:
            payment.stripe_transfer_id = transfer["id"]
            payment.stripe_payout_status = transfer["status"]
            payment.save(update_fields=["stripe_transfer_id", "stripe_payout_status"])
            return Response(TalentPaymentSerializer(payment).data)
        except Exception as exc:
            # Transfer went through but we could not persist it — return the
            # transfer ID so the operator can reconcile manually.
            return Response(
                {
                    "detail": (
                        f"Transfer was sent successfully (ID: {transfer['id']}) but the "
                        f"portal record could not be updated: {exc}. "
                        f"Please mark this payment as paid manually."
                    ),
                    "stripe_transfer_id": transfer["id"],
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Payment summary for a specific talent (or the logged-in talent)."""
        user = request.user
        if user.role == "talent":
            try:
                profile = user.talent_profile
            except TalentProfile.DoesNotExist:
                return Response({"detail": "No profile"}, status=status.HTTP_404_NOT_FOUND)
        else:
            talent_id = request.query_params.get("talent")
            if not talent_id:
                return Response({"detail": "talent param required"}, status=status.HTTP_400_BAD_REQUEST)
            profile = TalentProfile.objects.get(id=talent_id)

        now = timezone.now()
        month, year = now.month, now.year

        time_logs_month = TalentTimeLog.objects.filter(
            talent=profile, date__month=month, date__year=year
        )
        expected = time_logs_month.aggregate(total=Sum("amount"))["total"] or Decimal("0")

        payment_month = TalentPayment.objects.filter(
            talent=profile, period_month=month, period_year=year
        ).first()
        received = payment_month.total_amount if payment_month and payment_month.status == "paid" else Decimal("0")

        total_earned = TalentTimeLog.objects.filter(talent=profile).aggregate(
            total=Sum("amount")
        )["total"] or Decimal("0")
        total_received = TalentPayment.objects.filter(
            talent=profile, status="paid"
        ).aggregate(total=Sum("total_amount"))["total"] or Decimal("0")

        data = {
            "expected_this_month": expected,
            "received_this_month": received,
            "pending_this_month": expected - received,
            "total_earned": total_earned,
            "total_received": total_received,
        }
        return Response(TalentPaymentSummarySerializer(data).data)


class TalentAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = TalentAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = TalentAvailability.objects.select_related("talent__user")
        user = self.request.user
        if user.role == "talent":
            qs = qs.filter(talent__user=user)
        talent_filter = self.request.query_params.get("talent")
        if talent_filter:
            qs = qs.filter(talent_id=talent_filter)
        month = self.request.query_params.get("month")
        year = self.request.query_params.get("year")
        if month and year:
            qs = qs.filter(date__month=int(month), date__year=int(year))
        date_from = self.request.query_params.get("date_from")
        if date_from:
            qs = qs.filter(date__gte=date_from)
        date_to = self.request.query_params.get("date_to")
        if date_to:
            qs = qs.filter(date__lte=date_to)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "talent":
            profile = user.talent_profile
            serializer.save(talent=profile)
        else:
            serializer.save()

    @action(detail=False, methods=["post"])
    def bulk_update(self, request):
        """Set availability for multiple half-day slots at once."""
        user = request.user
        if user.role == "talent":
            profile = user.talent_profile
        else:
            talent_id = request.data.get("talent")
            if not talent_id:
                return Response({"detail": "talent is required"}, status=400)
            profile = TalentProfile.objects.get(id=talent_id)

        entries = request.data.get("entries", [])
        results = []
        with transaction.atomic():
            for entry in entries:
                period = entry.get("period", "full")
                entry_date = entry["date"]

                # Clean up conflicting period entries for the same date
                if period == "full":
                    TalentAvailability.objects.filter(
                        talent=profile, date=entry_date, period__in=["am", "pm"]
                    ).delete()
                else:
                    TalentAvailability.objects.filter(
                        talent=profile, date=entry_date, period="full"
                    ).delete()

                obj, _ = TalentAvailability.objects.update_or_create(
                    talent=profile,
                    date=entry_date,
                    period=period,
                    defaults={
                        "status": entry.get("status", "available"),
                        "note": entry.get("note", ""),
                    },
                )
                results.append(TalentAvailabilitySerializer(obj).data)
        return Response(results)


class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    @csrf_exempt
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def post(self, request):
        payload = request.body
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        stripe.api_key = django_settings.STRIPE_SECRET_KEY

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, django_settings.STRIPE_WEBHOOK_SECRET
            )
        except (ValueError, stripe.error.SignatureVerificationError):
            return Response({"detail": "Invalid signature."}, status=status.HTTP_400_BAD_REQUEST)

        event_type = event["type"]
        data = event["data"]["object"]

        if event_type == "transfer.paid":
            transfer_id = data["id"]
            # Try TalentPayment first
            try:
                payment = TalentPayment.objects.get(stripe_transfer_id=transfer_id)
                payment.status = TalentPayment.Status.PAID
                payment.paid_at = timezone.now()
                payment.stripe_payout_status = "paid"
                payment.save(update_fields=["status", "paid_at", "stripe_payout_status"])
                send_payment_confirmation(payment)
            except TalentPayment.DoesNotExist:
                pass
            # Try CrewPayment
            try:
                from apps.crew.models import CrewPayment
                crew_payment = CrewPayment.objects.get(stripe_transfer_id=transfer_id)
                crew_payment.status = CrewPayment.Status.PAID
                crew_payment.paid_at = timezone.now()
                crew_payment.stripe_payout_status = "paid"
                crew_payment.save(update_fields=["status", "paid_at", "stripe_payout_status"])
            except CrewPayment.DoesNotExist:
                pass

        elif event_type == "account.updated":
            account_id = data["id"]
            complete = bool(data.get("details_submitted") and data.get("payouts_enabled"))
            TalentProfile.objects.filter(stripe_account_id=account_id).update(
                stripe_onboarding_complete=complete
            )
            from apps.crew.models import CrewProfile as CrewProfileModel
            CrewProfileModel.objects.filter(stripe_account_id=account_id).update(
                stripe_onboarding_complete=complete
            )

        return Response({"status": "ok"})
