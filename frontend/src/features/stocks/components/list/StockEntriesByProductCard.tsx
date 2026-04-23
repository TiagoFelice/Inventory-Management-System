import React from 'react';
import { ActionIcon, Anchor, Badge, Group, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable } from '@components/ui/DataTable';
import { formatCurrency, formatDate, formatNumber } from '@shared/utils/formatting';
import { ROUTES } from '@/app/router/route-paths';
import type { StockEntry } from '../../stock.types';

interface StockEntriesByProductCardProps {
  entries: StockEntry[];
  onEdit: (entry: StockEntry) => void;
  onDelete: (entry: StockEntry) => void;
}

export const StockEntriesByProductCard: React.FC<StockEntriesByProductCardProps> = ({
  entries,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      key: 'stock_identifier',
      label: 'Stock Identifier',
      width: '12%',
      align: 'center' as const,
      render: (value: number | string) => <strong>{value}</strong>,
    },
    {
      key: 'source_type',
      label: 'Source',
      width: '20%',
      align: 'center' as const,
      render: (value: string, row: StockEntry) => (
        <Stack gap={4} align="center">
          {value === 'manual' ? (
            <Text size="sm" fw={600} c="dimmed">
              Manual Entry
            </Text>
          ) : null}
          {value === 'purchase_order' && row.purchase_order_id ? (
            <Anchor
              component={Link}
              to={ROUTES.purchaseOrderDetail(row.purchase_order_id)}
              size="sm"
              onClick={(event) => event.stopPropagation()}
            >
              {row.purchase_order_number || `PO #${row.purchase_order_id}`}
            </Anchor>
          ) : null}
        </Stack>
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
            actionsColumnWidth={110}
            onRowClick={(entry: StockEntry) => navigate(ROUTES.stockEntryDetail(entry.id))}
            renderRowActions={(row: StockEntry) => (
              <Group gap={4} wrap="nowrap" justify="center">
                <Tooltip label="Edit stock entry">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={(event) => {
                      event.stopPropagation();
                      onEdit(row);
                    }}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete stock entry">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={(event) => {
                      event.stopPropagation();
                      onDelete(row);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}
          />
        )}
      </Stack>
    </Paper>
  );
};
