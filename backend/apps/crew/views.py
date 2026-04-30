from datetime import date, timedelta
import stripe
from django.conf import settings as django_settings
from django.db import transaction
from django.db.models import Sum, Count, Q
from django.utils import timezone
from rest_framework import viewsets, generics, permissions, parsers, status, serializers
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsProductionAdmin, IsCrew
from apps.accounts.utils import read_availability_inquiry_token
from apps.projects.models import CrewConsideration, AvailabilityInquiryStatus
from apps.projects.serializers import (
    CrewConsiderationSerializer,
    AvailabilityInquiryResponseSerializer,
)
from .models import (
    CrewProfile,
    CrewAvailability,
    CrewAssignment,
    CrewTimeLog,
    Equipment,
    EquipmentCheckout,
    Evaluation,
    CrewPayment,
)
from .serializers import (
    CrewProfileSerializer,
    CrewAvailabilitySerializer,
    CrewAssignmentSerializer,
    CrewTimeLogSerializer,
    EquipmentSerializer,
    EquipmentCheckoutSerializer,
    EvaluationSerializer,
    CrewPaymentSerializer,
)


def _create_crew_payment_for_log(log):
    defaults = {
        "crew": log.crew,
        "project": log.project,
        "period_month": log.date.month,
        "period_year": log.date.year,
        "total_hours": log.hours_worked,
        "total_amount": log.amount,
        "notes": log.notes,
    }
    payment, created = CrewPayment.objects.get_or_create(
        source_time_log=log,
        defaults=defaults,
    )

    if not created:
        update_fields = []
        for field, value in defaults.items():
            if getattr(payment, field) != value:
                setattr(payment, field, value)
                update_fields.append(field)
        if update_fields:
            payment.save(update_fields=update_fields)
        return payment

    if payment.project:
        from apps.finance.models import Expense

        Expense.objects.get_or_create(
            project=payment.project,
            category="crew",
            amount=payment.total_amount,
            date=log.date,
            description=(
                f"Crew payment: {payment.crew.user.get_full_name()} – {log.date.isoformat()}"
            ),
        )

    return payment


def _validate_crew_inquiry_token(consideration, token, expected_action):
    if not token:
        return
    payload = read_availability_inquiry_token(token)
    if not payload:
        raise serializers.ValidationError(
            {"detail": "This availability inquiry link is invalid or has expired."}
        )
    if (
        payload.get("type") != "crew"
        or payload.get("id") != consideration.id
        or payload.get("portal") != "crew"
        or payload.get("action") != expected_action
        or payload.get("version") != consideration.inquiry_token_version
    ):
        raise serializers.ValidationError(
            {"detail": "This availability inquiry link is no longer valid. Ask production to resend it."}
        )


class CrewStatsView(generics.GenericAPIView):
    permission_classes = [IsProductionAdmin]

    def get(self, request):
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)
        month_start = today.replace(day=1)

        shoots_this_week = (
            CrewAssignment.objects.filter(
                shoot__shoot_date__gte=week_start,
                shoot__shoot_date__lte=week_end,
                status="accepted",
            )
            .values("shoot")
            .distinct()
            .count()
        )

        crew_costs_month = (
            CrewAssignment.objects.filter(
                shoot__shoot_date__gte=month_start,
                shoot__shoot_date__lte=today,
                status="accepted",
            ).aggregate(total=Sum("crew__hourly_rate"))["total"]
            or 0
        )

        equipment_total = Equipment.objects.count()
        checked_out_today = Equipment.objects.filter(status="checked_out").count()

        pending_deliverables = 0
        try:
            from apps.deliverables.models import Deliverable

            pending_deliverables = Deliverable.objects.filter(
                status__in=["pending", "in_progress"]
            ).count()
        except Exception:
            pass

        return Response(
            {
                "shoots_this_week": shoots_this_week,
                "crew_hours_month": shoots_this_week * 8,
                "crew_costs_month": float(crew_costs_month),
                "equipment_total": equipment_total,
                "equipment_checked_out": checked_out_today,
                "pending_deliverables": pending_deliverables,
            }
        )


class CrewProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CrewProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = CrewProfile.objects.select_related("user")
        role = self.request.query_params.get("crew_role")
        if role:
            qs = qs.filter(crew_role=role)
        availability = self.request.query_params.get("availability")
        if availability:
            qs = qs.filter(availability=availability)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    @action(
        detail=True,
        methods=["post"],
        parser_classes=[parsers.MultiPartParser, parsers.FormParser],
    )
    def upload_photo(self, request, pk=None):
        profile = self.get_object()
        photo = request.FILES.get("photo")
        if not photo:
            return Response({"detail": "No photo provided"}, status=400)
        profile.profile_photo = photo
        profile.save()
        return Response(
            CrewProfileSerializer(profile, context={"request": request}).data
        )

    @action(detail=True, methods=["post"])
    def create_stripe_account(self, request, pk=None):
        profile = self.get_object()
        user = request.user
        if user.role == "crew" and profile.user_id != user.id:
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
            if user.role == "crew":
                refresh_url = f"{django_settings.FRONTEND_URL}/crew/payments?tab=payout&refresh=1"
                return_url = f"{django_settings.FRONTEND_URL}/crew/payments?tab=payout&success=1"
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
        if user.role == "crew" and profile.user_id != user.id:
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
        """Return (or auto-create) the calling crew user's profile."""
        if request.user.role != "crew":
            return Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        CrewProfile.objects.get_or_create(user=request.user)
        profile = CrewProfile.objects.select_related("user").get(user=request.user)
        return Response(CrewProfileSerializer(profile, context={"request": request}).data)


class CrewAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = CrewAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        qs = CrewAvailability.objects.select_related("crew__user")
        user = self.request.user
        if user.role == "crew":
            qs = qs.filter(crew__user=user)
        crew_filter = self.request.query_params.get("crew")
        if crew_filter:
            qs = qs.filter(crew_id=crew_filter)
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
        if user.role == "crew":
            profile = user.crew_profile
            serializer.save(crew=profile)
        else:
            serializer.save()

    @action(detail=False, methods=["post"])
    def bulk_update(self, request):
        """Set availability for multiple dates at once."""
        user = request.user
        if user.role == "crew":
            profile = user.crew_profile
        else:
            crew_id = request.data.get("crew")
            if not crew_id:
                return Response({"detail": "crew is required"}, status=400)
            profile = CrewProfile.objects.get(id=crew_id)

        entries = request.data.get("entries", [])
        results = []
        with transaction.atomic():
            for entry in entries:
                period = entry.get("period", "full")
                entry_date = entry["date"]

                # Clean up conflicting period entries for the same date
                if period == "full":
                    CrewAvailability.objects.filter(
                        crew=profile, date=entry_date, period__in=["am", "pm"]
                    ).delete()
                else:
                    CrewAvailability.objects.filter(
                        crew=profile, date=entry_date, period="full"
                    ).delete()

                obj, _ = CrewAvailability.objects.update_or_create(
                    crew=profile,
                    date=entry_date,
                    period=period,
                    defaults={
                        "status": entry.get("status", "available"),
                        "note": entry.get("note", ""),
                    },
                )
                results.append(CrewAvailabilitySerializer(obj).data)
        return Response(results)


class CrewAssignmentViewSet(viewsets.ModelViewSet):
    serializer_class = CrewAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CrewAssignment.objects.select_related("crew__user", "shoot__project")
        user = self.request.user
        if user.role == "crew":
            qs = qs.filter(crew__user=user)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(shoot__project_id=project)
        crew_id = self.request.query_params.get("crew")
        if crew_id and self.request.user.role != "crew":
            qs = qs.filter(crew_id=crew_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        upcoming = self.request.query_params.get("upcoming")
        if upcoming:
            qs = qs.filter(shoot__shoot_date__gte=date.today())
        past = self.request.query_params.get("past")
        if past:
            qs = qs.filter(shoot__shoot_date__lt=date.today())
        return qs

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        assignment = self.get_object()
        assignment.status = CrewAssignment.Status.ACCEPTED
        assignment.save()
        return Response(CrewAssignmentSerializer(assignment).data)

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        assignment = self.get_object()
        assignment.status = CrewAssignment.Status.DECLINED
        assignment.save()
        return Response(CrewAssignmentSerializer(assignment).data)


class CrewTimeLogViewSet(viewsets.ModelViewSet):
    serializer_class = CrewTimeLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CrewTimeLog.objects.select_related(
            "crew__user", "project", "shoot", "assignment__shoot__project", "payment"
        )
        user = self.request.user
        if user.role == "crew":
            qs = qs.filter(crew__user=user)
        crew_id = self.request.query_params.get("crew")
        if crew_id:
            qs = qs.filter(crew_id=crew_id)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        assignment = self.request.query_params.get("assignment")
        if assignment:
            qs = qs.filter(assignment_id=assignment)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        extra = {}

        if user.role == "crew":
            profile = user.crew_profile
            extra["crew"] = profile
            extra["log_status"] = CrewTimeLog.LogStatus.PENDING

            assignment_id = self.request.data.get("assignment")
            if assignment_id:
                assignment = CrewAssignment.objects.select_related("shoot__project").get(
                    id=assignment_id,
                    crew=profile,
                )
                extra["assignment"] = assignment
                extra["shoot"] = assignment.shoot
                extra["project"] = assignment.shoot.project
                extra["date"] = assignment.shoot.shoot_date
                if not self.request.data.get("rate_applied"):
                    extra["rate_applied"] = profile.hourly_rate
        else:
            extra["log_status"] = CrewTimeLog.LogStatus.APPROVED

        log = serializer.save(**extra)
        if log.log_status == CrewTimeLog.LogStatus.APPROVED:
            _create_crew_payment_for_log(log)

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        log = self.get_object()
        with transaction.atomic():
            log.log_status = CrewTimeLog.LogStatus.APPROVED
            log.save(update_fields=["log_status"])
            _create_crew_payment_for_log(log)
        return Response(CrewTimeLogSerializer(log).data)

    @action(detail=True, methods=["post"])
    def reject(self, request, pk=None):
        log = self.get_object()
        log.log_status = CrewTimeLog.LogStatus.REJECTED
        log.save(update_fields=["log_status"])
        return Response(CrewTimeLogSerializer(log).data)


class CrewAvailabilityInquiryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = CrewConsiderationSerializer
    permission_classes = [IsCrew]

    def get_queryset(self):
        qs = CrewConsideration.objects.select_related(
            "project", "crew__user", "added_by", "inquiry_sent_by"
        ).filter(crew__user=self.request.user)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(inquiry_status=status_filter)
        return qs.exclude(inquiry_status=AvailabilityInquiryStatus.UNSENT)

    def _respond(self, request, consideration, target_status, expected_action):
        payload = AvailabilityInquiryResponseSerializer(data=request.data or {})
        payload.is_valid(raise_exception=True)

        if consideration.inquiry_status == AvailabilityInquiryStatus.UNSENT:
            raise serializers.ValidationError(
                {"detail": "No availability inquiry has been sent for this project yet."}
            )

        _validate_crew_inquiry_token(
            consideration,
            payload.validated_data.get("token"),
            expected_action,
        )

        if consideration.inquiry_status == target_status:
            return Response(self.get_serializer(consideration).data)

        if consideration.inquiry_status != AvailabilityInquiryStatus.PENDING:
            raise serializers.ValidationError(
                {"detail": "This inquiry has already been responded to. Ask production to resend it to change the response."}
            )

        consideration.inquiry_status = target_status
        consideration.inquiry_responded_at = timezone.now()
        consideration.save(update_fields=["inquiry_status", "inquiry_responded_at"])
        return Response(self.get_serializer(consideration).data)

    @action(detail=True, methods=["post"])
    def accept(self, request, pk=None):
        return self._respond(
            request,
            self.get_object(),
            AvailabilityInquiryStatus.ACCEPTED,
            "accept",
        )

    @action(detail=True, methods=["post"])
    def decline(self, request, pk=None):
        return self._respond(
            request,
            self.get_object(),
            AvailabilityInquiryStatus.DECLINED,
            "decline",
        )


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all()
    serializer_class = EquipmentSerializer
    permission_classes = [IsProductionAdmin]


class EquipmentCheckoutViewSet(viewsets.ModelViewSet):
    serializer_class = EquipmentCheckoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return EquipmentCheckout.objects.select_related(
            "equipment", "crew__user", "shoot"
        )


class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Evaluation.objects.select_related(
            "subject_user", "evaluator", "project"
        )
        subject_type = self.request.query_params.get("subject_type")
        if subject_type:
            qs = qs.filter(subject_type=subject_type)
        subject_user = self.request.query_params.get("subject_user")
        if subject_user:
            qs = qs.filter(subject_user_id=subject_user)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        return qs

    def perform_create(self, serializer):
        serializer.save(evaluator=self.request.user)


class CrewPaymentViewSet(viewsets.ModelViewSet):
    serializer_class = CrewPaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CrewPayment.objects.select_related("crew__user", "project", "source_time_log")
        user = self.request.user
        if user.role == "crew":
            qs = qs.filter(crew__user=user)
        crew_filter = self.request.query_params.get("crew")
        if crew_filter:
            qs = qs.filter(crew_id=crew_filter)
        project_filter = self.request.query_params.get("project")
        if project_filter:
            qs = qs.filter(project_id=project_filter)
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
                category="crew",
                amount=payment.total_amount,
                description=f"Crew payment: {payment.crew.user.get_full_name()} \u2013 {month_name} {payment.period_year}",
                date=timezone.now().date(),
            )

    @action(detail=True, methods=["post"])
    def mark_paid(self, request, pk=None):
        payment = self.get_object()
        payment.status = CrewPayment.Status.PAID
        payment.paid_at = timezone.now()
        payment.payment_reference = request.data.get("payment_reference", "")
        payment.save()
        return Response(CrewPaymentSerializer(payment).data)

    @action(detail=True, methods=["post"])
    def initiate_stripe_payout(self, request, pk=None):
        payment = self.get_object()
        if payment.status == CrewPayment.Status.PAID:
            return Response({"detail": "Payment already completed."}, status=status.HTTP_400_BAD_REQUEST)
        if payment.stripe_transfer_id:
            return Response(
                {"detail": f"A Stripe transfer has already been initiated (ID: {payment.stripe_transfer_id}). Check the Stripe dashboard for its status."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        profile = payment.crew
        if not profile.stripe_account_id or not profile.stripe_onboarding_complete:
            return Response(
                {"detail": "Crew member's Stripe account is not set up or onboarding is incomplete."},
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
                    "crew_payment_id": payment.id,
                    "crew_name": profile.user.get_full_name(),
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
            payment.stripe_payout_status = "submitted"
            payment.status = CrewPayment.Status.PAID
            payment.paid_at = timezone.now()
            if not payment.payment_reference:
                payment.payment_reference = transfer["id"]
            payment.save(
                update_fields=[
                    "stripe_transfer_id",
                    "stripe_payout_status",
                    "status",
                    "paid_at",
                    "payment_reference",
                ]
            )
            return Response(CrewPaymentSerializer(payment).data)
        except Exception as exc:
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
