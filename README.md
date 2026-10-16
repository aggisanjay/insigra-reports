# Insigra Reports — Multi-Tenant Marketing Analytics Dashboard

> **Secure Multi-Tenant Marketing Performance Platform with PostgreSQL Row-Level Security (RLS)**  
> Built for the Insigra Reports Junior Developer practical evaluation.

---

## 1. Project Overview

**Insigra Reports** is an enterprise-grade, multi-tenant B2B marketing analytics platform built with **Next.js 14 (App Router), React 18, TypeScript (Strict Mode), Tailwind CSS, Recharts, and Supabase PostgreSQL**.

The primary architectural requirement is **strict tenant isolation**:
- **Alpha Ltd** can only access and view Alpha Ltd marketing campaigns.
- **Beta Ltd** can only access and view Beta Ltd marketing campaigns.
- Tenant boundaries are **enforced strictly inside PostgreSQL using Row-Level Security (RLS)**. The frontend executes queries without company-level filters (`supabase.from('campaign_data').select('*')`), ensuring that even client tampering cannot leak cross-tenant records.

---

## 2. Key Features

- **Strict PostgreSQL Row-Level Security (RLS)**: Enforced via `auth.uid()` and an administrative `public.profiles` lookup subquery. Zero cross-tenant leakage.
- **Supabase Authentication**: Email/password authentication using `@supabase/ssr` cookies with server-side session refresh and route protection.
- **1-Click Test Access**: One-click authentication buttons on the login screen for instant evaluation of both Alpha Ltd and Beta Ltd accounts.
- **Dynamic Derived Metrics**: Three key performance indicator cards:
  - Total Leads (summed from permitted database records)
  - Active Channels (count of distinct channels)
  - Campaign Records (count of permitted records)
- **Interactive Leads-by-Channel Bar Chart**: Rendered with **Recharts**, featuring custom hover tooltips, responsive container, and channel aggregations.
- **Comprehensive Campaign Breakdown Table**: Displays channel, company, leads, and active status with instant search, channel dropdown filtering, and lead sorting.
- **Executive-Grade UI/UX**: Clean, uncluttered B2B aesthetics without implementation noise or awkward technical badges.
- **Production-Grade Resilience**: Clean loading states, accessible keyboard navigation, show/hide password toggle, and graceful handling of missing profiles, network errors, and unconfigured environments.

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, PostCSS, Lucide React icons
- **Animations**: Framer Motion (respecting `prefers-reduced-motion`)
- **Data Visualization**: Recharts
- **Backend & Database**: Supabase Authentication, Supabase PostgreSQL with RLS
- **Session & Client**: `@supabase/ssr`, `@supabase/supabase-js`
- **Testing & Tooling**: Node.js, `tsx`, ESLint, TypeScript compiler

---

## 4. Test Accounts & Benchmark Data

| Tenant | Email | Password | Total Leads | Channels |
| :--- | :--- | :--- | :--- | :--- |
| **Alpha Ltd** | `alpha@test.com` | `AlphaTest2026!` | **421** | Google (142), Meta (96), Organic (78), LinkedIn (61), Email (44) |
| **Beta Ltd** | `beta@test.com` | `BetaTest2026!` | **426** | Meta (133), Google (118), Organic (84), LinkedIn (52), Email (39) |

*You can test both accounts instantly by clicking the "Alpha Ltd" or "Beta Ltd" buttons on the [login screen](http://localhost:3000/login).*

---

## 5. Architecture Summary

```
Browser Request 
   │ (HTTPS + Auth Cookie)
   ▼
Next.js Middleware (Token refresh via getUser())
   │
   ▼
Server Component (Dashboard)
   │ 
   │ Query: `supabase.from('campaign_data').select('*')`
   │ (Notice: No company_name filter provided by frontend)
   ▼
Supabase PostgreSQL Engine
   │
   ├── RLS Policy: company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())
   ├── Extracts `auth.uid()` from JWT
   └── Filters physical rows on disk
   │
   ▼ Returns Permitted Rows ONLY (5 for Alpha, 5 for Beta)
Dashboard Client View (Calculates KPI metrics, renders Recharts & Table)
```

---

## 6. Project Structure

```
insigra-reports/
├── public/
│   ├── logo.svg                   # Brand vector logo
│   └── favicon.svg                # Favicon
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── signout/
│   │   │       └── route.ts       # Server-side signout route handler
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Server component dashboard (Pure RLS query)
│   │   ├── login/
│   │   │   └── page.tsx           # Authentication page
│   │   ├── globals.css            # Design tokens & responsive styles
│   │   ├── layout.tsx             # Root HTML layout & metadata
│   │   └── page.tsx               # Session-aware root router
│   ├── components/
│   │   ├── campaign-table.tsx     # Accessible table with search/filter/sort
│   │   ├── dashboard-header.tsx   # Top navigation & user controls
│   │   ├── dashboard-view.tsx     # Clean, modern SaaS dashboard layout
│   │   ├── leads-chart.tsx        # Recharts leads-by-channel bar chart
│   │   ├── login-form.tsx         # Login form with 1-click test access
│   │   ├── metric-card.tsx        # Pastel KPI metric card
│   │   └── sidebar.tsx            # Minimalist navigation sidebar
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          # Browser Supabase client (@supabase/ssr)
│   │   │   ├── middleware.ts      # Session refresh & route guard helper
│   │   │   └── server.ts          # Server Supabase client (@supabase/ssr)
│   │   └── utils.ts               # Class merge & formatting utilities
│   ├── middleware.ts              # Next.js edge middleware
│   └── types/
│       └── database.ts            # TypeScript database schema types
├── supabase/
│   ├── all-in-one-setup.sql       # 1-click single setup script (Schema + RLS + Seed)
│   ├── schema.sql                 # Table DDL, constraints & permissions
│   ├── policies.sql               # PostgreSQL Row-Level Security policies
│   ├── seed.sql                   # Deterministic demo data & profile bindings
│   └── verify-rls.sql             # Diagnostic SQL audit script
├── tests/
│   └── tenant-isolation.test.ts   # Automated tenant isolation test suite
├── scripts/
│   ├── verify-live.js             # Live database query verification script
│   └── seed-remote.ts             # Node administrative seeding utility
├── docs/
│   ├── architecture.md            # Request flow & component architecture
│   ├── deployment.md              # GitHub and Vercel deployment guide
│   ├── recording-script.md        # 3-minute video presentation script
│   ├── reflection-template.md     # Junior developer reflection template
│   ├── security.md                # Security model & RLS technical analysis
│   ├── setup.md                   # Step-by-step local & database setup guide
│   ├── shopify-bonus.md           # Bonus Shopify payment automation guide
│   └── testing.md                 # Multi-tenant test matrix & verification
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore file
├── package.json                   # Dependencies & build scripts
├── tailwind.config.ts             # Tailwind CSS styling tokens
└── tsconfig.json                  # TypeScript strict configuration
```

---

## 7. Installation & Local Setup

### Step 1: Install dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Ensure your Supabase project credentials are set:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Database Setup (Supabase)

To provision and seed the database in your Supabase project:

1. Open your **Supabase Dashboard** &rarr; **SQL Editor**.
2. Run [`supabase/all-in-one-setup.sql`](supabase/all-in-one-setup.sql).
3. This creates:
   - `public.profiles` and `public.campaign_data`
   - Strict Row-Level Security policies
   - All 10 deterministic campaign records
   - Automatic profile linkage for both accounts

---

## 9. Row-Level Security (RLS) Explanation

### The Exact Policy:
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

### Why It Works:
1. **Evaluated Inside PostgreSQL**: The policy is appended directly into the PostgreSQL execution plan.
2. **Cryptographic Identity**: `auth.uid()` reads the validated user UUID from the signed JWT bearer token.
3. **No Client Trust**: The frontend executes `supabase.from('campaign_data').select('*')` without any company filter. The database handles 100% of the authorization boundary.
4. **Least Privilege**: Authenticated users have SELECT access only; INSERT, UPDATE, and DELETE on campaign records are revoked.

---

## 10. Testing & Verification

### Run the Automated Integration Suite
```bash
npm test
```
The test suite verifies:
- Unauthenticated access returns 0 records.
- Alpha Ltd receives exactly its 5 permitted rows (421 leads).
- Alpha Ltd receives 0 Beta Ltd rows (100% strict isolation).
- Beta Ltd receives exactly its 5 permitted rows (426 leads).
- Beta Ltd receives 0 Alpha Ltd rows.

### Run Live Database Verification
```bash
node scripts/verify-live.js
```

---

## 11. Deployment (Vercel)

1. Push the repository to GitHub.
2. Import into [Vercel](https://vercel.com/new).
3. Set the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy and add your Vercel URL under Supabase **Authentication** &rarr; **URL Configuration** &rarr; **Redirect URLs**.

Full details are in [`docs/deployment.md`](docs/deployment.md).

---

## 12. Optional Shopify Bonus

See [`docs/shopify-bonus.md`](docs/shopify-bonus.md) for the architecture blueprint covering webhook ingestion, HMAC validation, idempotency enforcement, and automated customer provisioning.

---

## 13. Documentation Directory

- [`docs/setup.md`](docs/setup.md) — Step-by-step local & database setup guide
- [`docs/architecture.md`](docs/architecture.md) — System request lifecycle & component boundaries
- [`docs/security.md`](docs/security.md) — Security deep dive, threat model & RLS mechanics
- [`docs/testing.md`](docs/testing.md) — Multi-tenant test matrix & verification checklist
- [`docs/deployment.md`](docs/deployment.md) — GitHub & Vercel deployment instructions
- [`docs/recording-script.md`](docs/recording-script.md) — 3-minute video presentation script
- [`docs/reflection-template.md`](docs/reflection-template.md) — Developer personal reflection template
- [`docs/shopify-bonus.md`](docs/shopify-bonus.md) — Shopify webhook automation blueprint
