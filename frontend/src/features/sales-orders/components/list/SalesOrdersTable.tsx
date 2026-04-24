import React from 'react';
import { ActionIcon, Badge, Group, Popover, Stack, Text, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { DataTable } from '@components/ui/DataTable';
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

    const visibleItems = items.slice(0, 2);
    const hiddenItems = items.slice(2);

    return (
      <Group gap={6} justify="center" wrap="wrap">
        {visibleItems.map((item) => (
          <Badge key={item.id} variant="light" color="grape">
            {item.product_name || `Product #${item.product}`}
          </Badge>
        ))}
        {hiddenItems.length > 0 ? (
          <Popover width={260} position="bottom" withArrow shadow="md">
            <Popover.Target>
              <Badge
                variant="outline"
                color="gray"
                style={{ cursor: 'pointer' }}
              >
                +{hiddenItems.length} more
              </Badge>
            </Popover.Target>
            <Popover.Dropdown>
              <Stack gap={8}>
                {items.map((item) => (
                  <Group key={item.id} justify="space-between" gap="sm" wrap="nowrap">
                    <Text size="sm">{item.product_name || `Product #${item.product}`}</Text>
                    <Text size="xs" c="dimmed">
                      x{item.quantity}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Popover.Dropdown>
          </Popover>
        ) : null}
      </Group>
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
