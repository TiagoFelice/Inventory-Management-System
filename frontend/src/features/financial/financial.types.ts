export type FinancialPerspective = 'products' | 'purchase-items';

export type FinancialValue = number | string | null;

export interface FinancialQueryParams {
  ids?: number[];
  search?: string;
  start_date?: string;
  end_date?: string;
}

export interface FinancialMetrics {
  total_revenue: FinancialValue;
  total_purchase_cost: FinancialValue;
  total_cogs: FinancialValue;
  profit: FinancialValue;
  profit_margin: FinancialValue;
  quantity_purchased: FinancialValue;
  quantity_sold: FinancialValue;
  quantity_remaining: FinancialValue;
}

export interface FinancialSummary extends FinancialMetrics {}

export interface FinancialBaseItem extends FinancialMetrics {
  id: number;
  name: string;
}

export interface ProductFinancialItem extends FinancialBaseItem {
  sku: string;
  base_unit: string;
}

export interface PurchaseItemFinancialItem extends FinancialBaseItem {
  order_number: string;
  product_name: string;
  product_sku: string;
  base_unit: string;
  unit_cost: FinancialValue;
  remaining_value: FinancialValue;
}

export type FinancialPerspectiveItem =
  | ProductFinancialItem
  | PurchaseItemFinancialItem;

export interface FinancialPerspectiveResponse<TItem extends FinancialPerspectiveItem> {
  summary: FinancialSummary;
  items: TItem[];
}
