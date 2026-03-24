from django.contrib import admin
from .models import NotificationPreference, NotificationLog, ReminderSchedule

admin.site.register(NotificationPreference)
admin.site.register(NotificationLog)
admin.site.register(ReminderSchedule)
