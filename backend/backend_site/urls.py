from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from accounts.views import GoogleLogin, email_confirmation, reset_password_confirm, check_email
from django.conf import settings
from django.conf.urls.static import static
from accounts.views import get_user_profile_data
from accounts.views import user_profile

urlpatterns = [
    path("admin/", admin.site.urls),
    path('dj-rest-auth/', include('dj_rest_auth.urls')),
    path('dj-rest-auth/registration/account-confirm-email/<str:key>/', email_confirmation),
    path('dj-rest-auth/registration/', include('dj_rest_auth.registration.urls')),
    path('reset/password/confirm/<int:uid>/<str:token>', reset_password_confirm, name="password_reset_confirm"),
    path('dj-rest-auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('accounts/', include('allauth.urls')),  # Ensure this line is included copilot added this
    path('accounts/check-email/', check_email),
    path('api/', include('api.urls')),
    path('user_data/<str:pk>',get_user_profile_data),
    path('accounts/profile/', user_profile, name="user_profile"),  # NEW: Profile update & fetch API

]

# urlpatterns += [re_path(f'^.*', TemplateView.as_view(template_name = "index.html"))]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)