from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Product
from apps.sales_orders.models import SalesOrder, SalesOrderItem, StockAllocation
from apps.stocks.models import StockEntry


class StockRefactorTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='stock-owner', password='pass1234')
        self.client.force_authenticate(user=self.user)
        self.product = Product.objects.create(
            user=self.user,
            name='Milk',
            sku='MLK-001',
            base_unit='L',
            amount=0,
        )
        self.entry = StockEntry.objects.create(
            user=self.user,
            product=self.product,
            source_type='manual',
            quantity_received=Decimal('10.0000'),
            received_at='2026-04-24T10:00:00Z',
        )

    def test_quantity_available_is_computed_from_allocations(self):
        StockAllocation.objects.create(
            user=self.user,
            stock_entry=self.entry,
            quantity_allocated=Decimal('4.0000'),
            type='expired',
        )

        self.entry.refresh_from_db()
        self.assertEqual(self.entry.quantity_available, Decimal('6.0000'))

    def test_product_stock_detail_exposes_allocations(self):
        allocation = StockAllocation.objects.create(
            user=self.user,
            stock_entry=self.entry,
            quantity_allocated=Decimal('2.0000'),
            type='other',
            notes='Manual correction',
        )

        response = self.client.get(reverse('stock-allocation-list'), {'stock_entry__product': self.product.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], allocation.id)
        self.assertEqual(response.data['results'][0]['type'], 'other')
        self.assertEqual(response.data['results'][0]['notes'], 'Manual correction')

    def test_stock_entry_list_can_filter_by_product(self):
        other_product = Product.objects.create(
            user=self.user,
            name='Bread',
            sku='BRD-001',
            base_unit='unit',
            amount=0,
        )
        other_entry = StockEntry.objects.create(
            user=self.user,
            product=other_product,
            source_type='manual',
            quantity_received=Decimal('5.0000'),
            received_at='2026-04-24T11:00:00Z',
        )

        response = self.client.get(reverse('stock-entry-list'), {'product': self.product.id})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.entry.id)
        self.assertNotEqual(response.data['results'][0]['id'], other_entry.id)

    def test_stock_allocation_update_allows_using_current_reserved_quantity(self):
        order = SalesOrder.objects.create(
            user=self.user,
            order_number='SO-001',
            customer_name='Alice',
            status='confirmed',
            sold_at='2026-04-24T12:00:00Z',
        )
        item = SalesOrderItem.objects.create(
            sales_order=order,
            product=self.product,
            quantity=Decimal('9.0000'),
            unit_price=Decimal('5.00'),
            total_revenue=Decimal('45.00'),
        )
        allocation = StockAllocation.objects.create(
            user=self.user,
            sales_order_item=item,
            stock_entry=self.entry,
            quantity_allocated=Decimal('4.0000'),
            type='sale',
        )

        response = self.client.patch(
            reverse('stock-allocation-detail', args=[allocation.id]),
            {'quantity_allocated': '7.0000', 'notes': 'Adjusted'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        allocation.refresh_from_db()
        self.assertEqual(allocation.quantity_allocated, Decimal('7.0000'))
        self.assertEqual(allocation.notes, 'Adjusted')

    def test_stock_allocation_update_rejects_invalid_sales_type_change(self):
        order = SalesOrder.objects.create(
            user=self.user,
            order_number='SO-002',
            customer_name='Bob',
            status='confirmed',
            sold_at='2026-04-24T12:00:00Z',
        )
        item = SalesOrderItem.objects.create(
            sales_order=order,
            product=self.product,
            quantity=Decimal('4.0000'),
            unit_price=Decimal('5.00'),
            total_revenue=Decimal('20.00'),
        )
        allocation = StockAllocation.objects.create(
            user=self.user,
            sales_order_item=item,
            stock_entry=self.entry,
            quantity_allocated=Decimal('2.0000'),
            type='sale',
        )

        response = self.client.patch(
            reverse('stock-allocation-detail', args=[allocation.id]),
            {'type': 'other'},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('type', response.data)
