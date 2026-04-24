import React from 'react';
import { Container, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/app/router/route-paths';
import { useStockEntry, useUpdateStockEntry } from '@features/stocks/stocks.hooks';
import { useProducts } from '@/features/products/products.hooks';
import { getErrorMessage } from '@shared/utils/errors';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { StockForm, type StockFormValues } from '../components/form/StockForm';

const StockEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stockId = id ? parseInt(id, 10) : null;

  const stockQuery = useStockEntry(stockId);
  const updateMutation = useUpdateStockEntry();
  const productsQuery = useProducts();
  const products = productsQuery.data?.results || [];

  const form = useForm<StockFormValues>({
    initialValues: {
      product: '',
      quantity_received: 0,
      source_type: 'manual',
      received_at: new Date().toISOString().split('T')[0],
      expiration_date: '',
    },
    validate: {
      product: (value: string) =>
        value.length === 0 ? 'Product is required' : null,
      quantity_received: (value: number) =>
        value <= 0 ? 'Quantity must be greater than 0' : null,
      source_type: (value: string) =>
        value.length === 0 ? 'Source type is required' : null,
      received_at: (value: string) =>
        value.length === 0 ? 'Received date is required' : null,
    },
  });

  React.useEffect(() => {
    if (stockQuery.data) {
      const stock = stockQuery.data;
      form.setValues({
        product: String(stock.product) || '',
        quantity_received: stock.quantity_received || 0,
        source_type: stock.source_type || 'manual',
        received_at: stock.received_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        expiration_date: stock.expiration_date?.split('T')[0] || '',
      });
    }
  }, [stockQuery.data]);

  const handleSubmit = async (values: StockFormValues) => {
    if (!stockId) return;
    try {
      await updateMutation.mutateAsync({
        id: stockId,
        payload: {
          product: parseInt(values.product, 10),
          quantity_received: values.quantity_received,
          received_at: values.received_at,
          expiration_date: values.expiration_date || undefined,
        },
      });
      navigate(productStockPath);
    } catch (error) {
      console.error(error);
    }
  };

  if (stockQuery.isLoading) {
    return <LoadingState message="Loading stock entry..." />;
  }

  if (stockQuery.isError || !stockQuery.data) {
    return (
      <ErrorState
        message="Failed to load stock entry"
        onRetry={() => stockQuery.refetch()}
      />
    );
  }

  const errorMessage = updateMutation.error ? getErrorMessage(updateMutation.error) : null;
  const productOptions = products.map((p) => ({
    value: String(p.id),
    label: `${p.name} (${p.sku})`,
  }));
  const productStockPath = ROUTES.stockDetail(stockQuery.data.product);

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Edit Stock Entry</h1>

        <StockForm
          form={form}
          errorMessage={errorMessage}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save Changes"
          cancelLabel="Cancel"
          productOptions={productOptions}
          isLoadingProducts={productsQuery.isLoading}
          disableSourceType
          onSubmit={handleSubmit}
          onCancel={() => navigate(productStockPath)}
        />
      </Stack>
    </Container>
  );
};

export default StockEditPage;
