import React from 'react';
import { Badge, BadgeProps } from '@mantine/core';

type StatusType = 'pending' | 'received' | 'shipped' | 'cancelled' | 'draft' | 'active' | 'confirmed';

const STATUS_VARIANTS: Record<StatusType, { color: string; label: string }> = {
  pending: { color: 'yellow', label: 'Pending' },
  received: { color: 'green', label: 'Received' },
  shipped: { color: 'blue', label: 'Shipped' },
  cancelled: { color: 'red', label: 'Cancelled' },
  draft: { color: 'gray', label: 'Draft' },
  active: { color: 'green', label: 'Active' },
  confirmed: { color: 'blue', label: 'Confirmed' },
};

interface StatusBadgeProps extends Omit<BadgeProps, 'children'> {
  status: StatusType;
  variant?: 'dot' | 'filled' | 'outline' | 'light';
}

export const normalizeStatus = (status: string): StatusType => {
  const normalized = status.toLowerCase();

  if (normalized === 'pending') {
    return 'draft';
  }

  if (normalized in STATUS_VARIANTS) {
    return normalized as StatusType;
  }

  return 'pending';
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'light',
  ...props
}) => {
  const normalizedStatus = normalizeStatus(status);
  const config = STATUS_VARIANTS[normalizedStatus];

  return (
    <Badge color={config.color} variant={variant} {...props}>
      {config.label}
    </Badge>
  );
};
