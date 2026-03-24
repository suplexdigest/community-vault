from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"categories", views.MaintenanceCategoryViewSet, basename="maintenance-category")
router.register(r"work-orders", views.WorkOrderViewSet, basename="work-order")
router.register(r"work-order-comments", views.WorkOrderCommentViewSet, basename="work-order-comment")

urlpatterns = router.urls
