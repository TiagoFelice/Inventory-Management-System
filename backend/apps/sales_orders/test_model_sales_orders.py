from decimal import Decimal

import pytest
from django.db import IntegrityError

from apps.sales_orders.models import SalesOrder, SalesOrderItem


pytestmark = pytest.mark.django_db


def test_sales_order_item_profit_and_margin_handle_zero_cost(sales_order, product):
    item = SalesOrderItem.objects.create(
        sales_order=sales_order,
        product=product,
        quantity=Decimal('2.0000'),
        unit_price=Decimal('9.00'),
    )

    assert item.total_revenue == Decimal('18.00')
    assert item.total_cost == Decimal('0.00')
    assert item.profit == Decimal('18.00')
    assert item.margin_percent is None
    assert sales_order.total_profit == Decimal('18.00')


def test_sales_order_item_save_recomputes_total_revenue(sales_order_item):
    sales_order_item.quantity = Decimal('3.0000')
    sales_order_item.unit_price = Decimal('15.00')
    sales_order_item.total_revenue = Decimal('0.00')
    sales_order_item.save()
    sales_order_item.refresh_from_db()

    assert sales_order_item.total_revenue == Decimal('45.00')


def test_sales_order_number_must_be_unique_per_user(user):
    SalesOrder.objects.create(
        user=user,
        order_number='SO-UNI',
        customer_name='Alice',
        status='draft',
        sold_at='2026-04-24T10:00:00Z',
    )

    with pytest.raises(IntegrityError):
        SalesOrder.objects.create(
            user=user,
            order_number='SO-UNI',
            customer_name='Bob',
            status='draft',
            sold_at='2026-04-24T11:00:00Z',
        )
