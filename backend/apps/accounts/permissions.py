from rest_framework.permissions import BasePermission


def is_production_admin_user(user):
    if not getattr(user, "is_authenticated", False):
        return False

    role = getattr(user, "role", None)
    # Accept legacy "production" role values and staff/superusers.
    return role in {"production_admin", "production"} or bool(
        getattr(user, "is_staff", False) or getattr(user, "is_superuser", False)
    )


class IsProductionAdmin(BasePermission):
    def has_permission(self, request, view):
        return is_production_admin_user(request.user)


class IsClient(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "client"


class IsTalent(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "talent"


class IsCrew(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "crew"
