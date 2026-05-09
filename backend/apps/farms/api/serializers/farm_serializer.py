from rest_framework import serializers
from apps.farms.models import Farm
from apps.provinces.models import Province


class FarmListSerializer(serializers.ModelSerializer):
    province_name = serializers.CharField(source="province.name", read_only=True)

    class Meta:
        model = Farm
        fields = ["id", "name", "province", "province_name", "location", "capacity", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]


class FarmDetailSerializer(serializers.ModelSerializer):
    province_name = serializers.CharField(source="province.name", read_only=True)

    class Meta:
        model = Farm
        fields = ["id", "name", "province", "province_name", "location", "capacity", "is_active", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class FarmCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ["name", "province", "location", "capacity"]

    def validate(self, attrs):
        if Farm.objects.filter(province=attrs["province"], name__iexact=attrs["name"]).exists():
            raise serializers.ValidationError("Farm with this name already exists in this province.")
        return attrs


class FarmUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Farm
        fields = ["name", "location", "capacity", "is_active"]
