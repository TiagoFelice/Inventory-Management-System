import React from 'react';
import { ActionIcon, Badge, Group, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { DataTable } from '@components/ui/DataTable';
import { ListTableCard } from '@components/ui/ListTableCard';
import type { Product } from '../../product.types';

interface ProductTableProps {
  products: Product[];
  onRowClick: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onRowClick,
  onEdit,
  onDelete,
}) => {
  const columns = [
    { key: 'sku', label: 'SKU', width: '20%', align: 'center' as const },
    { key: 'name', label: 'Name', width: '20%', align: 'center' as const },
    {
      key: 'amount',
      label: 'Amount',
      width: '20%',
      align: 'center' as const,
      render: (value: number, row: Product) => `${value} ${row.base_unit}`,
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '20%',
      align: 'center' as const,
      render: (value: boolean) => (
        <Badge color={value ? 'green' : 'gray'} variant="light">
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <ListTableCard>
      <DataTable
        columns={columns}
        data={products}
        actionsColumnWidth={140}
        onRowClick={(row: Product) => onRowClick(row)}
        renderRowActions={(row: Product) => (
          <Group gap={4} wrap="nowrap" justify="center">
            <Tooltip label="Edit product">
              <ActionIcon
                variant="subtle"
                color="blue"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(row);
                }}
              >
                <IconPencil size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete product">
              <ActionIcon
                variant="subtle"
                color="red"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(row);
                }}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      />
    </ListTableCard>
  );
};
