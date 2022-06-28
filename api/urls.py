from django.urls import path

from .views import assignment, contact, klass, subject, user
from .views.klass import all as klass__all, assignments as klass__assignments
from .views.subject import all as subject__all
from .views.user import me as user__me


urlpatterns = [
    path("assignment/", assignment.AssignmentViewSet.as_view(), name="api__assignment"),
    path("contact/", contact.ContactViewSet.as_view(), name="api__contact"),
    path("class/", klass.ClassViewSet.as_view(), name="api__class"),
    path("class/all/", klass__all.ClassAllViewSet.as_view(), name="api__class__all"),
    path("class/assignments/", klass__assignments.ClassAssignmentsViewSet.as_view(), name="api__class__assignments"),
    path("subject/", subject.SubjectViewSet.as_view(), name="api__subject"),
    path("subject/all/", subject__all.SubjectAllViewSet.as_view(), name="api__subject__all"),
    path("user/", user.UserViewSet.as_view(), name="api__user"),
    path("user/@me/", user__me.MeViewSet.as_view(), name="api__user__@me"),
]
