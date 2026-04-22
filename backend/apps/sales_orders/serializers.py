from rest_framework import serializers
from .models import SalesOrder, SalesOrderItem, StockAllocation


class StockAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockAllocation
        fields = [
            'id', 'user', 'sales_order_item', 'stock_entry',
            'quantity_allocated',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class SalesOrderItemSerializer(serializers.ModelSerializer):
    total_cost = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    profit = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    margin_percent = serializers.DecimalField(
        read_only=True,
        max_digits=5,
        decimal_places=2
    )
    allocations = serializers.SerializerMethodField()
    
    class Meta:
        model = SalesOrderItem
        fields = [
            'id', 'sales_order', 'product', 'quantity', 'unit_price',
            'total_revenue', 'total_cost', 'profit', 'margin_percent',
            'allocations', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_revenue', 'total_cost', 'profit', 'margin_percent', 'allocations', 'created_at', 'updated_at']
    
    def get_allocations(self, obj):
        allocations = obj.allocations.all()
        return StockAllocationSerializer(allocations, many=True).data


class SalesOrderWriteItemSerializer(serializers.ModelSerializer):
    """Serializer for writing sales order items (nested in sales order create/update)."""
    class Meta:
        model = SalesOrderItem
        fields = ['product', 'quantity', 'unit_price']


class SalesOrderSerializer(serializers.ModelSerializer):
    items = SalesOrderItemSerializer(many=True, read_only=True)
    total_revenue = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    total_cost = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    total_profit = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    
    class Meta:
        model = SalesOrder
        fields = [
            'id', 'user', 'order_number', 'customer_name', 'status',
            'sold_at', 'notes', 'total_revenue', 'total_cost',
            'total_profit', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'total_revenue', 'total_cost', 'total_profit', 'items', 'created_at', 'updated_at']


class SalesOrderCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating sales orders with nested items."""
    items = SalesOrderWriteItemSerializer(many=True, required=False)
    total_revenue = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    total_cost = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    total_profit = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=2
    )
    
    class Meta:
        model = SalesOrder
        fields = [
            'id', 'user', 'order_number', 'customer_name', 'status',
            'sold_at', 'notes', 'total_revenue', 'total_cost',
            'total_profit', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'total_revenue', 'total_cost', 'total_profit', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        sales_order = SalesOrder.objects.create(**validated_data)
        
        for item_data in items_data:
            SalesOrderItem.objects.create(
                sales_order=sales_order,
                **item_data
            )
        
        return sales_order
    
    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        
        # Update sales order fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update items if provided
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                SalesOrderItem.objects.create(
                    sales_order=instance,
                    **item_data
                )
        
        return instance
