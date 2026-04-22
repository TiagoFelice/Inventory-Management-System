import React from 'react';
import { ListPageHeader } from '@components/ui/ListPageHeader';

interface StockToolbarProps {
  stockCount: number;
  onCreate: () => void;
}

export const StockToolbar: React.FC<StockToolbarProps> = ({
  stockCount,
  onCreate,
}) => {
  return (
    <ListPageHeader
      title="Stock Entries"
      itemCount={stockCount}
      itemLabel="stock entr"
      actionLabel="Add Stock"
      onAction={onCreate}
    />
  );
};
