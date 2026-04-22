import React from 'react';
import {
  Container,
  Paper,
  Stack,
  Text,
  Group,
  Button,
  SimpleGrid,
  ThemeIcon,
} from '@mantine/core';
import {
  IconTrendingUp,
  IconShoppingCart,
  IconPackage,
  IconCash,
  IconPlus,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/route-paths';
import { useProducts } from '@/features/products/products.hooks';
import { useStocks } from '@features/stocks/stocks.hooks';
import { usePurchaseOrders } from '@features/purchase-orders/purchaseOrders.hooks';
import { useSalesOrders } from '@features/sales-orders/salesOrders.hooks';
import { LoadingState } from '@components/ui/LoadingState';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const productsQuery = useProducts({ limit: 1 });
  const stocksQuery = useStocks({ limit: 1 });
  const purchaseOrdersQuery = usePurchaseOrders({ limit: 1 });
  const salesOrdersQuery = useSalesOrders({ limit: 1 });

  const isLoading =
    productsQuery.isLoading ||
    stocksQuery.isLoading ||
    purchaseOrdersQuery.isLoading ||
    salesOrdersQuery.isLoading;

  if (isLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  const stats = [
    {
      title: 'Products',
      count: productsQuery.data?.count || 0,
      icon: IconPackage,
      color: 'blue',
      action: () => navigate(ROUTES.products),
    },
    {
      title: 'Stock Entries',
      count: stocksQuery.data?.count || 0,
      icon: IconShoppingCart,
      color: 'green',
      action: () => navigate(ROUTES.stockEntries),
    },
    {
      title: 'Purchase Orders',
      count: purchaseOrdersQuery.data?.count || 0,
      icon: IconTrendingUp,
      color: 'orange',
      action: () => navigate(ROUTES.purchaseOrders),
    },
    {
      title: 'Sales Orders',
      count: salesOrdersQuery.data?.count || 0,
      icon: IconCash,
      color: 'red',
      action: () => navigate(ROUTES.salesOrders),
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Stack gap={0}>
            <Text size="xl" fw={700}>
              Dashboard
            </Text>
            <Text size="sm" c="dimmed">
              Welcome to your Inventory Management System
            </Text>
          </Stack>
        </Group>

        {/* Key Metrics */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Paper key={index} p="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed" fw={500}>
                    {stat.title}
                  </Text>
                  <ThemeIcon color={stat.color} variant="light" size="lg" radius="md">
                    <Icon size={18} />
                  </ThemeIcon>
                </Group>
                <Group justify="space-between" align="flex-end">
                  <div>
                    <Text fw={700} size="lg">
                      {stat.count}
                    </Text>
                  </div>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={stat.action}
                  >
                    View
                  </Button>
                </Group>
              </Paper>
            );
          })}
        </SimpleGrid>

        {/* Quick Actions */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={600}>Quick Actions</Text>
            <Group>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate(ROUTES.productNew)}
                variant="light"
              >
                New Product
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate(ROUTES.stockEntryNew)}
                variant="light"
              >
                Add Stock
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate(ROUTES.purchaseOrderNew)}
                variant="light"
              >
                New Purchase Order
              </Button>
              <Button
                leftSection={<IconPlus size={16} />}
                onClick={() => navigate(ROUTES.salesOrderNew)}
                variant="light"
              >
                New Sales Order
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Financial Overview Card */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Group justify="space-between">
              <Stack gap={0}>
                <Text fw={600}>Financial Overview</Text>
                <Text size="sm" c="dimmed">
                  View detailed financial metrics
                </Text>
              </Stack>
              <Button
                onClick={() => navigate(ROUTES.financial)}
                variant="light"
              >
                View Dashboard
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default DashboardPage;
