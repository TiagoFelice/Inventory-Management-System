from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Product
from .serializers import ProductSerializer
from apps.users.views import UserFilteredViewSet




class ProductViewSet(UserFilteredViewSet):
    """API endpoint for managing products."""
    queryset = Product.objects.prefetch_related('stock_entries__allocations')
    serializer_class = ProductSerializer
    search_fields = ['sku', 'name', 'description', 'stock_entries__stock_identifier']
    filterset_fields = ['id', 'sku']
    ordering_fields = ['sku', 'name', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['get'])
    def stock_summary(self, request, pk=None):
        """Get stock summary for a product."""
        product = self.get_object()
        stock_entries = [
            {
                'id': entry.id,
                'available': entry.quantity_available,
            }
            for entry in product.stock_entries.all()
        ]
        
        return Response({
            'product_id': product.id,
            'product_sku': product.sku,
            'total_available': product.available_quantity,
            'total_value': product.total_inventory_value,
            'stock_entries': list(stock_entries),
        })
