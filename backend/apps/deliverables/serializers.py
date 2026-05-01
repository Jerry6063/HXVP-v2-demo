from rest_framework import serializers
from .models import Deliverable, Contract


class DeliverableSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Deliverable
        fields = "__all__"

    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

    def get_thumbnail_url(self, obj):
        if obj.thumbnail:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.thumbnail.url)
            return obj.thumbnail.url
        return None


class ContractSerializer(serializers.ModelSerializer):
    project_name = serializers.SerializerMethodField()
    user_name = serializers.SerializerMethodField()
    user_email = serializers.SerializerMethodField()
    file_abs_url = serializers.SerializerMethodField()
    signature_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Contract
        fields = "__all__"

    def get_project_name(self, obj):
        return obj.project.name if obj.project_id else None

    def get_user_name(self, obj):
        return obj.user.get_full_name()

    def get_user_email(self, obj):
        return obj.user.email

    def get_file_abs_url(self, obj):
        if obj.file_url:
            req = self.context.get("request")
            if req:
                return req.build_absolute_uri(obj.file_url.url)
            return obj.file_url.url
        return None

    def get_signature_image_url(self, obj):
        if obj.signature_image:
            req = self.context.get("request")
            if req:
                return req.build_absolute_uri(obj.signature_image.url)
            return obj.signature_image.url
        return None
