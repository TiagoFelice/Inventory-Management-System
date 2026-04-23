import React from 'react';
import { ActionIcon, Button, Group, TextInput, Tooltip } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { IconSearch, IconX } from '@tabler/icons-react';

interface FinancialFiltersProps {
  searchPlaceholder: string;
  searchInput: string;
  startDate: Date | null;
  endDate: Date | null;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear: () => void;
  onStartDateChange: (value: Date | null) => void;
  onEndDateChange: (value: Date | null) => void;
  onResetPeriod: () => void;
}

export const FinancialFilters: React.FC<FinancialFiltersProps> = ({
  searchPlaceholder,
  searchInput,
  startDate,
  endDate,
  onSearchInputChange,
  onSearchSubmit,
  onSearchClear,
  onStartDateChange,
  onEndDateChange,
  onResetPeriod,
}) => {
  return (
    <Group align="flex-end" style={{ width: '100%' }} wrap="wrap">
      <TextInput
        placeholder={searchPlaceholder}
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
        onChange={(event) => onSearchInputChange(event.currentTarget.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            onSearchSubmit();
            event.currentTarget.blur();
          }
        }}
        style={{ flex: 1, minWidth: 260 }}
      />
      <Button onClick={onSearchSubmit}>
        Search
      </Button>
      <DateInput
        label="Start date"
        placeholder="Select start date"
        value={startDate}
        onChange={(value) => onStartDateChange(value ? new Date(value) : null)}
        clearable
        style={{ minWidth: 180 }}
      />
      <DateInput
        label="End date"
        placeholder="Select end date"
        value={endDate}
        onChange={(value) => onEndDateChange(value ? new Date(value) : null)}
        clearable
        style={{ minWidth: 180 }}
      />
      <Button variant="light" color="gray" onClick={onResetPeriod}>
        Reset period
      </Button>
    </Group>
  );
};
