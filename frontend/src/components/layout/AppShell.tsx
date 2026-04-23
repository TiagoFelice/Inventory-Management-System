import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppShell as MantineAppShell, Loader, Center } from '@mantine/core';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const AppShell: React.FC = () => {
  const location = useLocation();

  return (
    <MantineAppShell
      padding="md"
      navbar={{ width: 280, breakpoint: 'sm' }}
      header={{ height: 60 }}
      styles={{
        main: {
          backgroundColor: '#f5f5f5',
        },
      }}
    >
      <MantineAppShell.Header>
        <TopBar />
      </MantineAppShell.Header>

      <MantineAppShell.Navbar>
        <Sidebar />
      </MantineAppShell.Navbar>

      <MantineAppShell.Main>
        <Suspense
          fallback={
            <Center style={{ height: '100vh' }}>
              <Loader />
            </Center>
          }
        >
          <Outlet key={location.pathname} />
        </Suspense>
      </MantineAppShell.Main>
    </MantineAppShell>
  );
};

export default AppShell;
