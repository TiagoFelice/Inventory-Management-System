import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Container, Grid, Group, Paper, Stack, Text } from '@mantine/core';
import { ROUTES } from '@/app/router/route-paths';
import { ErrorState } from '@components/ui/ErrorState';
import { LoadingState } from '@components/ui/LoadingState';
import { formatCurrency, formatNumber } from '@shared/utils/formatting';
import { useProduct } from '@/features/products/products.hooks';
import { useStocks } from '../stocks.hooks';
import { StockEntriesByProductCard } from '../components/detail/StockEntriesByProductCard';

const StockMetric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <Stack gap={4}>
    <Text size="sm" c="dimmed" fw={500}>
      {label}
    </Text>
    <Text fw={700} size="lg">
      {value}
    </Text>
  </Stack>
);

const StockDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? parseInt(id, 10) : null;

  const productQuery = useProduct(productId);
  const stockEntriesQuery = useStocks({
    product: productId || undefined,
    ordering: '-received_at',
  });

  if (productQuery.isLoading || stockEntriesQuery.isLoading) {
    return <LoadingState message="Loading stock details..." />;
  }

  if (productQuery.isError || stockEntriesQuery.isError || !productQuery.data) {
    return (
      <ErrorState
        message="Failed to load stock details"
        onRetry={() => {
          productQuery.refetch();
          stockEntriesQuery.refetch();
        }}
      />
    );
  }

  const product = productQuery.data;
  const entries = stockEntriesQuery.data?.results || [];

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap={0}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Stock Details</h1>
            <Text size="sm" c="dimmed">
              {product.name} ({product.sku})
            </Text>
          </Stack>
          <Group>
            <Button variant="light" onClick={() => navigate(ROUTES.stockEntryNew)}>
              Add Stock Entry
            </Button>
            <Button variant="light" onClick={() => navigate(ROUTES.stockEntries)}>
              Back
            </Button>
          </Group>
        </Group>

        <Paper p="lg" radius="md" withBorder>
          <Stack gap="lg">
            <Group justify="space-between">
              <Stack gap={0}>
                <Text fw={700} size="lg">
                  Product Stock Summary
                </Text>
                <Text size="sm" c="dimmed">
                  Current inventory position for this product
                </Text>
              </Stack>
            </Group>

            <Grid>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <StockMetric
                  label="Quantity In Stock"
                  value={formatNumber(product.available_quantity, product.base_unit === 'unit' ? 0 : 2)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <StockMetric
                  label="Inventory Value"
                  value={formatCurrency(product.total_inventory_value)}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, sm: 4 }}>
                <StockMetric label="Stock Entries" value={String(entries.length)} />
              </Grid.Col>
            </Grid>
          </Stack>
        </Paper>

        <StockEntriesByProductCard entries={entries} />
      </Stack>
    </Container>
  );
};

export default StockDetailsPage;
