import React from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Switch,
  TextInput,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconAlertCircle } from '@tabler/icons-react';

export interface ManagerUserFormValues {
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  password: string;
  is_superuser: boolean;
  is_active: boolean;
}

interface ManagerUserFormProps {
  form: UseFormReturnType<ManagerUserFormValues>;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  submitLabel: string;
  onSubmit: (values: ManagerUserFormValues) => void | Promise<void>;
  onCancel: () => void;
}

export const ManagerUserForm: React.FC<ManagerUserFormProps> = ({
  form,
  errorMessage,
  isSubmitting = false,
  submitLabel,
  onSubmit,
  onCancel,
}) => {
  return (
    <Paper p="lg" radius="md" withBorder>
      {errorMessage ? (
        <Alert icon={<IconAlertCircle size={16} />} c="red" mb="lg">
          {errorMessage}
        </Alert>
      ) : null}

      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Group grow align="flex-start">
            <TextInput
              label="Username"
              placeholder="Enter username"
              withAsterisk
              disabled={isSubmitting}
              {...form.getInputProps('username')}
            />
            <TextInput
              label="Email"
              placeholder="Enter email"
              withAsterisk
              disabled={isSubmitting}
              {...form.getInputProps('email')}
            />
          </Group>

          <Group grow align="flex-start">
            <TextInput
              label="First name"
              placeholder="Enter first name"
              disabled={isSubmitting}
              {...form.getInputProps('first_name')}
            />
            <TextInput
              label="Last name"
              placeholder="Enter last name"
              disabled={isSubmitting}
              {...form.getInputProps('last_name')}
            />
          </Group>

          <PasswordInput
            label="Password"
            placeholder="Enter password"
            disabled={isSubmitting}
            {...form.getInputProps('password')}
          />

          <Switch
            label="Active user"
            description="Inactive users remain in the system but should not log in."
            disabled={isSubmitting}
            {...form.getInputProps('is_active', { type: 'checkbox' })}
          />

          <Checkbox
            label="Grant superuser access"
            description="Superusers can access the manager area and edit other users."
            disabled={isSubmitting}
            {...form.getInputProps('is_superuser', { type: 'checkbox' })}
          />

          <Group justify="flex-end" pt="xl">
            <Button type="button" variant="light" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
};
