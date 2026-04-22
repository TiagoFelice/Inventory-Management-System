import React from 'react';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { DataTable } from '@components/ui/DataTable';
import { ListTableCard } from '@components/ui/ListTableCard';
import { formatDate, formatCurrency } from '@shared/utils/formatting';
import type { StockEntry } from '../../stock.types';

interface StockTableProps {
  stocks: StockEntry[];
  onRowClick: (stock: StockEntry) => void;
  onEdit: (stock: StockEntry) => void;
  onDelete: (stock: StockEntry) => void;
}

export const StockTable: React.FC<StockTableProps> = ({
  stocks,
  onRowClick,
  onEdit,
  onDelete,
}) => {
  const columns = [
    { key: 'stock_identifier', label: 'Identifier', width: '15%', align: 'center' as const },
    { key: 'product_name', label: 'Product', width: '20%', align: 'center' as const },
    {
      key: 'quantity_available',
      label: 'Available',
      width: '15%',
      align: 'center' as const,
      render: (value: number) => <strong>{value}</strong>,
    },
    {
      key: 'quantity_received',
      label: 'Received',
      width: '12%',
      align: 'center' as const,
    },
    {
      key: 'unit_cost',
      label: 'Cost',
      width: '15%',
      align: 'center' as const,
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'expiration_date',
      label: 'Expires',
      width: '18%',
      align: 'center' as const,
      render: (value: string) => (value ? formatDate(value) : 'N/A'),
    },
  ];

  return (
    <ListTableCard>
      <DataTable
        columns={columns}
        data={stocks}
        actionsColumnWidth={100}
        onRowClick={(row: StockEntry) => onRowClick(row)}
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
    </ListTableCard>
  );
};
