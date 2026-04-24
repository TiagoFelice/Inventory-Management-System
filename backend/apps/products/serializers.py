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
    has_stock_entries = serializers.SerializerMethodField()

    def get_has_stock_entries(self, obj):
        prefetched = getattr(obj, '_prefetched_objects_cache', {})
        if 'stock_entries' in prefetched:
            return len(prefetched['stock_entries']) > 0
        return obj.stock_entries.exists()
    
    class Meta:
        model = Product
        fields = [
            'id', 'user', 'name', 'description', 'sku', 'base_unit', 'amount',
            'is_active', 'available_quantity', 'total_inventory_value', 'has_stock_entries',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at', 'available_quantity', 'total_inventory_value', 'has_stock_entries']
