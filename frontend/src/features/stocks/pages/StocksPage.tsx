import React, { useState } from 'react';
import { Modal, Stack, Text, Group, Button } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useStocks, useDeleteStockEntry } from '@features/stocks/stocks.hooks';
import { LoadingState } from '@components/ui/LoadingState';
import { ErrorState } from '@components/ui/ErrorState';
import { EmptyState } from '@components/ui/EmptyState';
import { ListPageLayout } from '@components/ui/ListPageLayout';
import { StockToolbar } from '../components/list/StockToolbar';
import { StockFilters } from '../components/list/StockFilters';
import { StockTable } from '../components/list/StockTable';
import type { StockEntry } from '../stock.types';

const StocksPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState('expiration_date');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; stockId: number | null }>({
    isOpen: false,
    stockId: null,
  });

  const query = useStocks({
    search: search || undefined,
    ordering: ordering,
  });

  const deleteMutation = useDeleteStockEntry();

  const handleDeleteConfirm = async () => {
    if (deleteModal.stockId) {
      try {
        await deleteMutation.mutateAsync(deleteModal.stockId);
        setDeleteModal({ isOpen: false, stockId: null });
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  if (query.isLoading) {
    return <LoadingState message="Loading stock entries..." />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message="Failed to load stock entries"
        onRetry={() => query.refetch()}
      />
    );
  }

  const stocks = query.data?.results || [];

  return (
    <ListPageLayout
      header={
        <StockToolbar
          stockCount={stocks.length}
          onCreate={() => navigate('/stock-entries/new')}
        />
      }
      filters={
        <StockFilters
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
      {stocks.length === 0 && !search ? (
        <EmptyState
          title="No Stock Entries"
          description="Start by adding your first stock entry"
          actionLabel="Add Stock"
          onAction={() => navigate('/stock-entries/new')}
        />
      ) : stocks.length === 0 ? (
        <EmptyState
          title="No Results"
          description={`No stock entries found matching "${search}"`}
        />
      ) : (
        <StockTable
          stocks={stocks}
          onRowClick={(stock: StockEntry) => navigate(`/stock-entries/${stock.id}`)}
          onEdit={(stock: StockEntry) => navigate(`/stock-entries/${stock.id}/edit`)}
          onDelete={(stock: StockEntry) =>
            setDeleteModal({ isOpen: true, stockId: stock.id })
          }
        />
      )}

      <Modal
        opened={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, stockId: null })}
        title="Delete Stock Entry"
        centered
      >
        <Stack>
          <Text>Are you sure you want to delete this stock entry? This action cannot be undone.</Text>
          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => setDeleteModal({ isOpen: false, stockId: null })}
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
    </ListPageLayout>
  );
};

export default StocksPage;
