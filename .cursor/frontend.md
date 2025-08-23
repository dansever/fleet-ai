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
