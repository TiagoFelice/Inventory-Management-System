import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/app/query/query-client';
import { apiClient } from '@/lib/api/client';
import { authStorage } from '@/lib/storage/auth-storage';
import { authApi } from './auth.api';

export const useLogin = () => {
  return useMutation({
    mutationFn: (credentials: { username: string; password: string }) =>
      authApi.login(credentials.username, credentials.password),
    onSuccess: (response) => {
      queryClient.clear();
      const { access, refresh } = response.data;
      apiClient.setAuthToken(access);
      authStorage.setTokens(access, refresh);
      window.dispatchEvent(new CustomEvent('auth:changed'));
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: async () => {
      queryClient.clear();
      apiClient.clearAuthToken();
      window.dispatchEvent(new CustomEvent('auth:changed'));
      return Promise.resolve();
    },
  });
};

export const isAuthenticated = (): boolean => {
  return !!authStorage.getAccessToken();
};
