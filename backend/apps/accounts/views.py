import logging

from django.conf import settings
from django.contrib.auth import authenticate
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .emails import send_welcome_email, send_password_reset_email, send_email_verification
from .models import User
from .permissions import IsProductionAdmin
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    AdminCreateClientSerializer,
    EmailVerifyConfirmSerializer,
)
from .utils import make_reset_token, read_reset_token, make_email_verify_token, read_email_verify_token

PORTAL_ROLE_MAP = {
    "production": User.Role.PRODUCTION_ADMIN,
    "client": User.Role.CLIENT,
    "talent": User.Role.TALENT,
    "crew": User.Role.CREW,
}

logger = logging.getLogger(__name__)


class AuthRateThrottle(AnonRateThrottle):
    """10 requests/hour per IP on auth endpoints."""
    scope = "auth"


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def _send_verification(self, user):
        token = make_email_verify_token(user.id)
        frontend_url = getattr(settings, "FRONTEND_URL", "").rstrip("/")
        verify_url = f"{frontend_url}/verify-email?token={token}"
        return send_email_verification(user, verify_url)

    def create(self, request, *args, **kwargs):
        email = (request.data.get("email") or "").strip()

        # If an unverified account already exists for this email, resend the link
        existing = User.objects.filter(email=email).first()
        if existing is not None:
            if not existing.is_active:
                sent = self._send_verification(existing)
                if not sent:
                    return Response(
                        {"detail": "Failed to send verification email. Please try again later."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
                return Response(
                    {"detail": "Verification email sent. Please check your inbox."},
                    status=status.HTTP_201_CREATED,
                )
            # Active account — return a friendly 400
            return Response(
                {"detail": "An account with this email already exists. Please sign in."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        sent = self._send_verification(user)
        if not sent:
            user.delete()
            return Response(
                {"detail": "Failed to send verification email. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(
            {"detail": "Verification email sent. Please check your inbox."},
            status=status.HTTP_201_CREATED,
        )


class EmailVerifyView(APIView):
    """Validate an email-verification token and return the user's display info."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = request.query_params.get("token", "")
        user_id = read_email_verify_token(token)
        if user_id is None:
            return Response(
                {"detail": "This verification link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(id=user_id, is_active=False)
        except User.DoesNotExist:
            return Response(
                {"detail": "This account has already been verified. Please log in."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response({"email": user.email, "first_name": user.first_name})


class EmailVerifyConfirmView(APIView):
    """Accept token + password to activate the account and return JWT tokens."""
    permission_classes = [permissions.AllowAny]
    throttle_classes = [AuthRateThrottle]

    def post(self, request):
        serializer = EmailVerifyConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        token = serializer.validated_data["token"]
        password = serializer.validated_data["password"]

        user_id = read_email_verify_token(token)
        if user_id is None:
            return Response(
                {"detail": "This verification link is invalid or has expired."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            user = User.objects.get(id=user_id, is_active=False)
        except User.DoesNotExist:
            return Response(
                {"detail": "This account has already been verified. Please log in."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(password)
        user.is_active = True
        user.save(update_fields=["password", "is_active"])

        # Auto-provision the role-specific profile so the portal isn't blank
        if user.role == User.Role.TALENT:
            from apps.talent.models import TalentProfile
            TalentProfile.objects.get_or_create(user=user)
        elif user.role == User.Role.CREW:
            from apps.crew.models import CrewProfile
            CrewProfile.objects.get_or_create(user=user)

        send_welcome_email(user)

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

        email = serializer.validated_data["email"].strip()
        portal = serializer.validated_data["portal"]

        # Always return 200 — prevents email enumeration
        expected_role = PORTAL_ROLE_MAP[portal]
        user = (
            User.objects.filter(email__iexact=email, role=expected_role, is_active=True)
            .order_by("id")
            .first()
        )

        if user is not None:
            token = make_reset_token(user.id, portal)
            frontend_url = getattr(settings, "FRONTEND_URL", "").rstrip("/")
            reset_url = f"{frontend_url}/{portal}/reset-password?token={token}"
            email_sent = send_password_reset_email(user, reset_url, portal)
            if not email_sent:
                logger.error(
                    "Password reset email failed for user_id=%s role=%s email=%s",
                    user.id,
                    portal,
                    user.email,
                )
                return Response(
                    {
                        "detail": (
                            "We couldn't send the reset email right now. "
                            "Please try again shortly."
                        )
                    },
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

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


class VerifyPaymentPasswordView(APIView):
    """Lightweight re-authentication for unlocking Stripe payouts in the portal.

    Returns 200 when the supplied password matches the authenticated user's
    password, 400 otherwise.  No tokens are issued — the frontend simply sets
    an in-memory flag to indicate the current session is payment-unlocked.
    """

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        password = request.data.get("password", "")
        if not password:
            return Response(
                {"detail": "Password is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Use the same authentication path as the login endpoint so re-verification
        # matches the credentials that were accepted at sign-in.
        verified_user = authenticate(
            request,
            username=request.user.email,
            password=password,
        )
        if verified_user is not None and verified_user.id == request.user.id:
            return Response({"verified": True})
        return Response(
            {"detail": "Incorrect password."},
            status=status.HTTP_400_BAD_REQUEST,
        )
