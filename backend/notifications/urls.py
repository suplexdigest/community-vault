from django.urls import path
from . import views

urlpatterns = [
    path("preferences/", views.NotificationPreferenceView.as_view(), name="notification-preferences"),
    path("logs/", views.NotificationLogView.as_view(), name="notification-logs"),
    path("schedule/", views.ReminderScheduleView.as_view(), name="reminder-schedule"),
]
