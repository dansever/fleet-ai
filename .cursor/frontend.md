---
alwaysApply: false
applyTo: ['apps/web/**/*']
---

# FleetAI Frontend Architecture Guide

## Project Structure

### Core Directory Layout

```
apps/web/src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages (sign-in/up)
│   ├── (platform)/               # Main application pages
│   │   ├── _components/          # Shared platform components
│   │   ├── dashboard/            # Dashboard feature
│   │   ├── fuel-procurement/     # Fuel procurement feature
│   │   ├── technical-procurement/# Technical procurement feature
│   │   ├── airport-hub/          # Ground Services procurement feature
│   │   └── settings/             # Settings page
│   ├── api/                      # Next.js API routes
│   ├── landing-page/             # Public landing page
│   └── layout.tsx                # Root layout with Clerk provider
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   └── miscellaneous/            # Custom utility components
├── stories/                      # Storybook component library
├── services/                     # API client services
├── db/                           # Database actions
├── lib/                          # Utilities and configurations
├── hooks/                        # Custom React hooks
└── middleware.ts                 # Clerk authentication middleware
```

### Platform Page Structure

Each directory in `(platform)` follows this standardized pattern:

```
example-feature/
├── page.tsx              # Server component (data fetching, auth)
├── ClientPage.tsx        # Client component (interactivity)
├── ContextProvider.tsx   # Feature-specific context provider
├── _components/          # Feature-specific components
├── _subpages/            # Sub-page components (tabs, modals)
├── utils/                # Feature utilities
└── hooks/                # Feature-specific hooks
```

## Architecture Principles

### 1. Server/Client Component Separation

**Server Components (`page.tsx`)**

- Handle authentication via `authorizeUser()`
- Fetch initial data from database
- Pass data to client components as props
- Redirect unauthenticated users

```typescript
export default async function ExamplePage() {
  const { dbUser, error } = await authorizeUser();

  if (error || !dbUser || !dbUser.orgId) {
    redirect('/sign-in');
  }

  const data = await db.select().from(table)
    .where(eq(table.orgId, dbUser.orgId)); // Multi-tenant filtering

  return <ClientPage dbUser={dbUser} initialData={data} />;
}
```

**Client Components (`ClientPage.tsx`)**

- Handle all user interactions
- Manage client-side state
- Use context providers for complex state
- Implement loading and error states

### 2. Multi-Tenancy with Organization Isolation

**Database Level**

- Every table includes `orgId` foreign key
- All queries must filter by user's `orgId`
- Authorization enforced at API and database layer

**Frontend Implementation**

```typescript
// All API calls automatically include user's org context
export async function getAirports() {
  const res = await api.get('/api/airports'); // Auto-scoped to user's org
  return res.data;
}

// Authorization utility
export function authorizeResource<T extends OrgScopedResource>(
  resource: T | null,
  user: User,
): boolean {
  if (!resource || !user.orgId) return false;
  return resource.orgId === user.orgId;
}
```

### 3. Context Provider Pattern

**Feature-Level Context Providers**
Each complex feature has its own context provider for:

- State management (loading, errors, data)
- API interactions
- Cross-component communication

```typescript
// Example: FuelProcurementProvider
export default function FuelProcurementProvider({
  dbUser,
  initialAirports,
  children,
}: {
  dbUser: User;
  initialAirports: Airport[];
  children: React.ReactNode;
}) {
  const [airports, setAirports] = useState<Airport[]>(initialAirports);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);

  // Provide comprehensive state management
  const value = {
    dbUser,
    airports,
    selectedAirport,
    setSelectedAirport,
    loading,
    errors,
    // CRUD operations
    refreshAirports,
    updateAirport,
    addAirport,
    removeAirport,
  };

  return (
    <FuelProcurementContext.Provider value={value}>
      {children}
    </FuelProcurementContext.Provider>
  );
}
```

## Authentication & Authorization

### Clerk Integration

**Middleware Protection**

```typescript
// middleware.ts
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Redirect root based on auth status
  if (pathname === '/') {
    url.pathname = userId ? '/dashboard' : '/landing-page';
    return NextResponse.redirect(url);
  }

  // Protect all non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect(); // Auto-redirect to sign-in
  }
});
```

**Server-Side Authorization**

```typescript
// lib/authorization/authorize-user.ts
export async function authorizeUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return { clerkUser: null, dbUser: null, error: 'Unauthorized' };
  }

  const dbUser = await getUserByClerkUserId(clerkUser.id);
  if (!dbUser || !dbUser.orgId) {
    return { error: 'Invalid user or missing org' };
  }

  return { clerkUser, dbUser, error: null };
}
```

**Webhook Integration**

- User creation/deletion synced via Clerk webhooks
- Automatic org assignment on user creation
- Database user records maintained in sync

## UI/UX Architecture

### Design System

**Component Hierarchy**

1. **shadcn/ui** (`components/ui/`) - Base UI primitives
2. **Storybook Components** (`stories/`) - Complex, reusable app components
3. **Feature Components** (`_components/`) - Feature-specific components
4. **Page Components** - Composed page layouts

**Key Design Principles**

- Glass morphism effects for modern UI
- Gradient-based color system
- Rounded corners (rounded-2xl, rounded-3xl)
- Consistent spacing and typography
- Responsive design with mobile-first approach

### Storybook Component Library

**Component Categories**

- **Button**: Multi-variant button with icons, loading states
- **Card**: Feature cards, stats cards, profile cards, notification cards
- **DataTable**: Advanced data tables with sorting, filtering
- **Dialog**: Modal dialogs for forms and confirmations
- **Form**: Form components with validation
- **PageLayout**: Standardized page layout with sidebar
- **Tabs**: Tab navigation components

**Storybook Configuration**

- Use `.ts` extension for story files (even with JSX)
- Import from `@storybook/nextjs-vite`
- Stories organized by component category

```typescript
// Example story structure
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { text: 'Button', intent: 'primary' },
};
```

### PageLayout Component

**Standardized Layout Structure**

```typescript
<PageLayout
  sidebarContent={<SidebarComponent />}     // Optional sidebar
  headerContent={<HeaderComponent />}       // Page header
  mainContent={<MainContent />}             // Scrollable main area
  sidebarWidth="20rem"                      // Customizable width
/>
```

## Database Communication

**CRITICAL: Client vs Server Data Access Rules**

- **Client Components**: MUST use `services/*-client.ts` functions only
- **Server Components**: Can directly call `db/*-actions.ts` functions
- **Never call db-actions from client components** - this breaks the app

**Data Flow Architecture**

```
Client Component → services/*-client.ts → /api/routes → db/*-actions.ts → Database
Server Component → db/*-actions.ts → Database (direct access)
```

### API Client Services

**Service Layer Architecture**

```
services/
├── api-client.ts           # Base Axios clients
├── core/                   # Core entity services
│   ├── user-client.ts
│   ├── org-client.ts
│   └── airport-client.ts
├── fuel/                   # Fuel-related services
└── technical/              # Technical procurement services
```

**API Client Pattern**

```typescript
// Base clients
export const api = axios.create({
  baseURL: `${env.NEXT_PUBLIC_APP_URL}`, // Next.js API routes
});

export const backendApi = axios.create({
  baseURL: env.NEXT_PUBLIC_BACKEND_URL, // FastAPI backend
});

// Client service functions (for use in client components)
export async function getAirports(): Promise<Airport[]> {
  const res = await api.get('/api/airports');
  return res.data;
}
```

**Function Naming Warning**
⚠️ **Be careful**: Function names in `db-actions.ts` and `services/*-client.ts` are often similar:

- `db/airports/db-actions.ts`: `getAirportsByOrg(orgId)`
- `services/core/airport-client.ts`: `getAirports()`

Always use the correct function based on component type!

### Database Actions

**Server-Side Database Layer**

```
db/
├── airports/db-actions.ts
├── fuel-tenders/db-actions.ts
├── orgs/db-actions.ts
└── users/db-actions.ts
```

**Multi-Tenant Database Queries**

```typescript
// Always filter by organization
export async function getAirportsByOrg(orgId: string): Promise<Airport[]> {
  return await db.select().from(airportsTable).where(eq(airportsTable.orgId, orgId));
}
```

## State Management

### Loading vs Refreshing State Pattern

**Critical Distinction: Loading vs Refreshing**

The application differentiates between two types of data fetching states:

- **Loading** (`isLoading`): Initial data fetch when no data exists
- **Refreshing** (`isRefreshing`): Updating existing data while keeping it visible

This pattern ensures better UX by maintaining data visibility during refresh operations.

### Context Provider State Architecture

**Dual State Management Pattern**

```typescript
export interface ContextValue {
  // Loading states (initial data fetch)
  isLoadingRfqs: boolean;
  isLoadingQuotes: boolean;
  isLoading: boolean; // Combined loading state

  // Refreshing states (updating existing data)
  isRefreshingRfqs: boolean;
  isRefreshingQuotes: boolean;
  isRefreshing: boolean; // Combined refreshing state
}
```

**State Logic Implementation**

```typescript
// Loading states - for initial data fetch
const [isLoadingRfqs, setIsLoadingRfqs] = useState(false);
const [isRefreshingRfqs, setIsRefreshingRfqs] = useState(false);

// Computed refreshing state - only true when we have existing data AND are fetching
const isRefreshingQuotes = selectedRfqId
  ? loadingQuotesForRfq.has(selectedRfqId) && quotesCache.has(selectedRfqId)
  : false;

// Combined states
const isLoading = isLoadingRfqs || isLoadingQuotes;
const isRefreshing = isRefreshingRfqs || isRefreshingQuotes;
```

### Smart Refresh Pattern

**Context Provider Refresh Logic**

```typescript
const refreshRfqs = async () => {
  // Use refreshing state if we already have data, otherwise use loading state
  const hasExistingData = rfqs.length > 0;

  if (hasExistingData) {
    setIsRefreshingRfqs(true); // Show refresh indicator, keep data visible
  } else {
    setIsLoadingRfqs(true); // Show loading screen, no data to display
  }

  try {
    const freshRfqs = await getRfqs();
    setRfqs(freshRfqs);
  } finally {
    if (hasExistingData) {
      setIsRefreshingRfqs(false);
    } else {
      setIsLoadingRfqs(false);
    }
  }
};
```

**Cache-Preserving Refresh**

```typescript
const refreshSelectedRfqQuotes = async () => {
  if (!selectedRfqId) return;

  // Start loading immediately
  setLoadingQuotesForRfq((prev) => new Set([...prev, selectedRfqId]));

  try {
    // ✅ CRITICAL: Don't clear cache until we have new data
    // This keeps existing data visible during refresh
    const quotes = await getQuotesByRfq(selectedRfqId);

    // Update cache with fresh results
    setQuotesCache((prev) => new Map(prev).set(selectedRfqId, quotes));
  } finally {
    setLoadingQuotesForRfq((prev) => {
      const newSet = new Set(prev);
      newSet.delete(selectedRfqId);
      return newSet;
    });
  }
};
```

### Component Loading State Handling

**Page-Level Loading Component**

```typescript
export default function ClientPage() {
  const { rfqs, isLoading, isRefreshing } = useContext();

  // Show full page loading when initially loading (no data yet)
  if (isLoading && rfqs.length === 0) {
    return (
      <PageLayout
        sidebarContent={sidebarContent}
        headerContent={<div>Loading...</div>}
        mainContent={<LoadingComponent text="Loading data..." />}
        sidebarWidth="20rem"
      />
    );
  }

  // Normal page with data (may show refresh indicators)
  return <PageLayout ... />;
}
```

**Refresh Button Pattern**

```typescript
// ✅ CORRECT: Only animate during refresh, not initial loading
<Button
  intent="ghost"
  onClick={refreshData}
  disabled={isLoading}
  icon={RefreshCw}
  className={`${isRefreshing ? 'animate-spin' : ''}`} // Only spin when refreshing
/>

// ❌ INCORRECT: Spins during both loading and refreshing
<Button
  className={`${isLoading && 'animate-spin'}`} // Wrong - spins during initial load too
/>
```

**Table Refresh Pattern**

```typescript
export default function DataTable({ isRefreshing = false }) {
  const { data, isLoadingData } = useContext();

  // Show loading message only when initially loading AND not refreshing
  if (isLoadingData && data.length === 0 && !isRefreshing) {
    return <LoadingMessage text="Loading data..." />;
  }

  // Show "no data" message only when not loading/refreshing
  if (data.length === 0 && !isLoadingData && !isRefreshing) {
    return <NoDataMessage />;
  }

  // Show table with optional refresh indicator
  return (
    <div className="relative">
      {isRefreshing && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full shadow-md">
            <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            Refreshing data...
          </div>
        </div>
      )}
      <div className={`${isRefreshing ? 'opacity-50' : 'opacity-100'} transition-opacity duration-200`}>
        <DataTable data={data} />
      </div>
    </div>
  );
}
```

**Sidebar List Pattern**

```typescript
export default function SidebarList({ isLoading, isRefreshing }) {
  return (
    <div>
      <Button
        icon={RefreshCw}
        className={`${isRefreshing ? 'animate-spin' : ''}`} // Only spin when refreshing
        disabled={isLoading} // Disable during any loading
        onClick={onRefresh}
      />

      {isLoading && items.length === 0 ? (
        <LoadingComponent size="sm" text="Loading items..." />
      ) : items.length === 0 ? (
        <NoItemsMessage />
      ) : (
        items.map(item => <ListItem key={item.id} item={item} />)
      )}
    </div>
  );
}
```

### Component Prop Patterns

**Context Provider to Component Communication**

```typescript
// Context provides both states
const contextValue = {
  isLoading, // Initial data fetch
  isRefreshing, // Updating existing data
  isLoadingSpecific, // Specific resource loading
  isRefreshingSpecific, // Specific resource refreshing
};

// Components receive what they need
<DataTable
  data={data}
  isRefreshing={isRefreshingData} // Only refreshing state for table
/>

<RefreshButton
  onClick={refresh}
  isLoading={isLoading} // For disabled state
  isRefreshing={isRefreshing} // For animation
/>
```

### State Flow Diagram

```
Initial Page Load:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ No Data     │ -> │ isLoading    │ -> │ Data Loaded │
│ Show Loading│    │ = true       │    │ Show Data   │
└─────────────┘    └──────────────┘    └─────────────┘

Refresh Operation:
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ Data Exists │ -> │ isRefreshing │ -> │ Data Updated│
│ Keep Visible│    │ = true       │    │ Remove      │
│             │    │ Show Spinner │    │ Indicator   │
└─────────────┘    └──────────────┘    └─────────────┘
```

### Context Provider Best Practices

**Loading States**

```typescript
type LoadingState = {
  airports: boolean;
  tenders: boolean;
};
```

**Error Handling**

```typescript
type ErrorState = {
  airports: string | null;
  tenders: string | null;
  general: string | null;
};
```

**CRUD Operations**

- Optimistic updates for better UX
- Cache management to avoid unnecessary refetches
- Proper error recovery and rollback
- Maintain data visibility during refresh operations

### Custom Hooks

**Common Patterns**

- `use-debounce.ts` - Input debouncing
- `use-mobile.ts` - Responsive design hooks
- `use-airport-autocomplete.ts` - Feature-specific hooks

## Performance Considerations

### Code Splitting

- Automatic route-based splitting with App Router
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### Data Fetching

- Server-side data fetching for initial page loads
- Client-side caching with context providers
- Optimistic updates for better perceived performance

### Bundle Optimization

- Tree-shaking enabled
- Dynamic imports for large libraries
- Image optimization with Next.js Image component

## Development Workflow

### File Creation Guidelines

1. **Always prefer editing existing files** over creating new ones
2. **Never create documentation files** unless explicitly requested
3. **Use existing component patterns** from Storybook library
4. **Follow the established directory structure**

### Code Quality

- TypeScript strict mode enabled
- ESLint and Prettier configured
- Consistent naming conventions
- Comprehensive error handling

### Testing Strategy

- Storybook for component testing
- Vitest for unit testing
- Component isolation testing

## Key Patterns to Follow

### 1. Authentication Flow

```typescript
// 1. Middleware protects routes
// 2. Server component authorizes user
// 3. Data fetched with org filtering
// 4. Client component receives authorized data
```

### 2. Multi-Tenancy

```typescript
// Every data operation must include org context
const data = await getDataByOrg(user.orgId);
```

### 3. Error Boundaries

```typescript
// Comprehensive error handling at context level
const [errors, setErrors] = useState<ErrorState>({
  airports: null,
  tenders: null,
  general: null,
});
```

### 4. Component Composition

```typescript
// Use PageLayout for consistent structure
// Use Storybook components for complex UI
// Use shadcn/ui for base components
```

## Date & Time Handling

### Database Schema Types

**Two distinct field types with different handling:**

```typescript
// 1. TIMESTAMPS (with timezone) - for precise moments in time
timestamp('created_at', { withTimezone: true }).notNull().defaultNow();
timestamp('updated_at', { withTimezone: true }).notNull().defaultNow();
timestamp('sent_at', { withTimezone: true }); // when RFQ was sent
timestamp('received_at', { withTimezone: true }); // when quote was received
timestamp('decision_at', { withTimezone: true }); // when decision was made

// 2. DATES (calendar dates only) - for business dates without time
date('effective_from'); // contract start date
date('effective_to'); // contract end date
date('bidding_starts'); // bidding period start
date('bidding_ends'); // bidding period end
date('invoice_date'); // invoice date
date('bid_submitted_at'); // bid submission date
```

### Data Flow Patterns

**For TIMESTAMP fields (precise moments):**

```
DateTimePicker → Date object → ISO string → TIMESTAMPTZ → formatDate with time
```

**For DATE fields (calendar dates):**

```
DatePicker → Date object → YYYY-MM-DD string → DATE → formatDate date-only
```

### Component State Pattern

**For TIMESTAMP fields:**

```typescript
// ✅ CORRECT: Store as Date objects for precise moments
const [formData, setFormData] = useState({
  sentAt: record?.sentAt ? new Date(record.sentAt) : null,
  receivedAt: record?.receivedAt ? new Date(record.receivedAt) : null,
});
```

**For DATE fields:**

```typescript
// ✅ CORRECT: Store as Date objects for calendar dates
const [formData, setFormData] = useState({
  effectiveFrom: record?.effectiveFrom ? new Date(record.effectiveFrom) : null,
  effectiveTo: record?.effectiveTo ? new Date(record.effectiveTo) : null,
  biddingStarts: record?.biddingStarts ? new Date(record.biddingStarts) : null,
});

// ❌ INCORRECT: Don't store as strings
const [formData, setFormData] = useState({
  effectiveFrom: record?.effectiveFrom || null, // Could be string - wrong!
});
```

### Form Submission Pattern

**For TIMESTAMP fields (precise moments):**

```typescript
// ✅ CORRECT: Send as ISO strings with time
const payload = {
  ...formData,
  sentAt: formData.sentAt?.toISOString() || null, // "2025-01-15T14:30:00.000Z"
  receivedAt: formData.receivedAt?.toISOString() || null,
  decisionAt: formData.decisionAt?.toISOString() || null,
};
```

**For DATE fields (calendar dates only):**

```typescript
// ✅ CORRECT: Send as YYYY-MM-DD strings (date-only)
const payload = {
  ...formData,
  effectiveFrom: formData.effectiveFrom?.toISOString().split('T')[0] || null, // "2025-01-15"
  effectiveTo: formData.effectiveTo?.toISOString().split('T')[0] || null,
  biddingStarts: formData.biddingStarts?.toISOString().split('T')[0] || null,
  biddingEnds: formData.biddingEnds?.toISOString().split('T')[0] || null,
  invoiceDate: formData.invoiceDate?.toISOString().split('T')[0] || null,
};

// ✅ ALTERNATIVE: Use utility function for cleaner code
import { formatDateForAPI } from '@/lib/utils/date-helpers';

const payload = {
  ...formData,
  effectiveFrom: formatDateForAPI(formData.effectiveFrom),
  effectiveTo: formatDateForAPI(formData.effectiveTo),
};
```

### API Route Pattern

```typescript
// ✅ CORRECT: Drizzle handles both types automatically
export async function POST(request: NextRequest) {
  const body = await request.json();

  // For TIMESTAMP fields: Drizzle converts ISO strings to TIMESTAMPTZ
  // For DATE fields: Drizzle converts YYYY-MM-DD strings to DATE
  // No manual conversion needed for either type!

  const result = await createRecord(body);
  return NextResponse.json(result);
}

// ❌ INCORRECT: Don't manually convert dates
const data = {
  ...body,
  effectiveFrom: body.effectiveFrom ? new Date(body.effectiveFrom) : null, // Unnecessary!
  sentAt: new Date(body.sentAt), // Unnecessary and breaks null handling!
};
```

### Display Pattern

**For TIMESTAMP fields (show date + time):**

```typescript
import { formatDate } from '@/lib/core/formatters';

// Shows: "Jan 15, 2025, 2:30 PM"
<div>{formatDate(record.createdAt)}</div>
<div>{formatDate(record.sentAt)}</div>
<div>{formatDate(record.receivedAt)}</div>
```

**For DATE fields (show date only):**

```typescript
// Shows: "Jan 15, 2025" (no time)
<div>{formatDate(record.effectiveFrom)}</div>
<div>{formatDate(record.biddingStarts)}</div>
<div>{formatDate(record.invoiceDate)}</div>
```

**For Form Inputs:**

```typescript
// Both types use Date objects in components
<DatePicker
  value={record.effectiveFrom ? new Date(record.effectiveFrom) : undefined}
  onChange={(date) => handleChange('effectiveFrom', date)}
/>

<DateTimePicker
  value={record.sentAt ? new Date(record.sentAt) : undefined}
  onChange={(date) => handleChange('sentAt', date)}
/>
```

### KeyValuePair with Dates

**For DATE fields:**

```typescript
// ✅ CORRECT: Pass Date objects directly for calendar dates
<KeyValuePair
  label="Effective From"
  value={formData.effectiveFrom} // Date object or null
  valueType="date"
  editMode={isEditing}
  onChange={(value) => handleFieldChange('effectiveFrom', value)}
/>
```

**For TIMESTAMP fields:**

```typescript
// ✅ CORRECT: Pass Date objects directly for precise moments
<KeyValuePair
  label="Sent At"
  value={formData.sentAt} // Date object or null
  valueType="date"        // Use "date" for both DATE and TIMESTAMP fields
  editMode={isEditing}
  onChange={(value) => handleFieldChange('sentAt', value)}
/>

// ❌ INCORRECT: Don't convert Date to Date
<KeyValuePair
  value={formData.effectiveFrom ? new Date(formData.effectiveFrom) : null} // Redundant!
/>
```

### Utility Functions

```typescript
// Available in @/lib/utils/date-helpers
import {
  safeDate, // Safe conversion to Date or null
  safeISOString, // Safe conversion to ISO string or null (for timestamps)
  formatDateForAPI, // Safe conversion to YYYY-MM-DD string or null (for dates)
  createDateFilter, // Filter by date range
  sortByDate, // Sort arrays by date field
  getRelativeTime, // "2 hours ago" format
} from '@/lib/utils/date-helpers';

// Display formatting (works for both DATE and TIMESTAMP fields)
import { formatDate } from '@/lib/core/formatters';
formatDate(dateField); // "Jan 15, 2025" (for DATE fields)
formatDate(timestampField); // "Jan 15, 2025, 2:30 PM" (for TIMESTAMP fields)
```

### Common Mistakes to Avoid

```typescript
// ❌ Don't do these:
value={formData.effectiveFrom ? new Date(formData.effectiveFrom) : null} // Double conversion
await apiCall(formData) // Sending Date objects to API (need to serialize first)
const date = new Date(possiblyNullValue) // Not handling null values
effectiveFrom: formData.effectiveFrom?.toISOString() // Wrong for DATE fields (includes time)

// ✅ Do these instead:
value={formData.effectiveFrom} // Already correct Date object type
effectiveFrom: formatDateForAPI(formData.effectiveFrom) // YYYY-MM-DD for DATE fields
sentAt: formData.sentAt?.toISOString() || null // ISO string for TIMESTAMP fields
const date = possiblyNullValue ? new Date(possiblyNullValue) : null // Safe conversion
```

### Quick Reference

| Field Type    | Component State             | Form Submission                 | Display                 | Input Component                     |
| ------------- | --------------------------- | ------------------------------- | ----------------------- | ----------------------------------- |
| **TIMESTAMP** | `new Date(value) \|\| null` | `date?.toISOString() \|\| null` | `formatDate(timestamp)` | `<KeyValuePair valueType="date" />` |
| **DATE**      | `new Date(value) \|\| null` | `formatDateForAPI(date)`        | `formatDate(date)`      | `<KeyValuePair valueType="date" />` |

### Python Backend Integration

**When sending to/from Python backend:**

```typescript
// ✅ CORRECT: Both types sent as strings
const payload = {
  // DATE fields → YYYY-MM-DD strings
  effectiveFrom: formatDateForAPI(formData.effectiveFrom), // "2025-01-15"

  // TIMESTAMP fields → ISO strings
  sentAt: formData.sentAt?.toISOString() || null, // "2025-01-15T14:30:00.000Z"
};

// Python will receive and can parse both formats correctly
// DATE: datetime.strptime(date_str, "%Y-%m-%d").date()
// TIMESTAMP: datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
```

## Environment Configuration

### Client Environment

- Clerk authentication keys
- API URLs (Next.js and FastAPI)
- Debug mode configuration
- Azure integration (optional)

### Type Safety

- Comprehensive TypeScript types
- Database schema types generated from Drizzle
- API response types for all endpoints

---

This architecture ensures scalability, maintainability, and consistent user experience across the FleetAI platform while maintaining strict multi-tenant security and modern development practices.
