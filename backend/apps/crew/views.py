from datetime import date, timedelta
from django.db.models import Sum, Count, Q
from rest_framework import viewsets, generics, permissions, parsers
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.accounts.permissions import IsProductionAdmin, IsCrew
from .models import (
    CrewProfile,
    CrewAvailability,
    CrewAssignment,
    Equipment,
    EquipmentCheckout,
    Evaluation,
)
from .serializers import (
    CrewProfileSerializer,
    CrewAvailabilitySerializer,
    CrewAssignmentSerializer,
    EquipmentSerializer,
    EquipmentCheckoutSerializer,
    EvaluationSerializer,
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


class CrewAvailabilityViewSet(viewsets.ModelViewSet):
    serializer_class = CrewAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

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
        for entry in entries:
            obj, _ = CrewAvailability.objects.update_or_create(
                crew=profile,
                date=entry["date"],
                period=entry.get("period", "full"),
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
