import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { stocksApi } from './stocks.api';
import type { CreateStockPayload } from './stock.types';

export const useStocks = (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  ordering?: string;
  product?: number;
}) => {
  return useQuery({
    queryKey: queryKeys.stocks.list(params),
    queryFn: async () => {
      const response = await stocksApi.list(params);
      return response.data;
    },
  });
};

export const useStockEntry = (id: number | null | undefined) => {
  return useQuery({
    queryKey: queryKeys.stocks.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await stocksApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useStockEntryAllocationDetail = (id: number | null | undefined) => {
  return useQuery({
    queryKey: queryKeys.stocks.allocation(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await stocksApi.getAllocationDetail(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreateStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStockPayload) => stocksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
    },
  });
};

export const useUpdateStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateStockPayload> }) =>
      stocksApi.partial_update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stocks.detail(variables.id),
      });
    },
  });
};

export const useDeleteStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => stocksApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
    },
  });
};
