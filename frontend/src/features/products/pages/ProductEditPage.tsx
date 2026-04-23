import React from 'react';
import { Container, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/app/router/route-paths';
import { ErrorState } from '@components/ui/ErrorState';
import { LoadingState } from '@components/ui/LoadingState';
import { getErrorMessage } from '@shared/utils/errors';
import { ProductForm } from '../components/form/ProductForm';
import type { ProductFormValues } from '../components/form/ProductFormFields';
import { ProductHeader } from '../components/shared/ProductHeader';
import { useProduct, useUpdateProduct } from '../products.hooks';

const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? parseInt(id, 10) : null;

  const productQuery = useProduct(productId);
  const updateMutation = useUpdateProduct();

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
  const hasInitializedForm = React.useRef(false);

  React.useEffect(() => {
    hasInitializedForm.current = false;
  }, [productId]);

  React.useEffect(() => {
    if (productQuery.data && !hasInitializedForm.current) {
      const product = productQuery.data;
      form.setValues({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        base_unit: product.base_unit || 'unit',
        amount: product.amount || 0,
      });
      hasInitializedForm.current = true;
    }
  }, [form, productQuery.data]);

  const handleSubmit = async (values: ProductFormValues) => {
    if (!productId) return;
    try {
      await updateMutation.mutateAsync({
        id: productId,
        payload: values,
      });
      navigate(ROUTES.productDetail(productId));
    } catch (error) {
      console.error(error);
    }
  };

  if (productQuery.isLoading) {
    return <LoadingState message="Loading product..." />;
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <ErrorState
        message="Failed to load product"
        onRetry={() => productQuery.refetch()}
      />
    );
  }

  const errorMessage = updateMutation.error
    ? getErrorMessage(updateMutation.error)
    : null;
  const detailPath = ROUTES.productDetail(productQuery.data.id);

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <ProductHeader
          title="Edit Product"
          subtitle={`Update ${productQuery.data.name} (${productQuery.data.sku})`}
          // actions={
          //   <Group>
          //     <Button
          //       type="button"
          //       variant="light"
          //       onClick={() => navigate(detailPath)}
          //     >
          //       Back to Detail
          //     </Button>
          //   </Group>
          // }
        />

        <ProductForm
          form={form}
          errorMessage={errorMessage}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => navigate(detailPath)}
        />
      </Stack>
    </Container>
  );
};

export default ProductEditPage;
