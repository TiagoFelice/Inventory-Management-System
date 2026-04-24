from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.products.models import Product
from apps.stocks.models import StockEntry


class SalesOrder(models.Model):
    """
    Sales order header.
    
    Tracks sales to customers.
    Status: draft, confirmed, cancelled
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sales_orders')
    order_number = models.CharField(max_length=100)
    customer_name = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    sold_at = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sales_orders'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', 'sold_at']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['user', 'order_number'], name='unique_so_number_per_user'),
        ]
    
    def __str__(self):
        return f"SO {self.order_number} - {self.customer_name}"
    
    @property
    def total_revenue(self):
        """Calculate total revenue from all items in this sales order."""
        return self.items.aggregate(
            total=models.Sum('total_revenue')
        )['total'] or Decimal('0.00')
    
    @property
    def total_cost(self):
        """
        Calculate total cost of goods sold for this sales order.
        Note: Requires cost tracking to be implemented at the StockAllocation level.
        Currently returns 0.00.
        """
        # TODO: Implement cost tracking if needed
        return Decimal('0.00')
    
    @property
    def total_profit(self):
        """Calculate profit: revenue - cost."""
        return self.total_revenue - self.total_cost


class SalesOrderItem(models.Model):
    """
    Sales order line item.
    
    Represents what was sold.
    Multiple stock_allocations can be created from a single sales order item
    if the item is fulfilled from multiple stock lots (FIFO or other strategy).
    """
    
    sales_order = models.ForeignKey(
        SalesOrder,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='sales_order_items'
    )
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0001'))]
    )
    unit_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total_revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'sales_order_items'
        indexes = [
            models.Index(fields=['sales_order']),
            models.Index(fields=['product']),
        ]
    
    def __str__(self):
        return f"{self.product.sku} - {self.quantity} @ ${self.unit_price}"
    
    def save(self, *args, **kwargs):
        """Automatically calculate total_revenue if not set."""
        if not self.total_revenue:
            self.total_revenue = self.quantity * self.unit_price
        super().save(*args, **kwargs)
    
    @property
    def total_cost(self):
        """
        Calculate cost of goods sold for this line item.
        Note: Requires cost tracking to be implemented at the StockAllocation level.
        Currently returns 0.00.
        """
        # TODO: Implement cost tracking if needed
        return Decimal('0.00')
    
    @property
    def profit(self):
        """Calculate profit for this item: revenue - cost."""
        return self.total_revenue - self.total_cost
    
    @property
    def margin_percent(self):
        """Calculate profit margin as percentage."""
        if self.total_cost == 0:
            return None
        return ((self.total_revenue - self.total_cost) / self.total_cost) * 100


class StockAllocation(models.Model):
    """
    Stock allocation - links sales items to stock entries.
    
    This table is essential for:
    1. Tracing which stock lots were consumed by which sales
    2. Implementing FIFO or other inventory costing strategies
    3. Accurate profit calculation per sale
    
    A sales order item can be fulfilled from multiple stock entries.
    The allocation records the cost basis at the time of sale.
    """
    
    TYPE_CHOICES = [
        ('sale', 'Sale'),
        ('expired', 'Expired'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stock_allocations')
    sales_order_item = models.ForeignKey(
        SalesOrderItem,
        on_delete=models.CASCADE,
        related_name='allocations',
        blank=True,
        null=True,
    )
    stock_entry = models.ForeignKey(
        StockEntry,
        on_delete=models.PROTECT,
        related_name='allocations'
    )
    quantity_allocated = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0001'))]
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='sale')
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stock_allocations'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['sales_order_item']),
            models.Index(fields=['stock_entry']),
        ]
    
    def __str__(self):
        target = self.sales_order_item.sales_order.order_number if self.sales_order_item_id else self.type
        return f"Allocation: Stock Entry #{self.stock_entry_id} -> {target}"
