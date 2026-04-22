from django.contrib import admin
from .models import PurchaseOrder, PurchaseOrderItem


class PurchaseOrderItemInline(admin.TabularInline):
    model = PurchaseOrderItem
    extra = 1
    readonly_fields = ('created_at', 'updated_at')


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'supplier_name', 'user', 'status', 'ordered_at', 'total_cost')
    list_filter = ('status', 'ordered_at', 'user')
    search_fields = ('order_number', 'supplier_name')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [PurchaseOrderItemInline]
    fieldsets = (
        ('User & Ownership', {
            'fields': ('user',)
        }),
        ('Purchase Order Information', {
            'fields': ('order_number', 'supplier_name', 'status', 'ordered_at', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PurchaseOrderItem)
class PurchaseOrderItemAdmin(admin.ModelAdmin):
    list_display = ('purchase_order', 'product', 'quantity', 'unit_cost', 'total_cost')
    list_filter = ('purchase_order', 'product')
    readonly_fields = ('created_at', 'updated_at')
