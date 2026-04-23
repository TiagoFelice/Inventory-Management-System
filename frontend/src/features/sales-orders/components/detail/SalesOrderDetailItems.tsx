import React from 'react';
import { Paper, Stack, Table, Text } from '@mantine/core';
import { formatCurrency } from '@shared/utils/formatting';
import type { SalesOrderItem } from '../../salesOrder.types';

interface SalesOrderDetailItemsProps {
  items: SalesOrderItem[];
}

export const SalesOrderDetailItems: React.FC<SalesOrderDetailItemsProps> = ({ items }) => {
  const totalRevenue = items.reduce((sum, item) => sum + item.total_revenue, 0);

  return (
    <Stack gap="lg" style={{ width: '100%' }}>
      <Text fw={600} size="lg">
        Order Items
      </Text>
      <Paper p="lg" radius="md" withBorder style={{ width: '100%', overflowX: 'auto' }}>
        {items.length === 0 ? (
          <Text c="dimmed">No items in this order</Text>
        ) : (
          <Table striped style={{ width: '100%', minWidth: 600 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '40%', textAlign: 'left' }}>Product</Table.Th>
                <Table.Th style={{ width: '20%', textAlign: 'center' }}>Quantity</Table.Th>
                <Table.Th style={{ width: '20%', textAlign: 'center' }}>Unit Price</Table.Th>
                <Table.Th style={{ width: '20%', textAlign: 'right' }}>Subtotal</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td style={{ textAlign: 'left' }}>{item.product_name || `Product #${item.product}`}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{item.quantity}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{formatCurrency(item.unit_price)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{formatCurrency(item.total_revenue)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>
                  Total:
                </Table.Td>
                <Table.Td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16 }}>
                  {formatCurrency(totalRevenue)}
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        )}
      </Paper>
    </Stack>
  );
};
