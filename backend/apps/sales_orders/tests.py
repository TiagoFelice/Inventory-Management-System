from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.products.models import Product
from apps.sales_orders.models import SalesOrder, SalesOrderItem


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
