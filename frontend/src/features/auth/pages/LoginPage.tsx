import React from 'react';
import { Container, Stack, Text, Center } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import LoginForm from '../components/LoginForm';
import { useAuthContext } from '../auth-context';
import { ROUTES } from '@/app/router/route-paths';
import { APP_NAME, APP_SUBTITLE } from '@/shared/constants/app.constants';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.dashboard, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <Container size="xs" py={80}>
      <Stack gap="lg">
        <Center>
          <Stack align="center" gap={6}>
            <Text size="xl" fw={700}>
              {APP_NAME}
            </Text>
            <Text size="sm" c="dimmed">
              {APP_SUBTITLE}
            </Text>
          </Stack>
        </Center>

        <LoginForm />
      </Stack>
    </Container>
  );
};

export default LoginPage;
