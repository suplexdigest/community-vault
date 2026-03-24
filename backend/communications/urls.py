from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"announcements", views.AnnouncementViewSet, basename="announcement")
router.register(r"emergency-alerts", views.EmergencyAlertViewSet, basename="emergency-alert")

urlpatterns = router.urls
