from rest_framework import serializers
from .models import StockEntry


class StockEntrySerializer(serializers.ModelSerializer):
    quantity_sold = serializers.DecimalField(
        read_only=True,
        max_digits=15,
        decimal_places=4
    )
    
    class Meta:
        model = StockEntry
        fields = [
            'id', 'user', 'product', 'source_type',
            'source_reference_id', 'quantity_received', 'quantity_available',
            'quantity_sold', 'unit_cost', 'total_cost', 'received_at',
            'expiration_date', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'quantity_sold', 'total_cost', 'created_at', 'updated_at']
