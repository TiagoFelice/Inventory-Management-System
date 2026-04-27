from decimal import Decimal

import pytest

from apps.sales_orders.models import SalesOrder, SalesOrderItem, StockAllocation


pytestmark = pytest.mark.django_db


def test_confirm_sales_order_with_allocations_marks_confirmed_and_reserves_stock(
    authenticated_client,
    sales_order,
    sales_order_item,
    stock_entry,
):
    response = authenticated_client.post(
        f'/api/sales-orders/{sales_order.id}/confirm_with_allocations/',
        {
            'allocations': [
                {
                    'sales_order_item_id': sales_order_item.id,
                    'stock_entry_id': stock_entry.id,
                    'quantity_allocated': '4.0000',
                }
            ]
        },
        format='json',
    )

    sales_order.refresh_from_db()
    stock_entry.refresh_from_db()

    assert response.status_code == 200
    assert sales_order.status == 'confirmed'
    assert StockAllocation.objects.filter(sales_order_item=sales_order_item, type='sale').count() == 1
    assert stock_entry.quantity_available == Decimal('6.0000')


def test_confirm_sales_order_rejects_allocations_greater_than_available_stock(
    authenticated_client,
    sales_order,
    sales_order_item,
    stock_entry,
):
    response = authenticated_client.post(
        f'/api/sales-orders/{sales_order.id}/confirm_with_allocations/',
        {
            'allocations': [
                {
                    'sales_order_item_id': sales_order_item.id,
                    'stock_entry_id': stock_entry.id,
                    'quantity_allocated': '11.0000',
                }
            ]
        },
        format='json',
    )

    sales_order.refresh_from_db()

    assert response.status_code == 400
    assert 'Insufficient stock' in response.data['error']
    assert sales_order.status == 'draft'
    assert StockAllocation.objects.count() == 0


def test_sales_order_confirm_endpoint_requires_allocations(authenticated_client, sales_order):
    response = authenticated_client.post(f'/api/sales-orders/{sales_order.id}/confirm/', {}, format='json')

    assert response.status_code == 400
    assert 'confirm_with_allocations' in response.data['detail']


def test_sales_order_reopen_requires_confirmation_when_allocations_exist(
    authenticated_client,
    user,
    sales_order_item,
    stock_entry,
):
    sales_order = sales_order_item.sales_order
    sales_order.status = 'confirmed'
    sales_order.save(update_fields=['status'])
    StockAllocation.objects.create(
        user=user,
        sales_order_item=sales_order_item,
        stock_entry=stock_entry,
        quantity_allocated=Decimal('2.0000'),
        type='sale',
    )

    response = authenticated_client.post(f'/api/sales-orders/{sales_order.id}/reopen/', {}, format='json')

    assert response.status_code == 400
    assert response.data['requires_confirmation'] is True


def test_sales_order_reopen_deletes_allocations_when_confirmed(
    authenticated_client,
    user,
    sales_order_item,
    stock_entry,
):
    sales_order = sales_order_item.sales_order
    sales_order.status = 'confirmed'
    sales_order.save(update_fields=['status'])
    StockAllocation.objects.create(
        user=user,
        sales_order_item=sales_order_item,
        stock_entry=stock_entry,
        quantity_allocated=Decimal('2.0000'),
        type='sale',
    )

    response = authenticated_client.post(
        f'/api/sales-orders/{sales_order.id}/reopen/',
        {'delete_allocations': True},
        format='json',
    )

    sales_order.refresh_from_db()
    assert response.status_code == 200
    assert sales_order.status == 'draft'
    assert StockAllocation.objects.filter(sales_order_item=sales_order_item).count() == 0


def test_sales_order_detail_is_not_accessible_across_users(api_client, user, other_user, product):
    api_client.force_authenticate(user=other_user)
    protected_order = SalesOrder.objects.create(
        user=user,
        order_number='SO-999',
        customer_name='Protected Customer',
        status='draft',
        sold_at='2026-04-24T18:00:00Z',
    )
    SalesOrderItem.objects.create(
        sales_order=protected_order,
        product=product,
        quantity=Decimal('1.0000'),
        unit_price=Decimal('10.00'),
    )

    response = api_client.get(f'/api/sales-orders/{protected_order.id}/')

    assert response.status_code == 404
