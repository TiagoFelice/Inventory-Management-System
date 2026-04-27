from decimal import Decimal

import pytest
from rest_framework.exceptions import ValidationError

from apps.finance.views import build_summary, calculate_margin, money, parse_ids, parse_period, quantity


def test_money_quantizes_to_two_decimals():
    assert money(Decimal('10.005')) == Decimal('10.01')


def test_quantity_quantizes_to_four_decimals():
    assert quantity(Decimal('3.45678')) == Decimal('3.4568')


def test_calculate_margin_returns_none_when_cogs_is_zero():
    assert calculate_margin(Decimal('10.00'), Decimal('0.00')) is None


def test_parse_ids_returns_integer_set():
    assert parse_ids('1, 2,3') == {1, 2, 3}


def test_parse_ids_rejects_invalid_values():
    with pytest.raises(ValidationError):
        parse_ids('1,nope')


def test_parse_period_rejects_end_before_start():
    with pytest.raises(ValidationError):
        parse_period('2026-04-10', '2026-04-01')


def test_build_summary_aggregates_money_and_quantities():
    summary = build_summary(
        [
            {
                'total_revenue': Decimal('40.00'),
                'total_purchase_cost': Decimal('50.00'),
                'total_cogs': Decimal('20.00'),
                'quantity_purchased': Decimal('10.0000'),
                'quantity_sold': Decimal('4.0000'),
                'quantity_remaining': Decimal('6.0000'),
            },
            {
                'total_revenue': Decimal('0.00'),
                'total_purchase_cost': Decimal('40.00'),
                'total_cogs': Decimal('0.00'),
                'quantity_purchased': Decimal('20.0000'),
                'quantity_sold': Decimal('0.0000'),
                'quantity_remaining': Decimal('20.0000'),
            },
        ]
    )

    assert summary['total_revenue'] == Decimal('40.00')
    assert summary['total_purchase_cost'] == Decimal('90.00')
    assert summary['total_cogs'] == Decimal('20.00')
    assert summary['profit'] == Decimal('20.00')
    assert summary['quantity_purchased'] == Decimal('30.0000')
