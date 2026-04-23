from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from decimal import Decimal

from apps.users.views import UserFilteredViewSet
from apps.stocks.models import StockEntry
from .models import SalesOrder, SalesOrderItem, StockAllocation
from .serializers import SalesOrderSerializer, SalesOrderItemSerializer, StockAllocationSerializer, SalesOrderCreateUpdateSerializer


class SalesOrderItemViewSet(UserFilteredViewSet):
    """API endpoint for sales order items."""
    queryset = SalesOrderItem.objects.all()
    serializer_class = SalesOrderItemSerializer
    
    def get_queryset(self):
        """Get items only from user's sales orders."""
        base_qs = SalesOrderItem.objects.filter(sales_order__user=self.request.user)
        sales_order = self.request.query_params.get('sales_order')
        if sales_order:
            base_qs = base_qs.filter(sales_order_id=sales_order)
        return base_qs
    
    def perform_create(self, serializer):
        """Create item for user's sales order."""
        sales_order = serializer.validated_data.get('sales_order')
        if sales_order.user != self.request.user:
            raise PermissionError("Cannot add item to another user's sales order")
        serializer.save()


class SalesOrderViewSet(UserFilteredViewSet):
    """API endpoint for managing sales orders."""
    queryset = SalesOrder.objects.prefetch_related('items')
    serializer_class = SalesOrderSerializer
    search_fields = ['order_number', 'customer_name']
    ordering_fields = ['sold_at', 'status', 'order_number']
    ordering = ['-sold_at']
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action in ('create', 'update', 'partial_update'):
            return SalesOrderCreateUpdateSerializer
        return SalesOrderSerializer


    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Manual allocations are required before confirming a sales order."""
        so = self.get_object()
        
        if so.status == 'confirmed':
            return Response(
                {'detail': 'This sales order is already confirmed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'detail': 'Use confirm_with_allocations to confirm a sales order.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a sales order."""
        so = self.get_object()
        
        if so.status == 'cancelled':
            return Response(
                {'message': 'Sales order is already cancelled'},
                status=status.HTTP_200_OK
            )
        
        so.status = 'cancelled'
        so.save()
        
        return Response(
            {'status': 'success', 'message': 'Sales order cancelled'},
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def confirm_with_allocations(self, request, pk=None):
        """Confirm sales order and allocate stock."""
        so = self.get_object()
        
        if so.status == 'confirmed':
            return Response(
                {'error': 'Sales order already confirmed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        sales_order_items = list(so.items.select_related('product').order_by('id'))
        if not sales_order_items:
            return Response(
                {'error': 'Sales order has no items to confirm'},
                status=status.HTTP_400_BAD_REQUEST
            )

        allocations_data = request.data.get('allocations', [])
        if not allocations_data:
            return Response(
                {'error': 'Allocations are required to confirm this sales order'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_allocations = []

        try:
            expected_item_ids = {item.id for item in sales_order_items}
            provided_item_ids = {
                allocation['sales_order_item_id']
                for allocation in allocations_data
                if allocation.get('quantity_allocated')
            }

            if expected_item_ids != provided_item_ids:
                raise ValueError('Each sales order item must be fully allocated before confirmation')

            for allocation_data in allocations_data:
                sales_item = SalesOrderItem.objects.get(
                    id=allocation_data['sales_order_item_id'],
                    sales_order=so
                )
                stock_entry = StockEntry.objects.get(
                    id=allocation_data['stock_entry_id'],
                    user=request.user
                )
                
                quantity = Decimal(str(allocation_data['quantity_allocated']))
                
                if stock_entry.quantity_available < quantity:
                    raise ValueError(
                        f'Insufficient stock for stock entry #{stock_entry.id}. '
                        f'Available: {stock_entry.quantity_available}, Required: {quantity}'
                    )
                
                allocation = StockAllocation.objects.create(
                    user=request.user,
                    sales_order_item=sales_item,
                    stock_entry=stock_entry,
                    quantity_allocated=quantity,
                )
                created_allocations.append(allocation)

            for sales_item in sales_order_items:
                allocated_total = sum(
                    allocation.quantity_allocated
                    for allocation in created_allocations
                    if allocation.sales_order_item_id == sales_item.id
                )
                if allocated_total != sales_item.quantity:
                    raise ValueError(
                        f'Allocations for product {sales_item.product.sku} must total {sales_item.quantity}'
                    )
            
            so.status = 'confirmed'
            so.save()
            
            return Response({
                'status': 'success',
                'message': f'{len(created_allocations)} stock allocations created',
                'total_profit': so.total_profit,
                'allocations': StockAllocationSerializer(created_allocations, many=True).data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


class StockAllocationViewSet(UserFilteredViewSet):
    """API endpoint for stock allocations."""
    queryset = StockAllocation.objects.select_related('sales_order_item', 'stock_entry')
    serializer_class = StockAllocationSerializer
    ordering_fields = ['created_at']
    ordering = ['-created_at']
