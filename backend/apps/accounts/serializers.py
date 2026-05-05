import secrets
from django.db import transaction
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "phone", "avatar"]
        read_only_fields = ["id"]


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "role", "phone"]

    def validate_role(self, value):
        if value == "production_admin":
            raise serializers.ValidationError(
                "Registration is not available for this portal."
            )
        return value

    def create(self, validated_data):
        user = User(
            email=validated_data["email"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            role=validated_data.get("role", ""),
            phone=validated_data.get("phone", ""),
            is_active=False,
        )
        user.set_unusable_password()
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    portal = serializers.ChoiceField(
        choices=["production", "client", "talent", "crew"]
    )


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    portal = serializers.ChoiceField(choices=["client", "talent", "crew"])


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


class EmailVerifyConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, min_length=8)


class AdminCreateClientSerializer(serializers.Serializer):
    """Production-admin only: creates a client User account with a random password."""
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        password = secrets.token_urlsafe(16)
        return User.objects.create_user(
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=password,
            role=User.Role.CLIENT,
        )


class _AdminInvitePortalUserSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=150)
    last_name = serializers.CharField(max_length=150)
    email = serializers.EmailField()

    role = None
    duplicate_error = "This email is already registered in HXVP Studio."

    def validate_email(self, value):
        email = User.objects.normalize_email(value.strip())
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError(self.duplicate_error)
        return email

    def create_profile(self, user):
        raise NotImplementedError

    def create(self, validated_data):
        with transaction.atomic():
            user = User(
                email=validated_data["email"],
                first_name=validated_data["first_name"].strip(),
                last_name=validated_data["last_name"].strip(),
                role=self.role,
                is_active=False,
            )
            user.set_unusable_password()
            user.save()
            self.create_profile(user)
        return user


class AdminInviteTalentSerializer(_AdminInvitePortalUserSerializer):
    role = User.Role.TALENT
    duplicate_error = (
        "This email is already registered in HXVP Studio. "
        "Use a different email address for this talent profile."
    )

    def create_profile(self, user):
        from apps.talent.models import TalentProfile

        TalentProfile.objects.get_or_create(user=user)


class AdminInviteCrewSerializer(_AdminInvitePortalUserSerializer):
    role = User.Role.CREW
    duplicate_error = (
        "This email is already registered in HXVP Studio. "
        "Use a different email address for this crew profile."
    )

    def create_profile(self, user):
        from apps.crew.models import CrewProfile

        CrewProfile.objects.get_or_create(user=user)
