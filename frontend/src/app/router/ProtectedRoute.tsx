import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader, Center } from '@mantine/core';
import { useAuthContext } from '@/features/auth/auth-context';
import { ROUTES } from './route-paths';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireSuperuser?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireSuperuser = false,
}) => {
  const { isLoading, isAuthenticated, isSuperuser } = useAuthContext();

  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (requireSuperuser && !isSuperuser) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <>{children}</>;
};
