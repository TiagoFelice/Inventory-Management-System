from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal


class Product(models.Model):
    """
    Product catalog.
    
    Each product belongs to exactly one user.
    SKU must be unique per user (not globally).
    """
    
    UNIT_CHOICES = [
        ('kg', 'Kilogram'),
        ('g', 'Gram'),
        ('L', 'Liter'),
        ('mL', 'Milliliter'),
        ('unit', 'Unit/Count'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    sku = models.CharField(max_length=100)
    base_unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
        indexes = [
            models.Index(fields=['user', 'sku']),
            models.Index(fields=['user', 'is_active']),
        ]
        constraints = [
            models.UniqueConstraint(fields=['user', 'sku'], name='unique_sku_per_user'),
        ]
    
    def __str__(self):
        return f"{self.sku} - {self.name}"
    
    @property
    def available_quantity(self):
        """
        Calculate total available stock for this product.
        Sum of all quantity_available from stock entries.
        """
        from apps.stocks.models import StockEntry
        return StockEntry.objects.filter(product=self).aggregate(
            total=models.Sum('quantity_available')
        )['total'] or Decimal('0.00')
    
    @property
    def total_inventory_value(self):
        """
        Calculate total value of available inventory.
        Sum of (quantity_available * unit_cost) from stock entries.
        """
        from apps.stocks.models import StockEntry
        return StockEntry.objects.filter(product=self).aggregate(
            total=models.Sum(
                models.F('quantity_available') * models.F('unit_cost'),
                output_field=models.DecimalField()
            )
        )['total'] or Decimal('0.00')
