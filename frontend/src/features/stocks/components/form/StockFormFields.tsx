import React from 'react';
import { NumberInput, Select, Stack, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import type { UseFormReturnType } from '@mantine/form';

export interface StockFormValues {
  stock_identifier: string;
  product: string;
  quantity_received: number;
  unit_cost: number;
  source_type: string;
  received_at: string;
  expiration_date: string;
}

interface StockFormFieldsProps {
  form: UseFormReturnType<StockFormValues>;
  productOptions: Array<{ value: string; label: string }>;
  isLoadingProducts?: boolean;
  disabled?: boolean;
}

export const StockFormFields: React.FC<StockFormFieldsProps> = ({
  form,
  productOptions,
  isLoadingProducts = false,
  disabled = false,
}) => {
  return (
    <Stack gap="md">
      <TextInput
        label="Stock Identifier"
        placeholder="e.g., STOCK-2024-001"
        {...form.getInputProps('stock_identifier')}
        disabled={disabled}
        required
      />

      <Select
        label="Product"
        placeholder="Select a product"
        data={productOptions}
        {...form.getInputProps('product')}
        disabled={disabled || isLoadingProducts}
        searchable
        required
      />

      <Select
        label="Source Type"
        placeholder="Select source type"
        data={[
          { value: 'manual', label: 'Manual Entry' },
          { value: 'purchase_order', label: 'Purchase Order' },
        ]}
        {...form.getInputProps('source_type')}
        disabled={disabled}
        required
      />

      <NumberInput
        label="Quantity Received"
        placeholder="Enter quantity"
        min={1}
        {...form.getInputProps('quantity_received')}
        disabled={disabled}
        required
      />

      <NumberInput
        label="Unit Cost"
        placeholder="0.00"
        min={0}
        step={0.01}
        {...form.getInputProps('unit_cost')}
        disabled={disabled}
        required
      />

      <TextInput
        label="Received Date"
        type="date"
        {...form.getInputProps('received_at')}
        disabled={disabled}
        required
      />

      <TextInput
        label="Expiration Date (Optional)"
        type="date"
        {...form.getInputProps('expiration_date')}
        disabled={disabled}
      />
    </Stack>
  );
};
