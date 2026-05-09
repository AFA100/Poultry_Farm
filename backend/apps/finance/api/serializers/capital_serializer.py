from rest_framework import serializers
from apps.finance.models import Capital


class CapitalListSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = Capital
        fields = ["id", "farm", "farm_name", "amount", "investment_date", "is_approved", "created_at"]
        read_only_fields = ["id", "created_at", "is_approved"]


class CapitalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Capital
        fields = ["farm", "amount", "investment_date", "note"]

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value
