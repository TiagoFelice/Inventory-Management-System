from django.contrib import admin
from .models import SalesOrder, SalesOrderItem, StockAllocation


class SalesOrderItemInline(admin.TabularInline):
    model = SalesOrderItem
    extra = 1
    readonly_fields = ('created_at', 'updated_at')


class StockAllocationInline(admin.TabularInline):
    model = StockAllocation
    extra = 1
    readonly_fields = ('created_at', 'updated_at')


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'user', 'status', 'sold_at', 'total_revenue')
    list_filter = ('status', 'sold_at', 'user')
    search_fields = ('order_number', 'customer_name')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [SalesOrderItemInline]
    fieldsets = (
        ('User & Ownership', {
            'fields': ('user',)
        }),
        ('Sales Order Information', {
            'fields': ('order_number', 'customer_name', 'status', 'sold_at', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SalesOrderItem)
class SalesOrderItemAdmin(admin.ModelAdmin):
    list_display = ('sales_order', 'product', 'quantity', 'unit_price', 'total_revenue')
    list_filter = ('sales_order', 'product')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(StockAllocation)
class StockAllocationAdmin(admin.ModelAdmin):
    list_display = ('stock_entry', 'sales_order_item', 'user', 'quantity_allocated')
    list_filter = ('created_at', 'stock_entry', 'user')
    readonly_fields = ('created_at', 'updated_at')
