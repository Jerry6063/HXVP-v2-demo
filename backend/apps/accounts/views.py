from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .emails import send_welcome_email, send_password_reset_email
from .models import User
from .permissions import IsProductionAdmin
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    AdminCreateClientSerializer,
)
from .utils import verify_hcaptcha, make_reset_token, read_reset_token

PORTAL_ROLE_MAP = {
    "production": User.Role.PRODUCTION_ADMIN,
    "client": User.Role.CLIENT,
    "talent": User.Role.TALENT,
    "crew": User.Role.CREW,
}


class AuthRateThrottle(AnonRateThrottle):
    """10 requests/hour per IP on auth endpoints."""
    scope = "auth"


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def create(self, request, *args, **kwargs):
        captcha_token = request.data.get("captcha_token", "")
        if not verify_hcaptcha(captcha_token):
            return Response(
                {"detail": "CAPTCHA verification failed. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        send_welcome_email(user)
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        portal = serializer.validated_data["portal"]

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {"detail": "Invalid credentials"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        expected_role = PORTAL_ROLE_MAP[portal]
        if user.role != expected_role:
            return Response(
                {"detail": "You do not have access to this portal"},
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            }
        )


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        portal = serializer.validated_data["portal"]
        captcha_token = serializer.validated_data["captcha_token"]

        if not verify_hcaptcha(captcha_token):
            return Response(
                {"detail": "CAPTCHA verification failed. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Always return 200 — prevents email enumeration
        try:
            expected_role = PORTAL_ROLE_MAP[portal]
            user = User.objects.get(email=email, role=expected_role, is_active=True)
            token = make_reset_token(user.id, portal)
            frontend_url = getattr(settings, "FRONTEND_URL", "").rstrip("/")
            reset_url = f"{frontend_url}/{portal}/reset-password?token={token}"
            send_password_reset_email(user, reset_url, portal)
        except User.DoesNotExist:
            pass

        return Response(
            {"detail": "If that email is registered, a reset link has been sent."}
        )


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        user_id, portal = read_reset_token(token)
        if user_id is None:
            return Response(
                {"detail": "This reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user = User.objects.get(id=user_id, is_active=True)
        except User.DoesNotExist:
            return Response(
                {"detail": "This reset link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response({"detail": "Password reset successful. You can now log in."})


class UserListView(generics.ListAPIView):
    """List users, optionally filtered by role. Production admins only."""
    serializer_class = UserSerializer
    permission_classes = [IsProductionAdmin]

    def get_queryset(self):
        qs = User.objects.filter(is_active=True).order_by("first_name", "last_name")
        role = self.request.query_params.get("role")
        if role:
            qs = qs.filter(role=role)
        return qs


class AdminCreateClientView(generics.CreateAPIView):
    """Production-admin only: create a new client account."""
    serializer_class = AdminCreateClientSerializer
    permission_classes = [IsProductionAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
