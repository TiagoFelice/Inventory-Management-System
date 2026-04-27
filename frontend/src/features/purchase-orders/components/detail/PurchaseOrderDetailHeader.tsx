import React from 'react';
import {
  Group,
  Stack,
  Text,
  ActionIcon,
  Tooltip,
  Badge,
  Button,
  Menu,
  Paper,
} from '@mantine/core';
import {
  IconPencil,
  IconTrash,
  IconCheck,
  IconX,
  IconChevronDown,
  IconRotateClockwise,
} from '@tabler/icons-react';
import { formatDate, formatCurrency } from '@shared/utils/formatting';
import { normalizeStatus } from '@components/ui/StatusBadge';
import type { PurchaseOrder } from '../../purchaseOrder.types';

interface PurchaseOrderDetailHeaderProps {
  order: PurchaseOrder;
  onEdit: () => void;
  onDelete: () => void;
  onConfirm: (e?: React.MouseEvent) => void;
  onCancel: (e?: React.MouseEvent) => void;
  onReceive: (e?: React.MouseEvent) => void;
  onReopen: (e?: React.MouseEvent) => void;
  confirmLoading?: boolean;
  cancelLoading?: boolean;
  receiveLoading?: boolean;
  reopenLoading?: boolean;
}

export const PurchaseOrderDetailHeader: React.FC<PurchaseOrderDetailHeaderProps> = ({
  order,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  onReceive,
  onReopen,
  confirmLoading = false,
  cancelLoading = false,
  receiveLoading = false,
  reopenLoading = false,
}) => {
  const normalizedStatus = normalizeStatus(order.status);

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
              <Tooltip label="Change order status" position="top">
                <Button
                  variant="light"
                  color={getStatusColor(normalizedStatus)}
                  rightSection={<IconChevronDown size={16} />}
                  size="md"
                >
                  <Group gap="xs">
                    <Text fw={600} size="sm">
                      Change status
                    </Text>
                    <Badge color={getStatusColor(normalizedStatus)} variant="white">
                      {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
                    </Badge>
                  </Group>
                </Button>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              {normalizedStatus === 'draft' && (
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
              {normalizedStatus === 'confirmed' && (
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
              {normalizedStatus === 'received' && (
                <Menu.Item
                  leftSection={<IconRotateClockwise size={14} />}
                  onClick={onReopen}
                  disabled={reopenLoading}
                >
                  Reopen Order
                </Menu.Item>
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
