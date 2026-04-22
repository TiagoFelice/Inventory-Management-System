import React from 'react';
import {
  Container,
  Stack,
  Group,
  Paper,
  Text,
  SimpleGrid,
  ThemeIcon,
  Table,
  Badge,
} from '@mantine/core';
import { IconCash, IconTrendingUp, IconTrendingDown, IconPercentage } from '@tabler/icons-react';
import { useFinancialSummary, useProductBreakdown } from '@features/financial/financial.hooks';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { formatCurrency, formatPercentage } from '@shared/utils/formatting';

const FinancialDashboard: React.FC = () => {
  const summaryQuery = useFinancialSummary();
  const breakdownQuery = useProductBreakdown();

  const isLoading = summaryQuery.isLoading || breakdownQuery.isLoading;
  const isError = summaryQuery.isError || breakdownQuery.isError;

  if (isLoading) {
    return <LoadingState message="Loading financial data..." />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load financial data"
        onRetry={() => {
          summaryQuery.refetch();
          breakdownQuery.refetch();
        }}
      />
    );
  }

  const summary = summaryQuery.data;
  const products = breakdownQuery.data || [];

  const kpis = [
    {
      title: 'Total Revenue',
      value: summary?.total_revenue || 0,
      icon: IconCash,
      color: 'green',
      prefix: '$',
    },
    {
      title: 'Total Costs',
      value: summary?.total_costs || 0,
      icon: IconTrendingDown,
      color: 'red',
      prefix: '$',
    },
    {
      title: 'Total Profit',
      value: summary?.total_profit || 0,
      icon: IconTrendingUp,
      color: 'blue',
      prefix: '$',
    },
    {
      title: 'Profit Margin',
      value: summary?.profit_margin || 0,
      icon: IconPercentage,
      color: 'yellow',
      suffix: '%',
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <Stack gap={0}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Financial Dashboard</h1>
            <Text size="sm" c="dimmed">
              Overview of your business profitability
            </Text>
          </Stack>
        </Group>

        {/* KPI Cards */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const displayValue =
              kpi.prefix === '$'
                ? formatCurrency(kpi.value as number)
                : `${formatPercentage(kpi.value as number)}${kpi.suffix || ''}`;

            return (
              <Paper key={index} p="lg" radius="md" withBorder>
                <Group justify="space-between" mb="xs">
                  <Text size="sm" c="dimmed" fw={500}>
                    {kpi.title}
                  </Text>
                  <ThemeIcon color={kpi.color} variant="light" size="lg" radius="md">
                    <Icon size={18} />
                  </ThemeIcon>
                </Group>
                <Text fw={700} size="xl">
                  {displayValue}
                </Text>
              </Paper>
            );
          })}
        </SimpleGrid>

        {/* Product Breakdown */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="lg">
            <Group justify="space-between">
              <Stack gap={0}>
                <Text fw={600} size="lg">
                  Product Profitability Breakdown
                </Text>
                <Text size="sm" c="dimmed">
                  Detailed financial metrics per product
                </Text>
              </Stack>
            </Group>

            {products.length === 0 ? (
              <Text c="dimmed" ta="center" py="lg">
                No product data available
              </Text>
            ) : (
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th>SKU</Table.Th>
                    <Table.Th>Qty Purchased</Table.Th>
                    <Table.Th>Qty Sold</Table.Th>
                    <Table.Th>Total Costs</Table.Th>
                    <Table.Th>Total Revenue</Table.Th>
                    <Table.Th>Profit</Table.Th>
                    <Table.Th>Margin</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {products.map((product: any, idx: number) => {
                    const margin = product.total_cost > 0 
                      ? ((product.total_profit / product.total_cost) * 100)
                      : 0;

                    return (
                      <Table.Tr key={idx}>
                        <Table.Td>
                          <Text fw={500}>{product.product_name}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light">{product.product_sku}</Badge>
                        </Table.Td>
                        <Table.Td>{product.quantity_purchased}</Table.Td>
                        <Table.Td>{product.quantity_sold}</Table.Td>
                        <Table.Td>{formatCurrency(product.total_cost)}</Table.Td>
                        <Table.Td>
                          <Text fw={600} c="green">
                            {formatCurrency(product.total_revenue)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text
                            fw={600}
                            color={product.total_profit >= 0 ? 'green' : 'red'}
                          >
                            {formatCurrency(product.total_profit)}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            color={margin >= 0 ? 'green' : 'red'}
                            variant="light"
                          >
                            {formatPercentage(margin)}
                          </Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </Stack>
        </Paper>

        {/* Summary Section */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="md">
            <Text fw={600} size="lg">
              Summary
            </Text>

            <Group grow>
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Total Revenue
                </Text>
                <Text fw={700} size="xl" c="green">
                  {formatCurrency(summary?.total_revenue || 0)}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Total Costs
                </Text>
                <Text fw={700} size="xl" c="red">
                  {formatCurrency(summary?.total_costs || 0)}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Net Profit
                </Text>
                <Text
                  fw={700}
                  size="xl"
                  color={(summary?.total_profit || 0) >= 0 ? 'green' : 'red'}
                >
                  {formatCurrency(summary?.total_profit || 0)}
                </Text>
              </div>

              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Profit Margin
                </Text>
                <Text fw={700} size="xl">
                  {formatPercentage(summary?.profit_margin || 0)}
                </Text>
              </div>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
};

export default FinancialDashboard;
