from decimal import Decimal

import pytest

from apps.sales_orders.models import StockAllocation
from apps.stocks.models import StockEntry


pytestmark = pytest.mark.django_db


def test_stock_entries_endpoint_filters_by_product(authenticated_client, user, product):
    StockEntry.objects.create(
        user=user,
        product=product,
        source_type='manual',
        quantity_received=Decimal('3.0000'),
        received_at='2026-04-24T10:00:00Z',
    )
    other_product = type(product).objects.create(
        user=user,
        name='Other',
        sku='OTH-002',
        base_unit='unit',
        amount=Decimal('0.00'),
    )
    StockEntry.objects.create(
        user=user,
        product=other_product,
        source_type='manual',
        quantity_received=Decimal('5.0000'),
        received_at='2026-04-24T11:00:00Z',
    )

    response = authenticated_client.get('/api/stock-entries/', {'product': product.id})

    assert response.status_code == 200
    assert response.data['count'] == 1
    assert response.data['results'][0]['product'] == product.id


def test_stock_entry_allocation_detail_returns_quantities(authenticated_client, user, stock_entry, sales_order_item):
    allocation = StockAllocation.objects.create(
        user=user,
        stock_entry=stock_entry,
        sales_order_item=sales_order_item,
        quantity_allocated=Decimal('2.0000'),
        type='sale',
    )

    response = authenticated_client.get(f'/api/stock-entries/{stock_entry.id}/allocation_detail/')

    assert response.status_code == 200
    assert response.data['stock_entry_id'] == stock_entry.id
    assert response.data['quantity_allocated'] == Decimal('2.0000')
    assert response.data['allocations'][0]['id'] == allocation.id


def test_stock_entry_update_rejects_source_type_change(authenticated_client, stock_entry):
    response = authenticated_client.patch(
        f'/api/stock-entries/{stock_entry.id}/',
        {'source_type': 'purchase_order'},
        format='json',
    )

    assert response.status_code == 400
    assert 'source_type' in response.data
