# Insigra Reports — System Architecture

This document describes the architectural flow, component boundaries, and security mechanics of Insigra Reports.

---

## 1. High-Level Request & Security Flow

```
[ Browser / Client ]
        │
        │ 1. HTTPS Request with Auth Cookie
        ▼
[ Next.js Edge Middleware ] ─── (Validates JWT session via getUser())
        │
        │ 2. Valid Session Forwarded
        ▼
[ Next.js Server Component (Dashboard) ]
        │
        │ 3. Query: `supabase.from('campaign_data').select('*')`
        │    (Carries user's verified Bearer JWT)
        ▼
[ Supabase PostgreSQL Engine ]
        │
        │ 4. Invokes Row-Level Security (RLS) Filter:
        │    `company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())`
        │
        ├── Evaluates `auth.uid()` from JWT
        ├── Resolves user tenant in `public.profiles`
        └── Filters table rows directly on PostgreSQL disk/memory
        │
        │ 5. Returns permitted rows ONLY (e.g. 5 rows for Alpha Ltd)
        ▼
[ Next.js Server Component ]
        │
        │ 6. Streams HTML / Props
        ▼
[ React Client Components ]
        │
        ├── Metric Cards (Derived: Total leads, Active channels, Records)
        ├── Recharts Bar Chart (Aggregated by channel)
        └── Interactive Campaign Table (Search, channel filters, sort)
```

---

## 2. Core Architectural Roles

| Component | Responsibility | Security Boundary Role |
| :--- | :--- | :--- |
| **Supabase Auth** | User identity, password verification, issuing signed JWTs | **Authentication**: Proves *who* the user is (`auth.uid()`). |
| **public.profiles** | Links each user UUID to exactly one `company_name` | **Authorization Mapping**: Administrative tenant directory. Normal users cannot modify rows. |
| **PostgreSQL RLS** | Filter rows during SQL query execution | **Authorization Enforcement**: Hardware-level data boundary. Untrusted input cannot bypass it. |
| **Next.js Server Component** | Initial render and data query orchestration | Enforces server-side redirect if session is unauthenticated. |
| **Next.js Middleware** | Token refresh & route guard | Prevents unauthenticated access before routes resolve. |
| **React Client UI** | User interaction, data filtering/search, charts | Presentation only. Never trusted for security or access control. |

---

## 3. Why Client-Side Filtering is Architecturally Disallowed

In standard insecure prototypes, developers frequently issue queries like:
```typescript
// ❌ INSECURE DESIGN:
const { data } = await supabase
  .from('campaign_data')
  .select('*')
  .eq('company_name', userCompany); // Relies on client parameter!
```
Or worse:
```typescript
// ❌ CRITICAL SECURITY VULNERABILITY:
const allData = await supabase.from('campaign_data').select('*');
const filteredData = allData.filter(row => row.company_name === 'Alpha Ltd');
```

**Why this fails:**
1. If RLS is missing or misconfigured, every tenant's data is transferred over the wire to the browser.
2. Any user inspecting DevTools (Network tab) can observe competitor data.
3. Attackers can modify request parameters (e.g. changing `company_name=Beta%20Ltd`) to access other organizations' sensitive data.

**The Insigra Reports Architecture:**
The query executed by the application is deliberately:
```typescript
// ✅ ROBUST RLS BOUNDARY:
const { data } = await supabase
  .from('campaign_data')
  .select('*')
  .order('leads', { ascending: false });
```
Because no `eq('company_name', ...)` filter is passed from the client, the query's security guarantees rest 100% on the database engine.
