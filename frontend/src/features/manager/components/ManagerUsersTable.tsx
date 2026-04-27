import React from 'react';
import { ActionIcon, Badge, Group, Tooltip } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { DataTable } from '@components/ui/DataTable';
import { ListTableCard } from '@components/ui/ListTableCard';
import type { ManagedUser } from '../manager.types';

interface ManagerUsersTableProps {
  users: ManagedUser[];
  onEdit: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

export const ManagerUsersTable: React.FC<ManagerUsersTableProps> = ({
  users,
  onEdit,
  onDelete,
}) => {
  const columns = [
    { key: 'username', label: 'Username', width: '20%', align: 'center' as const },
    { key: 'email', label: 'Email', width: '26%', align: 'center' as const },
    {
      key: 'full_name',
      label: 'Name',
      width: '24%',
      align: 'center' as const,
      render: (_value: unknown, row: ManagedUser) =>
        `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'No name',
    },
    {
      key: 'is_superuser',
      label: 'Role',
      width: '15%',
      align: 'center' as const,
      render: (value: boolean) => (
        <Badge color={value ? 'violet' : 'blue'} variant="light">
          {value ? 'Superuser' : 'User'}
        </Badge>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      width: '15%',
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
        data={users}
        actionsColumnWidth={100}
        renderRowActions={(row: ManagedUser) => (
          <Group gap={4} wrap="nowrap" justify="center">
            <Tooltip label="Edit user">
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
            <Tooltip label="Delete user">
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
