from decimal import Decimal

import pytest

from apps.products.models import Product
from apps.purchase_orders.models import PurchaseOrder, PurchaseOrderItem
from apps.stocks.models import StockEntry


pytestmark = pytest.mark.django_db


def test_receive_purchase_order_with_entries_creates_stock_and_marks_received(
    authenticated_client,
    purchase_order,
    purchase_order_item,
):
    response = authenticated_client.post(
        f'/api/purchase-orders/{purchase_order.id}/receive_with_entries/',
        {
            'entries': [
                {
                    'purchase_order_item_id': purchase_order_item.id,
                    'quantity_received': '5.0000',
                }
            ]
        },
        format='json',
    )

    purchase_order.refresh_from_db()
    created_entry = StockEntry.objects.get(source_reference_id=purchase_order_item.id)

    assert response.status_code == 200
    assert purchase_order.status == 'received'
    assert created_entry.source_type == 'purchase_order'
    assert created_entry.quantity_received == Decimal('5.0000')


def test_receive_purchase_order_requires_each_item_to_be_fully_received(
    authenticated_client,
    purchase_order,
    purchase_order_item,
):
    response = authenticated_client.post(
        f'/api/purchase-orders/{purchase_order.id}/receive_with_entries/',
        {
            'entries': [
                {
                    'purchase_order_item_id': purchase_order_item.id,
                    'quantity_received': '4.0000',
                }
            ]
        },
        format='json',
    )

    purchase_order.refresh_from_db()

    assert response.status_code == 400
    assert 'must total 5.0000' in response.data['error']
    assert purchase_order.status == 'confirmed'
    assert not StockEntry.objects.filter(source_reference_id=purchase_order_item.id).exists()


def test_purchase_order_confirm_moves_draft_to_confirmed(authenticated_client, user):
    purchase_order = PurchaseOrder.objects.create(
        user=user,
        supplier_name='Supplier',
        order_number='PO-CONFIRM',
        status='draft',
        ordered_at='2026-04-24T10:00:00Z',
    )

    response = authenticated_client.post(f'/api/purchase-orders/{purchase_order.id}/confirm/', {}, format='json')

    purchase_order.refresh_from_db()
    assert response.status_code == 200
    assert purchase_order.status == 'confirmed'


def test_purchase_order_patch_rejects_received_status_change(authenticated_client, purchase_order):
    response = authenticated_client.patch(
        f'/api/purchase-orders/{purchase_order.id}/',
        {'status': 'received'},
        format='json',
    )

    assert response.status_code == 400
    assert 'detail' in response.data


def test_purchase_order_reopen_requires_confirmation_when_stock_entries_exist(
    authenticated_client,
    user,
    purchase_order_item,
):
    purchase_order = purchase_order_item.purchase_order
    purchase_order.status = 'received'
    purchase_order.save(update_fields=['status'])
    StockEntry.objects.create(
        user=user,
        product=purchase_order_item.product,
        source_type='purchase_order',
        source_reference_id=purchase_order_item.id,
        quantity_received=Decimal('5.0000'),
        received_at='2026-04-24T10:00:00Z',
    )

    response = authenticated_client.post(f'/api/purchase-orders/{purchase_order.id}/reopen/', {}, format='json')

    assert response.status_code == 400
    assert response.data['requires_confirmation'] is True


def test_purchase_order_reopen_deletes_unallocated_stock_entries(
    authenticated_client,
    user,
    purchase_order_item,
):
    purchase_order = purchase_order_item.purchase_order
    purchase_order.status = 'received'
    purchase_order.save(update_fields=['status'])
    StockEntry.objects.create(
        user=user,
        product=purchase_order_item.product,
        source_type='purchase_order',
        source_reference_id=purchase_order_item.id,
        quantity_received=Decimal('5.0000'),
        received_at='2026-04-24T10:00:00Z',
    )

    response = authenticated_client.post(
        f'/api/purchase-orders/{purchase_order.id}/reopen/',
        {'delete_stock_entries': True},
        format='json',
    )

    purchase_order.refresh_from_db()
    assert response.status_code == 200
    assert purchase_order.status == 'confirmed'
    assert StockEntry.objects.filter(source_reference_id=purchase_order_item.id).count() == 0


def test_receive_purchase_order_rejects_non_positive_entry_quantity(
    authenticated_client,
    purchase_order,
    purchase_order_item,
):
    response = authenticated_client.post(
        f'/api/purchase-orders/{purchase_order.id}/receive_with_entries/',
        {
            'entries': [
                {
                    'purchase_order_item_id': purchase_order_item.id,
                    'quantity_received': '0.0000',
                }
            ]
        },
        format='json',
    )

    purchase_order.refresh_from_db()
    assert response.status_code == 400
    assert 'must be greater than zero' in response.data['error']
    assert purchase_order.status == 'confirmed'
    assert not StockEntry.objects.filter(source_reference_id=purchase_order_item.id).exists()


def test_purchase_order_create_rejects_product_from_other_user(authenticated_client, other_user):
    other_product = Product.objects.create(
        user=other_user,
        name='Foreign Product',
        sku='FOR-PO-1',
        base_unit='unit',
        amount=Decimal('0.00'),
    )

    response = authenticated_client.post(
        '/api/purchase-orders/',
        {
            'order_number': 'PO-FOREIGN',
            'supplier_name': 'Supplier',
            'ordered_at': '2026-04-24T10:00:00Z',
            'items': [
                {
                    'product': other_product.id,
                    'quantity': '1.0000',
                    'unit_cost': '3.50',
                }
            ],
        },
        format='json',
    )

    assert response.status_code == 400
    assert 'items' in response.data
