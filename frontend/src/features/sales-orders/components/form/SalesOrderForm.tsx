import React from 'react';
import { Stack, TextInput } from '@mantine/core';
import { DateInput } from '@mantine/dates';

export interface SalesOrderFormData {
  order_number: string;
  customer_name: string;
  sold_at: string;
}

interface SalesOrderFormProps {
  formData: SalesOrderFormData;
  onChange: (field: keyof SalesOrderFormData, value: string) => void;
  isLoading?: boolean;
}

export const SalesOrderForm: React.FC<SalesOrderFormProps> = ({
  formData,
  onChange,
  isLoading = false,
}) => {
  return (
    <Stack gap="md">
      <TextInput
        label="Order Number"
        placeholder="e.g., SO-2024-001"
        value={formData.order_number}
        onChange={(event) => onChange('order_number', event.currentTarget.value)}
        disabled={isLoading}
        required
      />
      <TextInput
        label="Customer Name"
        placeholder="Enter customer name"
        value={formData.customer_name}
        onChange={(event) => onChange('customer_name', event.currentTarget.value)}
        disabled={isLoading}
      />
      <DateInput
        label="Order Date"
        placeholder="Pick order date"
        value={formData.sold_at ? new Date(formData.sold_at) : null}
        onChange={(date) => onChange('sold_at', date ? date.toISOString().split('T')[0] : '')}
        disabled={isLoading}
        required
      />
    </Stack>
  );
};
