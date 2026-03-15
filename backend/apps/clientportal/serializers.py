from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from apps.accounts.models import User
from .models import (
    ProjectRequest,
    RequestContract,
    ProjectMilestone,
    DeliverableReview,
    CommunicationMessage,
    TalentRosterShare,
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


class TalentRosterShareSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    shared_by_name = serializers.SerializerMethodField()
    talent_details = serializers.SerializerMethodField()

    class Meta:
        model = TalentRosterShare
        fields = "__all__"
        read_only_fields = ["shared_by", "shared_at"]

    def get_client_name(self, obj):
        return obj.client.get_full_name()

    def get_shared_by_name(self, obj):
        return obj.shared_by.get_full_name() if obj.shared_by else None

    def get_talent_details(self, obj):
        from apps.talent.models import TalentProfile
        from apps.talent.serializers import TalentProfileListSerializer
        profiles = TalentProfile.objects.filter(id__in=obj.talent_ids).select_related("user").prefetch_related("photos")
        return TalentProfileListSerializer(profiles, many=True, context=self.context).data


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
