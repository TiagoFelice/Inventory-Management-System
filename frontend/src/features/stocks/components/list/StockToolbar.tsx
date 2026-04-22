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
      title="Stocks"
      itemCount={stockCount}
      itemLabel="product"
      actionLabel="Add Stock Entry"
      onAction={onCreate}
    />
  );
};
