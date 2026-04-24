from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Product
from apps.sales_orders.models import SalesOrder, SalesOrderItem, StockAllocation
from apps.stocks.models import StockEntry


class SalesOrderSearchTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='sales-owner', password='pass1234')
        self.client.force_authenticate(user=self.user)

        self.product = Product.objects.create(
            user=self.user,
            name='Chocolate Cake',
            sku='CK-001',
            base_unit='unit',
            amount=0,
        )
        self.other_product = Product.objects.create(
            user=self.user,
            name='Vanilla Ice Cream',
            sku='IC-001',
            base_unit='unit',
            amount=0,
        )

        self.matching_order = SalesOrder.objects.create(
            user=self.user,
            order_number='SO-100',
            customer_name='Alice',
            status='draft',
            sold_at='2026-04-24T12:00:00Z',
        )
        SalesOrderItem.objects.create(
            sales_order=self.matching_order,
            product=self.product,
            quantity='2.0000',
            unit_price='10.00',
            total_revenue='20.00',
        )

        self.other_order = SalesOrder.objects.create(
            user=self.user,
            order_number='SO-200',
            customer_name='Bob',
            status='draft',
            sold_at='2026-04-24T13:00:00Z',
        )
        SalesOrderItem.objects.create(
            sales_order=self.other_order,
            product=self.other_product,
            quantity='1.0000',
            unit_price='8.00',
            total_revenue='8.00',
        )

    def test_sales_order_list_search_matches_product_name(self):
        response = self.client.get(reverse('salesorder-list'), {'search': 'Chocolate'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.matching_order.id)

    def test_sales_order_list_search_matches_product_sku(self):
        response = self.client.get(reverse('salesorder-list'), {'search': 'CK-001'})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['id'], self.matching_order.id)


class SalesOrderItemRulesTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='sales-rules', password='pass1234')
        self.client.force_authenticate(user=self.user)
        self.product = Product.objects.create(
            user=self.user,
            name='Brownie',
            sku='BR-001',
            base_unit='unit',
            amount=0,
        )
        self.sales_order = SalesOrder.objects.create(
            user=self.user,
            order_number='SO-LOCK',
            customer_name='Alice',
            status='confirmed',
            sold_at='2026-04-24T15:00:00Z',
        )
        self.item = SalesOrderItem.objects.create(
            sales_order=self.sales_order,
            product=self.product,
            quantity=Decimal('2.0000'),
            unit_price=Decimal('10.00'),
        )

    def test_sales_order_item_total_revenue_recalculates_on_save(self):
        self.item.quantity = Decimal('3.0000')
        self.item.unit_price = Decimal('12.00')
        self.item.total_revenue = Decimal('0.00')
        self.item.save()

        self.item.refresh_from_db()
        self.assertEqual(self.item.total_revenue, Decimal('36.00'))

    def test_confirmed_sales_order_rejects_item_changes(self):
        response = self.client.patch(
            reverse('salesorder-detail', args=[self.sales_order.id]),
            {
                'items': [
                    {
                        'product': self.product.id,
                        'quantity': '4.0000',
                        'unit_price': '11.00',
                    }
                ]
            },
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('items', response.data)

    def test_reopen_confirmed_sales_order_requires_confirmation_when_allocations_exist(self):
        stock_entry = StockEntry.objects.create(
            user=self.user,
            product=self.product,
            source_type='manual',
            quantity_received=Decimal('5.0000'),
            received_at='2026-04-24T16:00:00Z',
        )
        StockAllocation.objects.create(
            user=self.user,
            sales_order_item=self.item,
            stock_entry=stock_entry,
            quantity_allocated=Decimal('2.0000'),
            type='sale',
        )

        response = self.client.post(
            reverse('salesorder-reopen', args=[self.sales_order.id]),
            {},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertTrue(response.data['requires_confirmation'])
        self.assertEqual(response.data['allocation_count'], 1)

    def test_reopen_confirmed_sales_order_deletes_allocations(self):
        stock_entry = StockEntry.objects.create(
            user=self.user,
            product=self.product,
            source_type='manual',
            quantity_received=Decimal('5.0000'),
            received_at='2026-04-24T16:00:00Z',
        )
        StockAllocation.objects.create(
            user=self.user,
            sales_order_item=self.item,
            stock_entry=stock_entry,
            quantity_allocated=Decimal('2.0000'),
            type='sale',
        )

        response = self.client.post(
            reverse('salesorder-reopen', args=[self.sales_order.id]),
            {'delete_allocations': True},
            format='json',
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.sales_order.refresh_from_db()
        self.assertEqual(self.sales_order.status, 'draft')
        self.assertEqual(StockAllocation.objects.filter(sales_order_item=self.item).count(), 0)
