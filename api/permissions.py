from __future__ import annotations

from rest_framework.permissions import BasePermission, IsAuthenticated


class IsTeacherForPOSTElseIsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if request.method == "POST":
            return IsAuthenticated().has_permission(request, view) and request.user.user_type == "t"
        else:
            return IsAuthenticated().has_permission(request, view)


class IsStaffForPOSTElseIsAuthenticated(BasePermission):
    def has_permission(self, request, view):
        if request.method == "POST":
            return IsAuthenticated().has_permission(request, view) and request.user.is_staff
        else:
            return IsAuthenticated().has_permission(request, view)
