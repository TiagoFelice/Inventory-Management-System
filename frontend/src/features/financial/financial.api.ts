import { apiClient } from '@/lib/api/client';
import type {
  FinancialPerspective,
  FinancialPerspectiveItem,
  FinancialPerspectiveResponse,
  FinancialQueryParams,
} from './financial.types';

const perspectivePathMap: Record<FinancialPerspective, string> = {
  products: '/finance/products/',
  'purchase-items': '/finance/purchase-items/',
};

export const financeApi = {
  getPerspectiveData: <TItem extends FinancialPerspectiveItem>(
    perspective: FinancialPerspective,
    params?: FinancialQueryParams
  ) => {
    const requestParams = Object.fromEntries(
      Object.entries({
        ...params,
        ids: params?.ids && params.ids.length > 0 ? params.ids.join(',') : undefined,
      }).filter(([, value]) => value !== undefined && value !== '')
    );
    return apiClient.get<FinancialPerspectiveResponse<TItem>>(perspectivePathMap[perspective], {
      params: requestParams,
    });
  },
};
