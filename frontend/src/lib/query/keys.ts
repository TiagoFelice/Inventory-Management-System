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
    detail: (id: number | null | undefined) =>
      ['sales-orders', 'detail', id] as const,
  },
  financial: {
    all: ['financial'] as const,
    summary: (params?: unknown) => ['financial', 'summary', params] as const,
    products: (params?: unknown) => ['financial', 'products', params] as const,
    revenueTrend: (params?: unknown) =>
      ['financial', 'revenue-trend', params] as const,
  },
};
