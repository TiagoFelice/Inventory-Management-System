import React from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/route-paths';
import { EmptyState } from '@components/ui/EmptyState';
import { ErrorState } from '@components/ui/ErrorState';
import { ListPageLayout } from '@components/ui/ListPageLayout';
import { LoadingState } from '@components/ui/LoadingState';
import { getErrorMessage } from '@shared/utils/errors';
import { ManagerUsersTable } from '../components/ManagerUsersTable';
import { ManagerUsersToolbar } from '../components/ManagerUsersToolbar';
import { useDeleteManagedUser, useManagedUsers } from '../manager.hooks';
import type { ManagedUser } from '../manager.types';

const ManagerUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const usersQuery = useManagedUsers();
  const deleteMutation = useDeleteManagedUser();
  const [deleteModal, setDeleteModal] = React.useState<ManagedUser | null>(null);

  if (usersQuery.isLoading) {
    return <LoadingState message="Loading users..." />;
  }

  if (usersQuery.isError) {
    return <ErrorState message="Failed to load users" onRetry={() => usersQuery.refetch()} />;
  }

  const users = usersQuery.data?.results ?? [];
  const userCount = usersQuery.data?.count ?? users.length;
  const deleteErrorMessage = deleteMutation.error
    ? getErrorMessage(deleteMutation.error)
    : null;

  const handleDeleteConfirm = async () => {
    if (!deleteModal) return;

    await deleteMutation.mutateAsync(deleteModal.id);
    setDeleteModal(null);
  };

  return (
    <>
      <ListPageLayout
        header={
          <ManagerUsersToolbar
            userCount={userCount}
            onCreate={() => navigate(ROUTES.managerUserNew)}
          />
        }
      >
        {users.length === 0 ? (
          <EmptyState
            title="No Users"
            description="Create the first user managed from this page."
            actionLabel="Create User"
            onAction={() => navigate(ROUTES.managerUserNew)}
          />
        ) : (
          <ManagerUsersTable
            users={users}
            onEdit={(user) => navigate(ROUTES.managerUserEdit(user.id))}
            onDelete={(user) => setDeleteModal(user)}
          />
        )}
      </ListPageLayout>

      <Modal
        opened={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete User"
        centered
      >
        <Stack>
          <Text>
            Are you sure you want to delete{' '}
            <strong>{deleteModal?.username}</strong>? This action cannot be
            undone.
          </Text>
          {deleteErrorMessage ? <Text c="red" size="sm">{deleteErrorMessage}</Text> : null}
          <Group justify="flex-end">
            <Button variant="light" onClick={() => setDeleteModal(null)}>
              Cancel
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={handleDeleteConfirm}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};

export default ManagerUsersPage;
