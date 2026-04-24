import React, { useState } from 'react';
import {
  Container,
  Paper,
  Stack,
  Button,
  Group,
  Alert,
  Text,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  usePurchaseOrder,
  useUpdatePurchaseOrder,
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
            quantity: Number(item.quantity),
            unit_cost: Number(item.unit_cost),
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

  const handleSubmit = async () => {
    if (!orderId) return;
    const isItemsLocked = orderQuery.data?.status === 'received';

    if (!formData.order_number.trim()) {
      alert('Order number is required');
      return;
    }

    const validItems = items.filter((item) => item.product && item.quantity > 0);
    if (!isItemsLocked && validItems.length === 0) {
      alert('At least one item is required');
      return;
    }

    try {
      const payload: {
        order_number: string;
        supplier_name?: string;
        ordered_at: string;
        items?: Array<{ product: number; quantity: number; unit_cost: number }>;
      } = {
        order_number: formData.order_number,
        supplier_name: formData.supplier_name || undefined,
        ordered_at: new Date(formData.ordered_at).toISOString(),
      };

      if (!isItemsLocked) {
        payload.items = validItems.map((item) => ({
          product: item.product!.id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
        }));
      }

      await updateMutation.mutateAsync({
        id: orderId,
        payload,
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
  const isItemsLocked = orderQuery.data.status === 'received';

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

            <PurchaseOrderItemsTable
              items={items}
              products={products}
              onItemChange={handleItemChange}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              isLoading={updateMutation.isPending}
              isLocked={isItemsLocked}
            />

            {isItemsLocked ? (
              <Text size="sm" c="dimmed">
                Order items are locked because this purchase order is already received.
              </Text>
            ) : null}

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

        <ActionErrorAlert
          opened={errorAlert.isOpen}
          message={errorAlert.message}
          onClose={() => setErrorAlert({ isOpen: false, message: '' })}
        />
      </Stack>
    </Container>
  );
};

export default PurchaseOrderEditPage;
