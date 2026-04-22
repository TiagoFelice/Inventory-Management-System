import React from 'react';
import { Button, Container, Group, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/route-paths';
import { getErrorMessage } from '@shared/utils/errors';
import { ProductForm } from '../components/form/ProductForm';
import type { ProductFormValues } from '../components/form/ProductFormFields';
import { ProductHeader } from '../components/shared/ProductHeader';
import { useCreateProduct } from '../products.hooks';

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateProduct();

  const form = useForm<ProductFormValues>({
    initialValues: {
      sku: '',
      name: '',
      description: '',
      base_unit: 'unit',
      amount: 0,
    },
    validate: {
      sku: (value) => (value.length === 0 ? 'SKU is required' : null),
      name: (value) => (value.length === 0 ? 'Name is required' : null),
      base_unit: (value) => (value ? null : 'Unit is required'),
      amount: (value) => (value < 0 ? 'Amount must be non-negative' : null),
    },
  });

  const handleSubmit = async (values: ProductFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      navigate(ROUTES.products);
    } catch (error) {
      console.error(error);
    }
  };

  const errorMessage = createMutation.error
    ? getErrorMessage(createMutation.error)
    : null;

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <ProductHeader
          title="Create Product"
          subtitle="Add a new catalog item and define its inventory unit."
          actions={
            <Group>
              <Button variant="light" onClick={() => navigate(ROUTES.products)}>
                Back to Products
              </Button>
            </Group>
          }
        />

        <ProductForm
          form={form}
          errorMessage={errorMessage}
          isSubmitting={createMutation.isPending}
          submitLabel="Create Product"
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.products)}
        />
      </Stack>
    </Container>
  );
};

export default ProductCreatePage;
