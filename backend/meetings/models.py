from django.conf import settings
from django.db import models

from core.models import Community
from properties.models import Owner


class Meeting(models.Model):
    TYPE_CHOICES = [
        ("board", "Board Meeting"),
        ("annual", "Annual Meeting"),
        ("special", "Special Meeting"),
        ("committee", "Committee Meeting"),
    ]
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="meetings")
    title = models.CharField(max_length=255)
    meeting_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="board")
    date = models.DateField()
    time = models.TimeField()
    location = models.CharField(max_length=255, blank=True, default="")
    is_virtual = models.BooleanField(default=False)
    virtual_link = models.URLField(blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="scheduled")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_meetings")

    class Meta:
        ordering = ["-date", "-time"]

    def __str__(self):
        return f"{self.title} - {self.date}"


class AgendaItem(models.Model):
    TYPE_CHOICES = [
        ("discussion", "Discussion"),
        ("vote", "Vote"),
        ("report", "Report"),
        ("other", "Other"),
    ]

    meeting = models.ForeignKey(Meeting, on_delete=models.CASCADE, related_name="agenda_items")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    sort_order = models.IntegerField(default=0)
    presenter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="presentations")
    time_allotted_minutes = models.IntegerField(default=10)
    item_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="discussion")

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.title


class Minutes(models.Model):
    meeting = models.OneToOneField(Meeting, on_delete=models.CASCADE, related_name="minutes")
    content = models.TextField()
    approved = models.BooleanField(default=False)
    approved_date = models.DateField(null=True, blank=True)
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="approved_minutes")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="created_minutes")

    class Meta:
        verbose_name_plural = "minutes"

    def __str__(self):
        return f"Minutes for {self.meeting.title}"


class Vote(models.Model):
    TYPE_CHOICES = [
        ("board_vote", "Board Vote"),
        ("homeowner_vote", "Homeowner Vote"),
    ]
    STATUS_CHOICES = [
        ("open", "Open"),
        ("closed", "Closed"),
        ("cancelled", "Cancelled"),
    ]

    community = models.ForeignKey(Community, on_delete=models.CASCADE, related_name="votes")
    meeting = models.ForeignKey(Meeting, on_delete=models.SET_NULL, null=True, blank=True, related_name="votes")
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")
    vote_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="board_vote")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    open_date = models.DateField(null=True, blank=True)
    close_date = models.DateField(null=True, blank=True)
    requires_quorum = models.BooleanField(default=True)
    quorum_percentage = models.IntegerField(default=51)

    class Meta:
        ordering = ["-open_date"]

    def __str__(self):
        return self.title


class Ballot(models.Model):
    CHOICE_OPTIONS = [
        ("yes", "Yes"),
        ("no", "No"),
        ("abstain", "Abstain"),
    ]

    vote = models.ForeignKey(Vote, on_delete=models.CASCADE, related_name="ballots")
    voter = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ballots")
    choice = models.CharField(max_length=10, choices=CHOICE_OPTIONS)
    cast_date = models.DateTimeField(auto_now_add=True)
    is_proxy = models.BooleanField(default=False)
    proxy_for = models.ForeignKey(Owner, on_delete=models.SET_NULL, null=True, blank=True, related_name="proxy_ballots")

    class Meta:
        ordering = ["-cast_date"]
        unique_together = ["vote", "voter"]

    def __str__(self):
        return f"{self.voter.email} - {self.choice} on {self.vote.title}"
