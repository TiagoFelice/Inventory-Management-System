// Financial types
export interface ProductFinancial {
  product_id: number;
  product_name: string;
  product_sku: string;
  total_cost: number;
  total_revenue: number;
  total_profit: number;
  profit_margin: number;
  quantity_purchased: number;
  quantity_sold: number;
}

export interface FinancialSummary {
  total_revenue: number;
  total_costs: number;
  total_profit: number;
  profit_margin: number;
  products: ProductFinancial[];
}

export interface FinancialQueryParams {
  start_date?: string;
  end_date?: string;
  product_id?: number;
}
