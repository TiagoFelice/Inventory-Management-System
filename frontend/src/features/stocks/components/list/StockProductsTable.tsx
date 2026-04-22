import React from 'react';
import { DataTable } from '@components/ui/DataTable';
import { ListTableCard } from '@components/ui/ListTableCard';
import { formatCurrency, formatNumber } from '@shared/utils/formatting';
import type { Product } from '@/features/products/product.types';
import { ProductStatusBadge } from '@/features/products/components/detail/ProductStatusBadge';

interface StockProductsTableProps {
  products: Product[];
  onRowClick: (product: Product) => void;
}

export const StockProductsTable: React.FC<StockProductsTableProps> = ({
  products,
  onRowClick,
}) => {
  const columns = [
    { key: 'sku', label: 'SKU', width: '20%', align: 'center' as const },
    { key: 'name', label: 'Product', width: '15%', align: 'center' as const },
    {
      key: 'available_quantity',
      label: 'In Stock',
      width: '20%',
      align: 'center' as const,
      render: (value: number | string, row: Product) => (
        <strong>{formatNumber(value, row.base_unit === 'unit' ? 0 : 2)}</strong>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '20%',
      align: 'center' as const,
      render: (_value: unknown, row: Product) => (
        <ProductStatusBadge quantityInStock={row.available_quantity} />
      ),
    },
    {
      key: 'total_inventory_value',
      label: 'Inventory Value',
      width: '25%',
      align: 'center' as const,
      render: (value: number | string) => formatCurrency(value),
    },
  ];

  return (
    <ListTableCard>
      <DataTable
        columns={columns}
        data={products}
        onRowClick={(row: Product) => onRowClick(row)}
      />
    </ListTableCard>
  );
};
