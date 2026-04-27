import axios from 'axios';
import { apiClient } from '@/lib/api/client';
import type { User } from './auth.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface TokenResponse {
  access: string;
  refresh: string;
}

export const authApi = {
  login: (username: string, password: string) =>
    axios.post<TokenResponse>(`${API_BASE_URL}/token/`, {
      username,
      password,
    }),

  getCurrentUser: () => apiClient.get<User>('/auth/me/'),

  refreshToken: (refreshToken: string) =>
    axios.post<TokenResponse>(`${API_BASE_URL}/token/refresh/`, {
      refresh: refreshToken,
    }),
};
