from rest_framework import serializers

from .models import Assessment, Payment, Vendor, BudgetCategory, Budget, Expense, ReserveFund


class AssessmentSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    property_unit = serializers.CharField(source="property.unit_number", read_only=True)

    class Meta:
        model = Assessment
        fields = "__all__"
        read_only_fields = ["id", "created_at"]

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}"


class PaymentSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    created_by_name = serializers.CharField(source="created_by.email", read_only=True)

    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ["id"]

    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}"


class VendorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = "__all__"
        read_only_fields = ["id"]


class BudgetCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetCategory
        fields = "__all__"
        read_only_fields = ["id"]


class BudgetSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_type = serializers.CharField(source="category.category_type", read_only=True)

    class Meta:
        model = Budget
        fields = "__all__"
        read_only_fields = ["id"]


class ExpenseSerializer(serializers.ModelSerializer):
    vendor_name = serializers.CharField(source="vendor.name", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.email", read_only=True)

    class Meta:
        model = Expense
        fields = "__all__"
        read_only_fields = ["id"]


class ReserveFundSerializer(serializers.ModelSerializer):
    funded_percentage = serializers.SerializerMethodField()

    class Meta:
        model = ReserveFund
        fields = "__all__"
        read_only_fields = ["id"]

    def get_funded_percentage(self, obj):
        if obj.target_amount and obj.target_amount > 0:
            return round(float(obj.current_balance) / float(obj.target_amount) * 100, 1)
        return 0
