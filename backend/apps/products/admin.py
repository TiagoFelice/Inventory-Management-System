from django.contrib import admin
from .models import Product


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('sku', 'name', 'user', 'base_unit', 'is_active', 'created_at')
    list_filter = ('is_active', 'base_unit', 'created_at', 'user')
    search_fields = ('sku', 'name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    fieldsets = (
        ('User & Ownership', {
            'fields': ('user',)
        }),
        ('Product Information', {
            'fields': ('name', 'description', 'sku', 'base_unit', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
