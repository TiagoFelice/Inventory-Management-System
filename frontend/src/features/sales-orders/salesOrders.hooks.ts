import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { salesOrdersApi } from './salesOrders.api';
import type { ConfirmSalesOrderAllocationPayload, CreateSalesOrderPayload } from './salesOrder.types';

export const useSalesOrders = (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.salesOrders.list(params),
    queryFn: async () => {
      const response = await salesOrdersApi.list(params);
      return response.data;
    },
  });
};

export const useSalesOrder = (id: number | null | undefined) => {
  return useQuery({
    queryKey: queryKeys.salesOrders.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await salesOrdersApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useSalesOrderItems = (params?: {
  product?: number;
  sales_order?: number;
  status?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.salesOrders.items(params),
    queryFn: async () => {
      const response = await salesOrdersApi.listItems(params);
      return response.data;
    },
    enabled: !!(params?.product || params?.sales_order),
  });
};

export const useCreateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalesOrderPayload) =>
      salesOrdersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.all,
      });
    },
  });
};

export const useUpdateSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateSalesOrderPayload> }) =>
      salesOrdersApi.partial_update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.items(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financial.all,
      });
    },
  });
};

export const useDeleteSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => salesOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.items(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financial.all,
      });
    },
  });
};

export const useConfirmSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => salesOrdersApi.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.detail(id),
      });
    },
  });
};

export const useConfirmSalesOrderWithAllocations = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ConfirmSalesOrderAllocationPayload }) =>
      salesOrdersApi.confirmWithAllocations(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stocks.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.items(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financial.all,
      });
    },
  });
};

export const useCancelSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => salesOrdersApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.items(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financial.all,
      });
    },
  });
};

export const useReopenSalesOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deleteAllocations = false }: { id: number; deleteAllocations?: boolean }) =>
      salesOrdersApi.reopen(id, { delete_allocations: deleteAllocations }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.salesOrders.items(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.stocks.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.products.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financial.all,
      });
    },
  });
};
