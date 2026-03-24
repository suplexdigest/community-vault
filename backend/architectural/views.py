from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsResident, IsResidentReadBoardWrite
from .models import ARBRequest, ARBComment
from .serializers import ARBRequestSerializer, ARBRequestListSerializer, ARBCommentSerializer


class ARBRequestViewSet(viewsets.ModelViewSet):
    queryset = ARBRequest.objects.select_related(
        "property", "owner", "reviewed_by"
    ).prefetch_related("comments")
    serializer_class = ARBRequestSerializer
    permission_classes = [IsAuthenticated, IsResident]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "property__unit_number"]
    ordering_fields = ["created_at", "status", "project_type"]

    def get_serializer_class(self):
        if self.action == "list":
            return ARBRequestListSerializer
        return ARBRequestSerializer

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        project_type = self.request.query_params.get("project_type")
        if project_type:
            qs = qs.filter(project_type=project_type)
        property_id = self.request.query_params.get("property_id")
        if property_id:
            qs = qs.filter(property_id=property_id)
        return qs


class ARBCommentViewSet(viewsets.ModelViewSet):
    queryset = ARBComment.objects.select_related("author")
    serializer_class = ARBCommentSerializer
    permission_classes = [IsAuthenticated, IsResident]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(request__community_id=community_id)
        request_id = self.request.query_params.get("request_id")
        if request_id:
            qs = qs.filter(request_id=request_id)
        return qs

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
