# Insigra Reports — Multi-Tenant Marketing Analytics Dashboard

> **Secure, Multi-Tenant Marketing Performance Dashboard with PostgreSQL Row-Level Security (RLS)**  
> Built for the Insigra Reports Junior Developer practical evaluation.

---

## 1. Project Overview

**Insigra Reports** is a multi-tenant B2B marketing analytics platform designed to give organizations clear visibility into their marketing channels and campaign lead generation.

The core engineering objective of this project is **strict tenant isolation**:
- **Alpha Ltd** must never be able to access Beta Ltd's campaign data.
- **Beta Ltd** must never be able to access Alpha Ltd's campaign data.

This security guarantee is enforced **inside the PostgreSQL storage engine via Row-Level Security (RLS)**, completely eliminating reliance on client-side array filtering, URL parameters, or trusted company names.

---

## 2. Key Features

- **Strict PostgreSQL Row-Level Security (RLS)**: Enforced via `auth.uid()` and an administrative `public.profiles` lookup subquery. Zero cross-tenant leakage.
- **Supabase Authentication**: Real email/password authentication using `@supabase/ssr` cookies with server-side session refresh and route protection.
- **Dynamic Derived Metrics**: Three key performance indicator cards:
  - Total Leads (summed from database records)
  - Active Channels (count of distinct channels)
  - Visible Campaign Records (count of permitted records)
- **Interactive Leads-by-Channel Bar Chart**: Rendered with **Recharts**, with custom tooltips, responsive container, and channel aggregations.
- **Comprehensive Campaign Breakdown Table**: Displays channel, company, leads, and RLS access status with instant search, channel dropdown filtering, and lead sorting.
- **Security Audit Status Panel**: Interactive on-dashboard proof displaying authenticated session UUID, email, and the exact PostgreSQL RLS policy running on the database.
- **Production-Grade Resilience**: Clean loading states, accessible keyboard navigation, show/hide password toggle, and graceful handling of missing profiles, network errors, and unconfigured environments.

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript (Strict Mode)
- **Styling**: Tailwind CSS, PostCSS, Lucide React icons
- **Animations**: Framer Motion (subtle transitions respecting `prefers-reduced-motion`)
- **Data Visualization**: Recharts
- **Backend & Database**: Supabase Authentication, Supabase PostgreSQL with RLS
- **Session & Client**: `@supabase/ssr`, `@supabase/supabase-js`
- **Testing & Tooling**: Node.js, `tsx`, ESLint, TypeScript compiler

---

## 4. Architecture Summary

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

## 5. Project Structure

```
insigra-reports/
├── public/
│   ├── logo.svg               # Brand vector logo
│   └── favicon.svg            # Favicon
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   └── signout/
│   │   │       └── route.ts   # Server-side signout route handler
│   │   ├── dashboard/
│   │   │   └── page.tsx       # Server component dashboard (RLS query)
│   │   ├── login/
│   │   │   └── page.tsx       # Authentication page
│   │   ├── globals.css        # Design tokens & responsive styles
│   │   ├── layout.tsx         # Root HTML layout & metadata
│   │   └── page.tsx           # Session-aware root router
│   ├── components/
│   │   ├── campaign-table.tsx # Accessible table with search/filter/sort
│   │   ├── dashboard-header.tsx# Top navigation & user controls
│   │   ├── dashboard-view.tsx # Unified dashboard layout
│   │   ├── leads-chart.tsx    # Recharts leads-by-channel bar chart
│   │   ├── login-form.tsx     # Login form with validation & quick fill
│   │   ├── metric-card.tsx    # Pastel KPI metric card
│   │   ├── security-status.tsx# Real-time RLS audit proof panel
│   │   └── sidebar.tsx        # Responsive navigation sidebar
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts      # Browser Supabase client (@supabase/ssr)
│   │   │   ├── middleware.ts  # Session refresh & route guard helper
│   │   │   └── server.ts      # Server Supabase client (@supabase/ssr)
│   │   └── utils.ts           # Class merge & formatting utilities
│   ├── middleware.ts          # Next.js edge middleware
│   └── types/
│       └── database.ts        # TypeScript database schema types
├── supabase/
│   ├── schema.sql             # Table DDL, constraints & permissions
│   ├── policies.sql           # PostgreSQL Row-Level Security policies
│   ├── seed.sql               # Deterministic demo data & profile bindings
│   └── verify-rls.sql         # Diagnostic SQL audit script
├── tests/
│   └── tenant-isolation.test.ts # Automated tenant isolation test suite
├── docs/
│   ├── architecture.md        # Request flow & component architecture
│   ├── deployment.md          # GitHub and Vercel deployment guide
│   ├── recording-script.md    # 3-minute video recording script
│   ├── reflection-template.md # Junior developer reflection template
│   ├── security.md            # Security model & RLS technical analysis
│   ├── setup.md               # Step-by-step local & database setup guide
│   ├── shopify-bonus.md       # Bonus Shopify payment automation guide
│   └── testing.md             # Multi-tenant test matrix & verification
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore file
├── package.json               # Dependencies & build scripts
├── tailwind.config.ts         # Tailwind CSS styling tokens
└── tsconfig.json              # TypeScript strict configuration
```

---

## 6. Installation & Local Setup

### Step 1: Clone and install dependencies
```bash
git clone <your-repo-url>
cd "insigra reports"
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 7. Supabase Database & Test Account Setup

Full detailed instructions are in [`docs/setup.md`](docs/setup.md).

### Quick Summary:
1. In your **Supabase SQL Editor**, execute [`supabase/schema.sql`](supabase/schema.sql).
2. Execute [`supabase/policies.sql`](supabase/policies.sql).
3. In **Authentication** → **Users**, create two test accounts:
   - `alpha@test.com` (Set password & mark Auto-Confirm)
   - `beta@test.com` (Set password & mark Auto-Confirm)
4. In **SQL Editor**, execute [`supabase/seed.sql`](supabase/seed.sql). This populates the 10 deterministic campaign records and links the profiles to the newly created users.
5. In **SQL Editor**, execute [`supabase/verify-rls.sql`](supabase/verify-rls.sql) to audit RLS enablement and verify table grants.

---

## 8. Deterministic Benchmark Data

### Alpha Ltd:
- Google — 142 leads
- Meta — 96 leads
- LinkedIn — 61 leads
- Email — 44 leads
- Organic — 78 leads  
*Total: 421 leads across 5 channels*

### Beta Ltd:
- Google — 118 leads
- Meta — 133 leads
- LinkedIn — 52 leads
- Email — 39 leads
- Organic — 84 leads  
*Total: 426 leads across 5 channels*

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
1. **Physical Isolation**: Evaluated directly inside PostgreSQL for every candidate row.
2. **Cryptographic User ID**: `auth.uid()` reads the validated `sub` claim from the signed Supabase JWT.
3. **No Client Filter Required**: The frontend executes `supabase.from('campaign_data').select('*')` without specifying any company filter. The database handles 100% of the authorization boundary.
4. **Least Privilege**: Authenticated users have SELECT access only; INSERT, UPDATE, and DELETE are strictly disallowed.

---

## 10. Running the Application

Start the local Next.js development server:
```bash
npm run dev
```
Navigate to [http://localhost:3000](http://localhost:3000).

---

## 11. Testing Both Tenants

1. Open `/login`.
2. Click the **Alpha Ltd** quick preset (or enter `alpha@test.com` and password).
3. Verify total leads = **421**, 5 active channels, Google = 142, Meta = 96.
4. Click **Sign Out**.
5. Log in as **beta@test.com**.
6. Verify total leads = **426**, Meta = 133, Google = 118.
7. Observe that zero Alpha Ltd rows exist in the table or chart.

To run automated integration tests:
```bash
npm test
```

---

## 12. Deployment Instructions (Vercel)

See [`docs/deployment.md`](docs/deployment.md) for full instructions:
1. Push repository to GitHub.
2. Import project in Vercel.
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy and set the production domain under Supabase **Authentication** → **URL Configuration**.

---

## 13. Optional Shopify Bonus

See [`docs/shopify-bonus.md`](docs/shopify-bonus.md):
- **Webhook**: Ingest Shopify `orders/paid` webhooks via a secure API endpoint.
- **HMAC Verification**: Validate `X-Shopify-Hmac-Sha256` with timing-safe comparison to prevent spoofing.
- **Idempotency**: Track Order IDs with unique database constraints to prevent duplicate provisioning during retries.
- **Provisioning**: Provision or activate tenant profiles server-side using secure backend credentials.
- **Lifecycle & Auditing**: Listen to `refunds/create` to revoke access and log all operations in an audit table.

---

## 14. Documentation Directory

- [`docs/setup.md`](docs/setup.md) — Step-by-step Supabase & local setup guide
- [`docs/architecture.md`](docs/architecture.md) — System request lifecycle & component boundaries
- [`docs/security.md`](docs/security.md) — Security deep dive, threat model & RLS mechanics
- [`docs/testing.md`](docs/testing.md) — Multi-tenant test matrix & verification checklist
- [`docs/deployment.md`](docs/deployment.md) — GitHub & Vercel deployment instructions
- [`docs/recording-script.md`](docs/recording-script.md) — 3-minute video presentation script
- [`docs/reflection-template.md`](docs/reflection-template.md) — Developer personal reflection template
- [`docs/shopify-bonus.md`](docs/shopify-bonus.md) — Shopify webhook automation blueprint
