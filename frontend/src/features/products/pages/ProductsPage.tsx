import React, { useState } from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/route-paths';
import { EmptyState } from '@components/ui/EmptyState';
import { ErrorState } from '@components/ui/ErrorState';
import { ListPageLayout } from '@components/ui/ListPageLayout';
import { LoadingState } from '@components/ui/LoadingState';
import { useDeleteProduct, useProducts } from '../products.hooks';
import type { Product } from '../product.types';
import { ProductFilters } from '../components/list/ProductFilters';
import { ProductTable } from '../components/list/ProductTable';
import { ProductToolbar } from '../components/list/ProductToolbar';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    productId: number | null;
  }>({
    isOpen: false,
    productId: null,
  });
  const query = useProducts({ search: search || undefined });
  const deleteMutation = useDeleteProduct();

  const handleDeleteConfirm = async () => {
    if (deleteModal.productId) {
      try {
        await deleteMutation.mutateAsync(deleteModal.productId);
        setDeleteModal({ isOpen: false, productId: null });
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  if (query.isLoading) {
    return <LoadingState message="Loading products..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Failed to load products"
        onRetry={() => query.refetch()}
      />
    );
  }

  const products = query.data?.results || [];

  return (
    <ListPageLayout
      header={
        <ProductToolbar
          productCount={products.length}
          onCreate={() => navigate(ROUTES.productNew)}
        />
      }
      filters={
        <ProductFilters
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearch(searchInput)}
          onClear={() => {
            setSearchInput('');
            setSearch('');
          }}
        />
      }
    >
      {products.length === 0 && !search ? (
        <EmptyState
          title="No Products"
          description="Start by creating your first product"
          actionLabel="Create Product"
          onAction={() => navigate(ROUTES.productNew)}
        />
      ) : products.length === 0 ? (
        <EmptyState
          title="No Results"
          description={`No products found matching "${search}"`}
        />
      ) : (
        <ProductTable
          products={products}
          onRowClick={(product: Product) => navigate(ROUTES.productDetail(product.id))}
          onEdit={(product: Product) => navigate(ROUTES.productEdit(product.id))}
          onDelete={(product: Product) =>
            setDeleteModal({ isOpen: true, productId: product.id })
          }
        />
      )}

      <Modal
        opened={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, productId: null })}
        title="Delete Product"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete this product? This action cannot
            be undone.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => setDeleteModal({ isOpen: false, productId: null })}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </ListPageLayout>
  );
};

export default ProductsPage;
