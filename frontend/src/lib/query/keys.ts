export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  products: {
    all: ['products'] as const,
    list: (params?: unknown) => ['products', 'list', params] as const,
    detail: (id: number | null | undefined) => ['products', 'detail', id] as const,
  },
  stocks: {
    all: ['stocks'] as const,
    list: (params?: unknown) => ['stocks', 'list', params] as const,
    detail: (id: number | null | undefined) => ['stocks', 'detail', id] as const,
    allocation: (id: number | null | undefined) =>
      ['stocks', 'allocation', id] as const,
    allocations: (params?: unknown) => ['stocks', 'allocations', params] as const,
  },
  purchaseOrders: {
    all: ['purchase-orders'] as const,
    list: (params?: unknown) => ['purchase-orders', 'list', params] as const,
    detail: (id: number | null | undefined) =>
      ['purchase-orders', 'detail', id] as const,
  },
  salesOrders: {
    all: ['sales-orders'] as const,
    list: (params?: unknown) => ['sales-orders', 'list', params] as const,
    items: (params?: unknown) => ['sales-orders', 'items', params] as const,
    detail: (id: number | null | undefined) =>
      ['sales-orders', 'detail', id] as const,
  },
  financial: {
    all: ['financial'] as const,
    perspective: (perspective: string, params?: unknown) =>
      ['financial', perspective, params] as const,
  },
};
