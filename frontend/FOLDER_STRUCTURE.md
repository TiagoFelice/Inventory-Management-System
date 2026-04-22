# Frontend Folder Structure

```
frontend/
├── public/
│   └── [static assets]
│
├── src/
│   ├── api/
│   │   ├── client.ts                    # HTTP client with auth & error handling
│   │   ├── auth.api.ts                  # Auth endpoints (login, logout, me)
│   │   ├── products.api.ts              # Product CRUD endpoints
│   │   ├── stocks.api.ts                # Stock entry CRUD + allocation detail
│   │   ├── purchase-orders.api.ts       # Purchase order endpoints
│   │   ├── sales-orders.api.ts          # Sales order endpoints
│   │   └── finance.api.ts               # Financial metrics endpoints
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                   # useLogin, useLogout, useGetCurrentUser
│   │   ├── useProducts.ts               # useProducts, useCreateProduct, etc.
│   │   ├── useStocks.ts                 # useStocks, useStockEntry, useStockEntryAllocationDetail
│   │   ├── usePurchaseOrders.ts         # usePurchaseOrders, useCreatePurchaseOrder, etc.
│   │   ├── useSalesOrders.ts            # useSalesOrders, useCreateSalesOrder, etc.
│   │   └── useFinance.ts                # useFinancialSummary, useProductBreakdown
│   │
│   ├── types/
│   │   ├── auth.ts                      # User, AuthResponse, LoginPayload
│   │   ├── product.ts                   # Product, CreateProductPayload
│   │   ├── stock.ts                     # StockEntry, StockAllocation, AllocationDetail
│   │   ├── order.ts                     # PurchaseOrder, SalesOrder, Items
│   │   ├── financial.ts                 # FinancialSummary, ProductFinancial
│   │   └── index.ts                     # Re-exports all types + PaginatedResponse
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   └── LoginPage.tsx        # Email/password login form
│   │   │   ├── components/
│   │   │   │   └── LoginForm.tsx        # Form with validation
│   │   │   └── AuthContext.tsx          # [shared with root context folder]
│   │   │
│   │   ├── dashboard/
│   │   │   └── pages/
│   │   │       └── DashboardPage.tsx    # KPI cards + quick actions
│   │   │
│   │   ├── products/
│   │   │   ├── pages/
│   │   │   │   ├── ProductsPage.tsx     # List with search
│   │   │   │   ├── ProductCreatePage.tsx # Form to create product
│   │   │   │   └── ProductDetailPage.tsx # View single product
│   │   │   ├── components/
│   │   │   │   └── [future specific components]
│   │   │   └── hooks.ts                 # [optional feature-specific hooks]
│   │   │
│   │   ├── stocks/
│   │   │   ├── pages/
│   │   │   │   ├── StocksPage.tsx       # List with sort/filter
│   │   │   │   ├── StockCreatePage.tsx  # Form to add stock
│   │   │   │   └── StockDetailPage.tsx  # KEY PAGE: Shows allocations to sales orders
│   │   │   ├── components/
│   │   │   │   ├── AllocationDetail.tsx # [example custom component]
│   │   │   │   └── ...
│   │   │   └── hooks.ts
│   │   │
│   │   ├── purchase-orders/
│   │   │   ├── pages/
│   │   │   │   ├── PurchaseOrdersPage.tsx      # List orders
│   │   │   │   ├── PurchaseOrderCreatePage.tsx # Create with line items
│   │   │   │   └── PurchaseOrderDetailPage.tsx # View with items table
│   │   │   ├── components/
│   │   │   │   └── ...
│   │   │   └── hooks.ts
│   │   │
│   │   ├── sales-orders/
│   │   │   ├── pages/
│   │   │   │   ├── SalesOrdersPage.tsx      # List orders
│   │   │   │   ├── SalesOrderCreatePage.tsx # Create with line items
│   │   │   │   └── SalesOrderDetailPage.tsx # View with items table
│   │   │   ├── components/
│   │   │   │   └── ...
│   │   │   └── hooks.ts
│   │   │
│   │   └── financial/
│   │       ├── pages/
│   │       │   └── FinancialDashboard.tsx # KEY PAGE: Revenue, Costs, Profit, Margin + Product breakdown
│   │       ├── components/
│   │       │   ├── FinancialSummaryCards.tsx
│   │       │   ├── ProductProfitTable.tsx
│   │       │   ├── ProfitChart.tsx        # [expandable for charts]
│   │       │   └── ...
│   │       └── hooks.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx              # Main layout wrapper
│   │   │   ├── Sidebar.tsx               # Navigation menu
│   │   │   └── TopBar.tsx                # Header with user menu
│   │   │
│   │   └── common/
│   │       ├── DataTable.tsx             # Generic table with actions & pagination
│   │       ├── LoadingState.tsx          # Spinner + optional message
│   │       ├── ErrorState.tsx            # Error alert + retry button
│   │       ├── EmptyState.tsx            # Empty message + CTA
│   │       └── StatusBadge.tsx           # Color-coded status badges
│   │
│   ├── utils/
│   │   ├── formatting.ts                 # formatCurrency, formatDate, formatPercentage
│   │   ├── validation.ts                 # Email, password, SKU validators
│   │   ├── errors.ts                     # getErrorMessage, getFieldErrors
│   │   └── constants.ts                  # PRODUCT_UNITS, ORDER_STATUSES, etc.
│   │
│   ├── context/
│   │   └── AuthContext.tsx               # Global auth state (user, isAuthenticated)
│   │
│   ├── router/
│   │   ├── routes.tsx                    # All route definitions + lazy loading
│   │   └── ProtectedRoute.tsx            # Auth guard component
│   │
│   ├── App.tsx                           # Root component with providers
│   ├── main.tsx                          # React entry point
│   └── index.css                         # Global styles
│
├── package.json                          # Dependencies & scripts
├── tsconfig.json                         # TypeScript configuration
├── tsconfig.node.json                    # TS for build files
├── vite.config.ts                        # Vite build configuration
├── tailwind.config.js                    # Tailwind CSS config
├── postcss.config.js                     # PostCSS config (Mantine)
├── index.html                            # HTML template
├── .env.example                          # Environment template
├── .gitignore                            # Git ignore rules
├── README.md                             # Getting started guide
├── ARCHITECTURE.md                       # Design decisions
├── IMPLEMENTATION_GUIDE.md               # How to extend
└── PROJECT_SUMMARY.md                    # This project overview
```

## File Count Summary

```
Total TypeScript Files:     ~50
├── API Modules:            7
├── Hooks:                  6
├── Type Definitions:       5
├── Feature Pages:          15
│   ├── Products:          3
│   ├── Stocks:            3
│   ├── Orders:            6
│   ├── Financial:         1
│   └── Dashboard/Auth:    3
├── Reusable Components:    10
├── Utilities:             4
├── Context/Router:        3
├── App/Entry:             2

Total Lines of Code:       ~4,000
├── Components:           ~2,200
├── API/Hooks:            ~1,000
├── Types:                ~300
├── Utils:                ~400
├── Configuration:         ~100

Configuration Files:        10
Documentation:             4
```

## Key Files by Purpose

### Authentication
- `src/api/auth.api.ts` - Login endpoint
- `src/hooks/useAuth.ts` - Login hook
- `src/context/AuthContext.tsx` - Auth state
- `src/router/ProtectedRoute.tsx` - Auth guard
- `src/features/auth/pages/LoginPage.tsx` - Login page

### Data Fetching
- `src/api/` - All endpoint modules
- `src/hooks/` - All TanStack Query hooks
- Every hook follows: useResource(), useResource(id), useCreateResource(), etc.

### UI Consistency
- `src/components/common/` - DataTable, states
- `src/components/layout/` - Shell, sidebar, topbar
- `src/utils/formatting.ts` - Consistent formatting
- Every page uses: LoadingState, ErrorState, EmptyState

### Type Safety
- `src/types/` - All domain types
- Every API response has a type
- Every form has a types interface
- Every component has prop types

### Production Readiness
- Error handling everywhere
- Loading states for async operations
- Empty states for no data
- Form validation with feedback
- Protected routes for auth
- TanStack Query caching
- Lazy-loaded routes
```

## Architecture Principles Applied

### 1. **Single Responsibility**
   - Each file/component has ONE purpose
   - Products page handles products, not orders

### 2. **Separation of Concerns**
   - API logic in `api/` folder
   - UI logic in components
   - State management in hooks/context
   - Utilities isolated

### 3. **DRY (Don't Repeat Yourself)**
   - `DataTable` used by all list pages
   - `loading/error/empty` states reusable
   - Formatters centralized
   - Validators centralized

### 4. **Type Safety**
   - No `any` types
   - All API responses typed
   - Form values typed
   - Component props typed

### 5. **Dependency Injection**
   - Hooks injected via custom hooks
   - No global singletons (except Context)
   - Easy to mock for testing

### 6. **Progressive Enhancement**
   - Basic functionality works
   - Enhancements add polish
   - Each page works independently

## Extensibility Examples

### Adding a New Feature
```
1. Create src/types/new-feature.ts
2. Create src/api/new-feature.api.ts
3. Create src/hooks/useNewFeature.ts
4. Create src/features/new-feature/pages/
5. Add routes in src/router/routes.tsx
6. Add nav in src/components/layout/Sidebar.tsx
Done! Feature is fully integrated.
```

### Adding a New Page Type
```
All pages follow the same pattern:
├── Hook to fetch data: useResource()
├── LoadingState while loading
├── ErrorState on error
├── List view OR Detail view
└── Actions: view, edit, delete

Reuse pattern across features!
```

### Adding Validation
```
1. Add validator function in src/utils/validation.ts
2. Use in form: form.validate = { field: validator() }
3. Error displays automatically in form field
```

## Testing Strategy (Ready for Implementation)

```
Each part is independently testable:

API Layer:
  ✓ Mock apiClient.post, apiClient.get
  ✓ Verify request payloads
  ✓ Test response handling

Hooks:
  ✓ renderHook from @testing-library/react
  ✓ Mock API functions
  ✓ Verify data fetching

Components:
  ✓ render from @testing-library/react
  ✓ Test props, callbacks
  ✓ Test conditional rendering

Pages:
  ✓ E2E test full flows
  ✓ User journey testing
```

---

**This structure is clean, scalable, and interview-friendly.**
