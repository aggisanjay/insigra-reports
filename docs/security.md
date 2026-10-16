# Insigra Reports — Security Deep Dive & Threat Model

This document outlines the security architecture, threat model, and defense-in-depth principles implemented in Insigra Reports.

---

## 1. Authentication vs. Authorization

A common mistake in junior full-stack applications is confusing **identity** with **permissions**:

- **Authentication (AuthN)**: "Who are you?"  
  Managed by Supabase Auth. The user presents an email and password; upon successful cryptographic verification, Supabase issues a signed JSON Web Token (JWT) containing standard claims such as `sub` (the user's UUID).
- **Authorization (AuthZ)**: "What are you permitted to see or do?"  
  Managed exclusively by PostgreSQL Row-Level Security (RLS) policies and table privilege grants. Even if a user is authenticated, they have zero permission to inspect or mutate records belonging to any other tenant.

---

## 2. Row-Level Security (RLS) Architecture

### What is `auth.uid()`?
Inside PostgreSQL, Supabase provides helper functions that extract claims from the incoming HTTP authorization header:
- `auth.uid()` extracts the cryptographic `sub` field (User UUID) from the validated JWT.
- It cannot be forged by the client because the token is signed with the project's JWT Secret.

### The Campaign Data Policy
```sql
CREATE POLICY "Users can only read their own company campaigns"
ON public.campaign_data
FOR SELECT
TO authenticated
USING (
    company_name = (
        SELECT p.company_name
        FROM public.profiles p
        WHERE p.id = auth.uid()
    )
);
```

### Why this policy is secure:
1. **Engine-Level Filter**: The PostgreSQL planner appends this predicate to every query plan executed under the `authenticated` role.
2. **Zero Row Leakage**: If an unauthenticated user queries the table, `auth.uid()` is `NULL`. The subquery returns `NULL`, causing `company_name = NULL` to evaluate to `NULL` (falsy in SQL boolean logic). The database returns 0 rows.
3. **No Profile Fallback**: If an authenticated user does not have a row in `profiles`, the subquery yields `NULL`, resulting in 0 rows.
4. **Tenant Isolation**: When `alpha@test.com` signs in, `auth.uid()` resolves to Alpha's UUID. The subquery returns `'Alpha Ltd'`. PostgreSQL only selects rows where `company_name = 'Alpha Ltd'`. Rows with `'Beta Ltd'` are physically excluded from the result set.

---

## 3. Principle of Least Privilege

By default, PostgreSQL tables grant broad access. Insigra Reports explicitly hardens the database:

```sql
-- Revoke all privileges from public/anonymous roles
REVOKE ALL ON TABLE public.profiles FROM anon, public;
REVOKE ALL ON TABLE public.campaign_data FROM anon, public;

-- Grant ONLY read access to authenticated sessions
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT SELECT ON TABLE public.campaign_data TO authenticated;
```

### Protection Against Privilege Escalation:
- **No INSERT/UPDATE/DELETE grants**: Even if an attacker uses the Supabase JavaScript client in their browser console to run `supabase.from('profiles').update({ company_name: 'Beta Ltd' })`, PostgreSQL rejects the statement immediately with a 42501 permission denied error.
- **Tenant reassignment impossible**: Normal users cannot reassign their company membership.

---

## 4. Secret Management & Key Hygiene

1. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**:  
   This key is meant to be public. It provides anonymous client connectivity to Supabase and is subject to all RLS policies and table grants.
2. **`SUPABASE_SERVICE_ROLE_KEY`**:  
   **Bypasses all RLS policies.** It must **NEVER** be committed to Git, added to `.env.local` with a `NEXT_PUBLIC_` prefix, or imported into browser-facing code. Insigra Reports does not use the service-role key anywhere in the web application.

---

## 5. How to Test Cross-Tenant Access (Penetration Test)

To prove tenant isolation yourself in browser DevTools:
1. Log in as `alpha@test.com`.
2. Open your browser's Developer Tools → **Console**.
3. Inspect the Supabase client or run:
   ```javascript
   // Attempt to query all campaign data
   const { data } = await window.__SUPABASE_CLIENT__.from('campaign_data').select('*');
   console.log(data);
   ```
4. **Result**: Exactly 5 rows for Alpha Ltd. Zero rows for Beta Ltd.
5. Attempt an explicit cross-tenant filter:
   ```javascript
   const { data } = await window.__SUPABASE_CLIENT__.from('campaign_data').select('*').eq('company_name', 'Beta Ltd');
   console.log(data);
   ```
6. **Result**: `data: []` (empty array). The database policy rejected the query.
