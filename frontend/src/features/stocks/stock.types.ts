// Stock entry types
export interface StockEntry {
  id: number;
  product: number;
  stock_identifier: string;
  product_name?: string;
  quantity_received: number;
  quantity_available: number;
  quantity_sold?: number;
  unit_cost: number;
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
  unit_cost: number;
  source_type: 'manual' | 'purchase_order';
  received_at: string;
  expiration_date?: string;
  notes?: string;
}

export interface StockAllocation {
  id: number;
  stock_entry: number;
  sales_order_item: number;
  quantity_allocated: number;
  allocated_at: string;
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
  unit_cost: number;
  allocations: StockAllocationDetail[];
}

export interface StockListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: StockEntry[];
}
