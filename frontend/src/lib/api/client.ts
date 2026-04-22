import axios, { AxiosError, AxiosHeaders, AxiosInstance } from 'axios';
import { authStorage } from '../storage/auth-storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

interface ErrorResponse {
  detail?: string;
  [key: string]: unknown;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attach auth token to every request
    this.client.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      const headers = AxiosHeaders.from(config.headers);
      headers.set('Authorization', token ? `Bearer ${token}` : undefined);
      config.headers = headers;

      return config;
    });

    // Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ErrorResponse>) => {
        // If 401, token might be invalid - could trigger logout here
        if (error.response?.status === 401) {
          this.clearAuthToken();
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    return authStorage.getAccessToken();
  }

  clearAuthToken(): void {
    authStorage.clearTokens();
    delete this.client.defaults.headers.common.Authorization;
  }

  setAuthToken(token: string): void {
    if (token) {
      authStorage.setTokens(token);
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
  }

  getClient(): AxiosInstance {
    return this.client;
  }

  // Generic request methods
  get<T>(url: string, config = {}) {
    return this.client.get<T>(url, config);
  }

  post<T>(url: string, data?: unknown, config = {}) {
    return this.client.post<T>(url, data, config);
  }

  put<T>(url: string, data?: unknown, config = {}) {
    return this.client.put<T>(url, data, config);
  }

  patch<T>(url: string, data?: unknown, config = {}) {
    return this.client.patch<T>(url, data, config);
  }

  delete<T>(url: string, config = {}) {
    return this.client.delete<T>(url, config);
  }
}

export const apiClient = new ApiClient();
