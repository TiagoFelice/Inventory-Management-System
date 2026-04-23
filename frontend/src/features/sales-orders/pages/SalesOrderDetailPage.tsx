import React, { useState } from 'react';
import { Button, Container, Group, Stack } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import {
  useCancelSalesOrder,
  useConfirmSalesOrder,
  useDeleteSalesOrder,
  useSalesOrder,
} from '@features/sales-orders/salesOrders.hooks';
import { SalesOrderDetailHeader } from '../components/detail/SalesOrderDetailHeader';
import { SalesOrderDetailItems } from '../components/detail/SalesOrderDetailItems';
import { DeleteConfirmationModal } from '../components/list/DeleteConfirmationModal';
import { ActionErrorAlert } from '../components/list/ActionErrorAlert';

const SalesOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : null;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const query = useSalesOrder(orderId);
  const deleteMutation = useDeleteSalesOrder();
  const confirmMutation = useConfirmSalesOrder();
  const cancelMutation = useCancelSalesOrder();

  const handleDelete = async () => {
    if (!orderId) return;

    try {
      await deleteMutation.mutateAsync(orderId);
      navigate('/sales-orders');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const handleConfirmOrder = async (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    try {
      await confirmMutation.mutateAsync(orderId!);
      query.refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        'Failed to confirm order';
      setErrorAlert({ isOpen: true, message });
    }
  };

  const handleCancelOrder = async (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    try {
      await cancelMutation.mutateAsync(orderId!);
      query.refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        'Failed to cancel order';
      setErrorAlert({ isOpen: true, message });
    }
  };

  if (query.isLoading) {
    return <LoadingState message="Loading sales order..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Failed to load sales order" onRetry={() => query.refetch()} />;
  }

  const order = query.data;
  const items = order.items || [];

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <SalesOrderDetailHeader
          order={order}
          onEdit={() => navigate(`/sales-orders/${order.id}/edit`)}
          onDelete={() => setShowDeleteModal(true)}
          onConfirm={handleConfirmOrder}
          onCancel={handleCancelOrder}
          confirmLoading={confirmMutation.isPending}
          cancelLoading={cancelMutation.isPending}
        />

        <SalesOrderDetailItems items={items} />

        <Group justify="flex-end">
          <Button variant="light" onClick={() => navigate('/sales-orders')}>
            Back
          </Button>
        </Group>

        <DeleteConfirmationModal
          opened={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />

        <ActionErrorAlert
          opened={errorAlert.isOpen}
          message={errorAlert.message}
          onClose={() => setErrorAlert({ isOpen: false, message: '' })}
        />
      </Stack>
    </Container>
  );
};

export default SalesOrderDetailPage;
