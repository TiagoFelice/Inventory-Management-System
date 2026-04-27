from decimal import Decimal

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError

from apps.purchase_orders.models import PurchaseOrder, PurchaseOrderItem


pytestmark = pytest.mark.django_db


def test_purchase_order_item_save_recomputes_total_cost(purchase_order, product):
    item = PurchaseOrderItem.objects.create(
        purchase_order=purchase_order,
        product=product,
        quantity=Decimal('2.5000'),
        unit_cost=Decimal('4.20'),
    )

    item.quantity = Decimal('3.0000')
    item.unit_cost = Decimal('5.00')
    item.total_cost = Decimal('0.00')
    item.save()
    item.refresh_from_db()

    assert item.total_cost == Decimal('15.00')
    assert purchase_order.total_cost == Decimal('15.00')


def test_purchase_order_total_cost_aggregates_multiple_items(purchase_order, product, user):
    PurchaseOrderItem.objects.create(
        purchase_order=purchase_order,
        product=product,
        quantity=Decimal('2.0000'),
        unit_cost=Decimal('4.00'),
    )
    second_product = type(product).objects.create(
        user=user,
        name='Second Product',
        sku='SEC-001',
        base_unit='unit',
        amount=Decimal('0.00'),
    )
    PurchaseOrderItem.objects.create(
        purchase_order=purchase_order,
        product=second_product,
        quantity=Decimal('3.0000'),
        unit_cost=Decimal('2.00'),
    )

    assert purchase_order.total_cost == Decimal('14.00')


def test_purchase_order_item_rejects_zero_quantity_on_model_validation(purchase_order, product):
    item = PurchaseOrderItem(
        purchase_order=purchase_order,
        product=product,
        quantity=Decimal('0.0000'),
        unit_cost=Decimal('4.00'),
        total_cost=Decimal('0.00'),
    )

    with pytest.raises(ValidationError) as exc:
        item.full_clean()

    assert 'quantity' in exc.value.message_dict


def test_purchase_order_number_must_be_unique_per_user(user):
    PurchaseOrder.objects.create(
        user=user,
        supplier_name='Supplier One',
        order_number='PO-UNI',
        status='draft',
        ordered_at='2026-04-24T10:00:00Z',
    )

    with pytest.raises(IntegrityError):
        PurchaseOrder.objects.create(
            user=user,
            supplier_name='Supplier Two',
            order_number='PO-UNI',
            status='draft',
            ordered_at='2026-04-24T11:00:00Z',
        )
