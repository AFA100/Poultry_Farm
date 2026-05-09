from rest_framework import serializers
from apps.employees.models import Employee


class EmployeeListSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = Employee
        fields = ["id", "full_name", "role", "status", "farm", "farm_name", "hire_date", "created_at"]
        read_only_fields = ["id", "created_at"]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    farm_name = serializers.CharField(source="farm.name", read_only=True)

    class Meta:
        model = Employee
        fields = ["id", "full_name", "role", "salary", "status", "farm", "farm_name", "hire_date", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class EmployeeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["full_name", "role", "salary", "farm", "hire_date"]

    def validate_salary(self, value):
        if value < 0:
            raise serializers.ValidationError("Salary cannot be negative.")
        return value


class EmployeeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ["full_name", "role", "salary", "status", "hire_date"]

    def validate_salary(self, value):
        if value < 0:
            raise serializers.ValidationError("Salary cannot be negative.")
        return value
