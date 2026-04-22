import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Stack,
  Group,
  Button,
  Text,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { useStockEntry, useStockEntryAllocationDetail, useDeleteStockEntry } from '@features/stocks/stocks.hooks';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { StockBasicInfo } from '../components/detail/StockBasicInfo';
import { StockAllocationInfo } from '../components/detail/StockAllocationInfo';
import { StockDeleteConfirmationModal } from '../components/detail/StockDeleteConfirmationModal';

const StockDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const stockId = id ? parseInt(id, 10) : null;
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const stockQuery = useStockEntry(stockId);
  const allocationQuery = useStockEntryAllocationDetail(stockId);
  const deleteMutation = useDeleteStockEntry();

  const handleDelete = async () => {
    if (stockId) {
      try {
        await deleteMutation.mutateAsync(stockId);
        navigate('/stock-entries');
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  if (stockQuery.isLoading || allocationQuery.isLoading) {
    return <LoadingState message="Loading stock entry..." />;
  }

  if (stockQuery.isError || !stockQuery.data) {
    return (
      <ErrorState
        message="Failed to load stock entry"
        onRetry={() => stockQuery.refetch()}
      />
    );
  }

  const stock = stockQuery.data;
  const allocation = allocationQuery.data;

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Stack gap={0}>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>
              {stock.stock_identifier}
            </h1>
            <Text size="sm" c="dimmed">
              Product: {stock.product_name}
            </Text>
          </Stack>
          <Group>
            <Tooltip label="Edit stock entry">
              <ActionIcon
                size="lg"
                variant="light"
                color="blue"
                onClick={() => navigate(`/stock-entries/${stock.id}/edit`)}
              >
                <IconPencil size={20} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete stock entry">
              <ActionIcon
                size="lg"
                variant="light"
                color="red"
                onClick={() => setShowDeleteModal(true)}
              >
                <IconTrash size={20} />
              </ActionIcon>
            </Tooltip>
            <Button variant="light" onClick={() => navigate('/stock-entries')}>
              Back
            </Button>
          </Group>
        </Group>

        <StockBasicInfo stock={stock} />

        <StockAllocationInfo allocation={allocation} />

        <StockDeleteConfirmationModal
          opened={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      </Stack>
    </Container>
  );
};

export default StockDetailPage;
