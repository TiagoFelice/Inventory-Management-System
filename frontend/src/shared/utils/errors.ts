import { AxiosError } from 'axios';
import type { ApiError } from '../types/api.types';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiError;

    if (data?.detail) {
      return typeof data.detail === 'string' ? data.detail : 'An error occurred';
    }

    const firstErrorKey = Object.keys(data || {})[0];
    if (firstErrorKey && data[firstErrorKey]) {
      const errorValue = data[firstErrorKey];
      if (Array.isArray(errorValue)) {
        return errorValue[0];
      }
      return String(errorValue);
    }

    return error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
};

export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, unknown>;
    const errors: Record<string, string> = {};

    Object.entries(data || {}).forEach(([key, value]) => {
      if (key === 'detail') return;
      if (Array.isArray(value)) {
        errors[key] = value[0] as string;
      } else {
        errors[key] = String(value);
      }
    });

    return errors;
  }

  return {};
};

export const isAuthError = (error: unknown): boolean => {
  return (
    error instanceof AxiosError &&
    (error.response?.status === 401 || error.response?.status === 403)
  );
};

export const isValidationError = (error: unknown): boolean => {
  return error instanceof AxiosError && error.response?.status === 400;
};
