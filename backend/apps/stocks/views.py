from rest_framework.decorators import action
from rest_framework.response import Response

from apps.users.views import UserFilteredViewSet
from .models import StockEntry
from .serializers import StockEntrySerializer


class StockEntryViewSet(UserFilteredViewSet):
    """API endpoint for managing stock entries."""
    queryset = StockEntry.objects.select_related('product', 'user').prefetch_related('allocations__sales_order_item__sales_order')
    serializer_class = StockEntrySerializer
    search_fields = ['product__sku', 'product__name']
    filterset_fields = ['product', 'source_type']
    ordering_fields = ['received_at', 'expiration_date', 'quantity_received']
    ordering = ['expiration_date', 'received_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        return queryset
    
    @action(detail=True, methods=['get'])
    def allocation_detail(self, request, pk=None):
        """Get detailed allocation information for this stock entry."""
        entry = self.get_object()
        allocations = entry.allocations.select_related('sales_order_item__sales_order')
        
        from apps.sales_orders.serializers import StockAllocationSerializer
        return Response({
            'stock_entry_id': entry.id,
            'quantity_received': entry.quantity_received,
            'quantity_available': entry.quantity_available,
            'quantity_allocated': entry.quantity_allocated_total,
            'allocations': StockAllocationSerializer(allocations, many=True).data,
        })
