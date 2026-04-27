from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError

from apps.purchase_orders.models import PurchaseOrder, PurchaseOrderItem
from apps.sales_orders.models import StockAllocation
from apps.stocks.models import StockEntry


pytestmark = pytest.mark.django_db


def test_stock_entry_derives_cost_from_purchase_order_item(user, product):
    purchase_order = PurchaseOrder.objects.create(
        user=user,
        supplier_name='Supplier',
        order_number='PO-201',
        status='received',
        ordered_at='2026-04-24T09:00:00Z',
    )
    purchase_item = PurchaseOrderItem.objects.create(
        purchase_order=purchase_order,
        product=product,
        quantity=Decimal('6.0000'),
        unit_cost=Decimal('2.50'),
    )
    entry = StockEntry.objects.create(
        user=user,
        product=product,
        source_type='purchase_order',
        source_reference_id=purchase_item.id,
        quantity_received=Decimal('6.0000'),
        received_at='2026-04-24T11:00:00Z',
    )

    assert entry.effective_unit_cost == Decimal('2.50')
    assert entry.total_cost == Decimal('15.000000')


def test_manual_stock_entry_has_zero_effective_cost(stock_entry):
    assert stock_entry.effective_unit_cost == Decimal('0.00')
    assert stock_entry.total_cost == Decimal('0.000000')


def test_stock_entry_generates_identifier_on_save(stock_entry):
    assert stock_entry.stock_identifier.startswith('STK-')


def test_stock_entry_available_quantity_and_quantity_sold_use_allocations(stock_entry, user, sales_order_item):
    StockAllocation.objects.create(
        user=user,
        stock_entry=stock_entry,
        sales_order_item=sales_order_item,
        quantity_allocated=Decimal('2.0000'),
        type='sale',
    )
    StockAllocation.objects.create(
        user=user,
        stock_entry=stock_entry,
        quantity_allocated=Decimal('1.5000'),
        type='other',
    )

    stock_entry.refresh_from_db()

    assert stock_entry.quantity_allocated_total == Decimal('3.5000')
    assert stock_entry.quantity_available == Decimal('6.5000')
    assert stock_entry.quantity_sold == Decimal('2.0000')


def test_stock_allocation_rejects_negative_quantity_on_model_validation(user, stock_entry):
    allocation = StockAllocation(
        user=user,
        stock_entry=stock_entry,
        quantity_allocated=Decimal('-1.0000'),
        type='other',
    )

    with pytest.raises(ValidationError) as exc:
        allocation.full_clean()

    assert 'quantity_allocated' in exc.value.message_dict
