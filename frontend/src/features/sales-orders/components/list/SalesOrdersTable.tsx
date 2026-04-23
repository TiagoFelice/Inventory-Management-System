import React from 'react';
import { ActionIcon, Badge, Group, Menu, Tooltip } from '@mantine/core';
import { IconCheck, IconChevronDown, IconPencil, IconTrash, IconX } from '@tabler/icons-react';
import { DataTable } from '@components/ui/DataTable';
import { formatCurrency, formatDate } from '@shared/utils/formatting';
import type { SalesOrder } from '../../salesOrder.types';

interface SalesOrdersTableProps {
  orders: SalesOrder[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onConfirm: (id: number, event?: React.MouseEvent) => void;
  onCancel: (id: number, event?: React.MouseEvent) => void;
  onRowClick: (order: SalesOrder) => void;
  confirmLoading?: boolean;
  cancelLoading?: boolean;
}

export const SalesOrdersTable: React.FC<SalesOrdersTableProps> = ({
  orders,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  onRowClick,
  confirmLoading = false,
  cancelLoading = false,
}) => {
  const columns = [
    { key: 'order_number', label: 'Order Code', align: 'center' as const },
    {
      key: 'customer_name',
      label: 'Customer',
      align: 'center' as const,
      render: (value: string) => value || 'N/A',
    },
    {
      key: 'sold_at',
      label: 'Order Date',
      align: 'center' as const,
      render: (value: string) => formatDate(value),
    },
    {
      key: 'total_revenue',
      label: 'Revenue',
      align: 'center' as const,
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center' as const,
      render: (value: string, row: SalesOrder) => (
        <Menu position="bottom-start" shadow="md">
          <Tooltip label="Click to change status" position="top">
            <Menu.Target>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={(event) => event.stopPropagation()}
              >
                <Badge color={value === 'draft' ? 'gray' : value === 'confirmed' ? 'blue' : 'red'}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </Badge>
                <IconChevronDown size={12} style={{ opacity: 0.6 }} />
              </div>
            </Menu.Target>
          </Tooltip>
          <Menu.Dropdown>
            {value === 'draft' && (
              <>
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={(event: React.MouseEvent) => onConfirm(row.id, event)}
                  disabled={confirmLoading}
                >
                  Confirm Order
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconX size={14} />}
                  color="red"
                  onClick={(event: React.MouseEvent) => onCancel(row.id, event)}
                  disabled={cancelLoading}
                >
                  Cancel Order
                </Menu.Item>
              </>
            )}
            {value === 'confirmed' && (
              <Menu.Item
                leftSection={<IconX size={14} />}
                color="red"
                onClick={(event: React.MouseEvent) => onCancel(row.id, event)}
                disabled={cancelLoading}
              >
                Cancel Order
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      ),
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
