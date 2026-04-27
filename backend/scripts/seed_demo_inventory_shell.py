from datetime import timedelta
from decimal import Decimal

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from apps.products.models import Product
from apps.purchase_orders.models import PurchaseOrder, PurchaseOrderItem
from apps.sales_orders.models import SalesOrder, SalesOrderItem, StockAllocation
from apps.stocks.models import StockEntry


SEED_TAG = "[DEMO SEED]"
DEFAULT_PASSWORD = "demo1234"

PRODUCT_TEMPLATES = [
    {
        "key": "cold_brew",
        "name": "Cold Brew Bottle 250mL",
        "description": "Ready-to-drink cold brew coffee bottle.",
        "sku_prefix": "CB-250",
        "amount": Decimal("250.00"),
        "unit_cost": Decimal("1.80"),
        "unit_price": Decimal("3.90"),
    },
    {
        "key": "kombucha",
        "name": "Ginger Kombucha 330mL",
        "description": "Fermented sparkling tea.",
        "sku_prefix": "KOM-330",
        "amount": Decimal("330.00"),
        "unit_cost": Decimal("1.42"),
        "unit_price": Decimal("3.35"),
    },
    {
        "key": "granola",
        "name": "Almond Granola 500g",
        "description": "Snack product for retail packs.",
        "sku_prefix": "GRA-500",
        "amount": Decimal("500.00"),
        "unit_cost": Decimal("2.40"),
        "unit_price": Decimal("5.80"),
    },
    {
        "key": "syrup",
        "name": "Vanilla Syrup 1L",
        "description": "Ingredient product with open purchasing.",
        "sku_prefix": "SYR-1L",
        "amount": Decimal("1000.00"),
        "unit_cost": Decimal("4.75"),
        "unit_price": Decimal("8.90"),
    },
]


def delete_existing_seed_data(user):
    seed_sales_orders = SalesOrder.objects.filter(user=user, notes__icontains=SEED_TAG)
    StockAllocation.objects.filter(
        user=user,
        sales_order_item__sales_order__in=seed_sales_orders,
    ).delete()
    SalesOrderItem.objects.filter(sales_order__in=seed_sales_orders).delete()
    seed_sales_orders.delete()

    StockAllocation.objects.filter(user=user, notes__icontains=SEED_TAG).delete()
    StockEntry.objects.filter(user=user, notes__icontains=SEED_TAG).delete()

    seed_purchase_orders = PurchaseOrder.objects.filter(user=user, notes__icontains=SEED_TAG)
    PurchaseOrderItem.objects.filter(purchase_order__in=seed_purchase_orders).delete()
    seed_purchase_orders.delete()

    Product.objects.filter(user=user, sku__startswith="DEMO-").delete()


def create_product_batch(user, batch_number):
    products = {}
    for template in PRODUCT_TEMPLATES:
        sku = f"DEMO-{template['sku_prefix']}-{batch_number:02d}"
        products[template["key"]] = Product.objects.create(
            user=user,
            name=f"{template['name']} Batch {batch_number}",
            description=f"{SEED_TAG} {template['description']}",
            sku=sku,
            base_unit="unit",
            amount=template["amount"],
            is_active=True,
        )
    return products


def create_purchase_orders(user, batch_number, products, now):
    purchase_order_count = 0
    stock_entry_count = 0
    stock_entries_by_key = {}

    po_received_1 = PurchaseOrder.objects.create(
        user=user,
        supplier_name="Roastery Supply Co.",
        order_number=f"DEMO-PO-{batch_number:02d}-001",
        status="received",
        ordered_at=now - timedelta(days=18 + batch_number),
        notes=f"{SEED_TAG} Received purchase order 1 for batch {batch_number}.",
    )
    purchase_order_count += 1

    cold_brew_item = PurchaseOrderItem.objects.create(
        purchase_order=po_received_1,
        product=products["cold_brew"],
        quantity=Decimal("120.0000"),
        unit_cost=Decimal("1.80"),
    )
    kombucha_item_a = PurchaseOrderItem.objects.create(
        purchase_order=po_received_1,
        product=products["kombucha"],
        quantity=Decimal("90.0000"),
        unit_cost=Decimal("1.35"),
    )

    po_received_2 = PurchaseOrder.objects.create(
        user=user,
        supplier_name="Healthy Snacks SRL",
        order_number=f"DEMO-PO-{batch_number:02d}-002",
        status="received",
        ordered_at=now - timedelta(days=10 + batch_number),
        notes=f"{SEED_TAG} Received purchase order 2 for batch {batch_number}.",
    )
    purchase_order_count += 1

    granola_item = PurchaseOrderItem.objects.create(
        purchase_order=po_received_2,
        product=products["granola"],
        quantity=Decimal("75.0000"),
        unit_cost=Decimal("2.40"),
    )
    kombucha_item_b = PurchaseOrderItem.objects.create(
        purchase_order=po_received_2,
        product=products["kombucha"],
        quantity=Decimal("60.0000"),
        unit_cost=Decimal("1.42"),
    )

    po_confirmed = PurchaseOrder.objects.create(
        user=user,
        supplier_name="Ingredients Depot",
        order_number=f"DEMO-PO-{batch_number:02d}-003",
        status="confirmed",
        ordered_at=now - timedelta(days=3 + batch_number),
        notes=f"{SEED_TAG} Confirmed purchase order not yet received for batch {batch_number}.",
    )
    purchase_order_count += 1
    PurchaseOrderItem.objects.create(
        purchase_order=po_confirmed,
        product=products["syrup"],
        quantity=Decimal("24.0000"),
        unit_cost=Decimal("4.75"),
    )

    stock_entries_by_key["cold_brew"] = [
        StockEntry.objects.create(
            user=user,
            product=products["cold_brew"],
            source_type="purchase_order",
            source_reference_id=cold_brew_item.id,
            quantity_received=Decimal("80.0000"),
            received_at=now - timedelta(days=17 + batch_number),
            expiration_date=(now + timedelta(days=120 + batch_number)).date(),
            notes=f"{SEED_TAG} Partial lot from {po_received_1.order_number}.",
        ),
        StockEntry.objects.create(
            user=user,
            product=products["cold_brew"],
            source_type="purchase_order",
            source_reference_id=cold_brew_item.id,
            quantity_received=Decimal("40.0000"),
            received_at=now - timedelta(days=16 + batch_number),
            expiration_date=(now + timedelta(days=140 + batch_number)).date(),
            notes=f"{SEED_TAG} Second lot from {po_received_1.order_number}.",
        ),
    ]

    stock_entries_by_key["kombucha"] = [
        StockEntry.objects.create(
            user=user,
            product=products["kombucha"],
            source_type="purchase_order",
            source_reference_id=kombucha_item_a.id,
            quantity_received=Decimal("90.0000"),
            received_at=now - timedelta(days=17 + batch_number),
            expiration_date=(now + timedelta(days=60 + batch_number)).date(),
            notes=f"{SEED_TAG} First kombucha receipt for batch {batch_number}.",
        ),
        StockEntry.objects.create(
            user=user,
            product=products["kombucha"],
            source_type="purchase_order",
            source_reference_id=kombucha_item_b.id,
            quantity_received=Decimal("60.0000"),
            received_at=now - timedelta(days=9 + batch_number),
            expiration_date=(now + timedelta(days=90 + batch_number)).date(),
            notes=f"{SEED_TAG} Second kombucha receipt for batch {batch_number}.",
        ),
    ]

    stock_entries_by_key["granola"] = [
        StockEntry.objects.create(
            user=user,
            product=products["granola"],
            source_type="purchase_order",
            source_reference_id=granola_item.id,
            quantity_received=Decimal("75.0000"),
            received_at=now - timedelta(days=9 + batch_number),
            expiration_date=(now + timedelta(days=180 + batch_number)).date(),
            notes=f"{SEED_TAG} Granola receipt from {po_received_2.order_number}.",
        ),
        StockEntry.objects.create(
            user=user,
            product=products["granola"],
            source_type="manual",
            source_reference_id=None,
            quantity_received=Decimal("12.0000"),
            received_at=now - timedelta(days=2 + batch_number),
            expiration_date=(now + timedelta(days=200 + batch_number)).date(),
            notes=f"{SEED_TAG} Manual stock adjustment for batch {batch_number}.",
        ),
    ]

    stock_entries_by_key["syrup"] = []
    stock_entry_count += sum(len(entries) for entries in stock_entries_by_key.values())

    return {
        "purchase_orders": purchase_order_count,
        "stock_entries": stock_entry_count,
        "stock_entries_by_key": stock_entries_by_key,
    }


def create_sales_orders(user, batch_number, products, stock_entries, now):
    sales_order_count = 0
    allocation_count = 0

    so_confirmed_1 = SalesOrder.objects.create(
        user=user,
        order_number=f"DEMO-SO-{batch_number:02d}-001",
        customer_name=f"Bistro Batch {batch_number}",
        status="confirmed",
        sold_at=now - timedelta(days=7 + batch_number),
        notes=f"{SEED_TAG} Confirmed order fulfilled from multiple lots for batch {batch_number}.",
    )
    sales_order_count += 1
    cold_brew_item = SalesOrderItem.objects.create(
        sales_order=so_confirmed_1,
        product=products["cold_brew"],
        quantity=Decimal("50.0000"),
        unit_price=Decimal("3.90"),
    )
    kombucha_item_1 = SalesOrderItem.objects.create(
        sales_order=so_confirmed_1,
        product=products["kombucha"],
        quantity=Decimal("24.0000"),
        unit_price=Decimal("3.20"),
    )

    so_confirmed_2 = SalesOrder.objects.create(
        user=user,
        order_number=f"DEMO-SO-{batch_number:02d}-002",
        customer_name=f"Green Market Batch {batch_number}",
        status="confirmed",
        sold_at=now - timedelta(days=4 + batch_number),
        notes=f"{SEED_TAG} Confirmed order for granola and kombucha for batch {batch_number}.",
    )
    sales_order_count += 1
    granola_item = SalesOrderItem.objects.create(
        sales_order=so_confirmed_2,
        product=products["granola"],
        quantity=Decimal("30.0000"),
        unit_price=Decimal("5.80"),
    )
    kombucha_item_2 = SalesOrderItem.objects.create(
        sales_order=so_confirmed_2,
        product=products["kombucha"],
        quantity=Decimal("18.0000"),
        unit_price=Decimal("3.35"),
    )

    so_draft = SalesOrder.objects.create(
        user=user,
        order_number=f"DEMO-SO-{batch_number:02d}-003",
        customer_name=f"Concept Store Batch {batch_number}",
        status="draft",
        sold_at=now - timedelta(days=1 + batch_number),
        notes=f"{SEED_TAG} Draft order left for testing batch {batch_number}.",
    )
    sales_order_count += 1
    SalesOrderItem.objects.create(
        sales_order=so_draft,
        product=products["cold_brew"],
        quantity=Decimal("15.0000"),
        unit_price=Decimal("4.10"),
    )
    SalesOrderItem.objects.create(
        sales_order=so_draft,
        product=products["granola"],
        quantity=Decimal("8.0000"),
        unit_price=Decimal("6.10"),
    )

    StockAllocation.objects.create(
        user=user,
        sales_order_item=cold_brew_item,
        stock_entry=stock_entries["cold_brew"][0],
        quantity_allocated=Decimal("45.0000"),
        type="sale",
        notes=f"{SEED_TAG} Allocation for {so_confirmed_1.order_number}.",
    )
    StockAllocation.objects.create(
        user=user,
        sales_order_item=cold_brew_item,
        stock_entry=stock_entries["cold_brew"][1],
        quantity_allocated=Decimal("5.0000"),
        type="sale",
        notes=f"{SEED_TAG} Allocation for {so_confirmed_1.order_number}.",
    )
    StockAllocation.objects.create(
        user=user,
        sales_order_item=kombucha_item_1,
        stock_entry=stock_entries["kombucha"][0],
        quantity_allocated=Decimal("24.0000"),
        type="sale",
        notes=f"{SEED_TAG} Allocation for {so_confirmed_1.order_number}.",
    )
    StockAllocation.objects.create(
        user=user,
        sales_order_item=granola_item,
        stock_entry=stock_entries["granola"][0],
        quantity_allocated=Decimal("30.0000"),
        type="sale",
        notes=f"{SEED_TAG} Allocation for {so_confirmed_2.order_number}.",
    )
    StockAllocation.objects.create(
        user=user,
        sales_order_item=kombucha_item_2,
        stock_entry=stock_entries["kombucha"][0],
        quantity_allocated=Decimal("18.0000"),
        type="sale",
        notes=f"{SEED_TAG} Allocation for {so_confirmed_2.order_number}.",
    )
    StockAllocation.objects.create(
        user=user,
        sales_order_item=None,
        stock_entry=stock_entries["kombucha"][0],
        quantity_allocated=Decimal("6.0000"),
        type="expired",
        notes=f"{SEED_TAG} Expired stock adjustment for batch {batch_number}.",
    )
    StockAllocation.objects.create(
        user=user,
        sales_order_item=None,
        stock_entry=stock_entries["granola"][1],
        quantity_allocated=Decimal("2.0000"),
        type="other",
        notes=f"{SEED_TAG} Internal tasting/sample usage for batch {batch_number}.",
    )
    allocation_count += 7

    return {
        "sales_orders": sales_order_count,
        "allocations": allocation_count,
    }


@transaction.atomic
def run_seed(username="DEMO", password=DEFAULT_PASSWORD, multiplier=10):
    user, _created = User.objects.get_or_create(
        username=username,
        defaults={"is_active": True},
    )
    user.set_password(password)
    user.save(update_fields=["password"])

    delete_existing_seed_data(user)

    now = timezone.now()
    summary = {
        "products": 0,
        "purchase_orders": 0,
        "stock_entries": 0,
        "sales_orders": 0,
        "allocations": 0,
    }

    for batch_number in range(1, multiplier + 1):
        batch_products = create_product_batch(user, batch_number)
        summary["products"] += len(batch_products)

        purchase_summary = create_purchase_orders(user, batch_number, batch_products, now)
        summary["purchase_orders"] += purchase_summary["purchase_orders"]
        summary["stock_entries"] += purchase_summary["stock_entries"]

        sales_summary = create_sales_orders(
            user,
            batch_number,
            batch_products,
            purchase_summary["stock_entries_by_key"],
            now,
        )
        summary["sales_orders"] += sales_summary["sales_orders"]
        summary["allocations"] += sales_summary["allocations"]

    print(f"Seeded deployed DB for {username}: {summary}")


run_seed()
