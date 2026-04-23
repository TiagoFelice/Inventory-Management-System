import { apiClient } from '@/lib/api/client';
import type {
  SalesOrder,
  ConfirmSalesOrderAllocationPayload,
  ConfirmSalesOrderAllocationResponse,
  CreateSalesOrderPayload,
  SalesOrderListResponse,
} from './salesOrder.types';

export const salesOrdersApi = {
  list: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    ordering?: string;
  }) => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) : {};
    return apiClient.get<SalesOrderListResponse>('/sales-orders/', { params: cleanParams });
  },

  get: (id: number) =>
    apiClient.get<SalesOrder>(`/sales-orders/${id}/`),

  create: (payload: CreateSalesOrderPayload) =>
    apiClient.post<SalesOrder>('/sales-orders/', payload),

  update: (id: number, payload: Partial<CreateSalesOrderPayload>) =>
    apiClient.put<SalesOrder>(`/sales-orders/${id}/`, payload),

  partial_update: (id: number, payload: Partial<CreateSalesOrderPayload>) =>
    apiClient.patch<SalesOrder>(`/sales-orders/${id}/`, payload),

  confirm: (id: number) =>
    apiClient.post(`/sales-orders/${id}/confirm/`),

  confirmWithAllocations: (id: number, payload: ConfirmSalesOrderAllocationPayload) =>
    apiClient.post<ConfirmSalesOrderAllocationResponse>(
      `/sales-orders/${id}/confirm_with_allocations/`,
      payload
    ),

  cancel: (id: number) =>
    apiClient.post(`/sales-orders/${id}/cancel/`),

  delete: (id: number) =>
    apiClient.delete(`/sales-orders/${id}/`),
};
