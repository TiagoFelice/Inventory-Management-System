import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { financeApi } from './financial.api';
import type {
  FinancialPerspective,
  FinancialPerspectiveItem,
  FinancialQueryParams,
} from './financial.types';

export const useFinancialPerspectiveData = <TItem extends FinancialPerspectiveItem>(
  perspective: FinancialPerspective,
  params?: FinancialQueryParams,
  enabled = true
) => {
  return useQuery({
    queryKey: queryKeys.financial.perspective(perspective, params),
    enabled,
    queryFn: async () => {
      const response = await financeApi.getPerspectiveData<TItem>(perspective, params);
      return response.data;
    },
  });
};
