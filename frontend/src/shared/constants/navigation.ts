import {
  IconCurrencyDollar,
  IconDashboard,
  IconPackage,
  IconPackages,
  IconShoppingCart,
  IconTrendingUp,
} from '@tabler/icons-react';
import { ROUTES } from '@/app/router/route-paths';

export const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.dashboard, icon: IconDashboard },
  { label: 'Products', href: ROUTES.products, icon: IconPackage },
  { label: 'Stock', href: ROUTES.stockEntries, icon: IconPackages },
  {
    label: 'Purchase Orders',
    href: ROUTES.purchaseOrders,
    icon: IconShoppingCart,
  },
  { label: 'Sales Orders', href: ROUTES.salesOrders, icon: IconTrendingUp },
  { label: 'Financial', href: ROUTES.financial, icon: IconCurrencyDollar },
] as const;
