import React from 'react';
import { Badge } from '@mantine/core';

interface ProductStatusBadgeProps {
  quantityInStock: number;
}

export const ProductStatusBadge: React.FC<ProductStatusBadgeProps> = ({
  quantityInStock,
}) => {
  if (quantityInStock <= 0) {
    return <Badge color="red">Out of stock</Badge>;
  }

  if (quantityInStock < 10) {
    return <Badge color="yellow">Low stock</Badge>;
  }

  return <Badge color="green">In stock</Badge>;
};
