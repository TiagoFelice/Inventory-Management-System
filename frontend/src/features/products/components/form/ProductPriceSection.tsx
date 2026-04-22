import React from 'react';
import { NumberInput, Stack, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import type { ProductFormValues } from './ProductFormFields';

interface ProductPriceSectionProps {
  form: UseFormReturnType<ProductFormValues>;
  disabled?: boolean;
}

export const ProductPriceSection: React.FC<ProductPriceSectionProps> = ({
  form,
  disabled = false,
}) => {
  return (
    <Stack gap="xs">
      <Text fw={600}>Product amount</Text>
      <NumberInput
        label="Amount per product"
        placeholder="Enter the amount contained in one product"
        min={0}
        step={0.01}
        description="This is the quantity of kg, g, L, mL, or units for one product."
        {...form.getInputProps('amount')}
        disabled={disabled}
      />
    </Stack>
  );
};
