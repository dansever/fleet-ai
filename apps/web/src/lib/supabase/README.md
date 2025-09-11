# Admin Supabase Operations:

List All Buckets:
`await supabaseAdmin.storage.listBuckets()`

Delete Bucket:
`await supabaseAdmin.storage.deleteBucket(bucketName);`

Create Bucket:
`await supabaseAdmin.storage.createBucket(bucketName)`

# Clerk JWT + Supabase Integration

This document summarizes how we integrated **Clerk JWTs** with **Supabase RLS** for org-level storage access.

---

## 1. Configure External JWT in Supabase

- Go to **Supabase Studio → Authentication → Providers → External JWT**.
- Add:
  - **Issuer**: `https://concise-yeti-4.clerk.accounts.dev`
  - **JWKS URL**: `https://concise-yeti-4.clerk.accounts.dev/.well-known/jwks.json`
- Ensure Clerk JWT template includes:
  ```json
  {
    "aud": "authenticated",
    "role": "authenticated",
    "sub": "{{user.id}}",
    "orgId": "{{org.id}}",
    "orgSlug": "{{org.slug}}",
    "orgName": "{{org.name}}"
  }
  ```

````

---

## 2. Debug Function in Supabase

Create this helper function in **SQL Editor**:

```sql
create or replace function public.debug_jwt()
returns jsonb
language sql
stable
as $$
  select current_setting('request.jwt.claims', true)::jsonb
$$;
```

Grant execution:

```sql
grant usage on schema public to anon, authenticated;
grant execute on function public.debug_jwt() to anon, authenticated;
```

Test with cURL:

```bash
curl -i -X POST \
  "https://<PROJECT-REF>.supabase.co/rest/v1/rpc/debug_jwt" \
  -H "apikey: <SUPABASE_ANON_KEY>" \
  -H "Authorization: Bearer <CLERK_JWT>"
```

---

## 3. Example RLS Policies

Restrict each org to its own bucket:

```sql
create policy "org can read its own buckets"
on storage.buckets
for select
to authenticated
using (
  id = (current_setting('request.jwt.claims', true)::jsonb ->> 'orgSlug')
);

create policy "org can read its own objects"
on storage.objects
for select
to authenticated
using (
  bucket_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'orgSlug')
);
```

Repeat similar policies for `insert`, `update`, and `delete` if needed.

---

## 4. Verification

- Call `rpc('debug_jwt')` and check claims.
- Ensure output includes `orgId`, `orgName`, `orgSlug`, and `sub`.
- If visible → RLS policies will now enforce org-scoped access.
````

## Santy Check:

const supabase = await createClerkSupabaseServer();
const whoami = await supabase.rpc('whoami');
console.log('Whoami: ', whoami);
