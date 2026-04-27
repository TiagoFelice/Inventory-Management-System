from decimal import Decimal

import pytest

from apps.products.models import Product
from apps.sales_orders.models import SalesOrder, SalesOrderItem, StockAllocation
from apps.stocks.models import StockEntry


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


def test_cancelling_confirmed_sales_order_releases_allocations(
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

    response = authenticated_client.post(f'/api/sales-orders/{sales_order.id}/cancel/', {}, format='json')

    sales_order.refresh_from_db()
    stock_entry.refresh_from_db()
    assert response.status_code == 200
    assert sales_order.status == 'cancelled'
    assert StockAllocation.objects.filter(sales_order_item=sales_order_item, type='sale').count() == 0
    assert stock_entry.quantity_available == Decimal('10.0000')


def test_confirm_sales_order_rejects_stock_entry_from_other_product(
    authenticated_client,
    user,
    sales_order,
    sales_order_item,
):
    other_product = Product.objects.create(
        user=user,
        name='Other Product',
        sku='OTH-999',
        base_unit='unit',
        amount=Decimal('0.00'),
    )
    wrong_stock_entry = StockEntry.objects.create(
        user=user,
        product=other_product,
        source_type='manual',
        quantity_received=Decimal('10.0000'),
        received_at='2026-04-24T12:00:00Z',
    )

    response = authenticated_client.post(
        f'/api/sales-orders/{sales_order.id}/confirm_with_allocations/',
        {
            'allocations': [
                {
                    'sales_order_item_id': sales_order_item.id,
                    'stock_entry_id': wrong_stock_entry.id,
                    'quantity_allocated': '4.0000',
                }
            ]
        },
        format='json',
    )

    sales_order.refresh_from_db()
    assert response.status_code == 400
    assert 'does not belong to product' in response.data['error']
    assert sales_order.status == 'draft'
    assert StockAllocation.objects.count() == 0


def test_manual_stock_allocation_rejects_cross_user_sales_order_item(
    authenticated_client,
    user,
    other_user,
    stock_entry,
):
    other_product = Product.objects.create(
        user=other_user,
        name='Other User Product',
        sku='OTH-USER',
        base_unit='unit',
        amount=Decimal('0.00'),
    )
    other_order = SalesOrder.objects.create(
        user=other_user,
        order_number='SO-OTHER',
        customer_name='Other',
        status='draft',
        sold_at='2026-04-24T18:00:00Z',
    )
    other_item = SalesOrderItem.objects.create(
        sales_order=other_order,
        product=other_product,
        quantity=Decimal('1.0000'),
        unit_price=Decimal('5.00'),
    )

    response = authenticated_client.post(
        '/api/stock-allocations/',
        {
            'stock_entry': stock_entry.id,
            'sales_order_item': other_item.id,
            'quantity_allocated': '1.0000',
            'type': 'sale',
        },
        format='json',
    )

    assert response.status_code == 400
    assert 'sales_order_item' in response.data


def test_manual_stock_allocation_rejects_cross_product_link(
    authenticated_client,
    user,
    sales_order_item,
):
    other_product = Product.objects.create(
        user=user,
        name='Other Product',
        sku='OTH-LINK',
        base_unit='unit',
        amount=Decimal('0.00'),
    )
    wrong_stock_entry = StockEntry.objects.create(
        user=user,
        product=other_product,
        source_type='manual',
        quantity_received=Decimal('10.0000'),
        received_at='2026-04-24T12:00:00Z',
    )

    response = authenticated_client.post(
        '/api/stock-allocations/',
        {
            'stock_entry': wrong_stock_entry.id,
            'sales_order_item': sales_order_item.id,
            'quantity_allocated': '1.0000',
            'type': 'sale',
        },
        format='json',
    )

    assert response.status_code == 400
    assert 'stock_entry' in response.data


def test_sales_order_create_rejects_product_from_other_user(authenticated_client, other_user):
    other_product = Product.objects.create(
        user=other_user,
        name='Foreign Product',
        sku='FOR-001',
        base_unit='unit',
        amount=Decimal('0.00'),
    )

    response = authenticated_client.post(
        '/api/sales-orders/',
        {
            'order_number': 'SO-FOREIGN',
            'customer_name': 'Alice',
            'sold_at': '2026-04-24T14:00:00Z',
            'items': [
                {
                    'product': other_product.id,
                    'quantity': '1.0000',
                    'unit_price': '12.50',
                }
            ],
        },
        format='json',
    )

    assert response.status_code == 400
    assert 'items' in response.data


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
