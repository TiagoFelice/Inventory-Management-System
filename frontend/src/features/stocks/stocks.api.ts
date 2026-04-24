import { apiClient } from '@/lib/api/client';
import type {
  StockEntry,
  CreateStockPayload,
  StockListResponse,
  StockEntryAllocationDetailResponse,
  StockAllocationListResponse,
  StockAllocation,
  CreateStockAllocationPayload,
  UpdateStockAllocationPayload,
} from './stock.types';

export const stocksApi = {
  list: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    ordering?: string;
    product?: number;
  }) => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) : {};
    return apiClient.get<StockListResponse>('/stock-entries/', { params: cleanParams });
  },

  get: (id: number) => apiClient.get<StockEntry>(`/stock-entries/${id}/`),

  create: (payload: CreateStockPayload) =>
    apiClient.post<StockEntry>('/stock-entries/', payload),

  update: (id: number, payload: Partial<CreateStockPayload>) =>
    apiClient.put<StockEntry>(`/stock-entries/${id}/`, payload),

  partial_update: (id: number, payload: Partial<CreateStockPayload>) =>
    apiClient.patch<StockEntry>(`/stock-entries/${id}/`, payload),

  delete: (id: number) => apiClient.delete(`/stock-entries/${id}/`),

  // Custom endpoint for allocation detail
  getAllocationDetail: (id: number) =>
    apiClient.get<StockEntryAllocationDetailResponse>(
      `/stock-entries/${id}/allocation_detail/`
    ),

  listAllocations: (params?: {
    stock_entry?: number;
    product?: number;
    type?: string;
  }) => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) : {};
    if (cleanParams.product) {
      cleanParams['stock_entry__product'] = cleanParams.product;
      delete cleanParams.product;
    }
    return apiClient.get<StockAllocationListResponse>('/stock-allocations/', { params: cleanParams });
  },

  createAllocation: (payload: CreateStockAllocationPayload) =>
    apiClient.post<StockAllocation>('/stock-allocations/', payload),

  partialUpdateAllocation: (id: number, payload: UpdateStockAllocationPayload) =>
    apiClient.patch<StockAllocation>(`/stock-allocations/${id}/`, payload),

  deleteAllocation: (id: number) => apiClient.delete(`/stock-allocations/${id}/`),
};
