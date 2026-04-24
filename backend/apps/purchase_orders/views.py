from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from decimal import Decimal
from django.db import transaction

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
    search_fields = ['order_number', 'supplier_name', 'items__product__name', 'items__product__sku']
    ordering_fields = ['ordered_at', 'status', 'order_number']
    ordering = ['-ordered_at']

    def get_queryset(self):
        return super().get_queryset().distinct()
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action in ('create', 'update', 'partial_update'):
            return PurchaseOrderCreateUpdateSerializer
        return PurchaseOrderSerializer

    def partial_update(self, request, *args, **kwargs):
        """Require manual stock-entry planning before moving an order to received."""
        instance = self.get_object()
        payload = request.data.copy()
        target_status = payload.pop('status', None)

        if target_status == 'received':
            return Response(
                {'detail': 'Use receive_with_entries to mark a purchase order as received.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(instance, data=payload, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if target_status and target_status != instance.status:
            instance.status = target_status
            instance.save()

        instance.refresh_from_db()
        return Response(PurchaseOrderSerializer(instance).data, status=status.HTTP_200_OK)
    
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
        """Manual stock entries are required before receiving a purchase order."""
        po = self.get_object()
        
        if po.status == 'received':
            return Response(
                {'error': 'Purchase order already received'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'detail': 'Use receive_with_entries to mark a purchase order as received.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=True, methods=['post'])
    def receive_with_entries(self, request, pk=None):
        """Mark purchase order as received using explicit stock-entry splits per item."""
        po = self.get_object()

        if po.status == 'received':
            return Response(
                {'error': 'Purchase order already received'},
                status=status.HTTP_400_BAD_REQUEST
            )

        po_items = list(po.items.select_related('product').order_by('id'))
        if not po_items:
            return Response(
                {'error': 'Purchase order has no items to receive'},
                status=status.HTTP_400_BAD_REQUEST
            )

        entries_data = request.data.get('entries', [])
        if not entries_data:
            return Response(
                {'error': 'Entries are required to receive this purchase order'},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_entries = []

        try:
            expected_item_ids = {item.id for item in po_items}
            provided_item_ids = {
                entry['purchase_order_item_id']
                for entry in entries_data
                if entry.get('quantity_received')
            }

            if expected_item_ids != provided_item_ids:
                raise ValueError('Each purchase order item must be fully received before completing this action')

            received_at = timezone.now()

            for entry_data in entries_data:
                po_item = PurchaseOrderItem.objects.get(
                    id=entry_data['purchase_order_item_id'],
                    purchase_order=po
                )

                quantity_received = Decimal(str(entry_data['quantity_received']))
                stock_entry = StockEntry.objects.create(
                    user=request.user,
                    product=po_item.product,
                    source_type='purchase_order',
                    source_reference_id=po_item.id,
                    quantity_received=quantity_received,
                    received_at=received_at,
                    expiration_date=entry_data.get('expiration_date') or None,
                    notes=f"Auto-created from purchase order {po.order_number}",
                )
                created_entries.append(stock_entry)

            for po_item in po_items:
                received_total = sum(
                    entry.quantity_received
                    for entry in created_entries
                    if entry.source_reference_id == po_item.id
                )
                if received_total != po_item.quantity:
                    raise ValueError(
                        f'Entries for product {po_item.product.sku} must total {po_item.quantity}'
                    )
            
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

    @action(detail=True, methods=['post'])
    def reopen(self, request, pk=None):
        """Reopen a received purchase order back to confirmed."""
        po = self.get_object()

        if po.status != 'received':
            return Response(
                {'detail': 'Only received purchase orders can be reopened.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        item_ids = list(po.items.values_list('id', flat=True))
        linked_entries = StockEntry.objects.filter(
            user=request.user,
            source_type='purchase_order',
            source_reference_id__in=item_ids,
        )
        delete_stock_entries = request.data.get('delete_stock_entries', False)

        allocated_entries = linked_entries.filter(allocations__isnull=False).distinct()
        if allocated_entries.exists():
            return Response(
                {
                    'detail': 'Cannot reopen this purchase order because linked stock entries already have allocations.',
                    'allocated_stock_entry_count': allocated_entries.count(),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        deleted_stock_entries = 0
        if linked_entries.exists() and not delete_stock_entries:
            return Response(
                {
                    'detail': 'This purchase order already created stock entries. Reopening requires deleting them.',
                    'requires_confirmation': True,
                    'stock_entry_count': linked_entries.count(),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        with transaction.atomic():
            if linked_entries.exists():
                deleted_stock_entries = linked_entries.count()
                linked_entries.delete()

            po.status = 'confirmed'
            po.save(update_fields=['status', 'updated_at'])

        return Response(
            {
                'status': 'success',
                'message': 'Purchase order reopened.',
                'deleted_stock_entries': deleted_stock_entries,
            },
            status=status.HTTP_200_OK
        )
