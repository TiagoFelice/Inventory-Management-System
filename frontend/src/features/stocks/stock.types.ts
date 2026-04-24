// Stock entry types
export interface StockEntry {
  id: number;
  product: number;
  stock_identifier: string;
  product_name?: string;
  quantity_received: number;
  quantity_available: number;
  quantity_sold?: number;
  source_type: 'manual' | 'purchase_order';
  source_reference_id?: number;
  purchase_order_id?: number;
  purchase_order_number?: string;
  received_at: string;
  expiration_date?: string;
  created_at: string;
  updated_at: string;
  user: number;
}

export interface CreateStockPayload {
  product: number;
  quantity_received: number;
  source_type: 'manual' | 'purchase_order';
  received_at: string;
  expiration_date?: string;
  notes?: string;
}

export interface StockAllocation {
  id: number;
  stock_entry: number;
  sales_order_item?: number | null;
  sales_order_id?: number | null;
  sales_order_code?: string;
  quantity_allocated: number;
  type: 'sale' | 'expired' | 'other';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateStockAllocationPayload {
  quantity_allocated: number;
  type: 'sale' | 'expired' | 'other';
  notes?: string | null;
}

export interface CreateStockAllocationPayload extends UpdateStockAllocationPayload {
  stock_entry: number;
  sales_order_item?: number | null;
}

export interface StockAllocationDetail {
  id: number;
  sales_order_item_id: number;
  sales_order_id: number;
  sales_order_code?: string;
  quantity_allocated: number;
  allocated_at: string;
}

export interface StockEntryAllocationDetailResponse {
  stock_entry_id: number;
  quantity_received: number;
  quantity_available: number;
  quantity_allocated: number;
  allocations: StockAllocationDetail[];
}

export interface StockListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: StockEntry[];
}

export interface StockAllocationListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: StockAllocation[];
}
