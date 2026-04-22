import React from 'react';
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Text,
  Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/route-paths';
import { getErrorMessage } from '@/shared/utils/errors';
import { IconAlertCircle } from '@tabler/icons-react';
import { useLogin } from '../auth.hooks';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) =>
        value.length === 0 ? 'Username is required' : null,
      password: (value) =>
        value.length === 0 ? 'Password is required' : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await loginMutation.mutateAsync(values);
      navigate(ROUTES.dashboard, { replace: true });
    } catch (error) {
      form.setFieldError('', getErrorMessage(error));
    }
  };

  const errorMessage = form.values
    ? (form.errors as any)['']
    : null;

  return (
    <Paper p="xl" radius="md" withBorder>
      <Stack gap="lg">
        {errorMessage && (
          <Alert icon={<IconAlertCircle size={16} />} c="red">
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Username"
              placeholder="testuser"
              {...form.getInputProps('username')}
              disabled={loginMutation.isPending}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              {...form.getInputProps('password')}
              disabled={loginMutation.isPending}
            />

            <Button
              type="submit"
              fullWidth
              loading={loginMutation.isPending}
            >
              Sign In
            </Button>
          </Stack>
        </form>

        <Group justify="center" py="md">
          <Text size="sm" c="dimmed">
            Demo credentials:
          </Text>
          <br />
          <Text size="xs" c="dimmed">
            Username: testuser | Password: 8989
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
};

export default LoginForm;
