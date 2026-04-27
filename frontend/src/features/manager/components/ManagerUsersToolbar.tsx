import React from 'react';
import { ListPageHeader } from '@components/ui/ListPageHeader';

interface ManagerUsersToolbarProps {
  userCount: number;
  onCreate: () => void;
}

export const ManagerUsersToolbar: React.FC<ManagerUsersToolbarProps> = ({
  userCount,
  onCreate,
}) => {
  return (
    <ListPageHeader
      title="Manager"
      itemCount={userCount}
      itemLabel="user"
      actionLabel="New User"
      onAction={onCreate}
    />
  );
};
