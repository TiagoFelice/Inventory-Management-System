from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
from apps.products.models import Product


class PurchaseOrder(models.Model):
    """
    Purchase order header.
    
    Tracks purchases from suppliers.
    Status: draft, confirmed, received, cancelled
    """
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('confirmed', 'Confirmed'),
        ('received', 'Received'),
        ('cancelled', 'Cancelled'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchase_orders')
    supplier_name = models.CharField(max_length=255)
    order_number = models.CharField(max_length=100)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    ordered_at = models.DateTimeField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'purchase_orders'
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['user', 'ordered_at']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['user', 'order_number'], name='unique_po_number_per_user'),
        ]
    
    def __str__(self):
        return f"PO {self.order_number} - {self.supplier_name}"
    
    @property
    def total_cost(self):
        """Calculate total cost of all items in this purchase order."""
        return self.items.aggregate(
            total=models.Sum('total_cost')
        )['total'] or Decimal('0.00')


class PurchaseOrderItem(models.Model):
    """
    Purchase order line item.
    
    Represents a specific product and quantity ordered from a purchase order.
    Multiple stock_entries can be created from a single purchase order item.
    """
    
    purchase_order = models.ForeignKey(
        PurchaseOrder, 
        on_delete=models.CASCADE, 
        related_name='items'
    )
    product = models.ForeignKey(
        Product, 
        on_delete=models.PROTECT, 
        related_name='purchase_order_items'
    )
    quantity = models.DecimalField(
        max_digits=15,
        decimal_places=4,
        validators=[MinValueValidator(Decimal('0.0001'))]
    )
    unit_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    total_cost = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'purchase_order_items'
        indexes = [
            models.Index(fields=['purchase_order']),
            models.Index(fields=['product']),
        ]
    
    def __str__(self):
        return f"{self.product.sku} - {self.quantity} {self.product.base_unit}"
    
    def save(self, *args, **kwargs):
        """Always keep total_cost consistent with quantity and unit_cost."""
        self.total_cost = self.quantity * self.unit_cost
        super().save(*args, **kwargs)
