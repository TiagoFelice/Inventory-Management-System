import React from 'react';
import { Paper } from '@mantine/core';

interface ListTableCardProps {
  children: React.ReactNode;
}

export const ListTableCard: React.FC<ListTableCardProps> = ({ children }) => {
  return (
    <Paper withBorder radius="md" style={{ overflow: 'hidden', width: '100%' }}>
      {children}
    </Paper>
  );
};
