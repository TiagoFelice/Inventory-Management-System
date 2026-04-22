import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Stack,
  Group,
  Button,
  Text,
  Grid,
  Table,
  Modal,
  ActionIcon,
  Tooltip,
  Select,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useSalesOrder, useDeleteSalesOrder, useUpdateSalesOrder } from '@features/sales-orders/salesOrders.hooks';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { formatDate, formatCurrency } from '@shared/utils/formatting';

const SalesOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const orderId = id ? parseInt(id, 10) : null;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const query = useSalesOrder(orderId);
  const deleteMutation = useDeleteSalesOrder();
  const updateMutation = useUpdateSalesOrder();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleDelete = async () => {
    if (orderId) {
      try {
        await deleteMutation.mutateAsync(orderId);
        navigate('/sales-orders');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleStatusChange = async (newStatus: string | null) => {
    if (!orderId || !newStatus) return;
    setIsUpdatingStatus(true);
    try {
      await updateMutation.mutateAsync({
        id: orderId,
        payload: { status: newStatus as any },
      });
      query.refetch();
    } catch (error) {
      console.error('Status update failed:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (query.isLoading) {
    return <LoadingState message="Loading sales order..." />;
  }

  if (query.isError || !query.data) {
    return (
      <ErrorState
        message="Failed to load sales order"
        onRetry={() => query.refetch()}
      />
    );
  }

  const order = query.data;
  const items = order.items || [];

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Stack gap={0}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              {order.order_number}
            </h1>
            <Text size="sm" c="dimmed">
              Sales Order Details
            </Text>
          </Stack>
          <Group>
            <Tooltip label="Edit order">
              <ActionIcon
                size="lg"
                variant="light"
                color="blue"
                onClick={() => navigate(`/sales-orders/${order.id}/edit`)}
              >
                <IconPencil size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete order">
              <ActionIcon
                size="lg"
                variant="light"
                color="red"
                onClick={() => setShowDeleteModal(true)}
              >
                <IconTrash size={20} />
              </ActionIcon>
            </Tooltip>
            <Button variant="light" onClick={() => navigate('/sales-orders')}>
              Back
            </Button>
          </Group>
        </Group>

        {/* Order Header Info */}
        <Paper p="lg" radius="md" withBorder>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Order Number
                </Text>
                <Text fw={600}>{order.order_number}</Text>
              </div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Status
                </Text>
                <Select
                  value={order.status}
                  onChange={handleStatusChange}
                  disabled={isUpdatingStatus}
                  data={[
                    { value: 'draft', label: 'Draft' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                  style={{ marginTop: 4 }}
                />
              </div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Customer
                </Text>
                <Text fw={600}>{order.customer_name || 'N/A'}</Text>
              </div>
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Order Date
                </Text>
                <Text>{formatDate(order.sold_at)}</Text>
              </div>
            </Grid.Col>

            <Grid.Col span={12}>
              <div>
                <Text size="sm" c="dimmed" fw={500}>
                  Total Revenue
                </Text>
                <Text fw={700} size="lg">
                  {formatCurrency(order.total_revenue)}
                </Text>
              </div>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Order Items */}
        <Paper p="lg" radius="md" withBorder>
          <Stack gap="lg">
            <Text fw={600} size="lg">
              Order Items
            </Text>

            {items.length === 0 ? (
              <Text c="dimmed">No items in this order</Text>
            ) : (
              <Table striped>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Product</Table.Th>
                    <Table.Th>Quantity</Table.Th>
                    <Table.Th>Unit Price</Table.Th>
                    <Table.Th>Subtotal</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {items.map((item, idx) => (
                    <Table.Tr key={idx}>
                      <Table.Td>
                        <div>
                          <Text fw={500}>{item.product_name}</Text>
                        </div>
                      </Table.Td>
                      <Table.Td>{item.quantity}</Table.Td>
                      <Table.Td>{formatCurrency(item.unit_price)}</Table.Td>
                      <Table.Td>
                        <Text fw={600}>{formatCurrency(item.total_revenue)}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            )}

            <Group justify="flex-end" pt="lg" style={{ borderTop: '1px solid #eee' }}>
              <Stack gap={0}>
                <Group justify="flex-end">
                  <span style={{ fontWeight: 600 }}>Order Total:</span>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>
                    {formatCurrency(order.total_revenue)}
                  </span>
                </Group>
              </Stack>
            </Group>
          </Stack>
        </Paper>

        {/* Delete Modal */}
        <Modal
          opened={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Sales Order"
          centered
        >
          <Stack>
            <Text>Are you sure you want to delete this sales order? This action cannot be undone.</Text>
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

export default SalesOrderDetailPage;
