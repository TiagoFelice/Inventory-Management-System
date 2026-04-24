import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';

interface ListPageHeaderProps {
  title: string;
  itemCount: number;
  itemLabel: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const ListPageHeader: React.FC<ListPageHeaderProps> = ({
  title,
  itemCount,
  itemLabel,
  actionLabel,
  onAction,
}) => {
  return (
    <Group justify="space-between">
      <Stack gap={0}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{title}</h1>
        {itemCount > 0 ? (
          <Text size="sm" c="dimmed">
            {itemCount} {itemLabel}
            {itemCount !== 1 ? 's' : ''}
          </Text>
        ) : null}
      </Stack>

      {actionLabel && onAction ? (
        <Button leftSection={<IconPlus size={16} />} onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </Group>
  );
};
