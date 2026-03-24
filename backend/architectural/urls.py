from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"requests", views.ARBRequestViewSet, basename="arb-request")
router.register(r"comments", views.ARBCommentViewSet, basename="arb-comment")

urlpatterns = router.urls
