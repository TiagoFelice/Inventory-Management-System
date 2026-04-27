from decimal import Decimal

import pytest

from apps.products.models import Product
from apps.stocks.models import StockEntry


pytestmark = pytest.mark.django_db


def test_products_endpoint_is_scoped_to_authenticated_user(authenticated_client, user, other_user):
    own_product = Product.objects.create(
        user=user,
        name='Own Product',
        sku='OWN-001',
        base_unit='unit',
        amount=Decimal('0.00'),
    )
    Product.objects.create(
        user=other_user,
        name='Other Product',
        sku='OTH-001',
        base_unit='unit',
        amount=Decimal('0.00'),
    )

    response = authenticated_client.get('/api/products/')

    assert response.status_code == 200
    assert response.data['count'] == 1
    assert response.data['results'][0]['id'] == own_product.id


def test_product_stock_summary_returns_entry_metrics(authenticated_client, user, product):
    first_entry = StockEntry.objects.create(
        user=user,
        product=product,
        source_type='manual',
        quantity_received=Decimal('3.0000'),
        received_at='2026-04-24T10:00:00Z',
    )
    second_entry = StockEntry.objects.create(
        user=user,
        product=product,
        source_type='manual',
        quantity_received=Decimal('2.0000'),
        received_at='2026-04-24T11:00:00Z',
    )

    response = authenticated_client.get(f'/api/products/{product.id}/stock_summary/')

    assert response.status_code == 200
    assert response.data['product_id'] == product.id
    assert response.data['total_available'] == Decimal('5.0000')
    assert {item['id'] for item in response.data['stock_entries']} == {first_entry.id, second_entry.id}


def test_product_detail_is_not_accessible_across_users(api_client, user, other_user):
    protected_product = Product.objects.create(
        user=user,
        name='Protected Product',
        sku='PRT-001',
        base_unit='unit',
        amount=Decimal('0.00'),
    )
    api_client.force_authenticate(user=other_user)

    response = api_client.get(f'/api/products/{protected_product.id}/')

    assert response.status_code == 404
