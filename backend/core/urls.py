from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"communities", views.CommunityViewSet, basename="community")
router.register(r"roles", views.RoleViewSet, basename="role")
router.register(r"community-settings", views.CommunitySettingsViewSet, basename="community-settings")

urlpatterns = [
    path("register/", views.register, name="register"),
    path("profile/", views.profile, name="profile"),
    path("password-change/", views.password_change, name="password-change"),
    path("my-roles/", views.my_roles, name="my-roles"),
    path("my-communities/", views.my_communities, name="my-communities"),
    path("dashboard/stats/", views.dashboard_stats, name="dashboard-stats"),
    path("", include(router.urls)),
]
