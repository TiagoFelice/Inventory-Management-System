import React from 'react';
import { Modal, Stack, Text, Group, Button } from '@mantine/core';

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
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Purchase Order"
      centered
    >
      <Stack>
        <Text>Are you sure you want to delete this purchase order? This action cannot be undone.</Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            loading={isLoading}
            onClick={onConfirm}
          >
            Delete
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
