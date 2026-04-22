from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.views import UserFilteredViewSet
from .models import StockEntry
from .serializers import StockEntrySerializer


class StockEntryViewSet(UserFilteredViewSet):
    """API endpoint for managing stock entries."""
    queryset = StockEntry.objects.select_related('product', 'user')
    serializer_class = StockEntrySerializer
    search_fields = ['stock_identifier', 'product__sku']
    ordering_fields = ['received_at', 'expiration_date', 'quantity_available']
    ordering = ['expiration_date', 'received_at']
    
    @action(detail=True, methods=['get'])
    def allocation_detail(self, request, pk=None):
        """Get detailed allocation information for this stock entry."""
        entry = self.get_object()
        allocations = entry.allocations.select_related('sales_order_item__sales_order')
        
        from apps.sales_orders.serializers import StockAllocationSerializer
        return Response({
            'stock_entry_id': entry.id,
            'stock_identifier': entry.stock_identifier,
            'quantity_received': entry.quantity_received,
            'quantity_available': entry.quantity_available,
            'quantity_allocated': entry.quantity_sold,
            'unit_cost': entry.unit_cost,
            'allocations': StockAllocationSerializer(allocations, many=True).data,
        })
