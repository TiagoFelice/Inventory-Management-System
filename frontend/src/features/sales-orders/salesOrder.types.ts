import type { PaginatedResponse } from '@/shared/types/api.types';

export interface SalesOrderItem {
  id: number;
  sales_order: number;
  product: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_revenue: number;
  total_cost: number;
  profit: number;
  margin_percent: number;
}

export interface SalesOrder {
  id: number;
  order_number: string;
  customer_name?: string;
  status: 'draft' | 'confirmed' | 'cancelled';
  sold_at: string;
  notes?: string;
  total_revenue: number;
  total_cost: number;
  total_profit: number;
  items?: SalesOrderItem[];
  created_at: string;
  updated_at: string;
  user: number;
}

export interface CreateSalesOrderItemPayload {
  product: number;
  quantity: number;
  unit_price: number;
}

export interface CreateSalesOrderPayload {
  order_number: string;
  customer_name?: string;
  status?: 'draft' | 'confirmed' | 'cancelled';
  sold_at: string;
  notes?: string;
  items: CreateSalesOrderItemPayload[];
}

export interface ConfirmSalesOrderAllocationPayload {
  allocations: Array<{
    sales_order_item_id: number;
    stock_entry_id: number;
    quantity_allocated: number;
  }>;
}

export interface ConfirmSalesOrderAllocationResponse {
  status: string;
  message: string;
  total_profit?: number;
  allocations: Array<{
    id: number;
    user: number;
    sales_order_item: number;
    stock_entry: number;
    quantity_allocated: number;
    created_at: string;
    updated_at: string;
  }>;
}

export type SalesOrderListResponse = PaginatedResponse<SalesOrder>;
