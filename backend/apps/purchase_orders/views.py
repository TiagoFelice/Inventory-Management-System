from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from apps.users.views import UserFilteredViewSet
from apps.stocks.models import StockEntry
from apps.stocks.serializers import StockEntrySerializer
from .models import PurchaseOrder, PurchaseOrderItem
from .serializers import PurchaseOrderSerializer, PurchaseOrderItemSerializer, PurchaseOrderCreateUpdateSerializer


class PurchaseOrderItemViewSet(UserFilteredViewSet):
    """API endpoint for purchase order items."""
    queryset = PurchaseOrderItem.objects.all()
    serializer_class = PurchaseOrderItemSerializer
    
    def get_queryset(self):
        """Get items only from user's purchase orders."""
        base_qs = PurchaseOrderItem.objects.filter(purchase_order__user=self.request.user)
        purchase_order = self.request.query_params.get('purchase_order')
        if purchase_order:
            base_qs = base_qs.filter(purchase_order_id=purchase_order)
        return base_qs
    
    def perform_create(self, serializer):
        """Create item for user's purchase order."""
        purchase_order = serializer.validated_data.get('purchase_order')
        if purchase_order.user != self.request.user:
            raise PermissionError("Cannot add item to another user's purchase order")
        serializer.save()


class PurchaseOrderViewSet(UserFilteredViewSet):
    """API endpoint for managing purchase orders."""
    queryset = PurchaseOrder.objects.prefetch_related('items__product')
    serializer_class = PurchaseOrderSerializer
    search_fields = ['order_number', 'supplier_name']
    ordering_fields = ['ordered_at', 'status', 'order_number']
    ordering = ['-ordered_at']
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action in ('create', 'update', 'partial_update'):
            return PurchaseOrderCreateUpdateSerializer
        return PurchaseOrderSerializer
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Confirm a purchase order (move from draft to confirmed)."""
        po = self.get_object()
        
        # Only draft orders can be confirmed
        if po.status != 'draft':
            if po.status == 'confirmed':
                return Response(
                    {'detail': 'This order is already confirmed.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif po.status == 'received':
                return Response(
                    {'detail': 'Cannot confirm a received order. This is not the usual workflow.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif po.status == 'cancelled':
                return Response(
                    {'detail': 'Cannot confirm a cancelled order. This is not the usual workflow.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        po.status = 'confirmed'
        po.save()
        
        return Response(
            PurchaseOrderSerializer(po).data,
            status=status.HTTP_200_OK
        )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a purchase order."""
        po = self.get_object()
        
        # Normal workflow: draft/confirmed can be cancelled
        if po.status not in ('draft', 'confirmed'):
            if po.status == 'cancelled':
                return Response(
                    {'detail': 'This order is already cancelled.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif po.status == 'received':
                return Response(
                    {'detail': 'Cannot cancel a received order. This is not the usual workflow.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        po.status = 'cancelled'
        po.save()
        
        return Response(
            PurchaseOrderSerializer(po).data,
            status=status.HTTP_200_OK
        )
        
    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        """Mark purchase order as received and create stock entries from its items."""
        po = self.get_object()
        
        if po.status == 'received':
            return Response(
                {'error': 'Purchase order already received'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if po.status != 'confirmed':
            return Response(
                {'error': 'Only confirmed purchase orders can be received'},
                status=status.HTTP_400_BAD_REQUEST
            )

        po_items = list(po.items.select_related('product').order_by('id'))
        created_entries = []
        
        try:
            if not po_items:
                return Response(
                    {'error': 'Purchase order has no items to receive'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            received_at = timezone.now()

            for po_item in po_items:
                stock_entry = StockEntry.objects.create(
                    user=request.user,
                    product=po_item.product,
                    stock_identifier=f"PO-{po.id}-ITEM-{po_item.id}",
                    source_type='purchase_order',
                    source_reference_id=po_item.id,
                    quantity_received=po_item.quantity,
                    quantity_available=po_item.quantity,
                    unit_cost=po_item.unit_cost,
                    total_cost=po_item.quantity * po_item.unit_cost,
                    received_at=received_at,
                    notes=f"Auto-created from purchase order {po.order_number}",
                )
                created_entries.append(stock_entry)
            
            po.status = 'received'
            po.save()
            
            return Response({
                'status': 'success',
                'message': f'{len(created_entries)} stock entries created',
                'stock_entries': StockEntrySerializer(created_entries, many=True).data
            })
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
