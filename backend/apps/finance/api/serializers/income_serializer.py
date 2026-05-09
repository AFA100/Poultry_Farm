from rest_framework import serializers
from apps.finance.models import Income


class IncomeListSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = Income
        fields = ["id", "farm", "farm_name", "source", "amount", "income_date", "is_approved", "created_at"]
        read_only_fields = ["id", "created_at", "is_approved"]


class IncomeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ["farm", "source", "amount", "income_date", "description"]

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value


class IncomeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Income
        fields = ["source", "amount", "income_date", "description"]

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value
