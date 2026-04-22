import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { ROUTES } from './route-paths';

// Lazy load pages for code splitting
const LoginPage = React.lazy(() => import('@features/auth/pages/LoginPage'));
const DashboardPage = React.lazy(() => import('@features/dashboard/pages/DashboardPage'));
const ProductsPage = React.lazy(() => import('@features/products/pages/ProductsPage'));
const ProductCreatePage = React.lazy(() =>
  import('@features/products/pages/ProductCreatePage')
);
const ProductDetailPage = React.lazy(() =>
  import('@features/products/pages/ProductDetailPage')
);
const ProductEditPage = React.lazy(() =>
  import('@features/products/pages/ProductEditPage')
);
const StocksPage = React.lazy(() => import('@features/stocks/pages/StocksPage'));
const StockDetailsPage = React.lazy(() => import('@/features/stocks/pages/StockDetailPage'));
const StockCreatePage = React.lazy(() =>
  import('@features/stocks/pages/StockCreatePage')
);
const StockDetailPage = React.lazy(() =>
  import('@features/stocks/pages/StockDetailPage')
);
const StockEditPage = React.lazy(() =>
  import('@features/stocks/pages/StockEditPage')
);
const PurchaseOrdersPage = React.lazy(() =>
  import('@features/purchase-orders/pages/PurchaseOrdersPage')
);
const PurchaseOrderCreatePage = React.lazy(() =>
  import('@features/purchase-orders/pages/PurchaseOrderCreatePage')
);
const PurchaseOrderDetailPage = React.lazy(() =>
  import('@features/purchase-orders/pages/PurchaseOrderDetailPage')
);
const PurchaseOrderEditPage = React.lazy(() =>
  import('@features/purchase-orders/pages/PurchaseOrderEditPage')
);
const SalesOrdersPage = React.lazy(() =>
  import('@features/sales-orders/pages/SalesOrdersPage')
);
const SalesOrderCreatePage = React.lazy(() =>
  import('@features/sales-orders/pages/SalesOrderCreatePage')
);
const SalesOrderDetailPage = React.lazy(() =>
  import('@features/sales-orders/pages/SalesOrderDetailPage')
);
const SalesOrderEditPage = React.lazy(() =>
  import('@features/sales-orders/pages/SalesOrderEditPage')
);
const FinancialDashboard = React.lazy(() =>
  import('@features/financial/pages/FinancialDashboard')
);

const AppShell = React.lazy(() => import('@components/layout/AppShell'));

export const router = createBrowserRouter([
  {
    path: ROUTES.login,
    element: <LoginPage />,
  },
  {
    path: ROUTES.root,
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.root,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.dashboard,
        element: <DashboardPage />,
      },
      {
        path: ROUTES.products,
        element: <ProductsPage />,
      },
      {
        path: ROUTES.productNew,
        element: <ProductCreatePage />,
      },
      {
        path: '/products/:id',
        element: <ProductDetailPage />,
      },
      {
        path: '/products/:id/edit',
        element: <ProductEditPage />,
      },
      {
        path: ROUTES.stockEntries,
        element: <StocksPage />,
      },
      {
        path: '/stock-details/:id',
        element: <StockDetailsPage />,
      },
      {
        path: ROUTES.stockEntryNew,
        element: <StockCreatePage />,
      },
      {
        path: '/stock-entries/:id',
        element: <StockDetailPage />,
      },
      {
        path: '/stock-entries/:id/edit',
        element: <StockEditPage />,
      },
      {
        path: ROUTES.purchaseOrders,
        element: <PurchaseOrdersPage />,
      },
      {
        path: ROUTES.purchaseOrderNew,
        element: <PurchaseOrderCreatePage />,
      },
      {
        path: '/purchase-orders/:id',
        element: <PurchaseOrderDetailPage />,
      },
      {
        path: '/purchase-orders/:id/edit',
        element: <PurchaseOrderEditPage />,
      },
      {
        path: ROUTES.salesOrders,
        element: <SalesOrdersPage />,
      },
      {
        path: ROUTES.salesOrderNew,
        element: <SalesOrderCreatePage />,
      },
      {
        path: '/sales-orders/:id',
        element: <SalesOrderDetailPage />,
      },
      {
        path: '/sales-orders/:id/edit',
        element: <SalesOrderEditPage />,
      },
      {
        path: ROUTES.financial,
        element: <FinancialDashboard />,
      },
    ],
  },
]);
