from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Product
from apps.purchase_orders.models import PurchaseOrder, PurchaseOrderItem
from apps.stocks.models import StockEntry


class PurchaseOrderItemRulesTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='po-owner', password='pass1234')
        self.client.force_authenticate(user=self.user)
        self.product = Product.objects.create(
            user=self.user,
            name='Milk',
            sku='MLK-001',
            base_unit='L',
            amount=0,
        )
        self.purchase_order = PurchaseOrder.objects.create(
            user=self.user,
            supplier_name='Supplier',
            order_number='PO-001',
            status='received',
            ordered_at='2026-04-24T10:00:00Z',
        )
        self.item = PurchaseOrderItem.objects.create(
            purchase_order=self.purchase_order,
            product=self.product,
            quantity=Decimal('2.0000'),
            unit_cost=Decimal('3.50'),
        )

    def test_purchase_order_item_total_cost_recalculates_on_save(self):
        self.item.quantity = Decimal('4.0000')
        self.item.unit_cost = Decimal('5.00')
        self.item.total_cost = Decimal('0.00')
        self.item.save()

        self.item.refresh_from_db()
        self.assertEqual(self.item.total_cost, Decimal('20.00'))

    def test_received_purchase_order_rejects_item_changes(self):
        response = self.client.patch(
            reverse('purchaseorder-detail', args=[self.purchase_order.id]),
            {
                'items': [
                    {
                        'product': self.product.id,
                        'quantity': '3.0000',
                        'unit_cost': '4.00',
                    }
                ]
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('items', response.data)

    def test_reopen_received_purchase_order_requires_confirmation_when_stock_entries_exist(self):
        StockEntry.objects.create(
            user=self.user,
            product=self.product,
            source_type='purchase_order',
            source_reference_id=self.item.id,
            quantity_received=Decimal('2.0000'),
            received_at='2026-04-24T10:00:00Z',
        )

        response = self.client.post(
            reverse('purchaseorder-reopen', args=[self.purchase_order.id]),
            {},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.data['requires_confirmation'])
        self.assertEqual(response.data['stock_entry_count'], 1)

    def test_reopen_received_purchase_order_deletes_linked_stock_entries(self):
        StockEntry.objects.create(
            user=self.user,
            product=self.product,
            source_type='purchase_order',
            source_reference_id=self.item.id,
            quantity_received=Decimal('2.0000'),
            received_at='2026-04-24T10:00:00Z',
        )

        response = self.client.post(
            reverse('purchaseorder-reopen', args=[self.purchase_order.id]),
            {'delete_stock_entries': True},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.purchase_order.refresh_from_db()
        self.assertEqual(self.purchase_order.status, 'confirmed')
        self.assertEqual(
            StockEntry.objects.filter(
                user=self.user,
                source_type='purchase_order',
                source_reference_id=self.item.id,
            ).count(),
            0,
        )
