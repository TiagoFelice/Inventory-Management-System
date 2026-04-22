import React from 'react';
import { Container, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { useCreateStockEntry } from '@features/stocks/stocks.hooks';
import { useProducts } from '@/features/products/products.hooks';
import { getErrorMessage } from '@shared/utils/errors';
import { StockForm, type StockFormValues } from '../components/form/StockForm';

const StockCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateStockEntry();
  const productsQuery = useProducts();
  const products = productsQuery.data?.results || [];

  const form = useForm<StockFormValues>({
    initialValues: {
      product: '',
      quantity_received: 0,
      unit_cost: 0,
      source_type: 'manual',
      received_at: new Date().toISOString().split('T')[0],
      expiration_date: '',
    },
    validate: {
      product: (value: string) =>
        value.length === 0 ? 'Product is required' : null,
      quantity_received: (value: number) =>
        value <= 0 ? 'Quantity must be greater than 0' : null,
      unit_cost: (value: number) =>
        value < 0 ? 'Unit cost cannot be negative' : null,
      source_type: (value: string) =>
        value.length === 0 ? 'Source type is required' : null,
      received_at: (value: string) =>
        value.length === 0 ? 'Received date is required' : null,
    },
  });

  const handleSubmit = async (values: StockFormValues) => {
    try {
      await createMutation.mutateAsync({
        product: parseInt(values.product, 10),
        quantity_received: values.quantity_received,
        unit_cost: values.unit_cost,
        source_type: values.source_type as any,
        received_at: values.received_at,
        expiration_date: values.expiration_date || undefined,
      });
      navigate('/stock-entries');
    } catch (error) {
      console.error(error);
    }
  };

  const errorMessage = createMutation.error ? getErrorMessage(createMutation.error) : null;
  const productOptions = products.map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.sku})`,
  }));

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Add Stock Entry</h1>

        <StockForm
          form={form}
          errorMessage={errorMessage}
          isSubmitting={createMutation.isPending}
          submitLabel="Create Stock Entry"
          cancelLabel="Cancel"
          productOptions={productOptions}
          isLoadingProducts={productsQuery.isLoading}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/stock-entries')}
        />
      </Stack>
    </Container>
  );
};

export default StockCreatePage;
