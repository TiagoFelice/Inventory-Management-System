import React, { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { router } from './routes';

export const AppRouter: React.FC = () => (
  <Suspense
    fallback={
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    }
  >
    <RouterProvider router={router} />
  </Suspense>
);
