import React from 'react';
import { Select, Textarea, TextInput } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { PRODUCT_UNITS } from '../../product.constants';
import type { ProductUnit } from '../../product.types';

export interface ProductFormValues {
  sku: string;
  name: string;
  description: string;
  base_unit: ProductUnit;
  amount: number;
}

interface ProductFormFieldsProps {
  form: UseFormReturnType<ProductFormValues>;
  disabled?: boolean;
}

export const ProductFormFields: React.FC<ProductFormFieldsProps> = ({
  form,
  disabled = false,
}) => {
  return (
    <>
      <TextInput
        label="SKU / Code"
        placeholder="PROD-001"
        {...form.getInputProps('sku')}
        disabled={disabled}
      />

      <TextInput
        label="Product Name"
        placeholder="Enter product name"
        {...form.getInputProps('name')}
        disabled={disabled}
      />

      <Textarea
        label="Description"
        placeholder="Enter product description"
        minRows={3}
        {...form.getInputProps('description')}
        disabled={disabled}
      />

      <Select
        label="Unit of measure"
        placeholder="Select unit"
        data={PRODUCT_UNITS}
        {...form.getInputProps('base_unit')}
        disabled={disabled}
      />
    </>
  );
};
