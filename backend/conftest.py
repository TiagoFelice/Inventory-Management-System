from decimal import Decimal

import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from apps.products.models import Product
from apps.purchase_orders.models import PurchaseOrder, PurchaseOrderItem
from apps.sales_orders.models import SalesOrder, SalesOrderItem
from apps.stocks.models import StockEntry


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user():
    return User.objects.create_user(username='owner', password='pass1234')


@pytest.fixture
def other_user():
    return User.objects.create_user(username='other-owner', password='pass1234')


@pytest.fixture
def authenticated_client(api_client, user):
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def product(user):
    return Product.objects.create(
        user=user,
        name='Chocolate Bar',
        sku='CHO-001',
        base_unit='unit',
        amount=Decimal('0.00'),
    )


@pytest.fixture
def purchase_order(user):
    return PurchaseOrder.objects.create(
        user=user,
        supplier_name='Main Supplier',
        order_number='PO-100',
        status='confirmed',
        ordered_at='2026-04-24T10:00:00Z',
    )


@pytest.fixture
def purchase_order_item(purchase_order, product):
    return PurchaseOrderItem.objects.create(
        purchase_order=purchase_order,
        product=product,
        quantity=Decimal('5.0000'),
        unit_cost=Decimal('3.50'),
    )


@pytest.fixture
def stock_entry(user, product):
    return StockEntry.objects.create(
        user=user,
        product=product,
        source_type='manual',
        quantity_received=Decimal('10.0000'),
        received_at='2026-04-24T12:00:00Z',
    )


@pytest.fixture
def sales_order(user):
    return SalesOrder.objects.create(
        user=user,
        order_number='SO-100',
        customer_name='Alice',
        status='draft',
        sold_at='2026-04-24T14:00:00Z',
    )


@pytest.fixture
def sales_order_item(sales_order, product):
    return SalesOrderItem.objects.create(
        sales_order=sales_order,
        product=product,
        quantity=Decimal('4.0000'),
        unit_price=Decimal('12.50'),
    )
