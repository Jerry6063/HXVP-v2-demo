import secrets
from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role", "phone", "avatar"]
        read_only_fields = ["id"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "first_name", "last_name", "role", "phone"]

    def validate_role(self, value):
        if value == "production_admin":
            raise serializers.ValidationError(
                "Registration is not available for this portal."
            )
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    portal = serializers.ChoiceField(
        choices=["production", "client", "talent", "crew"]
    )


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    portal = serializers.ChoiceField(choices=["client", "talent", "crew"])
    captcha_token = serializers.CharField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8)


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
