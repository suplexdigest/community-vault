import uuid

from django.conf import settings
from django.contrib import admin
from django.core.cache import cache
from django.urls import path, include
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.throttles import LoginRateThrottle
from core.views import _2FA_CACHE_PREFIX


class TwoFactorTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that checks for 2FA before issuing tokens."""
    throttle_classes = [LoginRateThrottle]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {'detail': 'No active account found with the given credentials'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = serializer.user

        if user.two_factor_enabled:
            temp_token = uuid.uuid4().hex
            cache.set(f'{_2FA_CACHE_PREFIX}{temp_token}', user.id, timeout=300)
            return Response({
                'requires_2fa': True,
                'temp_token': temp_token,
            })

        return Response(serializer.validated_data)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/token/", TwoFactorTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/", include("core.urls")),
    path("api/properties/", include("properties.urls")),
    path("api/finances/", include("finances.urls")),
    path("api/violations/", include("violations.urls")),
    path("api/maintenance/", include("maintenance.urls")),
    path("api/meetings/", include("meetings.urls")),
    path("api/documents/", include("documents.urls")),
    path("api/architectural/", include("architectural.urls")),
    path("api/communications/", include("communications.urls")),
    path("api/amenities/", include("amenities.urls")),
    path("api/reports/", include("reports.urls")),
    path("api/notifications/", include("notifications.urls")),
]

# Serve media files
from django.conf.urls.static import static
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
else:
    from django.views.static import serve as static_serve
    from django.urls import re_path
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', static_serve, {'document_root': settings.MEDIA_ROOT}),
    ]

# Serve frontend assets and SPA catch-all in production
if not settings.DEBUG:
    from django.views.static import serve as assets_serve
    from django.views.generic import TemplateView
    from django.urls import re_path as re_path2
    from pathlib import Path

    # Find frontend dist directory (Docker or local)
    _assets_root = Path(settings.BASE_DIR) / "frontend-dist"
    if not _assets_root.exists():
        _assets_root = Path(settings.BASE_DIR).parent / "frontend" / "dist"

    # Serve /assets/ and /favicon.svg directly from frontend dist
    urlpatterns += [
        re_path2(r'^assets/(?P<path>.*)$', assets_serve, {'document_root': str(_assets_root / 'assets')}),
        re_path2(r'^favicon\.svg$', assets_serve, {'document_root': str(_assets_root), 'path': 'favicon.svg'}),
    ]

    # SPA catch-all: serve index.html for all other non-API routes
    urlpatterns += [
        re_path2(r'^(?!api/|admin/|static/|media/|assets/).*$', TemplateView.as_view(template_name='index.html')),
    ]
