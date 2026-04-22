import React from 'react';
import { Grid, Group, Paper, Stack, Text } from '@mantine/core';
import { formatDate } from '@shared/utils/formatting';
import type { Product } from '../../product.types';
import { ProductStatusBadge } from './ProductStatusBadge';
import { ProductImage } from '../shared/ProductImage';

interface ProductInfoCardProps {
  product: Product;
}

const InfoItem: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div>
    <Text size="sm" c="dimmed" fw={500} mb={4}>
      {label}
    </Text>
    {children}
  </div>
);

export const ProductInfoCard: React.FC<ProductInfoCardProps> = ({
  product,
}) => {
  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="lg">
        <Group>
          <ProductImage name={product.name} size={72} radius="xl" />
          <Stack gap={2}>
            <Text fw={700} size="lg">
              {product.name}
            </Text>
            <ProductStatusBadge quantityInStock={product.available_quantity} />
          </Stack>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem label="SKU">
              <Text fw={600}>{product.sku}</Text>
            </InfoItem>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}></Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem label="Unit of measure">
              <Text fw={600}>{product.base_unit}</Text>
            </InfoItem>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem label="Amount per product">
              <Text fw={600}>
                {product.amount} {product.base_unit}
              </Text>
            </InfoItem>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem label="Created">
              <Text>{formatDate(product.created_at)}</Text>
            </InfoItem>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <InfoItem label="Updated">
              <Text>{formatDate(product.updated_at)}</Text>
            </InfoItem>
          </Grid.Col>

          <Grid.Col span={12}>
            <InfoItem label="Description">
              <Text>{product.description || 'No description'}</Text>
            </InfoItem>
          </Grid.Col>
        </Grid>
      </Stack>
    </Paper>
  );
};
