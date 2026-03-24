from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsResident, IsBoardMember, IsResidentReadBoardWrite
from .models import ViolationType, Violation, ViolationNotice, Fine, Appeal
from .serializers import (
    ViolationTypeSerializer, ViolationSerializer, ViolationNoticeSerializer,
    FineSerializer, AppealSerializer,
)


class ViolationTypeViewSet(viewsets.ModelViewSet):
    queryset = ViolationType.objects.all()
    serializer_class = ViolationTypeSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs


class ViolationViewSet(viewsets.ModelViewSet):
    queryset = Violation.objects.select_related("violation_type", "property", "reported_by", "assigned_to")
    serializer_class = ViolationSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["description", "property__unit_number", "property__address"]
    ordering_fields = ["created_at", "date_observed", "priority", "status"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        priority = self.request.query_params.get("priority")
        if priority:
            qs = qs.filter(priority=priority)
        property_id = self.request.query_params.get("property_id")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


class ViolationNoticeViewSet(viewsets.ModelViewSet):
    queryset = ViolationNotice.objects.select_related("violation", "created_by")
    serializer_class = ViolationNoticeSerializer
    permission_classes = [IsAuthenticated, IsBoardMember]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        violation_id = self.request.query_params.get("violation_id")
        if violation_id:
            qs = qs.filter(violation_id=violation_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class FineViewSet(viewsets.ModelViewSet):
    queryset = Fine.objects.select_related("violation")
    serializer_class = FineSerializer
    permission_classes = [IsAuthenticated, IsBoardMember]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        violation_id = self.request.query_params.get("violation_id")
        if violation_id:
            qs = qs.filter(violation_id=violation_id)
        return qs


class AppealViewSet(viewsets.ModelViewSet):
    queryset = Appeal.objects.select_related("violation", "filed_by", "decided_by")
    serializer_class = AppealSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        decision = self.request.query_params.get("decision")
        if decision:
            qs = qs.filter(decision=decision)
        return qs
