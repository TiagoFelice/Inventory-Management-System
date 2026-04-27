from decimal import Decimal

import pytest
from django.db import IntegrityError

from apps.products.models import Product
from apps.purchase_orders.models import PurchaseOrder, PurchaseOrderItem
from apps.sales_orders.models import StockAllocation
from apps.stocks.models import StockEntry


pytestmark = pytest.mark.django_db


def test_product_sku_must_be_unique_per_user(user, other_user):
    Product.objects.create(
        user=user,
        name='Milk',
        sku='SKU-001',
        base_unit='L',
        amount=Decimal('0.00'),
    )

    Product.objects.create(
        user=other_user,
        name='Milk',
        sku='SKU-001',
        base_unit='L',
        amount=Decimal('0.00'),
    )

    with pytest.raises(IntegrityError):
        Product.objects.create(
            user=user,
            name='Duplicate Milk',
            sku='SKU-001',
            base_unit='L',
            amount=Decimal('0.00'),
        )


def test_product_inventory_metrics_use_available_stock_only(user, product):
    purchase_order = PurchaseOrder.objects.create(
        user=user,
        supplier_name='Supplier',
        order_number='PO-200',
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
    StockAllocation.objects.create(
        user=user,
        stock_entry=entry,
        quantity_allocated=Decimal('1.5000'),
        type='expired',
    )

    product.refresh_from_db()

    assert product.available_quantity == Decimal('4.5000')
    assert product.total_inventory_value == Decimal('11.250000')
