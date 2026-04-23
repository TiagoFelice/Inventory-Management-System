from rest_framework import serializers


class FinancialMetricsSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_purchase_cost = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_cogs = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit_margin = serializers.DecimalField(max_digits=15, decimal_places=2, allow_null=True)
    quantity_purchased = serializers.DecimalField(max_digits=15, decimal_places=4, allow_null=True)
    quantity_sold = serializers.DecimalField(max_digits=15, decimal_places=4, allow_null=True)
    quantity_remaining = serializers.DecimalField(max_digits=15, decimal_places=4, allow_null=True)


class ProductFinancialItemSerializer(FinancialMetricsSerializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    sku = serializers.CharField()
    base_unit = serializers.CharField()


class PurchaseItemFinancialItemSerializer(FinancialMetricsSerializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    order_number = serializers.CharField()
    product_name = serializers.CharField()
    product_sku = serializers.CharField()
    base_unit = serializers.CharField()
    unit_cost = serializers.DecimalField(max_digits=15, decimal_places=2)
    remaining_value = serializers.DecimalField(max_digits=15, decimal_places=2)
