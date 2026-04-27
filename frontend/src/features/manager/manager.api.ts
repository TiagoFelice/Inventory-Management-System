import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/shared/types/api.types';
import type { ManagedUser, ManagedUserPayload } from './manager.types';

export const managerApi = {
  list: () => apiClient.get<PaginatedResponse<ManagedUser>>('/users/'),
  get: (id: number) => apiClient.get<ManagedUser>(`/users/${id}/`),
  create: (payload: ManagedUserPayload) => apiClient.post<ManagedUser>('/users/', payload),
  update: (id: number, payload: ManagedUserPayload) =>
    apiClient.patch<ManagedUser>(`/users/${id}/`, payload),
  delete: (id: number) => apiClient.delete(`/users/${id}/`),
};
