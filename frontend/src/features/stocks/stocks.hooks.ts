import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { stocksApi } from './stocks.api';
import type {
  CreateStockAllocationPayload,
  CreateStockPayload,
  UpdateStockAllocationPayload,
} from './stock.types';

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

export const useStockAllocations = (params?: {
  stock_entry?: number;
  product?: number;
  type?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.stocks.allocations(params),
    queryFn: async () => {
      const response = await stocksApi.listAllocations(params);
      return response.data;
    },
  });
};

export const useCreateStockEntry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStockPayload) => stocksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
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
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
    },
  });
};

export const useUpdateStockAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateStockAllocationPayload;
    }) => stocksApi.partialUpdateAllocation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders.all });
    },
  });
};

export const useCreateStockAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateStockAllocationPayload) => stocksApi.createAllocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders.items() });
    },
  });
};

export const useDeleteStockAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => stocksApi.deleteAllocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.stocks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.salesOrders.all });
    },
  });
};
