import React from 'react';
import {
  Group,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { DataTable } from '@components/ui/DataTable';
import { StatusBadge } from '@components/ui/StatusBadge';
import { formatDate, formatCurrency } from '@shared/utils/formatting';
import type { PurchaseOrder } from '../../purchaseOrder.types';

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRowClick: (order: PurchaseOrder) => void;
}

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  orders,
  onEdit,
  onDelete,
  onRowClick,
}) => {
  const columns = [
    { key: 'order_number', label: 'Order Code', align: 'center' as const },
    {
      key: 'supplier_name',
      label: 'Supplier',
      align: 'center' as const,
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'ordered_at',
      label: 'Order Date',
      align: 'center' as const,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'total_cost',
      label: 'Total Cost',
      align: 'center' as const,
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center' as const,
      render: (value: string) => <StatusBadge status={value as 'draft' | 'received' | 'cancelled'} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      actionsColumnWidth={140}
      onRowClick={(row) => onRowClick(row as PurchaseOrder)}
      renderRowActions={(row: any) => (
        <Group gap={4} wrap="nowrap" justify="center">
          <Tooltip label="Edit order">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(row.id);
              }}
            >
              <IconPencil size={16} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete order">
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(row.id);
              }}
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      )}
    />
  );
};
