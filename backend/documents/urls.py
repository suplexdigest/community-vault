from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"categories", views.DocumentCategoryViewSet, basename="document-category")
router.register(r"documents", views.DocumentViewSet, basename="document")

urlpatterns = router.urls
