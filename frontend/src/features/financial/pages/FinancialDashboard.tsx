import React, { useEffect, useState } from 'react';
import {
  Container,
  SegmentedControl,
  Stack,
  Text,
} from '@mantine/core';
import { ErrorState } from '@components/ui/ErrorState';
import { EmptyState } from '@components/ui/EmptyState';
import { LoadingState } from '@components/ui/LoadingState';
import { useFinancialPerspectiveData } from '../financial.hooks';
import type {
  FinancialPerspective,
  FinancialPerspectiveItem,
  FinancialQueryParams,
  FinancialSummary,
} from '../financial.types';
import { FinancialSummaryCards } from '../components/details/FinancialSummaryCards';
import { FinancialFilters } from '../components/list/FinancialFilters';
import { FinancialPerspectiveTable } from '../components/list/FinancialPerspectiveTable';

const perspectiveLabels: Record<FinancialPerspective, { title: string; subtitle: string }> = {
  products: {
    title: 'Product financials',
    subtitle: 'Roll up purchase, sales, COGS, and remaining quantity by product.',
  },
  'purchase-items': {
    title: 'Purchase order item financials',
    subtitle: 'Measure realized revenue, realized profit, and remaining stock value per received lot.',
  },
};

const searchPlaceholders: Record<FinancialPerspective, string> = {
  products: 'Search products by name or SKU...',
  'purchase-items': 'Search purchase items by order number, product, or SKU...',
};

const FinancialDashboard: React.FC = () => {
  const [perspective, setPerspective] = useState<FinancialPerspective>('products');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const sortedSelectedIds = [...selectedIds].sort((left, right) => left - right);
  const toDateParam = (value: Date | null) => {
    if (!value) {
      return undefined;
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const baseParams: FinancialQueryParams = {
    search: search || undefined,
    start_date: toDateParam(startDate),
    end_date: toDateParam(endDate),
  };

  const allItemsQuery = useFinancialPerspectiveData<FinancialPerspectiveItem>(perspective, baseParams);
  const selectedItemsQuery = useFinancialPerspectiveData<FinancialPerspectiveItem>(
    perspective,
    {
      ...baseParams,
      ids: sortedSelectedIds,
    },
    sortedSelectedIds.length > 0
  );

  useEffect(() => {
    setSelectedIds([]);
  }, [perspective]);

  if (allItemsQuery.isLoading) {
    return <LoadingState message="Loading financial data..." />;
  }

  if (allItemsQuery.isError || !allItemsQuery.data) {
    return (
      <ErrorState
        message="Failed to load financial data"
        onRetry={() => allItemsQuery.refetch()}
      />
    );
  }

  const items = allItemsQuery.data.items;
  const hasSelection = sortedSelectedIds.length > 0;
  const summary: FinancialSummary =
    hasSelection && selectedItemsQuery.data
      ? selectedItemsQuery.data.summary
      : allItemsQuery.data.summary;

  const toggleItem = (id: number) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(items.map((item) => item.id));
  };

  if (items.length === 0) {
    return (
      <Container size="xl" py="xl">
        <Stack gap="lg">
          <Text fw={700} size="2rem">
            Financial Dashboard
          </Text>
          <SegmentedControl
            value={perspective}
            onChange={(value) => setPerspective(value as FinancialPerspective)}
            data={[
              { label: 'Product', value: 'products' },
              { label: 'Purchase Item', value: 'purchase-items' },
            ]}
          />
          <FinancialFilters
            searchPlaceholder={searchPlaceholders[perspective]}
            searchInput={searchInput}
            startDate={startDate}
            endDate={endDate}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={() => setSearch(searchInput.trim())}
            onSearchClear={() => {
              setSearchInput('');
              setSearch('');
            }}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onResetPeriod={() => {
              setStartDate(null);
              setEndDate(null);
            }}
          />
          <EmptyState
            fullHeight={false}
            title="No financial records found"
            description="This perspective has no valid records yet. Received purchase orders will appear here once stock and sales activity exist."
          />
        </Stack>
      </Container>
    );
  }

  const label = perspectiveLabels[perspective];
  const summaryTitle = hasSelection
    ? `${label.title} · selected items`
    : `${label.title} · all items`;
  const summarySubtitle = hasSelection
    ? `Aggregated totals for ${selectedIds.length} selected item${selectedIds.length === 1 ? '' : 's'}.`
    : label.subtitle;

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <Stack gap={4}>
          <Text fw={700} size="2rem">
            Financial Dashboard
          </Text>
        </Stack>

        <SegmentedControl
          value={perspective}
          onChange={(value) => setPerspective(value as FinancialPerspective)}
          data={[
            { label: 'Product', value: 'products' },
            { label: 'Purchase Item', value: 'purchase-items' },
          ]}
        />

        <FinancialFilters
          searchPlaceholder={searchPlaceholders[perspective]}
          searchInput={searchInput}
          startDate={startDate}
          endDate={endDate}
          onSearchInputChange={setSearchInput}
          onSearchSubmit={() => setSearch(searchInput.trim())}
          onSearchClear={() => {
            setSearchInput('');
            setSearch('');
          }}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          onResetPeriod={() => {
            setStartDate(null);
            setEndDate(null);
          }}
        />

        <FinancialSummaryCards
          summary={summary}
          isSticky={hasSelection}
          title={summaryTitle}
          subtitle={summarySubtitle}
          isRefreshing={hasSelection && selectedItemsQuery.isFetching}
        />

        <FinancialPerspectiveTable
          perspective={perspective}
          items={items}
          selectedIds={selectedIds}
          onToggleItem={toggleItem}
          onToggleAll={toggleAll}
          onClearSelection={() => setSelectedIds([])}
        />
      </Stack>
    </Container>
  );
};

export default FinancialDashboard;
