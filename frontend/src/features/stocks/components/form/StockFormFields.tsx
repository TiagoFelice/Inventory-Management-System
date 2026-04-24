import React from 'react';
import { NumberInput, Select, Stack, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';

export interface StockFormValues {
  product: string;
  quantity_received: number;
  source_type: string;
  received_at: string;
  expiration_date: string;
}

interface StockFormFieldsProps {
  form: UseFormReturnType<StockFormValues>;
  productOptions: Array<{ value: string; label: string }>;
  isLoadingProducts?: boolean;
  disabled?: boolean;
  showSourceType?: boolean;
  disableSourceType?: boolean;
}

export const StockFormFields: React.FC<StockFormFieldsProps> = ({
  form,
  productOptions,
  isLoadingProducts = false,
  disabled = false,
  showSourceType = true,
  disableSourceType = false,
}) => {
  return (
    <Stack gap="md">
      <Select
        label="Product"
        placeholder="Select a product"
        data={productOptions}
        {...form.getInputProps('product')}
        disabled={disabled || isLoadingProducts}
        searchable
        required
      />

      {showSourceType ? (
        <Select
          label="Source Type"
          placeholder="Select source type"
          data={[
            { value: 'manual', label: 'Manual Entry' },
            { value: 'purchase_order', label: 'Purchase Order' },
          ]}
          {...form.getInputProps('source_type')}
          disabled={disabled || disableSourceType}
          required
        />
      ) : null}

      <NumberInput
        label="Quantity Received"
        placeholder="Enter quantity"
        min={1}
        {...form.getInputProps('quantity_received')}
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
