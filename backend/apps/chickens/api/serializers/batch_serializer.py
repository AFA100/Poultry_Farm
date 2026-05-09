from rest_framework import serializers
from apps.chickens.models import ChickenBatch


class ChickenBatchListSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = ChickenBatch
        fields = ["id", "farm", "farm_name", "quantity", "entry_date", "source", "cost_per_unit", "status", "created_at"]
        read_only_fields = ["id", "created_at"]


class ChickenBatchCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChickenBatch
        fields = ["farm", "quantity", "entry_date", "source", "cost_per_unit"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
