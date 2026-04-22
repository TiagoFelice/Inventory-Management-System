import React from 'react';
import {
  NavLink,
  Stack,
  Divider,
  Text,
  Badge,
  Box,
  ScrollArea,
} from '@mantine/core';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '@/shared/constants/navigation';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <ScrollArea style={{ height: 'calc(100vh - 60px)' }}>
      <Box p="md">
        <Text size="lg" fw={700} mb="lg">
          IMS
          <Badge size="sm" ml={8} variant="light">
            v1.0
          </Badge>
        </Text>

        <Divider my="lg" />

        <Stack gap={8}>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + '/');

            return (
              <NavLink
                key={item.href}
                label={item.label}
                leftSection={<Icon size={18} />}
                active={isActive}
                onClick={() => navigate(item.href)}
                styles={{
                  root: {
                    borderRadius: 6,
                    paddingLeft: 16,
                    paddingRight: 16,
                  },
                }}
              />
            );
          })}
        </Stack>
      </Box>
    </ScrollArea>
  );
};

export default Sidebar;
