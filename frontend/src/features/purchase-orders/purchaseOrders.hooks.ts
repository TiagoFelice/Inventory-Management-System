import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query/keys';
import { purchaseOrdersApi } from './purchaseOrders.api';
import type {
  CreatePurchaseOrderPayload,
  ReceivePurchaseOrderEntriesPayload,
} from './purchaseOrder.types';

export const usePurchaseOrders = (params?: {
  limit?: number;
  offset?: number;
  search?: string;
  ordering?: string;
}) => {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.list(params),
    queryFn: async () => {
      const response = await purchaseOrdersApi.list(params);
      return response.data;
    },
  });
};

export const usePurchaseOrder = (id: number | null | undefined) => {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.detail(id),
    queryFn: async () => {
      if (!id) return null;
      const response = await purchaseOrdersApi.get(id);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePurchaseOrderPayload) =>
      purchaseOrdersApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.all,
      });
    },
  });
};

export const useUpdatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<CreatePurchaseOrderPayload> }) =>
      purchaseOrdersApi.partial_update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financial.all,
      });
    },
  });
};

export const useDeletePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.financial.all,
      });
    },
  });
};

export const useConfirmPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.confirm(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.detail(id),
      });
    },
  });
};

export const useCancelPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.detail(id),
      });
    },
  });
};

export const useReceivePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => purchaseOrdersApi.receive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.detail(id),
      });
    },
  });
};

export const useReceivePurchaseOrderWithEntries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ReceivePurchaseOrderEntriesPayload }) =>
      purchaseOrdersApi.receiveWithEntries(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.detail(variables.id),
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

export const useReopenPurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, deleteStockEntries = false }: { id: number; deleteStockEntries?: boolean }) =>
      purchaseOrdersApi.reopen(id, { delete_stock_entries: deleteStockEntries }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchaseOrders.detail(variables.id),
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
