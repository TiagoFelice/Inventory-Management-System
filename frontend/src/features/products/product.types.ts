// Product unit types
export type ProductUnit = 'kg' | 'g' | 'L' | 'mL' | 'unit';

export interface Product {
  id: number;
  name: string;
  description: string;
  sku: string;
  base_unit: ProductUnit;
  amount: number;
  available_quantity: number;
  total_inventory_value: number;
  created_at: string;
  updated_at: string;
  user: number;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  sku: string;
  base_unit: ProductUnit;
  amount: number;
}

export interface UpdateProductPayload extends CreateProductPayload {}

export interface ProductListResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Product[];
}
