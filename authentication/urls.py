from django.urls import path

from .views import authenticate, unauthenticate
from .views.token import refresh as token_refresh
from .views.password import reset as password_reset, change as password_change, validate as password_validate


urlpatterns = [
    path("authenticate/", authenticate.AuthViewSet.as_view(), name="auth__authenticate"),
    path("unauthenticate/", unauthenticate.UnAuthViewSet.as_view(), name="auth__unauthenticate"),
    path("token/refresh/", token_refresh.TokenRefreshViewSet.as_view(), name="auth__token__refresh"),
    path("password/reset/", password_reset.PasswordResetViewSet.as_view(), name="auth__password__reset"),
    path("password/change/", password_change.PasswordChangeViewSet.as_view(), name="auth__password__change"),
    path("password/validate/", password_validate.PasswordValidationViewSet.as_view(), name="auth__password__validate"),
]
