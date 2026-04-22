import React, { useState } from 'react';
import {
  Container,
  Paper,
  Stack,
  Button,
  Group,
  TextInput,
  NumberInput,
  Table,
  Select,
  ActionIcon,
  Alert,
} from '@mantine/core';
import { IconTrash, IconAlertCircle } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSalesOrder, useUpdateSalesOrder } from '@features/sales-orders/salesOrders.hooks';
import { useProducts } from '@/features/products/products.hooks';
import { getErrorMessage } from '@shared/utils/errors';
import { formatCurrency } from '@shared/utils/formatting';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';

interface OrderItem {
  product: string;
  quantity: number;
  unit_price: number;
}

const SalesOrderEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : null;

  const orderQuery = useSalesOrder(orderId);
  const updateMutation = useUpdateSalesOrder();
  const productsQuery = useProducts();
  const products = productsQuery.data?.results || [];

  const [formData, setFormData] = useState({
    order_number: '',
    customer_name: '',
    sold_at: new Date().toISOString().split('T')[0],
    status: 'draft',
  });

  const [items, setItems] = useState<OrderItem[]>([
    { product: '', quantity: 0, unit_price: 0 },
  ]);

  React.useEffect(() => {
    if (orderQuery.data) {
      const order = orderQuery.data;
      setFormData({
        order_number: order.order_number || '',
        customer_name: order.customer_name || '',
        sold_at: order.sold_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: order.status || 'draft',
      });

      if (order.items && order.items.length > 0) {
        setItems(
          order.items.map((item: any) => ({
            product: String(item.product),
            quantity: item.quantity,
            unit_price: item.unit_price,
          }))
        );
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
    setItems([...items, { product: '', quantity: 0, unit_price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
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
          customer_name: formData.customer_name || undefined,
          sold_at: new Date(formData.sold_at).toISOString(),
          status: formData.status as any,
          items: validItems.map((item) => ({
            product: parseInt(item.product, 10),
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
    return (
      <ErrorState
        message="Failed to load sales order"
        onRetry={() => orderQuery.refetch()}
      />
    );
  }

  const totalRevenue = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  const errorMessage = updateMutation.error
    ? getErrorMessage(updateMutation.error)
    : null;

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
            {/* Order Header */}
            <div>
              <h3 style={{ marginBottom: 12 }}>Order Information</h3>
              <Group grow>
                <TextInput
                  label="Order Number"
                  placeholder="SO-2024-001"
                  value={formData.order_number}
                  onChange={(e) => handleFormChange('order_number', e.currentTarget.value)}
                  disabled={updateMutation.isPending}
                />
                <TextInput
                  label="Customer Name"
                  placeholder="Customer name (optional)"
                  value={formData.customer_name}
                  onChange={(e) => handleFormChange('customer_name', e.currentTarget.value)}
                  disabled={updateMutation.isPending}
                />
                <TextInput
                  label="Order Date"
                  type="date"
                  value={formData.sold_at}
                  onChange={(e) => handleFormChange('sold_at', e.currentTarget.value)}
                  disabled={updateMutation.isPending}
                />
                <Select
                  label="Status"
                  placeholder="Select status"
                  data={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                  value={formData.status}
                  onChange={(val) => handleFormChange('status', val)}
                  disabled={updateMutation.isPending}
                />
              </Group>
            </div>

            {/* Order Items */}
            <div>
              <Group justify="space-between" mb="lg">
                <h3 style={{ margin: 0 }}>Order Items</h3>
                <Button
                  size="sm"
                  variant="light"
                  onClick={handleAddItem}
                  disabled={updateMutation.isPending}
                >
                  Add Item
                </Button>
              </Group>

              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th>Quantity</Table.Th>
                    <Table.Th>Unit Price</Table.Th>
                    <Table.Th>Subtotal</Table.Th>
                    <Table.Th style={{ width: 40 }} />
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item, index) => {
                    const subtotal = item.quantity * item.unit_price;
                    return (
                      <Table.Tr key={index}>
                        <Table.Td style={{ minWidth: 250 }}>
                          <Select
                            placeholder="Select product"
                            data={products.map((p) => ({
                              value: String(p.id),
                              label: `${p.name} (${p.sku})`,
                            }))}
                            value={item.product}
                            onChange={(val) => handleItemChange(index, 'product', val)}
                            disabled={updateMutation.isPending}
                            searchable
                          />
                        </Table.Td>
                        <Table.Td style={{ minWidth: 100 }}>
                          <NumberInput
                            placeholder="0"
                            min={0}
                            value={item.quantity}
                            onChange={(val) => handleItemChange(index, 'quantity', val)}
                            disabled={updateMutation.isPending}
                          />
                        </Table.Td>
                        <Table.Td style={{ minWidth: 120 }}>
                          <NumberInput
                            placeholder="0.00"
                            min={0}
                            step={0.01}
                            value={item.unit_price}
                            onChange={(val) => handleItemChange(index, 'unit_price', val)}
                            disabled={updateMutation.isPending}
                          />
                        </Table.Td>
                        <Table.Td>{formatCurrency(subtotal)}</Table.Td>
                        <Table.Td>
                          <ActionIcon
                            c="red"
                            onClick={() => handleRemoveItem(index)}
                            disabled={updateMutation.isPending || items.length === 1}
                          >
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>

              <Group justify="flex-end" mt="lg" pt="lg" style={{ borderTop: '1px solid #eee' }}>
                <Stack gap={0}>
                  <Group justify="flex-end">
                    <span style={{ fontWeight: 600 }}>Total Revenue:</span>
                    <span style={{ fontWeight: 700, fontSize: 18 }}>
                      {formatCurrency(totalRevenue)}
                    </span>
                  </Group>
                </Stack>
              </Group>
            </div>

            {/* Actions */}
            <Group justify="flex-end" pt="xl">
              <Button
                variant="light"
                onClick={() => navigate(`/sales-orders/${orderId}`)}
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
      </Stack>
    </Container>
  );
};

export default SalesOrderEditPage;
