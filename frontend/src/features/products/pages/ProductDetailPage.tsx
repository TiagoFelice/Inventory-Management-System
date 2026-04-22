import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Button,
  Container,
  Grid,
  Group,
  Modal,
  Stack,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { ROUTES } from '@/app/router/route-paths';
import { ErrorState } from '@components/ui/ErrorState';
import { LoadingState } from '@components/ui/LoadingState';
import { ProductInventoryCard } from '../components/detail/ProductInventoryCard';
import { ProductInfoCard } from '../components/detail/ProductInfoCard';
import { ProductHeader } from '../components/shared/ProductHeader';
import { useDeleteProduct, useProduct } from '../products.hooks';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? parseInt(id, 10) : null;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const query = useProduct(productId);
  const deleteMutation = useDeleteProduct();

  const handleDelete = async () => {
    if (productId) {
      try {
        await deleteMutation.mutateAsync(productId);
        navigate(ROUTES.products);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  if (query.isLoading) {
    return <LoadingState message="Loading product..." />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        message="Failed to load product"
        onRetry={() => query.refetch()}
      />
    );
  }

  const product = query.data;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <ProductHeader
          title={product.name}
          subtitle={`SKU: ${product.sku}`}
          actions={
            <Group>
              <Tooltip label="Edit product">
                <ActionIcon
                  size="lg"
                  variant="light"
                  color="blue"
                  onClick={() => navigate(ROUTES.productEdit(product.id))}
                >
                  <IconPencil size={20} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label="Delete product">
                <ActionIcon
                  size="lg"
                  variant="light"
                  color="red"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <IconTrash size={20} />
                </ActionIcon>
              </Tooltip>
              <Button variant="light" onClick={() => navigate(ROUTES.products)}>
                Back
              </Button>
            </Group>
          }
        />

        <Grid>
          <Grid.Col span={{ base: 12, md: 7 }}>
            <ProductInfoCard product={product} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <ProductInventoryCard product={product} />
          </Grid.Col>
        </Grid>

        <Modal
          opened={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Product"
          centered
        >
          <Stack>
            <Text>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </Text>
            <Group justify="flex-end">
              <Button variant="light" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                color="red"
                loading={deleteMutation.isPending}
                onClick={handleDelete}
              >
                Delete
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
};

export default ProductDetailPage;
