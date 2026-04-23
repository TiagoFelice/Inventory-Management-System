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

export interface ReceivePurchaseOrderEntriesPayload {
  entries: Array<{
    purchase_order_item_id: number;
    quantity_received: number;
    expiration_date?: string;
  }>;
}

export interface ReceivePurchaseOrderEntriesResponse {
  status: string;
  message: string;
  stock_entries: Array<{
    id: number;
    user: number;
    product: number;
    source_type: 'purchase_order';
    source_reference_id: number;
    quantity_received: number;
    quantity_available: number;
    unit_cost: number;
    total_cost: number;
    received_at: string;
    expiration_date?: string;
    created_at: string;
    updated_at: string;
  }>;
}

export type PurchaseOrderListResponse = PaginatedResponse<PurchaseOrder>;
