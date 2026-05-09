from rest_framework import serializers
from apps.finance.models import Expense


class ExpenseListSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "farm", "farm_name", "category", "amount", "expense_date", "is_approved", "created_at"]
        read_only_fields = ["id", "created_at", "is_approved"]


class ExpenseDetailSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = Expense
        fields = ["id", "farm", "farm_name", "category", "amount", "expense_date", "description", "is_approved", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at", "is_approved"]


class ExpenseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["farm", "category", "amount", "expense_date", "description"]

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value


class ExpenseUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = ["category", "amount", "expense_date", "description"]

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value
