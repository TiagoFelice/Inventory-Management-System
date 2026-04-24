import React, { useEffect, useMemo, useState } from 'react';
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { IconAlertCircle, IconPencil, IconTrash } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { DataTable } from '@components/ui/DataTable';
import { ROUTES } from '@/app/router/route-paths';
import { formatDate, formatNumber } from '@shared/utils/formatting';
import { useDeleteStockAllocation, useUpdateStockAllocation } from '../../stocks.hooks';
import type { StockAllocation, StockEntry, UpdateStockAllocationPayload } from '../../stock.types';

interface StockAllocationsByProductCardProps {
  allocations: StockAllocation[];
  entries: StockEntry[];
  quantityDecimals: number;
}

const allocationTypeColors: Record<StockAllocation['type'], string> = {
  sale: 'blue',
  expired: 'orange',
  other: 'gray',
};

export const StockAllocationsByProductCard: React.FC<StockAllocationsByProductCardProps> = ({
  allocations,
  entries,
  quantityDecimals,
}) => {
  const updateAllocationMutation = useUpdateStockAllocation();
  const deleteAllocationMutation = useDeleteStockAllocation();
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  const [editingAllocation, setEditingAllocation] = useState<StockAllocation | null>(null);
  const [deletingAllocation, setDeletingAllocation] = useState<StockAllocation | null>(null);
  const [quantityAllocated, setQuantityAllocated] = useState<number | string>(0);
  const [allocationType, setAllocationType] = useState<StockAllocation['type']>('other');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!editingAllocation) {
      return;
    }

    setQuantityAllocated(Number(editingAllocation.quantity_allocated));
    setAllocationType(editingAllocation.type);
    setNotes(editingAllocation.notes || '');
    setFormError(null);
  }, [editingAllocation]);

  const editableQuantityMax = useMemo(() => {
    if (!editingAllocation) {
      return 0;
    }

    const entry = entryMap.get(editingAllocation.stock_entry);
    if (!entry) {
      return Number(editingAllocation.quantity_allocated);
    }

    return Number(entry.quantity_available) + Number(editingAllocation.quantity_allocated);
  }, [editingAllocation, entryMap]);

  const resetEditState = () => {
    setEditingAllocation(null);
    setFormError(null);
  };

  const resetDeleteState = () => {
    setDeletingAllocation(null);
    setDeleteError(null);
  };

  const extractErrorMessage = (error: unknown) => {
    const axiosError = error as AxiosError<{
      detail?: string;
      error?: string;
      [key: string]: unknown;
    }>;
    const responseData = axiosError.response?.data;
    if (!responseData) {
      return 'Failed to update stock allocation.';
    }

    if (typeof responseData.detail === 'string') {
      return responseData.detail;
    }

    if (typeof responseData.error === 'string') {
      return responseData.error;
    }

    const firstValue = Object.values(responseData)[0];
    if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
      return firstValue[0];
    }

    if (typeof firstValue === 'string') {
      return firstValue;
    }

    return 'Failed to update stock allocation.';
  };

  const handleSave = async () => {
    if (!editingAllocation) {
      return;
    }

    const parsedQuantity =
      typeof quantityAllocated === 'number' ? quantityAllocated : Number(quantityAllocated);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setFormError('Quantity must be greater than zero.');
      return;
    }

    if (parsedQuantity - editableQuantityMax > 0.0001) {
      setFormError(`Quantity cannot exceed ${formatNumber(editableQuantityMax, quantityDecimals)}.`);
      return;
    }

    if (editingAllocation.sales_order_item && allocationType !== 'sale') {
      setFormError('Sales-linked allocations must remain sale allocations.');
      return;
    }

    const payload: UpdateStockAllocationPayload = {
      quantity_allocated: parsedQuantity,
      type: allocationType,
      notes: notes.trim() || null,
    };

    try {
      await updateAllocationMutation.mutateAsync({
        id: editingAllocation.id,
        payload,
      });
      resetEditState();
    } catch (error) {
      setFormError(extractErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deletingAllocation) {
      return;
    }

    try {
      await deleteAllocationMutation.mutateAsync(deletingAllocation.id);
      resetDeleteState();
    } catch (error) {
      setDeleteError(extractErrorMessage(error));
    }
  };

  const columns = [
    {
      key: 'stock_entry',
      label: 'Stock Entry',
      width: '16%',
      align: 'center' as const,
      render: (value: number) => entryMap.get(value)?.stock_identifier || `Entry #${value}`,
    },
    {
      key: 'source',
      label: 'Source',
      width: '18%',
      align: 'center' as const,
      render: (_value: string | undefined, row: StockAllocation) => (
        row.type === 'sale' && row.sales_order_id && row.sales_order_code ? (
          <Anchor component={Link} to={ROUTES.salesOrderDetail(row.sales_order_id)}>
            {row.sales_order_code}
          </Anchor>
        ) : (
          <Badge color={allocationTypeColors[row.type]} variant="light">
            {row.type}
          </Badge>
        )
      ),
    },
    {
      key: 'quantity_allocated',
      label: 'Quantity',
      width: '16%',
      align: 'center' as const,
      render: (value: number | string) => <strong>{formatNumber(value, quantityDecimals)}</strong>,
    },
    {
      key: 'notes',
      label: 'Notes',
      width: '25%',
      align: 'center' as const,
      render: (value: string | null | undefined) => value || 'N/A',
    },
    {
      key: 'created_at',
      label: 'Created',
      width: '25%',
      align: 'center' as const,
      render: (value: string) => formatDate(value),
    },
  ];

  return (
    <Paper p="lg" radius="md" withBorder>
      <Stack gap="lg">
        <Group justify="space-between">
          <Stack gap={0}>
            <Text fw={700} size="lg">
              Stock Allocations
            </Text>
            {/* <Text size="sm" c="dimmed">
              All stock usage linked to this product
            </Text> */}
          </Stack>
          <Badge variant="light">{allocations.length} allocations</Badge>
        </Group>

        {allocations.length === 0 ? (
          <Text c="dimmed">No stock allocations found for this product.</Text>
        ) : (
          <DataTable
            columns={columns}
            data={allocations}
            actionsColumnWidth={110}
            tableMinWidth={900}
            renderRowActions={(row: StockAllocation) => (
              <Group gap={4} wrap="nowrap" justify="center">
                <Tooltip label="Edit stock allocation">
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => setEditingAllocation(row)}
                  >
                    <IconPencil size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="Delete stock allocation">
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => setDeletingAllocation(row)}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            )}
          />
        )}
      </Stack>

      <Modal
        opened={!!editingAllocation}
        onClose={resetEditState}
        title="Edit Stock Allocation"
        centered
      >
        <Stack gap="md">
          {formError ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              {formError}
            </Alert>
          ) : null}

          <Stack gap={4}>
            <Text size="sm" fw={500}>
              Stock Entry
            </Text>
            <Text size="sm" c="dimmed">
              {editingAllocation
                ? entryMap.get(editingAllocation.stock_entry)?.stock_identifier ||
                  `Entry #${editingAllocation.stock_entry}`
                : 'N/A'}
            </Text>
          </Stack>

          <NumberInput
            label="Quantity"
            value={quantityAllocated}
            onChange={setQuantityAllocated}
            min={0}
            max={editableQuantityMax}
            decimalScale={quantityDecimals}
            step={quantityDecimals === 0 ? 1 : 0.01}
            disabled={updateAllocationMutation.isPending}
          />

          <Select
            label="Type"
            data={[
              { value: 'sale', label: 'Sale' },
              { value: 'expired', label: 'Expired' },
              { value: 'other', label: 'Other' },
            ]}
            value={allocationType}
            onChange={(value) => {
              if (value) {
                setAllocationType(value as StockAllocation['type']);
              }
            }}
            disabled={!!editingAllocation?.sales_order_item || updateAllocationMutation.isPending}
          />

          {editingAllocation?.sales_order_item ? (
            <Text size="xs" c="dimmed">
              Sales-linked allocations keep the `sale` type to preserve stock and profit tracking.
            </Text>
          ) : null}

          <Textarea
            label="Notes"
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            minRows={3}
            autosize
            disabled={updateAllocationMutation.isPending}
          />

          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={resetEditState}
              disabled={updateAllocationMutation.isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} loading={updateAllocationMutation.isPending}>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={!!deletingAllocation}
        onClose={resetDeleteState}
        title="Delete Stock Allocation"
        centered
      >
        <Stack gap="md">
          {deleteError ? (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              {deleteError}
            </Alert>
          ) : null}

          <Text>
            Are you sure you want to delete this stock allocation?
          </Text>

          {deletingAllocation ? (
            <Text size="sm" c="dimmed">
              {entryMap.get(deletingAllocation.stock_entry)?.stock_identifier ||
                `Entry #${deletingAllocation.stock_entry}`}:
              {' '}
              {formatNumber(deletingAllocation.quantity_allocated, quantityDecimals)}
            </Text>
          ) : null}

          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={resetDeleteState}
              disabled={deleteAllocationMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDelete}
              loading={deleteAllocationMutation.isPending}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  );
};
