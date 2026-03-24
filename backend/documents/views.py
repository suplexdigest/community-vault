from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsResident, IsResidentReadBoardWrite
from .models import DocumentCategory, Document
from .serializers import DocumentCategorySerializer, DocumentSerializer


class DocumentCategoryViewSet(viewsets.ModelViewSet):
    queryset = DocumentCategory.objects.all()
    serializer_class = DocumentCategorySerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        return self.queryset.filter(community_id=community_id)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.select_related("category", "uploaded_by")
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated, IsResidentReadBoardWrite]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "title", "document_type"]

    def get_queryset(self):
        community_id = self.request.headers.get("X-Community-Id")
        qs = self.queryset.filter(community_id=community_id)
        document_type = self.request.query_params.get("document_type")
        if document_type:
            qs = qs.filter(document_type=document_type)
        category_id = self.request.query_params.get("category_id")
        if category_id:
            qs = qs.filter(category_id=category_id)
        is_public = self.request.query_params.get("is_public")
        if is_public is not None:
            qs = qs.filter(is_public=is_public.lower() == "true")
        return qs

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
