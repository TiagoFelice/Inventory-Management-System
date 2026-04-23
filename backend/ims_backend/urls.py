"""
URL configuration for ims_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Import viewsets from modular apps
from apps.products.views import ProductViewSet
from apps.stocks.views import StockEntryViewSet
from apps.purchase_orders.views import PurchaseOrderViewSet, PurchaseOrderItemViewSet
from apps.sales_orders.views import SalesOrderViewSet, SalesOrderItemViewSet, StockAllocationViewSet
from apps.finance.views import (
    ProductFinancialViewSet,
    PurchaseItemFinancialViewSet,
)

router = routers.DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'stock-entries', StockEntryViewSet, basename='stock-entry')
router.register(r'purchase-orders', PurchaseOrderViewSet, basename='purchase-order')
router.register(r'purchase-order-items', PurchaseOrderItemViewSet, basename='purchase-order-item')
router.register(r'sales-orders', SalesOrderViewSet, basename='sales-order')
router.register(r'sales-order-items', SalesOrderItemViewSet, basename='sales-order-item')
router.register(r'stock-allocations', StockAllocationViewSet, basename='stock-allocation')
router.register(r'finance/products', ProductFinancialViewSet, basename='finance-products')
router.register(r'finance/purchase-items', PurchaseItemFinancialViewSet, basename='finance-purchase-items')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    # JWT endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
