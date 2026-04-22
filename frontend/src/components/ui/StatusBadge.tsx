import React from 'react';
import { Badge, BadgeProps } from '@mantine/core';

type StatusType = 'pending' | 'received' | 'shipped' | 'cancelled' | 'draft' | 'active';

const STATUS_VARIANTS: Record<StatusType, { color: string; label: string }> = {
  pending: { color: 'yellow', label: 'Pending' },
  received: { color: 'green', label: 'Received' },
  shipped: { color: 'blue', label: 'Shipped' },
  cancelled: { color: 'red', label: 'Cancelled' },
  draft: { color: 'gray', label: 'Draft' },
  active: { color: 'green', label: 'Active' },
};

interface StatusBadgeProps extends Omit<BadgeProps, 'children'> {
  status: StatusType;
  variant?: 'dot' | 'filled' | 'outline' | 'light';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'light',
  ...props
}) => {
  const config = STATUS_VARIANTS[status] || STATUS_VARIANTS.pending;

  return (
    <Badge color={config.color} variant={variant} {...props}>
      {config.label}
    </Badge>
  );
};
