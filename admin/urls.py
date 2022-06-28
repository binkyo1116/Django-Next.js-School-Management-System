from django.urls import path

from .views import user
from .views.user import student, parent, teacher, management

urlpatterns = [
    path("user/", user.UserViewSet.as_view(), name="admin__user"),
    path("user/student/", student.StudentViewSet.as_view(), name="admin__user__student"),
    path("user/teacher/", teacher.TeacherViewSet.as_view(), name="admin__user__teacher"),
    path("user/parent/", parent.ParentViewSet.as_view(), name="admin__user__parent"),
    path("user/management/", management.ManagementViewSet.as_view(), name="admin__user__management"),
]
