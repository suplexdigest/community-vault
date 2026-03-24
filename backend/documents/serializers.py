from rest_framework import serializers

from .models import DocumentCategory, Document


class DocumentCategorySerializer(serializers.ModelSerializer):
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = DocumentCategory
        fields = "__all__"
        read_only_fields = ["id"]

    def get_document_count(self, obj):
        return obj.documents.count()


class DocumentSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    uploaded_by_name = serializers.CharField(source="uploaded_by.email", read_only=True)

    class Meta:
        model = Document
        fields = "__all__"
        read_only_fields = ["id", "created_at", "uploaded_by"]
