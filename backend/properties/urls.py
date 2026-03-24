from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"properties", views.PropertyViewSet, basename="property")
router.register(r"owners", views.OwnerViewSet, basename="owner")
router.register(r"residents", views.ResidentViewSet, basename="resident")
router.register(r"parking-spots", views.ParkingSpotViewSet, basename="parking-spot")

urlpatterns = router.urls
