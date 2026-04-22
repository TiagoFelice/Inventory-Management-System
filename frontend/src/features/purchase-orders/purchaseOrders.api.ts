import { apiClient } from '@/lib/api/client';
import type {
  PurchaseOrder,
  CreatePurchaseOrderPayload,
  PurchaseOrderListResponse,
  ReceivePurchaseOrderResponse,
} from './purchaseOrder.types';

export const purchaseOrdersApi = {
  list: (params?: {
    limit?: number;
    offset?: number;
    search?: string;
    ordering?: string;
  }) => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) : {};
    return apiClient.get<PurchaseOrderListResponse>('/purchase-orders/', { params: cleanParams });
  },

  get: (id: number) =>
    apiClient.get<PurchaseOrder>(`/purchase-orders/${id}/`),

  create: (payload: CreatePurchaseOrderPayload) =>
    apiClient.post<PurchaseOrder>('/purchase-orders/', payload),

  update: (id: number, payload: Partial<CreatePurchaseOrderPayload>) =>
    apiClient.put<PurchaseOrder>(`/purchase-orders/${id}/`, payload),

  partial_update: (id: number, payload: Partial<CreatePurchaseOrderPayload>) =>
    apiClient.patch<PurchaseOrder>(`/purchase-orders/${id}/`, payload),

  delete: (id: number) =>
    apiClient.delete(`/purchase-orders/${id}/`),

  confirm: (id: number) =>
    apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/confirm/`, {}),

  cancel: (id: number) =>
    apiClient.post<PurchaseOrder>(`/purchase-orders/${id}/cancel/`, {}),

  receive: (id: number) =>
    apiClient.post<ReceivePurchaseOrderResponse>(`/purchase-orders/${id}/receive/`, {}),
};
