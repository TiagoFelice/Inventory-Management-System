import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { managerApi } from './manager.api';
import type { ManagedUserPayload } from './manager.types';

const managerQueryKeys = {
  all: ['manager-users'] as const,
  detail: (id: number | null | undefined) => ['manager-users', 'detail', id] as const,
};

export const useManagedUsers = () =>
  useQuery({
    queryKey: managerQueryKeys.all,
    queryFn: async () => {
      const response = await managerApi.list();
      return response.data;
    },
  });

export const useManagedUser = (id: number | null | undefined) =>
  useQuery({
    queryKey: managerQueryKeys.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await managerApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });

export const useCreateManagedUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManagedUserPayload) => managerApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.all });
    },
  });
};

export const useUpdateManagedUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ManagedUserPayload }) =>
      managerApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.detail(variables.id) });
    },
  });
};

export const useDeleteManagedUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => managerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerQueryKeys.all });
    },
  });
};
