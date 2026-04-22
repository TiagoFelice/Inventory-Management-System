# Inventory Management System - Frontend

A production-grade React + TypeScript frontend for an Inventory Management System built for Food & Beverages CPG brands.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **TanStack Query (React Query)** - Server state management
- **Mantine** - UI component library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS (minimal use)
- **Vite** - Build tool

## Features

- 🔐 **Authentication** - Token-based auth with session persistence
- 📦 **Product Management** - Create and manage products with multiple units (kg, g, L, mL, units)
- 📊 **Stock Management** - Track stock entries with expiration dates and allocation traceability
- 🛒 **Purchase Orders** - Manage supplier orders with item-level detail
- 📈 **Sales Orders** - Record sales with profit-to-stock traceability
- 💰 **Financial Dashboard** - Real-time KPIs: revenue, costs, profit, margin
- 🎯 **Multi-user** - All data filtered by authenticated user

## Project Structure

```
src/
├── api/              # API client & endpoints
├── hooks/            # TanStack Query hooks (custom hooks)
├── types/            # TypeScript types & DTOs
├── features/         # Feature modules (pages + components)
├── components/       # Reusable components
│   ├── layout/      # App shell, sidebar, topbar
│   └── common/      # LoadingState, DataTable, StatusBadge, etc.
├── utils/            # Formatters, validators, constants
├── context/          # React Context (AuthContext)
├── router/           # Routing configuration
└── App.tsx          # Main app component
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/pnpm
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update VITE_API_URL if backend is on different port
```

### Development

```bash
# Start dev server
npm run dev

# Open http://localhost:5173
```

The dev server includes:
- Hot module reloading
- API proxy to backend
- Source maps
- Type checking

### Production Build

```bash
# Build for production
npm run build

# Preview build
npm run preview
```

## Architecture Highlights

### API Layer

Centralized HTTP client with automatic token injection and error handling:

```typescript
// src/api/client.ts
- Automatic Bearer token attachment
- Global error handling (401 redirects)
- Typed endpoint modules per resource
```

### State Management

TanStack Query for server state + React Context for auth:

```typescript
// src/hooks/useProducts.ts
- useProducts() - List with caching
- useProduct(id) - Single item
- useCreateProduct() - Mutation
- useUpdateProduct() - Mutation
- useDeleteProduct() - Mutation
```

### Authentication

Context-based auth with localStorage persistence:

```typescript
// src/context/AuthContext.tsx
- User state management
- isAuthenticated check
- logout action
- Protected route wrapper
```

### Routing

React Router with lazy loading and protected routes:

```typescript
// src/router/routes.tsx
- Public: /login
- Protected: /dashboard, /products, /stocks, etc.
- ProtectedRoute wrapper auto-redirects to login
```

### Forms

Mantine forms with validation:

```typescript
// e.g., ProductCreatePage.tsx
- useForm hook
- Built-in validation
- Error messaging
- Loading states
```

## Page Structure

### Core Pages

1. **Login** - Authentication entry point
2. **Dashboard** - Overview with quick navigation
3. **Products** - CRUD for products
4. **Stock Entries** - Stock management with allocation traceability
5. **Purchase Orders** - Supplier order management
6. **Sales Orders** - Customer order management
7. **Financial Dashboard** - KPIs and product profit breakdown

### UX Patterns

- **Loading States** - Skeleton/spinner from Mantine
- **Error States** - Retry buttons, clear messaging
- **Empty States** - CTA buttons to create resources
- **DataTable** - Reusable table with actions & pagination
- **Status Badges** - Color-coded order statuses
- **Form Validation** - Inline errors, required field markers

## Key Components

### DataTable

Flexible, reusable table with:
- Custom column rendering
- Row actions dropdown
- Pagination support
- Click handlers

```typescript
<DataTable
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'sku', label: 'SKU', render: (v) => <strong>{v}</strong> }
  ]}
  data={products}
  actions={[{label: 'View', onClick: (row) => ...}]}
  onRowClick={(row) => navigate(`/products/${row.id}`)}
/>
```

### LoadingState, ErrorState, EmptyState

Standard UI patterns:

```typescript
<LoadingState message="Loading..." />
<ErrorState message="Failed to load" onRetry={() => refetch()} />
<EmptyState title="No data" actionLabel="Create" onAction={() => create()} />
```

## Stock Allocation Traceability

The **Stock Detail** page demonstrates traceability:

1. Fetches stock entry data
2. Uses `/stock-entries/{id}/allocation_detail/` endpoint
3. Displays:
   - Stock metadata (received, available, allocated)
   - Allocation history table (sales order links)
   - Allocation percentages
4. Links to sales orders for further inspection

## Financial Dashboard

KPI-focused design with:

- **4 Summary Cards**: Revenue, Cost, Profit, Margin
- **Product Breakdown Table**: Per-product financials
- **Summary Section**: Totals and calculations
- **Color Coding**: Green (revenue/profit), Red (cost/loss)

Formula examples:
- Profit = Total Revenue - Total Costs
- Margin = (Profit / Costs) × 100

## Error Handling

Centralized error utilities:

```typescript
// src/utils/errors.ts
- getErrorMessage(error) - Extract error from API response
- getFieldErrors(error) - Field-specific validation errors
- isAuthError(error) - Check if 401/403
- isValidationError(error) - Check if validation error
```

## Formatting Utilities

```typescript
// src/utils/formatting.ts
- formatCurrency(1234.56) → "$1,234.56"
- formatDate("2024-01-15") → "Jan 15, 2024"
- formatPercentage(87.5) → "87.50%"
```

## Configuration

### Environment Variables

```bash
# .env
VITE_API_URL=http://localhost:8000/api
```

### Vite Aliases

All major folders have path aliases:
- `@/src` → `@`
- `@/src/api` → `@api`
- `@/src/hooks` → `@hooks`
- `@/src/types` → `@types`
- etc.

## Development Workflow

### Adding a New Feature

1. **Create types** in `src/types/`
2. **Create API endpoint** in `src/api/`
3. **Create hooks** in `src/hooks/`
4. **Create pages** in `src/features/{feature}/pages/`
5. **Create components** in `src/features/{feature}/components/`
6. **Add route** in `src/router/routes.tsx`
7. **Add nav item** in `src/components/layout/Sidebar.tsx`

### Styling

- **Mantine** for components (preferred)
- **Tailwind** for spacing/layout only
- Global styles in `src/index.css`

## Performance Optimizations

- **Code Splitting**: Lazy-loaded page routes
- **Query Caching**: TanStack Query stale time = 5 min
- **Suspense**: React.lazy() with Suspense boundary
- **Pagination**: Supports paginated endpoints

## Extending the API Layer

Add new endpoints:

```typescript
// src/api/new-resource.api.ts
export const newResourceApi = {
  list: (params?: {}) =>
    apiClient.get<ItemListResponse>('/new-resource/', { params }),
  get: (id: number) =>
    apiClient.get<Item>(`/new-resource/${id}/`),
  create: (payload: CreatePayload) =>
    apiClient.post<Item>('/new-resource/', payload),
  // ... more methods
};
```

Then create hooks:

```typescript
// src/hooks/useNewResource.ts
export const useNewResource = (params?: {}) => {
  return useQuery({
    queryKey: ['new-resource', params],
    queryFn: async () => {
      const response = await newResourceApi.list(params);
      return response.data;
    },
  });
};
```

## Deployment

### Build

```bash
npm run build
# Output: dist/
```

### Static Hosting

Deploy `dist/` folder to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static host

### Backend Integration

Update `VITE_API_URL` in `.env` to production backend URL.

## Troubleshooting

### CORS Issues

Ensure backend sets appropriate CORS headers or use API proxy in Vite config.

### Auth Token Expiration

Token refresh is handled in the API client. On 401, user is redirected to login.

### Type Errors

Always define types in `src/types/` before using in API/components.

## Further Documentation

- [Mantine Docs](https://mantine.dev)
- [TanStack Query Docs](https://tanstack.com/query)
- [React Router Docs](https://reactrouter.com)
- [Vite Docs](https://vitejs.dev)
- [Axios Docs](https://axios-http.com)

## License

Proprietary - IMS Frontend v1.0
