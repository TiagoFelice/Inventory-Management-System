import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  usePurchaseOrders,
  useDeletePurchaseOrder,
} from '../purchaseOrders.hooks';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { EmptyState } from '@components/ui/EmptyState';
import { ListPageHeader } from '@components/ui/ListPageHeader';
import { ListPageLayout } from '@components/ui/ListPageLayout';
import { ListTableCard } from '@components/ui/ListTableCard';
import { PurchaseOrdersTable } from '../components/list/PurchaseOrdersTable';
import { PurchaseOrdersFilters } from '../components/list/PurchaseOrdersFilters';
import { DeleteConfirmationModal } from '../components/list/DeleteConfirmationModal';
import { ActionErrorAlert } from '../components/list/ActionErrorAlert';

const PurchaseOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-ordered_at');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; orderId: number | null }>({
    isOpen: false,
    orderId: null,
  });
  const [errorAlert, setErrorAlert] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const query = usePurchaseOrders({
    search: search || undefined,
    ordering: ordering,
  });

  const deleteMutation = useDeletePurchaseOrder();

  const handleDeleteConfirm = async () => {
    if (deleteModal.orderId) {
      try {
        await deleteMutation.mutateAsync(deleteModal.orderId);
        setDeleteModal({ isOpen: false, orderId: null });
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  if (query.isLoading) {
    return <LoadingState message="Loading purchase orders..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Failed to load purchase orders"
        onRetry={() => query.refetch()}
      />
    );
  }

  const orders = query.data?.results || [];

  return (
    <ListPageLayout
      contentWidth="92%"
      header={
        <ListPageHeader
          title="Purchase Orders"
          itemCount={orders.length}
          itemLabel="order"
          actionLabel="New Order"
          onAction={() => navigate('/purchase-orders/new')}
        />
      }
      filters={
        <PurchaseOrdersFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSearch={setSearch}
          onSearchClear={() => {
            setSearchInput('');
            setSearch('');
          }}
          ordering={ordering}
          onOrderingChange={setOrdering}
        />
      }
    >
      {orders.length === 0 && !search ? (
        <EmptyState
          title="No Purchase Orders"
          description="Start by creating your first purchase order"
          actionLabel="Create Order"
          onAction={() => navigate('/purchase-orders/new')}
        />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Results"
          description={`No purchase orders found matching "${search}"`}
        />
      ) : (
        <ListTableCard>
          <PurchaseOrdersTable
            orders={orders}
            onEdit={(id) => navigate(`/purchase-orders/${id}/edit`)}
            onDelete={(id) => setDeleteModal({ isOpen: true, orderId: id })}
            onRowClick={(order) => navigate(`/purchase-orders/${order.id}`)}
          />
        </ListTableCard>
      )}

      <DeleteConfirmationModal
        opened={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, orderId: null })}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <ActionErrorAlert
        opened={errorAlert.isOpen}
        message={errorAlert.message}
        onClose={() => setErrorAlert({ isOpen: false, message: '' })}
      />
    </ListPageLayout>
  );
};

export default PurchaseOrdersPage;
