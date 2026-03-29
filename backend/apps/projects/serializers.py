from rest_framework import serializers
from .models import (
    Project, Shoot, ActivityLog,
    CallSheet, CallSheetEntry, Checklist, ChecklistItem, ProductionLog,
    TalentConsideration, CrewConsideration,
    TalentRequirement, CrewRequirement,
)
from apps.accounts.serializers import UserSerializer


class ShootSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source='project.name', read_only=True)

    class Meta:
        model = Shoot
        fields = '__all__'


class ShootDetailSerializer(serializers.ModelSerializer):
    """Shoot with nested bookings and crew assignments for detail view."""
    project_name = serializers.CharField(source='project.name', read_only=True)
    bookings = serializers.SerializerMethodField()
    crew_assignments = serializers.SerializerMethodField()

    class Meta:
        model = Shoot
        fields = "__all__"

    def get_bookings(self, obj):
        result = []
        for b in obj.bookings.select_related("talent__user").all():
            photo = b.talent.photos.filter(is_primary=True).first() or b.talent.photos.first()
            photo_url = None
            if photo:
                request = self.context.get("request")
                photo_url = request.build_absolute_uri(photo.image.url) if request else None
            result.append({
                "id": b.id,
                "talent_id": b.talent.id,
                "talent_name": b.talent.user.get_full_name(),
                "talent_type": b.talent.talent_type,
                "photo_url": photo_url,
                "status": b.status,
                "notes": b.notes,
            })
        return result

    def get_crew_assignments(self, obj):
        result = []
        for a in obj.crew_assignments.select_related("crew__user").all():
            photo_url = None
            if a.crew.profile_photo:
                request = self.context.get("request")
                photo_url = request.build_absolute_uri(a.crew.profile_photo.url) if request else None
            result.append({
                "id": a.id,
                "crew_id": a.crew.id,
                "crew_name": a.crew.user.get_full_name(),
                "role": a.role_on_shoot or a.crew.crew_role,
                "role_display": a.role_on_shoot.replace("_", " ").title() if a.role_on_shoot else a.crew.get_crew_role_display(),
                "photo_url": photo_url,
                "status": a.status,
                "special_instructions": a.special_instructions,
            })
        return result


class ActivityLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = ActivityLog
        fields = "__all__"
        read_only_fields = ["user", "timestamp"]


class TalentRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentRequirement
        fields = "__all__"


class CrewRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CrewRequirement
        fields = "__all__"


class ProjectListSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    shoot_count = serializers.SerializerMethodField()
    talent_requirements = TalentRequirementSerializer(many=True, read_only=True)
    crew_requirements_list = CrewRequirementSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "name", "client", "client_name", "status",
            "budget", "start_date", "deadline", "shoot_count",
            "description", "location",
            "model_requirements", "crew_requirements", "other_requirements",
            "raw_material_url", "created_at",
            "talent_requirements", "crew_requirements_list",
        ]

    def get_client_name(self, obj):
        return obj.client.get_full_name() if obj.client else None

    def get_shoot_count(self, obj):
        return obj.shoots.count()


class ProjectDetailSerializer(serializers.ModelSerializer):
    client_detail = UserSerializer(source="client", read_only=True)
    shoots = ShootSerializer(many=True, read_only=True)
    activity_logs = ActivityLogSerializer(many=True, read_only=True)
    talent_requirements = TalentRequirementSerializer(many=True, read_only=True)
    crew_requirements_list = CrewRequirementSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = "__all__"


# ── Document Generator Serializers ──


class CallSheetEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CallSheetEntry
        fields = "__all__"
        read_only_fields = ["call_sheet"]


class CallSheetListSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    entry_count = serializers.SerializerMethodField()
    creator_name = serializers.SerializerMethodField()

    class Meta:
        model = CallSheet
        fields = [
            "id", "project", "project_name", "shoot", "title",
            "shoot_date", "call_time", "est_wrap_time", "location",
            "entry_count", "creator_name", "created_at",
        ]

    def get_entry_count(self, obj):
        return obj.entries.count()

    def get_creator_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None


class CallSheetDetailSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    entries = CallSheetEntrySerializer(many=True, read_only=True)
    creator_name = serializers.SerializerMethodField()

    class Meta:
        model = CallSheet
        fields = "__all__"

    def get_creator_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None


class ChecklistItemSerializer(serializers.ModelSerializer):
    completed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = ChecklistItem
        fields = "__all__"
        read_only_fields = ["checklist", "completed_by", "completed_at"]

    def get_completed_by_name(self, obj):
        return obj.completed_by.get_full_name() if obj.completed_by else None


class ChecklistListSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    item_count = serializers.SerializerMethodField()
    completed_count = serializers.SerializerMethodField()
    creator_name = serializers.SerializerMethodField()

    class Meta:
        model = Checklist
        fields = [
            "id", "project", "project_name", "title", "category",
            "description", "item_count", "completed_count",
            "creator_name", "created_at",
        ]

    def get_item_count(self, obj):
        return obj.items.count()

    def get_completed_count(self, obj):
        return obj.items.filter(is_completed=True).count()

    def get_creator_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None


class ChecklistDetailSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    items = ChecklistItemSerializer(many=True, read_only=True)
    creator_name = serializers.SerializerMethodField()

    class Meta:
        model = Checklist
        fields = "__all__"

    def get_creator_name(self, obj):
        return obj.created_by.get_full_name() if obj.created_by else None


class ProductionLogSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = ProductionLog
        fields = "__all__"
        read_only_fields = ["author"]

    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else None


class TalentConsiderationSerializer(serializers.ModelSerializer):
    talent_name = serializers.SerializerMethodField()
    talent_type = serializers.CharField(source="talent.talent_type", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    added_by_name = serializers.SerializerMethodField()
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = TalentConsideration
        fields = "__all__"
        read_only_fields = ["added_by", "added_at"]

    def get_talent_name(self, obj):
        return obj.talent.user.get_full_name()

    def get_added_by_name(self, obj):
        return obj.added_by.get_full_name() if obj.added_by else None

    def get_photo_url(self, obj):
        photo = obj.talent.photos.filter(is_primary=True).first() or obj.talent.photos.first()
        if not photo:
            return None
        request = self.context.get("request")
        return request.build_absolute_uri(photo.image.url) if request else None


class CrewConsiderationSerializer(serializers.ModelSerializer):
    crew_name = serializers.SerializerMethodField()
    crew_role = serializers.CharField(source="crew.crew_role", read_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    added_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CrewConsideration
        fields = "__all__"
        read_only_fields = ["added_by", "added_at"]

    def get_crew_name(self, obj):
        return obj.crew.user.get_full_name()

    def get_added_by_name(self, obj):
        return obj.added_by.get_full_name() if obj.added_by else None
