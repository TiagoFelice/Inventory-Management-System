import React from 'react';
import { MantineProvider } from '@mantine/core';
import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { appTheme } from './theme';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <MantineProvider theme={appTheme}>
      <QueryProvider>
        <AuthProvider>{children}</AuthProvider>
      </QueryProvider>
    </MantineProvider>
  );
};
