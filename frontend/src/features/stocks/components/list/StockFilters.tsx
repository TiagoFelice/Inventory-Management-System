import React from 'react';
import { Group, TextInput, Select, ActionIcon, Tooltip } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

interface StockFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (value: string) => void;
  onSearchClear: () => void;
  ordering: string;
  onOrderingChange: (value: string) => void;
}

export const StockFilters: React.FC<StockFiltersProps> = ({
  searchInput,
  onSearchInputChange,
  onSearch,
  onSearchClear,
  ordering,
  onOrderingChange,
}) => {
  return (
    <Group align="flex-end" style={{ width: '100%' }} wrap="nowrap">
      <TextInput
        placeholder="Search by product name or SKU..."
        leftSection={<IconSearch size={16} />}
        rightSection={
          searchInput ? (
            <Tooltip label="Clear search">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={onSearchClear}
                aria-label="Clear search"
              >
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          ) : null
        }
        value={searchInput}
        onChange={(e) => onSearchInputChange(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSearch(searchInput);
            e.currentTarget.blur();
          }
        }}
        style={{ flex: 1 }}
      />
      <Select
        placeholder="Sort by"
        data={[
          { value: 'expiration_date', label: 'Expiration Date' },
          { value: '-received_at', label: 'Newest First' },
          { value: 'received_at', label: 'Oldest First' },
          { value: '-quantity_available', label: 'Quantity (High to Low)' },
          { value: 'quantity_available', label: 'Quantity (Low to High)' },
        ]}
        value={ordering}
        onChange={(val) => onOrderingChange(val || 'expiration_date')}
        style={{ width: 240, flexShrink: 0 }}
      />
    </Group>
  );
};
