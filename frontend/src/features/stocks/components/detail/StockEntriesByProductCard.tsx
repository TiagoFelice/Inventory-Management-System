import React from 'react';
import { Badge, Group, Paper, Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@components/ui/DataTable';
import { formatCurrency, formatDate, formatNumber } from '@shared/utils/formatting';
import { ROUTES } from '@/app/router/route-paths';
import type { StockEntry } from '../../stock.types';

interface StockEntriesByProductCardProps {
  entries: StockEntry[];
}

export const StockEntriesByProductCard: React.FC<StockEntriesByProductCardProps> = ({
  entries,
}) => {
  const navigate = useNavigate();

  const columns = [
    { key: 'id', label: 'Entry #', width: '12%', align: 'center' as const },
    {
      key: 'source_type',
      label: 'Source',
      width: '16%',
      align: 'center' as const,
      render: (value: string) => (
        <Badge color={value === 'purchase_order' ? 'blue' : 'gray'} variant="light">
          {value === 'purchase_order' ? 'Purchase Order' : 'Manual'}
        </Badge>
      ),
    },
    {
      key: 'quantity_available',
      label: 'Available',
      width: '14%',
      align: 'center' as const,
      render: (value: number | string) => <strong>{formatNumber(value)}</strong>,
    },
    {
      key: 'quantity_received',
      label: 'Received',
      width: '14%',
      align: 'center' as const,
      render: (value: number | string) => formatNumber(value),
    },
    {
      key: 'unit_cost',
      label: 'Unit Cost',
      width: '14%',
      align: 'center' as const,
      render: (value: number | string) => formatCurrency(value),
    },
    {
      key: 'received_at',
      label: 'Received',
      width: '16%',
      align: 'center' as const,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'expiration_date',
      label: 'Expires',
      width: '14%',
      align: 'center' as const,
      render: (value: string | undefined) => (value ? formatDate(value) : 'N/A'),
    },
  ];

  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="lg">
        <Group justify="space-between">
          <Stack gap={0}>
            <Text fw={700} size="lg">
              Stock Entries
            </Text>
            <Text size="sm" c="dimmed">
              All stock entries for this product
            </Text>
          </Stack>
          <Badge variant="light">{entries.length} entries</Badge>
        </Group>

        {entries.length === 0 ? (
          <Text c="dimmed">No stock entries found for this product.</Text>
        ) : (
          <DataTable
            columns={columns}
            data={entries}
            onRowClick={(entry: StockEntry) => navigate(ROUTES.stockEntryDetail(entry.id))}
          />
        )}
      </Stack>
    </Paper>
  );
};
