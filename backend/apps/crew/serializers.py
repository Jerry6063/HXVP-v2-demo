from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import (
    CrewProfile,
    CrewAvailability,
    CrewAssignment,
    Equipment,
    EquipmentCheckout,
    Evaluation,
    CrewPayment,
)


class CrewProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    next_shoot_date = serializers.SerializerMethodField()
    profile_photo_url = serializers.SerializerMethodField()
    crew_role_display = serializers.CharField(
        source="get_crew_role_display", read_only=True
    )

    class Meta:
        model = CrewProfile
        fields = "__all__"

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_next_shoot_date(self, obj):
        from datetime import date

        assignment = (
            obj.assignments.filter(
                shoot__shoot_date__gte=date.today(), status="accepted"
            )
            .order_by("shoot__shoot_date")
            .first()
        )
        if assignment:
            return assignment.shoot.shoot_date
        return None

    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            req = self.context.get("request")
            if req:
                return req.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None


class CrewAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = CrewAvailability
        fields = "__all__"
        read_only_fields = ["crew"]


class CrewAssignmentSerializer(serializers.ModelSerializer):
    crew_name = serializers.SerializerMethodField()
    shoot_detail = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()

    class Meta:
        model = CrewAssignment
        fields = "__all__"

    def get_crew_name(self, obj):
        return obj.crew.user.get_full_name()

    def get_shoot_detail(self, obj):
        from apps.projects.serializers import ShootSerializer

        return ShootSerializer(obj.shoot).data

    def get_project_name(self, obj):
        return obj.shoot.project.name if obj.shoot and obj.shoot.project else None


class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = "__all__"


class EquipmentCheckoutSerializer(serializers.ModelSerializer):
    equipment_name = serializers.CharField(source="equipment.name", read_only=True)
    crew_name = serializers.SerializerMethodField()

    class Meta:
        model = EquipmentCheckout
        fields = "__all__"

    def get_crew_name(self, obj):
        return obj.crew.user.get_full_name()


class EvaluationSerializer(serializers.ModelSerializer):
    subject_name = serializers.SerializerMethodField()
    evaluator_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()

    class Meta:
        model = Evaluation
        fields = "__all__"
        read_only_fields = ["evaluator"]

    def get_subject_name(self, obj):
        return obj.subject_user.get_full_name()

    def get_evaluator_name(self, obj):
        return obj.evaluator.get_full_name() if obj.evaluator else None

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None


class CrewPaymentSerializer(serializers.ModelSerializer):
    crew_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    period_label = serializers.SerializerMethodField()

    class Meta:
        model = CrewPayment
        fields = "__all__"

    def get_crew_name(self, obj):
        return obj.crew.user.get_full_name()

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_period_label(self, obj):
        import calendar
        return f"{calendar.month_name[obj.period_month]} {obj.period_year}"
