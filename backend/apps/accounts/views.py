from django.contrib.auth import authenticate
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .permissions import IsProductionAdmin
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

PORTAL_ROLE_MAP = {
    "production": User.Role.PRODUCTION_ADMIN,
    "client": User.Role.CLIENT,
    "talent": User.Role.TALENT,
    "crew": User.Role.CREW,
}


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
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


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
