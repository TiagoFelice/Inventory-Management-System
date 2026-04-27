import {
  type TablerIconsProps,
  IconCurrencyDollar,
  IconDashboard,
  IconPackage,
  IconPackages,
  IconUsers,
  IconShoppingCart,
  IconTrendingUp,
} from '@tabler/icons-react';
import { ROUTES } from '@/app/router/route-paths';
import type { FunctionComponent } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: FunctionComponent<TablerIconsProps>;
  superuserOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: ROUTES.dashboard, icon: IconDashboard },
  { label: 'Products', href: ROUTES.products, icon: IconPackage },
  { label: 'Stocks', href: ROUTES.stocks, icon: IconPackages },
  {
    label: 'Purchase Orders',
    href: ROUTES.purchaseOrders,
    icon: IconShoppingCart,
  },
  { label: 'Sales Orders', href: ROUTES.salesOrders, icon: IconTrendingUp },
  { label: 'Financial', href: ROUTES.financial, icon: IconCurrencyDollar },
  { label: 'Manager', href: ROUTES.managerUsers, icon: IconUsers, superuserOnly: true },
];
