import React from 'react';
import { ActionIcon, Badge, Group, Menu, Paper, Stack, Text, Tooltip } from '@mantine/core';
import { IconCheck, IconChevronDown, IconPencil, IconRotateClockwise, IconTrash, IconX } from '@tabler/icons-react';
import { formatCurrency, formatDate } from '@shared/utils/formatting';
import { normalizeStatus } from '@components/ui/StatusBadge';
import type { SalesOrder } from '../../salesOrder.types';

interface SalesOrderDetailHeaderProps {
  order: SalesOrder;
  onEdit: () => void;
  onDelete: () => void;
  onConfirm: (event?: React.MouseEvent) => void;
  onCancel: (event?: React.MouseEvent) => void;
  onReopen: (event?: React.MouseEvent) => void;
  confirmLoading?: boolean;
  cancelLoading?: boolean;
  reopenLoading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'draft':
      return 'gray';
    case 'confirmed':
      return 'blue';
    case 'cancelled':
      return 'red';
    default:
      return 'gray';
  }
};

export const SalesOrderDetailHeader: React.FC<SalesOrderDetailHeaderProps> = ({
  order,
  onEdit,
  onDelete,
  onConfirm,
  onCancel,
  onReopen,
  confirmLoading = false,
  cancelLoading = false,
  reopenLoading = false,
}) => {
  const normalizedStatus = normalizeStatus(order.status);

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={0}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{order.order_number}</h1>
          <Text size="sm" c="dimmed">
            Sales Order
          </Text>
        </Stack>
        <Group gap="xs">
          <Tooltip label="Edit order">
            <ActionIcon size="lg" variant="light" color="blue" onClick={onEdit}>
              <IconPencil size={20} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete order">
            <ActionIcon size="lg" variant="light" color="red" onClick={onDelete}>
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
                  onMouseEnter={(event) => {
                    event.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Badge color={getStatusColor(normalizedStatus)} size="lg">
                    {normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1)}
                  </Badge>
                  <IconChevronDown size={18} style={{ opacity: 0.6 }} />
                </Group>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              {normalizedStatus === 'draft' && (
                <>
                  <Menu.Item leftSection={<IconCheck size={14} />} onClick={onConfirm} disabled={confirmLoading}>
                    Confirm Order
                  </Menu.Item>
                  <Menu.Item leftSection={<IconX size={14} />} color="red" onClick={onCancel} disabled={cancelLoading}>
                    Cancel Order
                  </Menu.Item>
                </>
              )}
              {normalizedStatus === 'confirmed' && (
                <>
                  <Menu.Item
                    leftSection={<IconRotateClockwise size={14} />}
                    onClick={onReopen}
                    disabled={reopenLoading}
                  >
                    Reopen Order
                  </Menu.Item>
                  <Menu.Item leftSection={<IconX size={14} />} color="red" onClick={onCancel} disabled={cancelLoading}>
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
              Customer
            </Text>
            <Text fw={600}>{order.customer_name || 'N/A'}</Text>
          </div>

          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Order Date
            </Text>
            <Text>{formatDate(order.sold_at)}</Text>
          </div>

          <div>
            <Text size="sm" c="dimmed" fw={500}>
              Total Revenue
            </Text>
            <Text fw={700} size="lg" c="blue">
              {formatCurrency(order.total_revenue)}
            </Text>
          </div>
        </Group>
      </Paper>
    </Stack>
  );
};
