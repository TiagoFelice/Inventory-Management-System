from rest_framework import serializers
from .models import StockEntry


class StockEntrySerializer(serializers.ModelSerializer):
    quantity_sold = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=4
    )
    purchase_order_id = serializers.SerializerMethodField()
    purchase_order_number = serializers.SerializerMethodField()

    def get_purchase_order_id(self, obj):
        if obj.source_type != 'purchase_order' or not obj.source_reference_id:
            return None

        from apps.purchase_orders.models import PurchaseOrderItem

        po_item = (
            PurchaseOrderItem.objects
            .filter(id=obj.source_reference_id, purchase_order__user=obj.user)
            .select_related('purchase_order')
            .first()
        )
        return po_item.purchase_order_id if po_item else None

    def get_purchase_order_number(self, obj):
        if obj.source_type != 'purchase_order' or not obj.source_reference_id:
            return None

        from apps.purchase_orders.models import PurchaseOrderItem

        po_item = (
            PurchaseOrderItem.objects
            .filter(id=obj.source_reference_id, purchase_order__user=obj.user)
            .select_related('purchase_order')
            .first()
        )
        return po_item.purchase_order.order_number if po_item else None

    def create(self, validated_data):
        # Manual entries start fully available when first received.
        if 'quantity_available' not in validated_data:
            validated_data['quantity_available'] = validated_data['quantity_received']
        return super().create(validated_data)
    
    class Meta:
        model = StockEntry
        fields = [
            'id', 'user', 'product', 'stock_identifier', 'source_type',
            'source_reference_id', 'quantity_received', 'quantity_available',
            'quantity_sold', 'unit_cost', 'total_cost', 'received_at',
            'expiration_date', 'notes', 'purchase_order_id', 'purchase_order_number',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'stock_identifier', 'quantity_available', 'quantity_sold', 'total_cost',
            'purchase_order_id', 'purchase_order_number',
            'created_at', 'updated_at'
        ]
