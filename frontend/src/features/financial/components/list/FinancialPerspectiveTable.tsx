import React from 'react';
import {
  Badge,
  Button,
  Checkbox,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
} from '@mantine/core';
import type {
  FinancialPerspective,
  FinancialPerspectiveItem,
  ProductFinancialItem,
  PurchaseItemFinancialItem,
} from '../../financial.types';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from '@shared/utils/formatting';

interface FinancialPerspectiveTableProps {
  perspective: FinancialPerspective;
  items: FinancialPerspectiveItem[];
  selectedIds: number[];
  onToggleItem: (id: number) => void;
  onToggleAll: () => void;
  onClearSelection: () => void;
}

const renderMetricCell = (value: number | string | null, type: 'currency' | 'number' | 'percentage') => {
  if (value === null) {
    return 'N/A';
  }

  if (type === 'currency') {
    return formatCurrency(value);
  }

  if (type === 'percentage') {
    return formatPercentage(value);
  }

  return formatNumber(value, 4);
};

const renderPrimaryCell = (perspective: FinancialPerspective, item: FinancialPerspectiveItem) => {
  if (perspective === 'products') {
    const product = item as ProductFinancialItem;
    return (
      <Stack gap={2}>
        <Text fw={600}>{product.name}</Text>
        <Group gap="xs">
          <Badge variant="light">{product.sku}</Badge>
          <Text size="xs" c="dimmed">
            {product.base_unit}
          </Text>
        </Group>
      </Stack>
    );
  }

  if (perspective === 'purchase-items') {
    const purchaseItem = item as PurchaseItemFinancialItem;
    return (
      <Stack gap={2}>
        <Text fw={600}>{purchaseItem.product_name}</Text>
        <Group gap="xs">
          <Badge variant="light">{purchaseItem.order_number}</Badge>
          <Text size="xs" c="dimmed">
            {purchaseItem.product_sku}
          </Text>
        </Group>
      </Stack>
    );
  }
};

export const FinancialPerspectiveTable: React.FC<FinancialPerspectiveTableProps> = ({
  perspective,
  items,
  selectedIds,
  onToggleItem,
  onToggleAll,
  onClearSelection,
}) => {
  const allSelected = items.length > 0 && selectedIds.length === items.length;
  const someSelected = selectedIds.length > 0;

  return (
    <Paper withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group justify="space-between">
          <Stack gap={2}>
            <Text fw={700} size="lg">
              Per-item breakdown
            </Text>
            <Text size="sm" c="dimmed">
              Select multiple rows to refresh the summary cards with aggregated totals.
            </Text>
          </Stack>

          <Group gap="sm">
            {someSelected ? (
              <Text size="sm" c="dimmed">
                {selectedIds.length} selected
              </Text>
            ) : null}
            <Button variant="light" onClick={onToggleAll}>
              {allSelected ? 'Clear visible' : 'Select all'}
            </Button>
            {someSelected ? (
              <Button variant="subtle" color="gray" onClick={onClearSelection}>
                Reset selection
              </Button>
            ) : null}
          </Group>
        </Group>

        <ScrollArea>
          <Table striped highlightOnHover style={{ minWidth: 980 }}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: 56 }}>
                  <Checkbox
                    checked={allSelected}
                    indeterminate={!allSelected && someSelected}
                    onChange={onToggleAll}
                    aria-label="Select all rows"
                  />
                </Table.Th>
                <Table.Th>Item</Table.Th>
                {perspective === 'purchase-items' ? <Table.Th>Unit Cost</Table.Th> : null}
                {perspective === 'purchase-items' ? <Table.Th>Remaining Value</Table.Th> : null}
                <Table.Th>Purchased Qty</Table.Th>
                <Table.Th>Sold Qty</Table.Th>
                <Table.Th>Remaining Qty</Table.Th>
                <Table.Th>Purchase Cost</Table.Th>
                <Table.Th>Revenue</Table.Th>
                <Table.Th>COGS</Table.Th>
                <Table.Th>Profit</Table.Th>
                <Table.Th>Margin</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((item) => {
                const isSelected = selectedIds.includes(item.id);

                return (
                  <Table.Tr
                    key={item.id}
                    style={isSelected ? { backgroundColor: 'var(--mantine-color-blue-0)' } : undefined}
                  >
                    <Table.Td>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => onToggleItem(item.id)}
                        aria-label={`Select ${item.name}`}
                      />
                    </Table.Td>
                    <Table.Td>{renderPrimaryCell(perspective, item)}</Table.Td>
                    {perspective === 'purchase-items' ? (
                      <Table.Td>
                        {formatCurrency((item as PurchaseItemFinancialItem).unit_cost)}
                      </Table.Td>
                    ) : null}
                    {perspective === 'purchase-items' ? (
                      <Table.Td>
                        {formatCurrency((item as PurchaseItemFinancialItem).remaining_value)}
                      </Table.Td>
                    ) : null}
                    <Table.Td>{renderMetricCell(item.quantity_purchased, 'number')}</Table.Td>
                    <Table.Td>{renderMetricCell(item.quantity_sold, 'number')}</Table.Td>
                    <Table.Td>{renderMetricCell(item.quantity_remaining, 'number')}</Table.Td>
                    <Table.Td>{renderMetricCell(item.total_purchase_cost, 'currency')}</Table.Td>
                    <Table.Td>{renderMetricCell(item.total_revenue, 'currency')}</Table.Td>
                    <Table.Td>{renderMetricCell(item.total_cogs, 'currency')}</Table.Td>
                    <Table.Td>{renderMetricCell(item.profit, 'currency')}</Table.Td>
                    <Table.Td>{renderMetricCell(item.profit_margin, 'percentage')}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Stack>
    </Paper>
  );
};
