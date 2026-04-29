from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.accounts.models import User
from apps.projects.models import Project
from apps.talent.models import TalentProfile
from .models import (
    ProjectRequest,
    RequestContract,
    ProjectMilestone,
    DeliverableReview,
    CommunicationMessage,
    TalentRosterShare,
    TalentRosterShareItem,
)


class RequestContractSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    signature_url = serializers.SerializerMethodField()

    class Meta:
        model = RequestContract
        fields = "__all__"
        read_only_fields = ["request"]

    def get_file_url(self, obj):
        if obj.file:
            req = self.context.get("request")
            if req:
                return req.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_signature_url(self, obj):
        if obj.signature_image:
            req = self.context.get("request")
            if req:
                return req.build_absolute_uri(obj.signature_image.url)
            return obj.signature_image.url
        return None


class ProjectRequestListSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    latest_contract = serializers.SerializerMethodField()
    client = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.CLIENT),
        required=False,
    )

    class Meta:
        model = ProjectRequest
        fields = "__all__"

    def get_client_name(self, obj):
        return obj.client.get_full_name() if obj.client else ''

    def get_latest_contract(self, obj):
        contract = obj.contracts.first()
        if contract:
            return RequestContractSerializer(
                contract, context=self.context
            ).data
        return None


class ProjectRequestDetailSerializer(serializers.ModelSerializer):
    client_detail = UserSerializer(source="client", read_only=True)
    contracts = RequestContractSerializer(many=True, read_only=True)

    class Meta:
        model = ProjectRequest
        fields = "__all__"
        read_only_fields = ["client"]  # client is set server-side via perform_create


class TalentRosterShareItemSerializer(serializers.ModelSerializer):
    talent_id = serializers.IntegerField(source="talent.id", read_only=True)
    full_name = serializers.SerializerMethodField()
    talent_type = serializers.CharField(source="talent.talent_type", read_only=True)
    hourly_rate = serializers.DecimalField(
        source="talent.hourly_rate",
        max_digits=8,
        decimal_places=2,
        read_only=True,
    )
    availability = serializers.CharField(source="talent.availability", read_only=True)
    age = serializers.IntegerField(source="talent.age", read_only=True)
    gender = serializers.CharField(source="talent.gender", read_only=True)
    race_ethnicity = serializers.CharField(source="talent.race_ethnicity", read_only=True)
    performance_capability = serializers.CharField(source="talent.performance_capability", read_only=True)
    bio = serializers.CharField(source="talent.bio", read_only=True)
    height = serializers.CharField(source="talent.height", read_only=True)
    measurements = serializers.CharField(source="talent.measurements", read_only=True)
    specializations = serializers.CharField(source="talent.specializations", read_only=True)
    portfolio_url = serializers.URLField(source="talent.portfolio_url", read_only=True)
    primary_photo = serializers.SerializerMethodField()
    photos = serializers.SerializerMethodField()

    class Meta:
        model = TalentRosterShareItem
        fields = [
            "id",
            "talent_id",
            "full_name",
            "talent_type",
            "hourly_rate",
            "availability",
            "age",
            "gender",
            "race_ethnicity",
            "performance_capability",
            "bio",
            "height",
            "measurements",
            "specializations",
            "portfolio_url",
            "primary_photo",
            "photos",
            "notes",
            "sort_order",
            "client_favorite",
            "client_note",
        ]

    def get_full_name(self, obj):
        return obj.talent.user.get_full_name()

    def get_primary_photo(self, obj):
        photo = obj.talent.photos.first()
        if not photo:
            return None
        req = self.context.get("request")
        if req:
            return req.build_absolute_uri(photo.image.url)
        return photo.image.url

    def get_photos(self, obj):
        req = self.context.get("request")
        result = []
        for photo in obj.talent.photos.all():
            if req:
                result.append(req.build_absolute_uri(photo.image.url))
            else:
                result.append(photo.image.url)
        return result


class TalentRosterShareSerializer(serializers.ModelSerializer):
    project_name = serializers.SerializerMethodField()
    client_name = serializers.SerializerMethodField()
    shared_by_name = serializers.SerializerMethodField()
    pdf_url = serializers.SerializerMethodField()
    talent_details = TalentRosterShareItemSerializer(source="items", many=True, read_only=True)

    class Meta:
        model = TalentRosterShare
        fields = [
            "id",
            "project",
            "project_name",
            "client",
            "client_name",
            "talent_ids",
            "message",
            "shared_by",
            "shared_by_name",
            "shared_at",
            "pdf_url",
            "talent_details",
        ]
        read_only_fields = fields

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_client_name(self, obj):
        return obj.client.get_full_name()

    def get_shared_by_name(self, obj):
        return obj.shared_by.get_full_name() if obj.shared_by else None

    def get_pdf_url(self, obj):
        if not obj.pdf_file:
            return None
        req = self.context.get("request")
        if req:
            return req.build_absolute_uri(obj.pdf_file.url)
        return obj.pdf_file.url


class TalentRosterShareCreateSerializer(serializers.Serializer):
    project = serializers.PrimaryKeyRelatedField(
        queryset=Project.objects.select_related("client"),
        required=False,
        allow_null=True,
    )
    client = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role=User.Role.CLIENT),
        required=False,
        allow_null=True,
    )
    talent_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )
    message = serializers.CharField(required=False, allow_blank=True)

    def validate_talent_ids(self, value):
        deduped = list(dict.fromkeys(value))
        if TalentProfile.objects.filter(id__in=deduped).count() != len(deduped):
            raise serializers.ValidationError("One or more selected talents no longer exist.")
        return deduped

    def validate(self, attrs):
        project = attrs.get("project")
        client = attrs.get("client")

        if project and not project.client:
            raise serializers.ValidationError({"project": "This project does not have an assigned client yet."})

        if project and client and project.client_id != client.id:
            raise serializers.ValidationError({"client": "Selected client does not match the project client."})

        if project and not client:
            attrs["client"] = project.client

        if not attrs.get("client"):
            raise serializers.ValidationError({"client": "A client is required when sharing without a project."})

        return attrs


class TalentRosterShareFavoriteSerializer(serializers.Serializer):
    item_id = serializers.IntegerField(min_value=1)
    client_favorite = serializers.BooleanField()
    client_note = serializers.CharField(required=False, allow_blank=True)


class ProjectMilestoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMilestone
        fields = "__all__"


class DeliverableReviewSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = DeliverableReview
        fields = "__all__"
        read_only_fields = ["author"]

    def get_author_name(self, obj):
        return obj.author.get_full_name()


class CommunicationMessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.CharField(source="sender.role", read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = CommunicationMessage
        fields = "__all__"
        read_only_fields = ["sender", "is_from_client"]

    def get_sender_name(self, obj):
        return obj.sender.get_full_name()

    def get_reply_count(self, obj):
        if obj.parent is None:
            return obj.replies.count()
        return 0


class MessageThreadSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    sender_role = serializers.CharField(source="sender.role", read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = CommunicationMessage
        fields = "__all__"

    def get_sender_name(self, obj):
        return obj.sender.get_full_name()

    def get_replies(self, obj):
        if obj.parent is None:
            return CommunicationMessageSerializer(
                obj.replies.order_by("created_at"),
                many=True,
                context=self.context,
            ).data
        return []
