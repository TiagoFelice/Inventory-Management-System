import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader, Center } from '@mantine/core';
import { authStorage } from '@/lib/storage/auth-storage';
import { ROUTES } from './route-paths';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = authStorage.getAccessToken();
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();

    window.addEventListener('storage', checkAuth);
    window.addEventListener('auth:changed', checkAuth);
    window.addEventListener('auth:unauthorized', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth:changed', checkAuth);
      window.removeEventListener('auth:unauthorized', checkAuth);
    };
  }, []);

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

  return <>{children}</>;
};
