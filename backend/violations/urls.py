from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"violation-types", views.ViolationTypeViewSet, basename="violation-type")
router.register(r"violations", views.ViolationViewSet, basename="violation")
router.register(r"violation-notices", views.ViolationNoticeViewSet, basename="violation-notice")
router.register(r"fines", views.FineViewSet, basename="fine")
router.register(r"appeals", views.AppealViewSet, basename="appeal")

urlpatterns = router.urls
