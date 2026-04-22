from django.contrib import admin
from .models import StockEntry


@admin.register(StockEntry)
class StockEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'product', 'quantity_available', 'unit_cost', 'received_at')
    list_filter = ('source_type', 'received_at', 'user')
    search_fields = ('id', 'product__sku', 'product__name')
    readonly_fields = ('created_at', 'updated_at', 'quantity_sold')
    fieldsets = (
        ('User & Ownership', {
            'fields': ('user',)
        }),
        ('Stock Information', {
            'fields': ('product', 'source_type', 'source_reference_id')
        }),
        ('Quantities', {
            'fields': ('quantity_received', 'quantity_available', 'quantity_sold')
        }),
        ('Cost Information', {
            'fields': ('unit_cost', 'total_cost')
        }),
        ('Dates & Expiration', {
            'fields': ('received_at', 'expiration_date')
        }),
        ('Notes', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
