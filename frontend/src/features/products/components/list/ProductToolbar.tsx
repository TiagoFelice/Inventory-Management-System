import React from 'react';
import { ListPageHeader } from '@components/ui/ListPageHeader';

interface ProductToolbarProps {
  productCount: number;
  onCreate: () => void;
}

export const ProductToolbar: React.FC<ProductToolbarProps> = ({
  productCount,
  onCreate,
}) => {
  return (
    <ListPageHeader
      title="Products"
      itemCount={productCount}
      itemLabel="product"
      actionLabel="New Product"
      onAction={onCreate}
    />
  );
};
