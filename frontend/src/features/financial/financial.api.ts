import { apiClient } from '@/lib/api/client';
import type {
  FinancialSummary,
  FinancialQueryParams,
  ProductFinancial,
} from './financial.types';

export const financeApi = {
  getSummary: (params?: FinancialQueryParams) => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) : {};
    return apiClient.get<FinancialSummary>('/finance/summary/', { params: cleanParams });
  },

  getProductBreakdown: (params?: FinancialQueryParams) => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) : {};
    return apiClient.get<ProductFinancial[]>('/finance/products/', { params: cleanParams });
  },

  getRevenueTrend: (params?: FinancialQueryParams & { period?: 'day' | 'week' | 'month' }) => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined)
    ) : {};
    return apiClient.get<Array<any>>('/finance/revenue-trend/', { params: cleanParams });
  },
};
