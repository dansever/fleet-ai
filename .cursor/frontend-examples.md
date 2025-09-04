---
applyTo: ['apps/web/**/*']
---

## Frontend Recipes & Examples

- Use this file for detailed examples. The high-level guide lives in `frontend.md`.

### Authentication flow (server → client)

```typescript
// page.tsx (server)
const { dbUser } = await getAuthContext();
const data = await getDataByOrg(dbUser.orgId);
return <ClientPage dbUser={dbUser} initialData={data} />;
```

```typescript
// ClientPage.tsx (client)
const { isLoading, isRefreshing, refresh } = useContext();
```

### Service-layer data access (client components)

```typescript
// services/core/airport-client.ts
export async function getAirports() {
  const res = await api.get('/api/airports');
  return res.data;
}
```

### Server-only db actions

```typescript
// db/airports/db-actions.ts
export async function getAirportsByOrg(orgId: string) {
  return db.select().from(airports).where(eq(airports.orgId, orgId));
}
```

### Context loading vs refreshing

```typescript
const [isLoading, setIsLoading] = useState(false); // initial load
const [isRefreshing, setIsRefreshing] = useState(false); // update with data visible
```

### Refresh with cache preserved

```typescript
async function refreshSelected() {
  if (!selectedId) return;
  setRefreshingSet((s) => new Set(s).add(selectedId));
  try {
    const fresh = await getById(selectedId);
    setCache((m) => new Map(m).set(selectedId, fresh));
  } finally {
    setRefreshingSet((s) => {
      const n = new Set(s);
      n.delete(selectedId);
      return n;
    });
  }
}
```

### PageLayout usage

```tsx
<PageLayout
  sidebarContent={<Sidebar />}
  headerContent={<Header />}
  mainContent={<Main />}
  sidebarWidth="20rem"
/>
```

### Date handling

```typescript
// State
const [form, setForm] = useState({
  sentAt: record?.sentAt ? new Date(record.sentAt) : null, // TIMESTAMP
  effectiveFrom: record?.effectiveFrom ? new Date(record.effectiveFrom) : null, // DATE
});

// Submit
const payload = {
  sentAt: form.sentAt?.toISOString() || null,
  effectiveFrom: form.effectiveFrom?.toISOString().split('T')[0] || null,
};

// Display
formatDate(record.sentAt);
formatDate(record.effectiveFrom);
```

### Storybook conventions

```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
```

### Common pitfalls

- Do not call `db-actions` from client components.
- Always include `orgId` filtering in server queries.
- Keep data visible during refresh; reserve full-screen loaders for the first load.

### Prevent duplicate fetches when server provided data

```typescript
// ContextProvider.tsx (client)
export default function Provider({ dbUser, initialData }: Props) {
  const [items, setItems] = useState(initialData ?? []);
  const hasServerData = Boolean(initialData); // prevents first client fetch loop

  useEffect(() => {
    if (hasServerData) return;
    void fetchItems();
  }, [hasServerData]);
}
```

### API clients (Next.js API vs Python backend)

```typescript
import axios from 'axios';
import { env } from '@/lib/env';

export const api = axios.create({ baseURL: env.NEXT_PUBLIC_APP_URL });
export const backendApi = axios.create({ baseURL: env.NEXT_PUBLIC_BACKEND_URL });
```

### Robust async call wrapper

```typescript
export async function safeCall<T>(fn: () => Promise<T>): Promise<{ data?: T; error?: string }> {
  try {
    return { data: await fn() };
  } catch (e: any) {
    return { error: e?.message ?? 'Unexpected error' };
  }
}
```

### RBAC gate in UI (client) with server enforcement

```typescript
const canEdit = user?.roles?.includes('admin');
return <Button disabled={!canEdit}>Edit</Button>; // UI gate only
// Always validate on server/API as well.
```

### Pagination pattern (service + component)

```typescript
// services/items-client.ts
export async function listItems(page: number, pageSize: number) {
  const res = await api.get('/api/items', { params: { page, pageSize } });
  return res.data;
}
```

```typescript
// ClientPage.tsx
const [page, setPage] = useState(1);
const { data } = await listItems(page, 20);
```

### Optimistic update

```typescript
async function updateItem(id: string, patch: Partial<Item>) {
  const prev = items;
  setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const { error } = await safeCall(() => api.patch(`/api/items/${id}`, patch));
  if (error) setItems(prev); // rollback
}
```

### Minimal Next.js API route

```typescript
// apps/web/src/app/api/items/route.ts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('pageSize') ?? 20);
  const data = await listItemsDb(page, pageSize); // server-side db action
  return NextResponse.json(data);
}
```
