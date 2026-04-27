from decimal import Decimal

import pytest
from django.contrib.auth.models import User

from apps.products.models import Product
from apps.purchase_orders.models import PurchaseOrder, PurchaseOrderItem
from apps.sales_orders.models import SalesOrder, SalesOrderItem, StockAllocation
from apps.stocks.models import StockEntry


pytestmark = pytest.mark.django_db


@pytest.fixture
def finance_data(user):
    product = Product.objects.create(
        user=user,
        name='Arabica Beans',
        sku='COF-001',
        base_unit='kg',
        amount=0,
    )
    second_product = Product.objects.create(
        user=user,
        name='Paper Cups',
        sku='CUP-001',
        base_unit='unit',
        amount=0,
    )

    purchase_order = PurchaseOrder.objects.create(
        user=user,
        supplier_name='Supplier A',
        order_number='PO-001',
        status='received',
        ordered_at='2026-04-01T09:00:00Z',
    )
    purchase_item = PurchaseOrderItem.objects.create(
        purchase_order=purchase_order,
        product=product,
        quantity=Decimal('10.0000'),
        unit_cost=Decimal('5.00'),
    )
    PurchaseOrderItem.objects.create(
        purchase_order=purchase_order,
        product=second_product,
        quantity=Decimal('20.0000'),
        unit_cost=Decimal('2.00'),
    )

    stock_entry = StockEntry.objects.create(
        user=user,
        product=product,
        source_type='purchase_order',
        source_reference_id=purchase_item.id,
        quantity_received=Decimal('10.0000'),
        received_at='2026-04-01T12:00:00Z',
    )
    sales_order = SalesOrder.objects.create(
        user=user,
        order_number='SO-001',
        customer_name='Retail Shop',
        status='confirmed',
        sold_at='2026-04-05T10:00:00Z',
    )
    sales_item = SalesOrderItem.objects.create(
        sales_order=sales_order,
        product=product,
        quantity=Decimal('4.0000'),
        unit_price=Decimal('10.00'),
    )
    StockAllocation.objects.create(
        user=user,
        sales_order_item=sales_item,
        stock_entry=stock_entry,
        quantity_allocated=Decimal('4.0000'),
    )

    other_user = User.objects.create_user(username='finance-other', password='pass1234')
    other_product = Product.objects.create(
        user=other_user,
        name='Foreign Product',
        sku='FOR-001',
        base_unit='unit',
        amount=0,
    )
    other_purchase_order = PurchaseOrder.objects.create(
        user=other_user,
        supplier_name='Other Supplier',
        order_number='PO-999',
        status='received',
        ordered_at='2026-04-01T09:00:00Z',
    )
    other_purchase_item = PurchaseOrderItem.objects.create(
        purchase_order=other_purchase_order,
        product=other_product,
        quantity=Decimal('1.0000'),
        unit_cost=Decimal('100.00'),
    )
    other_stock = StockEntry.objects.create(
        user=other_user,
        product=other_product,
        source_type='purchase_order',
        source_reference_id=other_purchase_item.id,
        quantity_received=Decimal('1.0000'),
        received_at='2026-04-01T12:00:00Z',
    )
    other_sales_order = SalesOrder.objects.create(
        user=other_user,
        order_number='SO-999',
        customer_name='Other Customer',
        status='confirmed',
        sold_at='2026-04-05T10:00:00Z',
    )
    other_sales_item = SalesOrderItem.objects.create(
        sales_order=other_sales_order,
        product=other_product,
        quantity=Decimal('1.0000'),
        unit_price=Decimal('130.00'),
    )
    StockAllocation.objects.create(
        user=other_user,
        sales_order_item=other_sales_item,
        stock_entry=other_stock,
        quantity_allocated=Decimal('1.0000'),
    )

    return {
        'product': product,
        'purchase_item': purchase_item,
    }


def test_finance_products_endpoint_returns_summary_for_current_user_only(authenticated_client, finance_data):
    response = authenticated_client.get('/api/finance/products/')

    assert response.status_code == 200
    assert response.data['summary']['total_revenue'] == '40.00'
    assert response.data['summary']['total_purchase_cost'] == '90.00'
    assert response.data['summary']['total_cogs'] == '20.00'
    assert response.data['summary']['profit'] == '20.00'
    assert len(response.data['items']) == 2

    items = {item['id']: item for item in response.data['items']}
    assert items[finance_data['product'].id]['total_revenue'] == '40.00'
    assert items[finance_data['product'].id]['quantity_remaining'] == '6.0000'


def test_finance_purchase_items_endpoint_supports_ids_filter(authenticated_client, finance_data):
    response = authenticated_client.get(
        '/api/finance/purchase-items/',
        {'ids': str(finance_data['purchase_item'].id)},
    )

    assert response.status_code == 200
    assert len(response.data['items']) == 1
    assert response.data['items'][0]['id'] == finance_data['purchase_item'].id
    assert response.data['items'][0]['remaining_value'] == '30.00'


def test_finance_products_endpoint_supports_search(authenticated_client, finance_data):
    response = authenticated_client.get('/api/finance/products/', {'search': 'Arabica'})

    assert response.status_code == 200
    assert len(response.data['items']) == 1
    assert response.data['items'][0]['id'] == finance_data['product'].id


def test_finance_products_endpoint_supports_period_filter(authenticated_client, finance_data):
    response = authenticated_client.get(
        '/api/finance/products/',
        {'start_date': '2026-04-05', 'end_date': '2026-04-05'},
    )

    assert response.status_code == 200
    assert response.data['summary']['total_purchase_cost'] == '0.00'
    assert response.data['summary']['total_revenue'] == '40.00'
    assert response.data['summary']['quantity_purchased'] == '0.0000'
