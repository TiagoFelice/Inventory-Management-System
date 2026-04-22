import React, { useState } from 'react';
import {
  Container,
  Stack,
  Group,
  Button,
  TextInput,
  Paper,
  Select,
  Modal,
  Text,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconSearch, IconPencil, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useSalesOrders, useDeleteSalesOrder } from '@features/sales-orders/salesOrders.hooks';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { EmptyState } from '@components/ui/EmptyState';
import { DataTable } from '@components/ui/DataTable';
import { StatusBadge } from '@components/ui/StatusBadge';
import { formatDate, formatCurrency } from '@shared/utils/formatting';

const SalesOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('-sold_at');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; orderId: number | null }>({
    isOpen: false,
    orderId: null,
  });

  const query = useSalesOrders({
    search: search || undefined,
    ordering: ordering,
  });

  const deleteMutation = useDeleteSalesOrder();

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
    return <LoadingState message="Loading sales orders..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Failed to load sales orders"
        onRetry={() => query.refetch()}
      />
    );
  }

  const orders = query.data?.results || [];

  const columns = [
    { key: 'order_number', label: 'Order Code' },
    { key: 'customer_name', label: 'Customer', render: (value: string) => value || 'N/A' },
    {
      key: 'sold_at',
      label: 'Order Date',
      render: (value: string) => formatDate(value),
    },
    {
      key: 'total_revenue',
      label: 'Revenue',
      render: (value: number) => formatCurrency(value),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => <StatusBadge status={value as any} />,
    },
  ];

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <Stack gap={0}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Sales Orders</h1>
            {orders.length > 0 && (
              <p style={{ margin: 0, color: '#777', fontSize: 14 }}>
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </p>
            )}
          </Stack>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => navigate('/sales-orders/new')}
          >
            New Order
          </Button>
        </Group>

        {/* Filters */}
        <Group align="flex-end">
          <TextInput
            placeholder="Search by order code or customer..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Sort by"
            data={[
              { value: '-sold_at', label: 'Newest First' },
              { value: 'sold_at', label: 'Oldest First' },
              { value: '-total_revenue', label: 'Highest Revenue' },
            ]}
            value={ordering}
            onChange={(val) => setOrdering(val || '-sold_at')}
            style={{ minWidth: 200 }}
          />
        </Group>

        {/* Table */}
        {orders.length === 0 && !search ? (
          <EmptyState
            title="No Sales Orders"
            description="Start by creating your first sales order"
            actionLabel="Create Order"
            onAction={() => navigate('/sales-orders/new')}
          />
        ) : orders.length === 0 ? (
          <EmptyState
            title="No Results"
            description={`No sales orders found matching "${search}"`}
          />
        ) : (
          <Paper withBorder radius="md" style={{ overflow: 'hidden' }}>
            <DataTable
              columns={columns}
              data={orders}
              onRowClick={(row) => navigate(`/sales-orders/${row.id}`)}
              renderRowActions={(row: any) => (
                <Group gap={4}>
                  <Tooltip label="Edit order">
                    <ActionIcon
                      variant="subtle"
                      color="blue"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/sales-orders/${row.id}/edit`);
                      }}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                  </Tooltip>
                  <Tooltip label="Delete order">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ isOpen: true, orderId: row.id });
                      }}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              )}
            />
          </Paper>
        )}

        {/* Delete Modal */}
        <Modal
          opened={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, orderId: null })}
          title="Delete Sales Order"
          centered
        >
          <Stack>
            <Text>Are you sure you want to delete this sales order? This action cannot be undone.</Text>
            <Group justify="flex-end">
              <Button
                variant="light"
                onClick={() => setDeleteModal({ isOpen: false, orderId: null })}
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
      </Stack>
    </Container>
  );
};

export default SalesOrdersPage;
