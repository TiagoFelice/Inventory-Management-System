import React, { useState } from 'react';
import {
  Container,
  Paper,
  Stack,
  Button,
  Group,
  Select,
  Alert,
  Modal,
  Text,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  usePurchaseOrder,
  useUpdatePurchaseOrder,
  useConfirmPurchaseOrder,
  useCancelPurchaseOrder,
  useReceivePurchaseOrder,
} from '../purchaseOrders.hooks';
import { useProducts } from '@/features/products/products.hooks';
import { getErrorMessage } from '@shared/utils/errors';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { PurchaseOrderForm } from '../components/form/PurchaseOrderForm';
import { PurchaseOrderItemsTable, type OrderItem } from '../components/form/PurchaseOrderItemsTable';
import { ActionErrorAlert } from '../components/list/ActionErrorAlert';

const PurchaseOrderEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : null;

  const orderQuery = usePurchaseOrder(orderId);
  const updateMutation = useUpdatePurchaseOrder();
  const confirmMutation = useConfirmPurchaseOrder();
  const cancelMutation = useCancelPurchaseOrder();
  const receiveMutation = useReceivePurchaseOrder();
  const productsQuery = useProducts();
  const products = productsQuery.data?.results || [];

  const [formData, setFormData] = useState({
    order_number: '',
    supplier_name: '',
    ordered_at: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<OrderItem[]>([
    { product: null, quantity: 0, unit_cost: 0 },
  ]);

  const [errorAlert, setErrorAlert] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });

  const [statusConfirmation, setStatusConfirmation] = useState<{
    isOpen: boolean;
    newStatus: string | null;
    currentStatus: string | null;
  }>({
    isOpen: false,
    newStatus: null,
    currentStatus: null,
  });

  const isUnusualWorkflow = (currentStatus: string, newStatus: string): boolean => {
    // Normal: draft -> confirmed -> received, or draft/confirmed -> cancelled
    if (newStatus === 'confirmed') return currentStatus !== 'draft';
    if (newStatus === 'cancelled') return !['draft', 'confirmed'].includes(currentStatus);
    if (newStatus === 'received') return currentStatus !== 'confirmed';
    return false;
  };

  React.useEffect(() => {
    if (orderQuery.data) {
      const order = orderQuery.data;
      setFormData({
        order_number: order.order_number || '',
        supplier_name: order.supplier_name || '',
        ordered_at: order.ordered_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      });

      if (order.items && order.items.length > 0) {
        setItems(
          order.items.map((item) => ({
            product: item.product ?? null,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          }))
        );
      } else {
        setItems([{ product: null, quantity: 0, unit_cost: 0 }]);
      }
    }
  }, [orderQuery.data]);

  const handleFormChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([...items, { product: null, quantity: 0, unit_cost: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleStatusDropdownChange = async (newStatus: string | null) => {
    if (!newStatus || !orderQuery.data) return;
    
    const currentStatus = orderQuery.data.status;

    if (newStatus === currentStatus) {
      return;
    }
    
    // Check if it's an unusual workflow
    if (isUnusualWorkflow(currentStatus, newStatus)) {
      setStatusConfirmation({
        isOpen: true,
        newStatus,
        currentStatus,
      });
      return;
    }
    
    // Normal workflow, proceed with status change
    await performStatusChange(newStatus);
  };

  const performStatusChange = async (newStatus: string) => {
    if (!orderId || !orderQuery.data) return;

    const currentStatus = orderQuery.data.status;

    try {
      if (newStatus === 'confirmed' && currentStatus === 'draft') {
        await confirmMutation.mutateAsync(orderId);
      } else if (newStatus === 'received' && currentStatus === 'confirmed') {
        await receiveMutation.mutateAsync(orderId);
      } else if (newStatus === 'cancelled' && ['draft', 'confirmed'].includes(currentStatus)) {
        await cancelMutation.mutateAsync(orderId);
      } else {
        setErrorAlert({
          isOpen: true,
          message: `Cannot change from ${currentStatus} to ${newStatus}`,
        });
      }
      orderQuery.refetch();
      setStatusConfirmation({ isOpen: false, newStatus: null, currentStatus: null });
    } catch (error: any) {
      const message = error?.response?.data?.detail || error?.response?.data?.error || 'Failed to change status';
      setErrorAlert({ isOpen: true, message });
    }
  };

  const handleStatusConfirmationProceed = async () => {
    if (!statusConfirmation.newStatus) return;
    setStatusConfirmation({ isOpen: false, newStatus: null, currentStatus: null });
    await performStatusChange(statusConfirmation.newStatus);
  };

  const handleSubmit = async () => {
    if (!orderId) return;

    // Validation
    if (!formData.order_number.trim()) {
      alert('Order number is required');
      return;
    }

    const validItems = items.filter((item) => item.product && item.quantity > 0);
    if (validItems.length === 0) {
      alert('At least one item is required');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: orderId,
        payload: {
          order_number: formData.order_number,
          supplier_name: formData.supplier_name || undefined,
          ordered_at: new Date(formData.ordered_at).toISOString(),
          items: validItems.map((item) => ({
            product: item.product!.id,
            quantity: item.quantity,
            unit_cost: item.unit_cost,
          })),
        },
      });
      navigate(`/purchase-orders/${orderId}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (orderQuery.isLoading) {
    return <LoadingState message="Loading purchase order..." />;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <ErrorState
        message="Failed to load purchase order"
        onRetry={() => orderQuery.refetch()}
      />
    );
  }

  const errorMessage = updateMutation.error
    ? getErrorMessage(updateMutation.error)
    : null;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Edit Purchase Order</h1>

        <Paper p="lg" radius="md" withBorder>
          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} c="red" mb="lg">
              {errorMessage}
            </Alert>
          )}

          <Stack gap="md">
            <PurchaseOrderForm
              formData={formData}
              onChange={handleFormChange}
              isLoading={updateMutation.isPending}
            />

            {/* Status Section */}
            <div>
              <Text size="sm" c="dimmed" fw={500} mb={8}>
                Status
              </Text>
              <Select
                label="Change Order Status"
                placeholder="Select status"
                data={[
                  { value: 'draft', label: 'Draft' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'received', label: 'Received' },
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={orderQuery.data?.status || null}
                onChange={handleStatusDropdownChange}
                disabled={
                  updateMutation.isPending ||
                  confirmMutation.isPending ||
                  cancelMutation.isPending ||
                  receiveMutation.isPending
                }
              />
              <Text size="xs" c="dimmed" mt={4}>
                Changing status uses specific endpoints to validate workflow rules.
              </Text>
            </div>

            <PurchaseOrderItemsTable
              items={items}
              products={products}
              onItemChange={handleItemChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              isLoading={updateMutation.isPending}
            />

            {/* Actions */}
            <Group justify="flex-end" pt="xl">
              <Button
                variant="light"
                onClick={() => navigate(`/purchase-orders/${orderId}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={updateMutation.isPending}
              >
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Paper>

        {/* Error Alert Modal */}
        <ActionErrorAlert
          opened={errorAlert.isOpen}
          message={errorAlert.message}
          onClose={() => setErrorAlert({ isOpen: false, message: '' })}
        />

        {/* Unusual Workflow Confirmation Modal */}
        <Modal
          opened={statusConfirmation.isOpen}
          onClose={() =>
            setStatusConfirmation({ isOpen: false, newStatus: null, currentStatus: null })
          }
          title="Confirm Unusual Status Change"
          centered
        >
          <Stack>
            <Alert icon={<IconAlertCircle size={16} />} c="yellow">
              <Text fw={500} mb={4}>
                This status change is not part of the usual workflow.
              </Text>
              <Text size="sm">
                Changing from <strong>{statusConfirmation.currentStatus}</strong> to{' '}
                <strong>{statusConfirmation.newStatus}</strong>. Are you sure you want to proceed?
              </Text>
            </Alert>
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() =>
                  setStatusConfirmation({ isOpen: false, newStatus: null, currentStatus: null })
                }
              >
                Cancel
              </Button>
              <Button
                color="yellow"
                loading={
                  confirmMutation.isPending ||
                  cancelMutation.isPending ||
                  receiveMutation.isPending
                }
                onClick={handleStatusConfirmationProceed}
              >
                Proceed Anyway
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  );
};

export default PurchaseOrderEditPage;
