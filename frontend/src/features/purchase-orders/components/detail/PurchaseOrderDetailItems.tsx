import React from 'react';
import { Paper, Stack, Table, Text } from '@mantine/core';
import { formatCurrency } from '@shared/utils/formatting';
import type { PurchaseOrderItem } from '../../purchaseOrder.types';

interface PurchaseOrderDetailItemsProps {
  items: PurchaseOrderItem[];
}

export const PurchaseOrderDetailItems: React.FC<PurchaseOrderDetailItemsProps> = ({
  items,
}) => {
  const totalCost = items.reduce((sum, item) => sum + item.total_cost, 0);

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
                <Table.Th style={{ width: '20%', textAlign: 'center' }}>Unit Cost</Table.Th>
                <Table.Th style={{ width: '20%', textAlign: 'right' }}>Subtotal</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td style={{ textAlign: 'left' }}>
                    {item.product.name}
                  </Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{item.quantity}</Table.Td>
                  <Table.Td style={{ textAlign: 'center' }}>{formatCurrency(item.unit_cost)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>
                    {formatCurrency(item.total_cost)}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Td colSpan={3} style={{ textAlign: 'right', fontWeight: 600 }}>
                  Total:
                </Table.Td>
                <Table.Td style={{ textAlign: 'right', fontWeight: 700, fontSize: 16 }}>
                  {formatCurrency(totalCost)}
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        )}
      </Paper>
    </Stack>
  );
};
