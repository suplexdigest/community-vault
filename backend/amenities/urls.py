from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"amenities", views.AmenityViewSet, basename="amenity")
router.register(r"reservations", views.ReservationViewSet, basename="reservation")

urlpatterns = router.urls
