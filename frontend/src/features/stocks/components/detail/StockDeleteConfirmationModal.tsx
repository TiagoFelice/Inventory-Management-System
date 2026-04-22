import React from 'react';
import { Modal, Stack, Text, Button, Group } from '@mantine/core';

interface StockDeleteConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const StockDeleteConfirmationModal: React.FC<StockDeleteConfirmationModalProps> = ({
  opened,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Delete Stock Entry"
      centered
    >
      <Stack>
        <Text>
          Are you sure you want to delete this stock entry? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="light" onClick={onClose} disabled={isLoading}>
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
