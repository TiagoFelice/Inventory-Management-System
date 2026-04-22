import React from 'react';
import { Paper, Stack, Grid, Text, Badge, Group } from '@mantine/core';
import { formatDate, formatCurrency } from '@shared/utils/formatting';
import type { StockEntry } from '../../stock.types';

interface StockBasicInfoProps {
  stock: StockEntry;
}

export const StockBasicInfo: React.FC<StockBasicInfoProps> = ({ stock }) => {
  const totalValue = stock.quantity_received * stock.unit_cost;

  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="lg">
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Stock Entry
              </Text>
              <Text fw={600}>#{stock.id}</Text>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Product
              </Text>
              <Text fw={600}>{stock.product_name}</Text>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Quantity Received
              </Text>
              <Text fw={600} size="lg">
                {stock.quantity_received}
              </Text>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Unit Cost
              </Text>
              <Text fw={600}>{formatCurrency(stock.unit_cost)}</Text>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Available
              </Text>
              <Group gap="xs">
                <Badge size="lg" c="green">
                  {stock.quantity_available}
                </Badge>
                <Text size="sm" c="dimmed">
                  ({(stock.quantity_available / stock.quantity_received * 100).toFixed(1)}%)
                </Text>
              </Group>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Allocated
              </Text>
              <Group gap="xs">
                <Badge size="lg" color="orange">
                  {stock.quantity_sold || 0}
                </Badge>
                <Text size="sm" c="dimmed">
                  ({(stock.quantity_sold ? stock.quantity_sold / stock.quantity_received * 100 : 0).toFixed(1)}%)
                </Text>
              </Group>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Received
              </Text>
              <Text>{formatDate(stock.received_at)}</Text>
            </div>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <div>
              <Text size="sm" c="dimmed" fw={500}>
                Expiration
              </Text>
              <Text>
                {stock.expiration_date ? formatDate(stock.expiration_date) : 'No expiration'}
              </Text>
            </div>
          </Grid.Col>

          <Grid.Col span={12}>
            <div>
              <Text size="sm" c="dimmed" fw={500} mb={8}>
                Total Value
              </Text>
              <Text fw={700} size="lg">
                {formatCurrency(totalValue)}
              </Text>
            </div>
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
};
