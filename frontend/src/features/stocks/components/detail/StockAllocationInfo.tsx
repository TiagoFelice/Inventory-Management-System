import React from 'react';
import { Alert, Paper, Stack, Group, Text, Table } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@shared/utils/formatting';
import type { StockEntryAllocationDetailResponse } from '../../stock.types';

interface StockAllocationInfoProps {
  allocation: StockEntryAllocationDetailResponse | undefined | null;
}

export const StockAllocationInfo: React.FC<StockAllocationInfoProps> = ({
  allocation,
}) => {
  const navigate = useNavigate();

  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="lg">
        <Group justify="space-between">
          <Stack gap={0}>
            <Text fw={600} size="lg">
              Allocation Traceability
            </Text>
            <Text size="sm" c="dimmed">
              Track where this stock has been allocated
            </Text>
          </Stack>
        </Group>

        {!allocation || allocation.allocations.length === 0 ? (
          <Alert icon={<IconInfoCircle size={16} />} color="blue">
            This stock entry has not been allocated to any sales orders yet
          </Alert>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Sales Order</Table.Th>
                <Table.Th>Quantity Allocated</Table.Th>
                <Table.Th>Allocated Date</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {allocation.allocations.map((alloc, idx) => (
                <Table.Tr key={idx}>
                  <Table.Td>
                    <Text
                      fw={500}
                      style={{ cursor: 'pointer', color: '#0066cc' }}
                      onClick={() => navigate(`/sales-orders/${alloc.sales_order_id}`)}
                    >
                      {alloc.sales_order_code || `Order #${alloc.sales_order_id}`}
                    </Text>
                  </Table.Td>
                  <Table.Td>{alloc.quantity_allocated}</Table.Td>
                  <Table.Td>{formatDate(alloc.allocated_at)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>
    </Paper>
  );
};
