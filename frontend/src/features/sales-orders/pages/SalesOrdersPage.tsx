import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { EmptyState } from '@components/ui/EmptyState';
import { ListPageHeader } from '@components/ui/ListPageHeader';
import { ListPageLayout } from '@components/ui/ListPageLayout';
import { ListTableCard } from '@components/ui/ListTableCard';
import {
  useDeleteSalesOrder,
  useSalesOrders,
} from '@features/sales-orders/salesOrders.hooks';
import { ActionErrorAlert } from '../components/list/ActionErrorAlert';
import { DeleteConfirmationModal } from '../components/list/DeleteConfirmationModal';
import { SalesOrdersFilters } from '../components/list/SalesOrdersFilters';
import { SalesOrdersTable } from '../components/list/SalesOrdersTable';

const SalesOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-sold_at');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; orderId: number | null }>({
    isOpen: false,
    orderId: null,
  });
  const [errorAlert, setErrorAlert] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const query = useSalesOrders({
    search: search || undefined,
    ordering,
  });
  const deleteMutation = useDeleteSalesOrder();

  const handleDeleteConfirm = async () => {
    if (!deleteModal.orderId) return;

    try {
      await deleteMutation.mutateAsync(deleteModal.orderId);
      setDeleteModal({ isOpen: false, orderId: null });
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (query.isLoading) {
    return <LoadingState message="Loading sales orders..." />;
  }

  if (query.isError) {
    return <ErrorState message="Failed to load sales orders" onRetry={() => query.refetch()} />;
  }

  const orders = query.data?.results || [];

  return (
    <ListPageLayout
      header={
        <ListPageHeader
          title="Sales Orders"
          itemCount={orders.length}
          itemLabel="order"
          actionLabel="New Order"
          onAction={() => navigate('/sales-orders/new')}
        />
      }
      filters={
        <SalesOrdersFilters
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
          title="No Sales Orders"
          description="Start by creating your first sales order"
          actionLabel="Create Order"
          onAction={() => navigate('/sales-orders/new')}
        />
      ) : orders.length === 0 ? (
        <EmptyState title="No Results" description={`No sales orders found matching "${search}"`} />
      ) : (
        <ListTableCard>
          <SalesOrdersTable
            orders={orders}
            onEdit={(id) => navigate(`/sales-orders/${id}/edit`)}
            onDelete={(id) => setDeleteModal({ isOpen: true, orderId: id })}
            onRowClick={(order) => navigate(`/sales-orders/${order.id}`)}
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

export default SalesOrdersPage;
