import React, { useEffect, useState } from 'react';
import { Alert, Button, Container, Group, Paper, Select, Stack, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { useProducts } from '@/features/products/products.hooks';
import { getErrorMessage } from '@shared/utils/errors';
import {
  useCancelSalesOrder,
  useConfirmSalesOrderWithAllocations,
  useSalesOrder,
  useUpdateSalesOrder,
} from '@features/sales-orders/salesOrders.hooks';
import type { ConfirmSalesOrderAllocationPayload } from '@features/sales-orders/salesOrder.types';
import { ActionErrorAlert } from '../components/list/ActionErrorAlert';
import { SalesOrderForm, type SalesOrderFormData } from '../components/form/SalesOrderForm';
import {
  SalesOrderItemsTable,
  type SalesOrderFormItem,
} from '../components/form/SalesOrderItemsTable';
import { SalesOrderAllocationModal } from '../components/form/SalesOrderAllocationModal';

const SalesOrderEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : null;

  const orderQuery = useSalesOrder(orderId);
  const updateMutation = useUpdateSalesOrder();
  const confirmMutation = useConfirmSalesOrderWithAllocations();
  const cancelMutation = useCancelSalesOrder();
  const productsQuery = useProducts();
  const products = productsQuery.data?.results || [];

  const [formData, setFormData] = useState<SalesOrderFormData>({
    order_number: '',
    customer_name: '',
    sold_at: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState<SalesOrderFormItem[]>([
    { product: null, quantity: 0, unit_price: 0 },
  ]);

  const [errorAlert, setErrorAlert] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: '',
  });
  const [showAllocationModal, setShowAllocationModal] = useState(false);

  useEffect(() => {
    if (orderQuery.data) {
      const order = orderQuery.data;
      setFormData({
        order_number: order.order_number || '',
        customer_name: order.customer_name || '',
        sold_at: order.sold_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      });

      if (order.items && order.items.length > 0) {
        setItems(
          order.items.map((item) => ({
            product: products.find((product) => product.id === item.product) || null,
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        );
      } else {
        setItems([{ product: null, quantity: 0, unit_price: 0 }]);
      }
    }
  }, [orderQuery.data, products]);

  const handleFormChange = (field: keyof SalesOrderFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (
    index: number,
    field: keyof SalesOrderFormItem,
    value: SalesOrderFormItem[keyof SalesOrderFormItem]
  ) => {
    const nextItems = [...items];
    nextItems[index] = { ...nextItems[index], [field]: value };
    setItems(nextItems);
  };

  const handleAddItem = () => {
    setItems([...items, { product: null, quantity: 0, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleStatusChange = async (newStatus: string | null) => {
    if (!orderId || !orderQuery.data || !newStatus || newStatus === orderQuery.data.status) {
      return;
    }

    try {
      if (newStatus === 'confirmed') {
        setShowAllocationModal(true);
        return;
      } else if (newStatus === 'cancelled' && ['draft', 'confirmed'].includes(orderQuery.data.status)) {
        await cancelMutation.mutateAsync(orderId);
      } else if (newStatus !== 'draft') {
        setErrorAlert({
          isOpen: true,
          message: `Cannot change from ${orderQuery.data.status} to ${newStatus}`,
        });
      }

      await orderQuery.refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        'Failed to change status';
      setErrorAlert({ isOpen: true, message });
    }
  };

  const handleConfirmWithAllocations = async (payload: ConfirmSalesOrderAllocationPayload) => {
    if (!orderId) {
      return;
    }

    try {
      await confirmMutation.mutateAsync({ id: orderId, payload });
      setShowAllocationModal(false);
      await orderQuery.refetch();
    } catch (error: any) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        'Failed to confirm order';
      setErrorAlert({ isOpen: true, message });
    }
  };

  const handleSubmit = async () => {
    if (!orderId) return;

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
          customer_name: formData.customer_name || undefined,
          sold_at: new Date(formData.sold_at).toISOString(),
          items: validItems.map((item) => ({
            product: item.product!.id,
            quantity: item.quantity,
            unit_price: item.unit_price,
          })),
        },
      });
      navigate(`/sales-orders/${orderId}`);
    } catch (error) {
      console.error(error);
    }
  };

  if (orderQuery.isLoading) {
    return <LoadingState message="Loading sales order..." />;
  }

  if (orderQuery.isError || !orderQuery.data) {
    return <ErrorState message="Failed to load sales order" onRetry={() => orderQuery.refetch()} />;
  }

  const errorMessage = updateMutation.error ? getErrorMessage(updateMutation.error) : null;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Edit Sales Order</h1>

        <Paper p="lg" radius="md" withBorder>
          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} c="red" mb="lg">
              {errorMessage}
            </Alert>
          )}

          <Stack gap="md">
            <SalesOrderForm
              formData={formData}
              onChange={handleFormChange}
              isLoading={updateMutation.isPending}
            />

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
                  { value: 'cancelled', label: 'Cancelled' },
                ]}
                value={orderQuery.data.status}
                onChange={handleStatusChange}
                disabled={
                  updateMutation.isPending || confirmMutation.isPending || cancelMutation.isPending
                }
              />
              <Text size="xs" c="dimmed" mt={4}>
                Confirmed status requires manual stock allocations. Other status changes still use the usual endpoints.
              </Text>
            </div>

            <SalesOrderItemsTable
              items={items}
              products={products}
              onItemChange={handleItemChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              isLoading={updateMutation.isPending}
            />

            <Group justify="flex-end" pt="xl">
              <Button
                variant="light"
                onClick={() => navigate(`/sales-orders/${orderId}`)}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={updateMutation.isPending}>
                Save Changes
              </Button>
            </Group>
          </Stack>
        </Paper>

        <ActionErrorAlert
          opened={errorAlert.isOpen}
          message={errorAlert.message}
          onClose={() => setErrorAlert({ isOpen: false, message: '' })}
        />

        {orderQuery.data ? (
          <SalesOrderAllocationModal
            opened={showAllocationModal}
            order={orderQuery.data}
            onClose={() => setShowAllocationModal(false)}
            onConfirm={handleConfirmWithAllocations}
            isLoading={confirmMutation.isPending}
          />
        ) : null}
      </Stack>
    </Container>
  );
};

export default SalesOrderEditPage;
