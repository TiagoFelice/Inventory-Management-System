import type { PaginatedResponse } from '@/shared/types/api.types';
import { Product } from '../products/product.types';

export interface PurchaseOrderItem {
  id: number;
  purchase_order: number;
  product: Product;
  product_name?: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}

export interface PurchaseOrder {
  id: number;
  order_number: string;
  supplier_name?: string;
  status: 'draft' | 'confirmed' | 'received' | 'cancelled';
  ordered_at: string;
  notes?: string;
  total_cost: number;
  items?: PurchaseOrderItem[];
  created_at: string;
  updated_at: string;
  user: number;
}

export interface CreatePurchaseOrderItemPayload {
  product: number;
  quantity: number;
  unit_cost: number;
}

export interface CreatePurchaseOrderPayload {
  order_number: string;
  supplier_name?: string;
  status?: 'draft' | 'confirmed' | 'cancelled' | 'received';
  ordered_at: string;
  notes?: string;
  items: CreatePurchaseOrderItemPayload[];
}

export interface ReceivePurchaseOrderResponse {
  status: string;
  message: string;
}

export type PurchaseOrderListResponse = PaginatedResponse<PurchaseOrder>;
