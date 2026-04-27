"""
URL configuration for ims_backend project.
"""
from django.conf import settings
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
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
from apps.users.views import UserManagementViewSet, current_user_view

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
router.register(r'users', UserManagementViewSet, basename='user-management')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/auth/me/', current_user_view, name='current-user'),
    # JWT endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if (settings.BASE_DIR / 'frontend_dist' / 'index.html').exists():
    urlpatterns += [
        re_path(
            r'^(?!api/|admin/|static/).*$',
            TemplateView.as_view(template_name='index.html'),
            name='frontend',
        ),
    ]
