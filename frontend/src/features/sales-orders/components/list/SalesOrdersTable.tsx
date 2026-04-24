import React from 'react';
import { ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { DataTable } from '@components/ui/DataTable';
import { OrderProductsBadges } from '@components/ui/OrderProductsBadges';
import { StatusBadge } from '@components/ui/StatusBadge';
import { formatCurrency, formatDate } from '@shared/utils/formatting';
import type { SalesOrder, SalesOrderItem } from '../../salesOrder.types';

interface SalesOrdersTableProps {
  orders: SalesOrder[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onRowClick: (order: SalesOrder) => void;
}

export const SalesOrdersTable: React.FC<SalesOrdersTableProps> = ({
  orders,
  onEdit,
  onDelete,
  onRowClick,
}) => {
  const renderProductsCell = (items: SalesOrderItem[] | undefined) => {
    if (!items?.length) {
      return 'N/A';
    }

    return (
      <OrderProductsBadges
        items={items.map((item) => ({
          id: item.id,
          label: item.product_name || `Product #${item.product}`,
          quantity: item.quantity,
        }))}
        badgeColor="grape"
      />
    );
  };

  const columns = [
    { key: 'order_number', label: 'Order Code', align: 'center' as const, width: '15%' },
    {
      key: 'customer_name',
      label: 'Customer',
      align: 'center' as const,
      width: '18%',
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'items',
      label: 'Products',
      align: 'center' as const,
      width: '25%',
      render: (value: SalesOrderItem[] | undefined) => renderProductsCell(value),
    },
    {
      key: 'sold_at',
      label: 'Order Date',
      align: 'center' as const,
      width: '16%',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'total_revenue',
      label: 'Revenue',
      align: 'center' as const,
      width: '13%',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center' as const,
      width: '13%',
      render: (value: string) => <StatusBadge status={value as 'draft' | 'cancelled'} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={orders}
      actionsColumnWidth={140}
      onRowClick={(row) => onRowClick(row as SalesOrder)}
      renderRowActions={(row: SalesOrder) => (
        <Group gap={4} wrap="nowrap" justify="center">
          <Tooltip label="Edit order">
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={(event) => {
                event.stopPropagation();
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
              onClick={(event) => {
                event.stopPropagation();
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
