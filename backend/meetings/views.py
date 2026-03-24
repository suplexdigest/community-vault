from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsResident, IsBoardMember, IsResidentReadBoardWrite
from .models import Meeting, AgendaItem, Minutes, Vote, Ballot
from .serializers import (
    MeetingSerializer, MeetingListSerializer, AgendaItemSerializer,
    MinutesSerializer, VoteSerializer, BallotSerializer,
)


class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.select_related("created_by").prefetch_related("agenda_items")
    serializer_class = MeetingSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title"]
    ordering_fields = ["date", "meeting_type", "status"]

    def get_serializer_class(self):
        if self.action == "list":
            return MeetingListSerializer
        return MeetingSerializer

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        meeting_type = self.request.query_params.get("meeting_type")
        if meeting_type:
            qs = qs.filter(meeting_type=meeting_type)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AgendaItemViewSet(viewsets.ModelViewSet):
    queryset = AgendaItem.objects.select_related("presenter")
    serializer_class = AgendaItemSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(meeting__community_id=community_id)
        meeting_id = self.request.query_params.get("meeting_id")
        if meeting_id:
            qs = qs.filter(meeting_id=meeting_id)
        return qs


class MinutesViewSet(viewsets.ModelViewSet):
    queryset = Minutes.objects.select_related("meeting", "approved_by", "created_by")
    serializer_class = MinutesSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        return self.queryset.filter(meeting__community_id=community_id)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class VoteViewSet(viewsets.ModelViewSet):
    queryset = Vote.objects.prefetch_related("ballots")
    serializer_class = VoteSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter]
    search_fields = ["title"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class BallotViewSet(viewsets.ModelViewSet):
    queryset = Ballot.objects.select_related("voter", "proxy_for")
    serializer_class = BallotSerializer
    permission_classes = [IsAuthenticated, IsResident]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(vote__community_id=community_id)
        vote_id = self.request.query_params.get("vote_id")
        if vote_id:
            qs = qs.filter(vote_id=vote_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(voter=self.request.user)
