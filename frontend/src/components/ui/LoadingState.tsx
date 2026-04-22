import React from 'react';
import { Center, Loader, Stack, Text } from '@mantine/core';

interface LoadingStateProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ size = 'md', message }) => {
  return (
    <Center style={{ minHeight: 300, flexDirection: 'column' }}>
      <Stack align="center" gap={16}>
        <Loader size={size} />
        {message && <Text c="dimmed">{message}</Text>}
      </Stack>
    </Center>
  );
};
