from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import (
    TalentProfile,
    TalentPhoto,
    Booking,
    PerformanceRecord,
    TalentTimeLog,
    TalentPayment,
    TalentAvailability,
)


class TalentPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = TalentPhoto
        fields = "__all__"
        read_only_fields = ["profile"]

    def get_image_url(self, obj):
        if obj.image:
            req = self.context.get("request")
            if req:
                return req.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class TalentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    photos = TalentPhotoSerializer(many=True, read_only=True)
    primary_photo = serializers.SerializerMethodField()

    class Meta:
        model = TalentProfile
        fields = "__all__"

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_primary_photo(self, obj):
        photo = obj.photos.filter(is_primary=True).first()
        if not photo:
            photo = obj.photos.first()
        if photo:
            req = self.context.get("request")
            if req and photo.image:
                return req.build_absolute_uri(photo.image.url)
            elif photo.image:
                return photo.image.url
        return None


class TalentProfileListSerializer(serializers.ModelSerializer):
    """Lighter serializer for list views and client-facing roster."""
    user = UserSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()
    photos = TalentPhotoSerializer(many=True, read_only=True)
    primary_photo = serializers.SerializerMethodField()

    class Meta:
        model = TalentProfile
        fields = [
            "id", "user", "full_name", "talent_type", "hourly_rate",
            "availability", "height", "measurements", "age", "skin_tone",
            "race_ethnicity", "gender", "performance_capability", "specializations", "bio",
            "approval_status", "primary_photo", "photos",
            "portfolio_url", "admin_notes", "profile_submitted_at", "approved_at",
        ]

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_primary_photo(self, obj):
        photo = obj.photos.filter(is_primary=True).first()
        if not photo:
            photo = obj.photos.first()
        if photo:
            req = self.context.get("request")
            if req and photo.image:
                return req.build_absolute_uri(photo.image.url)
            elif photo.image:
                return photo.image.url
        return None


class BookingSerializer(serializers.ModelSerializer):
    talent_name = serializers.SerializerMethodField()
    shoot_detail = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = "__all__"

    def get_talent_name(self, obj):
        return obj.talent.user.get_full_name()

    def get_shoot_detail(self, obj):
        from apps.projects.serializers import ShootSerializer
        return ShootSerializer(obj.shoot).data


class PerformanceRecordSerializer(serializers.ModelSerializer):
    talent_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()

    class Meta:
        model = PerformanceRecord
        fields = "__all__"
        read_only_fields = ["talent"]

    def get_talent_name(self, obj):
        return obj.talent.user.get_full_name()

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None


class TalentTimeLogSerializer(serializers.ModelSerializer):
    talent_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    shoot_date = serializers.SerializerMethodField()
    booking_detail = serializers.SerializerMethodField()

    class Meta:
        model = TalentTimeLog
        fields = "__all__"

    def get_talent_name(self, obj):
        return obj.talent.user.get_full_name()

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_shoot_date(self, obj):
        return obj.shoot.shoot_date if obj.shoot else None

    def get_booking_detail(self, obj):
        if not obj.booking:
            return None
        shoot = obj.booking.shoot
        return {
            "id": obj.booking.id,
            "shoot_date": shoot.shoot_date if shoot else None,
            "location": shoot.location if shoot else None,
            "project_name": shoot.project.name if shoot and shoot.project else None,
        }


class TalentPaymentSerializer(serializers.ModelSerializer):
    talent_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    period_label = serializers.SerializerMethodField()

    class Meta:
        model = TalentPayment
        fields = "__all__"

    def get_talent_name(self, obj):
        return obj.talent.user.get_full_name()

    def get_project_name(self, obj):
        return obj.project.name if obj.project else None

    def get_period_label(self, obj):
        import calendar
        month_name = calendar.month_name[obj.period_month]
        return f"{month_name} {obj.period_year}"


class TalentAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = TalentAvailability
        fields = "__all__"
        read_only_fields = ["talent"]


class TalentPaymentSummarySerializer(serializers.Serializer):
    expected_this_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    received_this_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    pending_this_month = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_earned = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_received = serializers.DecimalField(max_digits=12, decimal_places=2)
