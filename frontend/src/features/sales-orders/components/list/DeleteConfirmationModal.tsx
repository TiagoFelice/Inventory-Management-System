import React from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';

interface DeleteConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  opened,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal opened={opened} onClose={onClose} title="Delete Sales Order" centered>
      <Stack>
        <Text>Are you sure you want to delete this sales order? This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" loading={isLoading} onClick={onConfirm}>
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
