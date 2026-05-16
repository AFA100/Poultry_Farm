from rest_framework import serializers
from apps.chickens.models import ChickenMovement


class ChickenMovementListSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)
    batch_id = serializers.UUIDField(source="batch.id", read_only=True)

    class Meta:
        model = ChickenMovement
        fields = ["id", "farm", "farm_name", "batch_id", "type", "quantity", "movement_date", "reason", "created_at"]
        read_only_fields = ["id", "created_at"]


class ChickenMovementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChickenMovement
        fields = ["farm", "batch", "type", "quantity", "movement_date", "reason"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value


class ChickenMovementUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChickenMovement
        fields = ["type", "quantity", "movement_date", "reason"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
