import React from "react";
import { ActionIcon, Group, TextInput, Tooltip } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";

interface ProductFiltersProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  value,
  onChange,
  onSubmit,
  onClear,
}) => {
  return (
    <TextInput
      placeholder="Search products by SKU or name..."
      leftSection={<IconSearch size={16} />}
      rightSection={
        <Group gap={4} wrap="nowrap">
          {value ? (
            <Tooltip label="Clear search">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={onClear}
                aria-label="Clear search"
              >
                <IconX size={16} />
              </ActionIcon>
            </Tooltip>
          ) : null}
        </Group>
      }
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onSubmit();
          event.currentTarget.blur();
        }
      }}
    />
  );
};
