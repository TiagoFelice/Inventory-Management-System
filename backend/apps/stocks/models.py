from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.db.models import Sum
from apps.products.models import Product


class StockEntry(models.Model):
    """
    Stock entry - represents a unique stock lot/batch.

    source_type: 'manual' or 'purchase_order'
    source_reference_id: Foreign key ID to the source (e.g., purchase_order_item ID)
    
    quantity_available <= quantity_received (some may be sold or discarded)
    """
    
    SOURCE_TYPE_CHOICES = [
        ('manual', 'Manual Entry'),
        ('purchase_order', 'Purchase Order'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='stock_entries')
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name='stock_entries'
    )
    stock_identifier = models.CharField(max_length=255, unique=True, blank=True)
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPE_CHOICES)
    source_reference_id = models.IntegerField(blank=True, null=True)
    quantity_received = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0'))]
    )
    received_at = models.DateTimeField()
    expiration_date = models.DateField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'stock_entries'
        indexes = [
            models.Index(fields=['user', 'product']),
            models.Index(fields=['stock_identifier']),
            models.Index(fields=['received_at']),
        ]
    
    def __str__(self):
        return f"Stock Entry #{self.pk} - {self.quantity_available} available"
    
    def save(self, *args, **kwargs):
        """Generate the stock identifier after the first save when needed."""
        is_new = self._state.adding
        super().save(*args, **kwargs)

        if is_new and not self.stock_identifier:
            self.stock_identifier = f"STK-{self.pk:06d}"
            super().save(update_fields=['stock_identifier'])

    @property
    def effective_unit_cost(self):
        """
        Derive cost from the purchase order item when stock originates from purchasing.
        Manual stock entries do not carry their own cost field anymore.
        """
        if self.source_type != 'purchase_order' or not self.source_reference_id:
            return Decimal('0.00')

        from apps.purchase_orders.models import PurchaseOrderItem

        purchase_item = (
            PurchaseOrderItem.objects
            .filter(
                id=self.source_reference_id,
                purchase_order__user=self.user,
            )
            .only('unit_cost')
            .first()
        )
        return purchase_item.unit_cost if purchase_item else Decimal('0.00')

    @property
    def total_cost(self):
        """Compute total received value from the derived unit cost."""
        return self.quantity_received * self.effective_unit_cost
    
    @property
    def quantity_allocated_total(self):
        """Calculate how much of this stock has been allocated across all allocation types."""
        from apps.sales_orders.models import StockAllocation
        return StockAllocation.objects.filter(stock_entry=self).aggregate(
            total=models.Sum('quantity_allocated')
        )['total'] or Decimal('0.00')

    @property
    def quantity_available(self):
        """Available stock is received minus related allocations."""
        available = self.quantity_received - self.quantity_allocated_total
        return available if available > Decimal('0.00') else Decimal('0.00')

    @property
    def quantity_sold(self):
        """Calculate how much of this stock has been allocated to sales."""
        from apps.sales_orders.models import StockAllocation
        return StockAllocation.objects.filter(
            stock_entry=self,
            type='sale',
        ).aggregate(total=Sum('quantity_allocated'))['total'] or Decimal('0.00')
