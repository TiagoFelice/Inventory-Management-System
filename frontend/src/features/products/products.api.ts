import { apiClient } from '@/lib/api/client';
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListResponse,
} from './product.types';

export const productsApi = {
  list: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    ordering?: string;
  }) => {
    // Filter out undefined values to prevent 400 errors
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) : {};
    return apiClient.get<ProductListResponse>('/products/', { params: cleanParams });
  },

  get: (id: number) => apiClient.get<Product>(`/products/${id}/`),

  create: (payload: CreateProductPayload) =>
    apiClient.post<Product>('/products/', payload),

  update: (id: number, payload: UpdateProductPayload) =>
    apiClient.put<Product>(`/products/${id}/`, payload),

  partial_update: (id: number, payload: Partial<UpdateProductPayload>) =>
    apiClient.patch<Product>(`/products/${id}/`, payload),

  delete: (id: number) => apiClient.delete(`/products/${id}/`),
};
