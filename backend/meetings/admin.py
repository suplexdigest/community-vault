from django.contrib import admin

from .models import Meeting, AgendaItem, Minutes, Vote, Ballot


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ["title", "community", "meeting_type", "date", "time", "status"]
    list_filter = ["meeting_type", "status", "community"]
    search_fields = ["title"]


@admin.register(AgendaItem)
class AgendaItemAdmin(admin.ModelAdmin):
    list_display = ["title", "meeting", "item_type", "sort_order", "time_allotted_minutes"]
    list_filter = ["item_type"]


@admin.register(Minutes)
class MinutesAdmin(admin.ModelAdmin):
    list_display = ["meeting", "approved", "approved_date", "created_by"]
    list_filter = ["approved"]


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ["title", "community", "vote_type", "status", "open_date", "close_date"]
    list_filter = ["vote_type", "status", "community"]


@admin.register(Ballot)
class BallotAdmin(admin.ModelAdmin):
    list_display = ["vote", "voter", "choice", "cast_date", "is_proxy"]
    list_filter = ["choice", "is_proxy"]
