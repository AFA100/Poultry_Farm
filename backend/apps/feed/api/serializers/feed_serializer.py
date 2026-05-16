from rest_framework import serializers
from apps.feed.models import FeedInventory, FeedTransaction


class FeedInventorySerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = FeedInventory
        fields = ["id", "farm", "farm_name", "quantity", "unit", "last_updated"]
        read_only_fields = ["id", "last_updated"]


class FeedTransactionListSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = FeedTransaction
        fields = ["id", "farm", "farm_name", "type", "quantity", "unit", "transaction_date", "note", "created_at"]
        read_only_fields = ["id", "created_at"]


class FeedTransactionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedTransaction
        fields = ["farm", "type", "quantity", "unit", "transaction_date", "note"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value


class FeedTransactionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedTransaction
        fields = ["type", "quantity", "unit", "transaction_date", "note"]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value
