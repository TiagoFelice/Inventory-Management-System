from decimal import Decimal

from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Product
from apps.purchase_orders.models import PurchaseOrder, PurchaseOrderItem
from apps.sales_orders.models import SalesOrder, SalesOrderItem, StockAllocation
from apps.stocks.models import StockEntry


class FinancialEndpointsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='owner', password='pass1234')
        self.other_user = User.objects.create_user(username='other', password='pass1234')
        self.client.force_authenticate(user=self.user)

        self.product_a = Product.objects.create(
            user=self.user,
            name='Arabica Beans',
            sku='COF-001',
            base_unit='kg',
            amount=0,
        )
        self.product_b = Product.objects.create(
            user=self.user,
            name='Paper Cups',
            sku='CUP-001',
            base_unit='unit',
            amount=0,
        )
        self.product_c = Product.objects.create(
            user=self.user,
            name='Unused Product',
            sku='UNU-001',
            base_unit='unit',
            amount=0,
        )

        self.received_purchase_order = PurchaseOrder.objects.create(
            user=self.user,
            supplier_name='Supplier A',
            order_number='PO-001',
            status='received',
            ordered_at='2026-04-01T09:00:00Z',
        )
        self.ignored_purchase_order = PurchaseOrder.objects.create(
            user=self.user,
            supplier_name='Supplier B',
            order_number='PO-002',
            status='confirmed',
            ordered_at='2026-04-02T09:00:00Z',
        )

        self.purchase_item_a = PurchaseOrderItem.objects.create(
            purchase_order=self.received_purchase_order,
            product=self.product_a,
            quantity=Decimal('10.0000'),
            unit_cost=Decimal('5.00'),
            total_cost=Decimal('50.00'),
        )
        self.purchase_item_b = PurchaseOrderItem.objects.create(
            purchase_order=self.received_purchase_order,
            product=self.product_b,
            quantity=Decimal('20.0000'),
            unit_cost=Decimal('2.00'),
            total_cost=Decimal('40.00'),
        )
        PurchaseOrderItem.objects.create(
            purchase_order=self.ignored_purchase_order,
            product=self.product_a,
            quantity=Decimal('99.0000'),
            unit_cost=Decimal('1.00'),
            total_cost=Decimal('99.00'),
        )

        self.stock_a = StockEntry.objects.create(
            user=self.user,
            product=self.product_a,
            source_type='purchase_order',
            source_reference_id=self.purchase_item_a.id,
            quantity_received=Decimal('10.0000'),
            received_at='2026-04-01T12:00:00Z',
        )
        self.stock_b = StockEntry.objects.create(
            user=self.user,
            product=self.product_b,
            source_type='purchase_order',
            source_reference_id=self.purchase_item_b.id,
            quantity_received=Decimal('20.0000'),
            received_at='2026-04-01T12:00:00Z',
        )

        self.confirmed_sales_order = SalesOrder.objects.create(
            user=self.user,
            order_number='SO-001',
            customer_name='Retail Shop',
            status='confirmed',
            sold_at='2026-04-05T10:00:00Z',
        )
        self.cancelled_sales_order = SalesOrder.objects.create(
            user=self.user,
            order_number='SO-002',
            customer_name='Ignored Customer',
            status='cancelled',
            sold_at='2026-04-06T10:00:00Z',
        )

        self.confirmed_item_a = SalesOrderItem.objects.create(
            sales_order=self.confirmed_sales_order,
            product=self.product_a,
            quantity=Decimal('4.0000'),
            unit_price=Decimal('10.00'),
            total_revenue=Decimal('40.00'),
        )
        self.confirmed_item_b = SalesOrderItem.objects.create(
            sales_order=self.confirmed_sales_order,
            product=self.product_b,
            quantity=Decimal('5.0000'),
            unit_price=Decimal('4.00'),
            total_revenue=Decimal('20.00'),
        )
        cancelled_item = SalesOrderItem.objects.create(
            sales_order=self.cancelled_sales_order,
            product=self.product_a,
            quantity=Decimal('2.0000'),
            unit_price=Decimal('50.00'),
            total_revenue=Decimal('100.00'),
        )

        StockAllocation.objects.create(
            user=self.user,
            sales_order_item=self.confirmed_item_a,
            stock_entry=self.stock_a,
            quantity_allocated=Decimal('4.0000'),
        )
        StockAllocation.objects.create(
            user=self.user,
            sales_order_item=self.confirmed_item_b,
            stock_entry=self.stock_b,
            quantity_allocated=Decimal('5.0000'),
        )
        StockAllocation.objects.create(
            user=self.user,
            sales_order_item=cancelled_item,
            stock_entry=self.stock_a,
            quantity_allocated=Decimal('2.0000'),
        )

        other_product = Product.objects.create(
            user=self.other_user,
            name='Foreign Product',
            sku='FOR-001',
            base_unit='unit',
            amount=0,
        )
        other_purchase_order = PurchaseOrder.objects.create(
            user=self.other_user,
            supplier_name='Other Supplier',
            order_number='PO-999',
            status='received',
            ordered_at='2026-04-01T09:00:00Z',
        )
        other_purchase_item = PurchaseOrderItem.objects.create(
            purchase_order=other_purchase_order,
            product=other_product,
            quantity=Decimal('1.0000'),
            unit_cost=Decimal('100.00'),
            total_cost=Decimal('100.00'),
        )
        other_stock = StockEntry.objects.create(
            user=self.other_user,
            product=other_product,
            source_type='purchase_order',
            source_reference_id=other_purchase_item.id,
            quantity_received=Decimal('1.0000'),
            received_at='2026-04-01T12:00:00Z',
        )
        other_sales_order = SalesOrder.objects.create(
            user=self.other_user,
            order_number='SO-999',
            customer_name='Other Customer',
            status='confirmed',
            sold_at='2026-04-05T10:00:00Z',
        )
        other_sales_item = SalesOrderItem.objects.create(
            sales_order=other_sales_order,
            product=other_product,
            quantity=Decimal('1.0000'),
            unit_price=Decimal('130.00'),
            total_revenue=Decimal('130.00'),
        )
        StockAllocation.objects.create(
            user=self.other_user,
            sales_order_item=other_sales_item,
            stock_entry=other_stock,
            quantity_allocated=Decimal('1.0000'),
        )

    def test_products_endpoint_returns_canonical_metrics(self):
        response = self.client.get(reverse('finance-products-list'))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary']['total_revenue'], '60.00')
        self.assertEqual(response.data['summary']['total_purchase_cost'], '90.00')
        self.assertEqual(response.data['summary']['total_cogs'], '30.00')
        self.assertEqual(response.data['summary']['profit'], '30.00')
        self.assertEqual(response.data['summary']['profit_margin'], '100.00')
        self.assertEqual(response.data['summary']['quantity_purchased'], '30.0000')
        self.assertEqual(response.data['summary']['quantity_sold'], '9.0000')
        self.assertEqual(response.data['summary']['quantity_remaining'], '21.0000')

        items = {item['id']: item for item in response.data['items']}
        self.assertEqual(items[self.product_a.id]['total_purchase_cost'], '50.00')
        self.assertEqual(items[self.product_a.id]['total_revenue'], '40.00')
        self.assertEqual(items[self.product_a.id]['total_cogs'], '20.00')
        self.assertEqual(items[self.product_a.id]['profit'], '20.00')
        self.assertEqual(items[self.product_a.id]['profit_margin'], '100.00')
        self.assertEqual(items[self.product_a.id]['quantity_remaining'], '6.0000')
        self.assertEqual(items[self.product_c.id]['total_revenue'], '0.00')
        self.assertEqual(items[self.product_c.id]['quantity_purchased'], '0.0000')

    def test_purchase_items_endpoint_supports_multi_select_summary(self):
        response = self.client.get(
            reverse('finance-purchase-items-list'),
            {'ids': f'{self.purchase_item_a.id}'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        item = response.data['items'][0]
        self.assertEqual(item['id'], self.purchase_item_a.id)
        self.assertEqual(item['total_purchase_cost'], '50.00')
        self.assertEqual(item['total_revenue'], '40.00')
        self.assertEqual(item['total_cogs'], '20.00')
        self.assertEqual(item['profit'], '20.00')
        self.assertEqual(item['quantity_purchased'], '10.0000')
        self.assertEqual(item['quantity_sold'], '4.0000')
        self.assertEqual(item['quantity_remaining'], '6.0000')
        self.assertEqual(item['remaining_value'], '30.00')
        self.assertEqual(response.data['summary']['profit_margin'], '100.00')

    def test_products_endpoint_supports_search(self):
        response = self.client.get(
            reverse('finance-products-list'),
            {'search': 'Arabica'},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['items']), 1)
        self.assertEqual(response.data['items'][0]['id'], self.product_a.id)
        self.assertEqual(response.data['summary']['total_revenue'], '40.00')
        self.assertEqual(response.data['summary']['quantity_purchased'], '10.0000')

    def test_products_endpoint_supports_period_filter(self):
        response = self.client.get(
            reverse('finance-products-list'),
            {
                'start_date': '2026-04-05',
                'end_date': '2026-04-05',
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        items = {item['id']: item for item in response.data['items']}
        self.assertEqual(response.data['summary']['total_purchase_cost'], '0.00')
        self.assertEqual(response.data['summary']['total_revenue'], '60.00')
        self.assertEqual(response.data['summary']['quantity_purchased'], '0.0000')
        self.assertEqual(response.data['summary']['quantity_sold'], '9.0000')
        self.assertEqual(items[self.product_a.id]['total_purchase_cost'], '0.00')
        self.assertEqual(items[self.product_a.id]['total_revenue'], '40.00')

    def test_purchase_items_endpoint_supports_period_filter(self):
        response = self.client.get(
            reverse('finance-purchase-items-list'),
            {
                'start_date': '2026-04-01',
                'end_date': '2026-04-03',
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['summary']['total_purchase_cost'], '90.00')
        self.assertEqual(response.data['summary']['total_revenue'], '0.00')
        self.assertEqual(response.data['summary']['quantity_sold'], '0.0000')
        self.assertEqual(len(response.data['items']), 2)
