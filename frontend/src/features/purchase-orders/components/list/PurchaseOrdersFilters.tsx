import React from 'react';
import { Group, TextInput, Select, ActionIcon, Tooltip } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

interface PurchaseOrdersFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (value: string) => void;
  onSearchClear: () => void;
  ordering: string;
  onOrderingChange: (value: string) => void;
}

export const PurchaseOrdersFilters: React.FC<PurchaseOrdersFiltersProps> = ({
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
        placeholder="Search by order code, supplier, or product..."
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
          { value: '-ordered_at', label: 'Newest First' },
          { value: 'ordered_at', label: 'Oldest First' },
          { value: '-total_cost', label: 'Highest Cost' },
        ]}
        value={ordering}
        onChange={(val) => onOrderingChange(val || '-ordered_at')}
        style={{ width: 240, flexShrink: 0 }}
      />
    </Group>
  );
};
