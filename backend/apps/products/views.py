from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F

from .models import Product
from .serializers import ProductSerializer
from apps.users.views import UserFilteredViewSet




class ProductViewSet(UserFilteredViewSet):
    """API endpoint for managing products."""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    search_fields = ['sku', 'name', 'description', 'stock_entries__stock_identifier']
    filterset_fields = ['id', 'sku']
    ordering_fields = ['sku', 'name', 'created_at']
    ordering = ['-created_at']
    
    @action(detail=True, methods=['get'])
    def stock_summary(self, request, pk=None):
        """Get stock summary for a product."""
        product = self.get_object()
        stock_entries = product.stock_entries.values('id').annotate(
            available=F('quantity_available'),
            cost=F('unit_cost')
        )
        
        return Response({
            'product_id': product.id,
            'product_sku': product.sku,
            'total_available': product.available_quantity,
            'total_value': product.total_inventory_value,
            'stock_entries': list(stock_entries),
        })
