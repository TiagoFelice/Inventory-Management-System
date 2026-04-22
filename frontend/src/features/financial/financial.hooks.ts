import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { financeApi } from './financial.api';
import type { FinancialQueryParams } from './financial.types';

export const useFinancialSummary = (params?: FinancialQueryParams) => {
  return useQuery({
    queryKey: queryKeys.financial.summary(params),
    queryFn: async () => {
      const response = await financeApi.getSummary(params);
      return response.data;
    },
  });
};

export const useProductBreakdown = (params?: FinancialQueryParams) => {
  return useQuery({
    queryKey: queryKeys.financial.products(params),
    queryFn: async () => {
      const response = await financeApi.getProductBreakdown(params);
      return response.data;
    },
  });
};

export const useRevenueTrend = (
  params?: FinancialQueryParams & { period?: 'day' | 'week' | 'month' }
) => {
  return useQuery({
    queryKey: queryKeys.financial.revenueTrend(params),
    queryFn: async () => {
      const response = await financeApi.getRevenueTrend(params);
      return response.data;
    },
  });
};
