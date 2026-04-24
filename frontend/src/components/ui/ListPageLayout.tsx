import React from 'react';
import { Box, Stack } from '@mantine/core';

interface ListPageLayoutProps {
  header: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  contentWidth?: string;
}

export const ListPageLayout: React.FC<ListPageLayoutProps> = ({
  header,
  filters,
  children,
  contentWidth = '80%',
}) => {
  return (
    <Box py="xl" style={{ width: '100%' }}>
      <Box style={{ width: contentWidth, margin: '0 auto' }}>
        <Stack gap="lg">
          {header}
          {filters}
          {children}
        </Stack>
      </Box>
    </Box>
  );
};
