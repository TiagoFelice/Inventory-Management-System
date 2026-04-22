import React from 'react';
import {
  Group,
  ActionIcon,
  Tooltip,
  Badge,
  Menu,
} from '@mantine/core';
import { IconCheck, IconX, IconPencil, IconTrash, IconChevronDown } from '@tabler/icons-react';
import { DataTable } from '@components/ui/DataTable';
import { formatDate, formatCurrency } from '@shared/utils/formatting';
import type { PurchaseOrder } from '../../purchaseOrder.types';

interface PurchaseOrdersTableProps {
  orders: PurchaseOrder[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onConfirm: (id: number, e?: React.MouseEvent) => void;
  onCancel: (id: number, e?: React.MouseEvent) => void;
  onReceive: (id: number, e?: React.MouseEvent) => void;
  onRowClick: (order: PurchaseOrder) => void;
  confirmLoading?: boolean;
  cancelLoading?: boolean;
  receiveLoading?: boolean;
}

export const PurchaseOrdersTable: React.FC<PurchaseOrdersTableProps> = ({
  orders,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  onReceive,
  onRowClick,
  confirmLoading = false,
  cancelLoading = false,
  receiveLoading = false,
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
      render: (value: string, row: any) => (
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <Badge
                  color={
                    value === 'draft'
                      ? 'gray'
                      : value === 'confirmed'
                      ? 'blue'
                      : value === 'received'
                      ? 'green'
                      : 'red'
                  }
                >
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
                  onClick={(e: any) => onConfirm(row.id, e)}
                  disabled={confirmLoading}
                >
                  Confirm Order
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconX size={14} />}
                  color="red"
                  onClick={(e: any) => onCancel(row.id, e)}
                  disabled={cancelLoading}
                >
                  Cancel Order
                </Menu.Item>
              </>
            )}
            {value === 'confirmed' && (
              <>
                <Menu.Item
                  leftSection={<IconCheck size={14} />}
                  onClick={(e: any) => onReceive(row.id, e)}
                  disabled={receiveLoading}
                >
                  Mark as Received
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconX size={14} />}
                  color="red"
                  onClick={(e: any) => onCancel(row.id, e)}
                  disabled={cancelLoading}
                >
                  Cancel Order
                </Menu.Item>
              </>
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
