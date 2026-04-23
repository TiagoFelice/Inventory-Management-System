import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Stack, Button, Group } from '@mantine/core';
import {
  usePurchaseOrder,
  useDeletePurchaseOrder,
  useConfirmPurchaseOrder,
  useCancelPurchaseOrder,
  useReceivePurchaseOrderWithEntries,
} from '../purchaseOrders.hooks';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { PurchaseOrderDetailHeader } from '../components/detail/PurchaseOrderDetailHeader';
import { PurchaseOrderDetailItems } from '../components/detail/PurchaseOrderDetailItems';
import { DeleteConfirmationModal } from '../components/list/DeleteConfirmationModal';
import { ActionErrorAlert } from '../components/list/ActionErrorAlert';
import { PurchaseOrderReceiveModal } from '../components/form/PurchaseOrderReceiveModal';
import type { ReceivePurchaseOrderEntriesPayload } from '../purchaseOrder.types';

const PurchaseOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : null;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const query = usePurchaseOrder(orderId);
  const deleteMutation = useDeletePurchaseOrder();
  const confirmMutation = useConfirmPurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();
  const receiveMutation = useReceivePurchaseOrderWithEntries();

  const handleDelete = async () => {
    if (orderId) {
      try {
        await deleteMutation.mutateAsync(orderId);
        navigate('/purchase-orders');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleConfirmOrder = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      await confirmMutation.mutateAsync(orderId!);
      query.refetch();
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.response?.data?.error || 'Failed to confirm order';
      setErrorAlert({ isOpen: true, message });
    }
  };

  const handleCancelOrder = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    try {
      await cancelMutation.mutateAsync(orderId!);
      query.refetch();
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.response?.data?.error || 'Failed to cancel order';
      setErrorAlert({ isOpen: true, message });
    }
  };

  const handleReceiveOrder = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setShowReceiveModal(true);
  };

  const handleReceiveWithEntries = async (payload: ReceivePurchaseOrderEntriesPayload) => {
    try {
      await receiveMutation.mutateAsync({ id: orderId!, payload });
      setShowReceiveModal(false);
      query.refetch();
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.response?.data?.error || 'Failed to receive order';
      setErrorAlert({ isOpen: true, message });
    }
  };

  if (query.isLoading) {
    return <LoadingState message="Loading purchase order..." />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        message="Failed to load purchase order"
        onRetry={() => query.refetch()}
      />
    );
  }

  const order = query.data;
  const items = order.items || [];

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <PurchaseOrderDetailHeader
          order={order}
          onEdit={() => navigate(`/purchase-orders/${order.id}/edit`)}
          onDelete={() => setShowDeleteModal(true)}
          onConfirm={handleConfirmOrder}
          onCancel={handleCancelOrder}
          onReceive={handleReceiveOrder}
          onBack={() => navigate('/purchase-orders')}
          confirmLoading={confirmMutation.isPending}
          cancelLoading={cancelMutation.isPending}
          receiveLoading={receiveMutation.isPending}
        />

        <PurchaseOrderDetailItems items={items} />

        <Group justify="flex-end">
          <Button
            variant="light"
            onClick={() => navigate('/purchase-orders')}
          >
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

        <PurchaseOrderReceiveModal
          opened={showReceiveModal}
          order={order}
          onClose={() => setShowReceiveModal(false)}
          onConfirm={handleReceiveWithEntries}
          isLoading={receiveMutation.isPending}
        />
      </Stack>
    </Container>
  );
};

export default PurchaseOrderDetailPage;
