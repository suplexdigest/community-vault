from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"meetings", views.MeetingViewSet, basename="meeting")
router.register(r"agenda-items", views.AgendaItemViewSet, basename="agenda-item")
router.register(r"minutes", views.MinutesViewSet, basename="minutes")
router.register(r"votes", views.VoteViewSet, basename="vote")
router.register(r"ballots", views.BallotViewSet, basename="ballot")

urlpatterns = router.urls
