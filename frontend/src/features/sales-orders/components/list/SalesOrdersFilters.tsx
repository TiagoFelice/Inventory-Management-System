import React from 'react';
import { ActionIcon, Group, Select, TextInput, Tooltip } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';

interface SalesOrdersFiltersProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: (value: string) => void;
  onSearchClear: () => void;
  ordering: string;
  onOrderingChange: (value: string) => void;
}

export const SalesOrdersFilters: React.FC<SalesOrdersFiltersProps> = ({
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
        placeholder="Search by order code or customer..."
        leftSection={<IconSearch size={16} />}
        rightSection={
          searchInput ? (
            <Tooltip label="Clear search">
              <ActionIcon variant="subtle" color="gray" onClick={onSearchClear} aria-label="Clear search">
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          ) : null
        }
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSearch(searchInput);
            event.currentTarget.blur();
          }
        }}
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
        onChange={(value) => onOrderingChange(value || '-sold_at')}
        style={{ width: 240, flexShrink: 0 }}
      />
    </Group>
  );
};
