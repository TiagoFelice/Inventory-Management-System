import React from 'react';
import {
  Group,
  Stack,
  Text,
  ActionIcon,
  Tooltip,
  Badge,
  Menu,
  Paper,
} from '@mantine/core';
import {
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconChevronDown,
} from '@tabler/icons-react';
import { formatDate, formatCurrency } from '@shared/utils/formatting';
import type { PurchaseOrder } from '../../purchaseOrder.types';

interface PurchaseOrderDetailHeaderProps {
  order: PurchaseOrder;
  onEdit: () => void;
  onDelete: () => void;
  onConfirm: (e?: React.MouseEvent) => void;
  onCancel: (e?: React.MouseEvent) => void;
  onReceive: (e?: React.MouseEvent) => void;
  onBack: () => void;
  confirmLoading?: boolean;
  cancelLoading?: boolean;
  receiveLoading?: boolean;
}

export const PurchaseOrderDetailHeader: React.FC<PurchaseOrderDetailHeaderProps> = ({
  order,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  onReceive,
  confirmLoading = false,
  cancelLoading = false,
  receiveLoading = false,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'gray';
      case 'confirmed':
        return 'blue';
      case 'received':
        return 'green';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={0}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
            {order.order_number}
          </h1>
          <Text size="sm" c="dimmed">
            Purchase Order
          </Text>
        </Stack>
        <Group gap="xs">
          <Tooltip label="Edit order">
            <ActionIcon
              size="lg"
              variant="light"
              color="blue"
              onClick={onEdit}
            >
              <IconPencil size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete order">
            <ActionIcon
              size="lg"
              variant="light"
              color="red"
              onClick={onDelete}
            >
              <IconTrash size={20} />
            </ActionIcon>
          </Tooltip>
          <Menu position="bottom-end" shadow="md">
            <Menu.Target>
              <Tooltip label="Click to change status" position="top">
                <Group
                  gap={4}
                  style={{
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Badge
                    color={getStatusColor(order.status)}
                    size="lg"
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                  <IconChevronDown size={18} style={{ opacity: 0.6 }} />
                </Group>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              {order.status === 'draft' && (
                <>
                  <Menu.Item
                    leftSection={<IconCheck size={14} />}
                    onClick={onConfirm}
                    disabled={confirmLoading}
                  >
                    Confirm Order
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconX size={14} />}
                    color="red"
                    onClick={onCancel}
                    disabled={cancelLoading}
                  >
                    Cancel Order
                  </Menu.Item>
                </>
              )}
              {order.status === 'confirmed' && (
                <>
                  <Menu.Item
                    leftSection={<IconCheck size={14} />}
                    onClick={onReceive}
                    disabled={receiveLoading}
                  >
                    Mark as Received
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconX size={14} />}
                    color="red"
                    onClick={onCancel}
                    disabled={cancelLoading}
                  >
                    Cancel Order
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <Paper p="lg" radius="md" withBorder>
        <Group justify="space-between">
          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Supplier
            </Text>
            <Text fw={600}>{order.supplier_name || 'N/A'}</Text>
          </div>

          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Order Date
            </Text>
            <Text>{formatDate(order.ordered_at)}</Text>
          </div>

          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Total Cost
            </Text>
            <Text fw={700} size="lg" c="blue">
              {formatCurrency(order.total_cost)}
            </Text>
          </div>
        </Group>
      </Paper>
    </Stack>
  );
};
