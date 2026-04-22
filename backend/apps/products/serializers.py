from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    available_quantity = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=4
    )
    total_inventory_value = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    
    class Meta:
        model = Product
        fields = [
            'id', 'user', 'name', 'description', 'sku', 'base_unit', 'amount',
            'is_active', 'available_quantity', 'total_inventory_value',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'available_quantity', 'total_inventory_value']
