from __future__ import annotations

from rest_framework.permissions import BasePermission, IsAuthenticated


# rest_framework's IsAdminUser checks if the user.is_staff is True or not
# But in our case, admin users are those who has is_superuser = True
class IsAdmin(BasePermission):
    def has_permission(self, request, view) -> bool:
        return IsAuthenticated().has_permission(request, view) and request.user.is_superuser


class IsStaff(BasePermission):
    def has_permission(self, request, view) -> bool:
        return IsAuthenticated().has_permission(request, view) and request.user.is_staff
