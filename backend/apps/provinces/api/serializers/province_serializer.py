from rest_framework import serializers
from apps.provinces.models import Province


class ProvinceListSerializer(serializers.ModelSerializer):
    farm_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Province
        fields = ["id", "name", "created_at", "farm_count"]
        read_only_fields = ["id", "created_at"]


class ProvinceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ["id", "name", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProvinceCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Province
        fields = ["name"]

    def validate_name(self, value):
        if Province.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError("Province with this name already exists.")
        return value
