from datetime import date, timedelta
from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework import viewsets, generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from apps.accounts.permissions import IsProductionAdmin, IsClient
from apps.clientportal.models import ProjectMilestone
from .models import (
    Project, Shoot, ActivityLog,
    CallSheet, CallSheetEntry, Checklist, ChecklistItem, ProductionLog,
    TalentConsideration, CrewConsideration,
    TalentRequirement, CrewRequirement,
)
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ShootSerializer,
    ShootDetailSerializer,
    ActivityLogSerializer,
    CallSheetListSerializer,
    CallSheetDetailSerializer,
    CallSheetEntrySerializer,
    ChecklistListSerializer,
    ChecklistDetailSerializer,
    ChecklistItemSerializer,
    ProductionLogSerializer,
    TalentConsiderationSerializer,
    CrewConsiderationSerializer,
    TalentRequirementSerializer,
    CrewRequirementSerializer,
)


class ProductionStatsView(generics.GenericAPIView):
    permission_classes = [IsProductionAdmin]

    def get(self, request):
        today = date.today()
        month_start = today.replace(day=1)
        active_count = Project.objects.filter(status="active").count()
        upcoming_shoots = Shoot.objects.filter(
            shoot_date__gte=today, status="scheduled"
        ).count()
        from apps.payments.models import Invoice

        revenue = (
            Invoice.objects.filter(
                invoice_date__gte=month_start,
                status=Invoice.Status.PAID,
            ).aggregate(total=Sum("total"))["total"]
            or 0
        )
        return Response(
            {
                "active_projects": active_count,
                "revenue_mtd": float(revenue),
                "upcoming_shoots": upcoming_shoots,
            }
        )


class ProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Project.objects.select_related("client")
        user = self.request.user
        if user.role == "client":
            qs = qs.filter(client=user)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ProjectDetailSerializer
        return ProjectListSerializer

    def perform_create(self, serializer):
        project = serializer.save()
        default_milestones = [
            ("pre_production", "1 - Pre-production phase"),
            ("pre_production", "Location"),
            ("pre_production", "Talent"),
            ("pre_production", "Crew"),
            ("pre_production", "Art / Props"),
            ("shooting", "2 - Production phase"),
            ("shooting", "Call sheet"),
            ("shooting", "Equipment / Props Checklist"),
            ("post_production", "3 - Post-production"),
            ("post_production", "Rough"),
            ("post_production", "Edit"),
            ("post_production", "Color"),
            ("post_production", "Revision"),
            ("post_production", "Deliver"),
        ]
        for i, (phase, title) in enumerate(default_milestones):
            ProjectMilestone.objects.create(
                project=project, phase=phase, title=title, order=i
            )

    @action(detail=True, methods=["post"])
    def archive(self, request, pk=None):
        project = self.get_object()
        project.status = Project.Status.ARCHIVED
        project.save()
        ActivityLog.objects.create(
            project=project, user=request.user, action="Project archived"
        )
        return Response(ProjectListSerializer(project).data)

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        project = self.get_object()
        project.status = Project.Status.ACTIVE
        project.save()
        ActivityLog.objects.create(
            project=project, user=request.user, action="Project activated"
        )
        return Response(ProjectListSerializer(project).data)


class ShootViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ShootDetailSerializer
        return ShootSerializer

    def get_queryset(self):
        qs = Shoot.objects.select_related("project")
        project_id = self.request.query_params.get("project")
        if project_id:
            qs = qs.filter(project_id=project_id)
        upcoming = self.request.query_params.get("upcoming")
        if upcoming:
            qs = qs.filter(shoot_date__gte=date.today(), status="scheduled")
        return qs

    @action(detail=False, methods=["get"])
    def availability(self, request):
        """Return per-person, per-half-day availability for a talent/crew list over a date range."""
        from datetime import time as dtime
        NOON = dtime(12, 0)

        def booking_periods(call_time, wrap_time):
            """Return which half-day periods a booking occupies."""
            if call_time is None:
                return {"am", "pm"}
            if call_time < NOON:
                # AM slot always blocked; PM blocked when wrap extends past noon or is unset
                if wrap_time is None or wrap_time > NOON:
                    return {"am", "pm"}
                return {"am"}
            return {"pm"}

        start_str = request.query_params.get("start_date")
        end_str = request.query_params.get("end_date")
        talent_ids_str = request.query_params.get("talent_ids", "")
        crew_ids_str = request.query_params.get("crew_ids", "")

        if not start_str or not end_str:
            return Response({"detail": "start_date and end_date required"}, status=400)

        start = date.fromisoformat(start_str)
        end = date.fromisoformat(end_str)

        talent_ids = [int(x) for x in talent_ids_str.split(",") if x.strip().isdigit()]
        crew_ids = [int(x) for x in crew_ids_str.split(",") if x.strip().isdigit()]

        # Build date list
        dates, d = [], start
        while d <= end:
            dates.append(d)
            d += timedelta(days=1)
        dates_str = [d.isoformat() for d in dates]

        people = []

        if talent_ids:
            from apps.talent.models import TalentProfile, Booking
            for profile in TalentProfile.objects.select_related("user").prefetch_related("photos").filter(id__in=talent_ids):
                # Build per-half-day booked set
                booked_slots = set()  # elements like "2026-03-07:am" / "2026-03-07:pm"
                for b in Booking.objects.select_related("shoot").filter(
                    talent=profile, status="accepted",
                    shoot__shoot_date__range=[start, end],
                ):
                    ds = b.shoot.shoot_date.isoformat()
                    for p in booking_periods(b.shoot.call_time, b.shoot.est_wrap_time):
                        booked_slots.add(f"{ds}:{p}")

                primary = profile.photos.filter(is_primary=True).first() or profile.photos.first()
                photo_url = request.build_absolute_uri(primary.image.url) if primary else None
                days = {}
                for ds in dates_str:
                    am = "booked" if f"{ds}:am" in booked_slots else (
                        "unavailable" if profile.availability == "unavailable" else "available"
                    )
                    pm = "booked" if f"{ds}:pm" in booked_slots else (
                        "unavailable" if profile.availability == "unavailable" else "available"
                    )
                    days[ds] = {"am": am, "pm": pm}
                people.append({
                    "id": profile.id,
                    "type": "talent",
                    "name": profile.user.get_full_name(),
                    "role": profile.get_talent_type_display(),
                    "photo_url": photo_url,
                    "general_availability": profile.availability,
                    "days": days,
                })

        if crew_ids:
            from apps.crew.models import CrewProfile, CrewAvailability, CrewAssignment
            for profile in CrewProfile.objects.select_related("user").filter(id__in=crew_ids):
                # Build per-half-day assigned set from accepted assignments
                assigned_slots = set()
                for a in CrewAssignment.objects.select_related("shoot").filter(
                    crew=profile, status="accepted",
                    shoot__shoot_date__range=[start, end],
                ):
                    ds = a.shoot.shoot_date.isoformat()
                    for p in booking_periods(a.shoot.call_time, a.shoot.est_wrap_time):
                        assigned_slots.add(f"{ds}:{p}")

                # Explicit crew availability entries (period-aware)
                explicit = {}  # key: "date:am" or "date:pm" -> status
                for av in CrewAvailability.objects.filter(crew=profile, date__range=[start, end]):
                    ds = av.date.isoformat()
                    if av.period == "full":
                        explicit[f"{ds}:am"] = av.status
                        explicit[f"{ds}:pm"] = av.status
                    else:
                        explicit[f"{ds}:{av.period}"] = av.status

                photo_url = request.build_absolute_uri(profile.profile_photo.url) if profile.profile_photo else None
                days = {}
                for ds in dates_str:
                    def _slot(key):
                        if key in assigned_slots:
                            return "booked"
                        if key in explicit:
                            return explicit[key]
                        if profile.availability == "unavailable":
                            return "unavailable"
                        return "available"
                    days[ds] = {"am": _slot(f"{ds}:am"), "pm": _slot(f"{ds}:pm")}
                people.append({
                    "id": profile.id,
                    "type": "crew",
                    "name": profile.user.get_full_name(),
                    "role": profile.get_crew_role_display(),
                    "photo_url": photo_url,
                    "general_availability": profile.availability,
                    "days": days,
                })

        return Response({"dates": dates_str, "people": people})


# ── Document Generator ViewSets ──


class CallSheetViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = CallSheet.objects.select_related("project", "created_by").prefetch_related(
            "entries"
        )
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        shoot = self.request.query_params.get("shoot")
        if shoot:
            qs = qs.filter(shoot_id=shoot)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return CallSheetDetailSerializer
        return CallSheetListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def add_entry(self, request, pk=None):
        call_sheet = self.get_object()
        ser = CallSheetEntrySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        ser.save(call_sheet=call_sheet)
        return Response(
            CallSheetDetailSerializer(call_sheet).data
        )

    @action(detail=True, methods=["delete"], url_path="entries/(?P<entry_id>[^/.]+)")
    def remove_entry(self, request, pk=None, entry_id=None):
        call_sheet = self.get_object()
        call_sheet.entries.filter(id=entry_id).delete()
        return Response(
            CallSheetDetailSerializer(call_sheet).data
        )

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        """Email this call sheet to selected talent and crew."""
        import re
        from apps.talent.models import TalentProfile
        from apps.crew.models import CrewProfile
        from .emails import send_call_sheet_email

        email_re = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
        call_sheet = self.get_object()
        talent_ids = request.data.get("talent_profile_ids", [])
        crew_ids = request.data.get("crew_profile_ids", [])
        sent = 0
        failed = 0
        failed_recipients = []
        skipped = 0
        skipped_recipients = []

        profiles = []
        for profile in TalentProfile.objects.select_related("user").filter(id__in=talent_ids):
            profiles.append(profile)
        for profile in CrewProfile.objects.select_related("user").filter(id__in=crew_ids):
            profiles.append(profile)

        for profile in profiles:
            email = profile.user.email
            name = profile.user.get_full_name()
            if not email or not email_re.match(email):
                skipped += 1
                skipped_recipients.append(name)
                continue
            ok = send_call_sheet_email(call_sheet, email, name)
            if ok:
                sent += 1
            else:
                failed += 1
                failed_recipients.append(name)

        return Response({
            "sent": sent,
            "failed": failed,
            "failed_recipients": failed_recipients,
            "skipped": skipped,
            "skipped_recipients": skipped_recipients,
        })

    @action(detail=True, methods=["post"])
    def generate_from_shoot(self, request, pk=None):
        """Auto-populate a call sheet from shoot + assigned talent/crew."""
        call_sheet = self.get_object()
        shoot = call_sheet.shoot
        if not shoot:
            return Response({"detail": "No shoot linked"}, status=400)

        entries_created = []
        for booking in shoot.bookings.filter(status="accepted"):
            entry, created = CallSheetEntry.objects.get_or_create(
                call_sheet=call_sheet,
                person_type="talent",
                name=booking.talent.user.get_full_name(),
                defaults={
                    "role": booking.talent.get_talent_type_display(),
                    "call_time": shoot.call_time,
                    "notes": booking.attire_requirements or "",
                },
            )
            if created:
                entries_created.append(entry)

        for assignment in shoot.crew_assignments.filter(status="accepted"):
            entry, created = CallSheetEntry.objects.get_or_create(
                call_sheet=call_sheet,
                person_type="crew",
                name=assignment.crew.user.get_full_name(),
                defaults={
                    "role": assignment.crew.get_crew_role_display(),
                    "call_time": shoot.call_time,
                    "notes": assignment.special_instructions or "",
                },
            )
            if created:
                entries_created.append(entry)

        return Response(CallSheetDetailSerializer(call_sheet).data)


class ChecklistViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Checklist.objects.select_related("project", "created_by").prefetch_related(
            "items"
        )
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ChecklistDetailSerializer
        return ChecklistListSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def add_item(self, request, pk=None):
        checklist = self.get_object()
        ser = ChecklistItemSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        max_order = checklist.items.count()
        ser.save(checklist=checklist, order=max_order)
        return Response(ChecklistDetailSerializer(checklist).data)

    @action(detail=True, methods=["post"], url_path="items/(?P<item_id>[^/.]+)/toggle")
    def toggle_item(self, request, pk=None, item_id=None):
        checklist = self.get_object()
        try:
            item = checklist.items.get(id=item_id)
        except ChecklistItem.DoesNotExist:
            return Response({"detail": "Item not found"}, status=404)

        item.is_completed = not item.is_completed
        if item.is_completed:
            item.completed_by = request.user
            item.completed_at = timezone.now()
        else:
            item.completed_by = None
            item.completed_at = None
        item.save()
        return Response(ChecklistDetailSerializer(checklist).data)

    @action(detail=True, methods=["delete"], url_path="items/(?P<item_id>[^/.]+)")
    def remove_item(self, request, pk=None, item_id=None):
        checklist = self.get_object()
        checklist.items.filter(id=item_id).delete()
        return Response(ChecklistDetailSerializer(checklist).data)


class ProductionLogViewSet(viewsets.ModelViewSet):
    serializer_class = ProductionLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = ProductionLog.objects.select_related("project", "author", "shoot")
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        log_type = self.request.query_params.get("log_type")
        if log_type:
            qs = qs.filter(log_type=log_type)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class TalentConsiderationViewSet(viewsets.ModelViewSet):
    serializer_class = TalentConsiderationSerializer
    permission_classes = [IsProductionAdmin]

    def get_queryset(self):
        qs = TalentConsideration.objects.select_related(
            "project", "talent__user", "added_by"
        )
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        talent = self.request.query_params.get("talent")
        if talent:
            qs = qs.filter(talent_id=talent)
        return qs

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


class CrewConsiderationViewSet(viewsets.ModelViewSet):
    serializer_class = CrewConsiderationSerializer
    permission_classes = [IsProductionAdmin]

    def get_queryset(self):
        qs = CrewConsideration.objects.select_related(
            "project", "crew__user", "added_by"
        )
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        crew = self.request.query_params.get("crew")
        if crew:
            qs = qs.filter(crew_id=crew)
        return qs

    def perform_create(self, serializer):
        serializer.save(added_by=self.request.user)


class TalentRequirementViewSet(viewsets.ModelViewSet):
    serializer_class = TalentRequirementSerializer
    permission_classes = [IsProductionAdmin]

    def get_queryset(self):
        qs = TalentRequirement.objects.select_related("project")
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        return qs


class CrewRequirementViewSet(viewsets.ModelViewSet):
    serializer_class = CrewRequirementSerializer
    permission_classes = [IsProductionAdmin]

    def get_queryset(self):
        qs = CrewRequirement.objects.select_related("project")
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        return qs
