import React from "react";
import { Group, Stack, Text } from "@mantine/core";

interface ProductHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const ProductHeader: React.FC<ProductHeaderProps> = ({
  title,
  subtitle,
  actions,
}) => {
  return (
    <Group justify="space-between" align="flex-start">
      <Stack gap={0}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>{title}</h1>
        {subtitle ? (
          <Text size="sm" c="dimmed">
            {subtitle}
          </Text>
        ) : null}
      </Stack>
      {actions}
    </Group>
  );
};
