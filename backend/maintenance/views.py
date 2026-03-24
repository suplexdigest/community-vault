from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsResident, IsBoardMember, IsResidentReadBoardWrite
from .models import MaintenanceCategory, WorkOrder, WorkOrderComment
from .serializers import (
    MaintenanceCategorySerializer, WorkOrderSerializer, WorkOrderCommentSerializer,
)


class MaintenanceCategoryViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceCategory.objects.all()
    serializer_class = MaintenanceCategorySerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        return self.queryset.filter(community_id=community_id)


class WorkOrderViewSet(viewsets.ModelViewSet):
    queryset = WorkOrder.objects.select_related(
        "property", "requested_by", "category", "assigned_vendor", "assigned_to"
    ).prefetch_related("comments")
    serializer_class = WorkOrderSerializer
    permission_classes = [IsAuthenticated, IsResident]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "property__unit_number"]
    ordering_fields = ["created_at", "priority", "status", "scheduled_date"]

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
        serializer.save(requested_by=self.request.user)


class WorkOrderCommentViewSet(viewsets.ModelViewSet):
    queryset = WorkOrderComment.objects.select_related("author")
    serializer_class = WorkOrderCommentSerializer
    permission_classes = [IsAuthenticated, IsResident]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(work_order__community_id=community_id)
        work_order_id = self.request.query_params.get("work_order_id")
        if work_order_id:
            qs = qs.filter(work_order_id=work_order_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
