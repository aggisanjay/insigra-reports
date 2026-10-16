# Insigra Reports — Local & Supabase Setup Guide

This guide details the exact step-by-step procedure to provision your Supabase PostgreSQL database, configure Row-Level Security, create the test accounts, seed sample data, and run Insigra Reports locally.

---

## 1. Prerequisites

- **Node.js**: v18.17+ (Tested on v24)
- **npm**: v9+ (or pnpm / yarn)
- **Supabase Account**: Free tier at [supabase.com](https://supabase.com)

---

## 2. Supabase Project Setup

1. Log in to [Supabase](https://supabase.com/dashboard) and click **New project**.
2. Set your **Project Name** (e.g., `insigra-reports`).
3. Set a strong **Database Password** and save it securely.
4. Select your preferred AWS/GCP region and click **Create new project**.
5. Once provisioned, navigate to **Project Settings** → **API**.
6. Copy the following credentials:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **Project API Anon Key** (`anon` `public` key, starts with `eyJ...`)

> [!IMPORTANT]
> **Never** expose the `service_role` key in frontend code, environment variables prefixed with `NEXT_PUBLIC_`, or Git repositories. Only the `anon` public key is needed.

---

## 3. Database Schema & RLS Execution

Navigate to **SQL Editor** in the left sidebar of your Supabase dashboard:

### Step 3.1: Execute Schema DDL
Open `supabase/schema.sql`, paste its content into the SQL Editor, and click **Run**:
- Creates `public.profiles` referencing `auth.users(id)`
- Creates `public.campaign_data` with lead validation constraints and indexes
- Restricts table privileges (`REVOKE ALL` from anon; `GRANT SELECT` to authenticated)

### Step 3.2: Execute RLS Policies
Open `supabase/policies.sql`, paste its content into the SQL Editor, and click **Run**:
- Enables and forces Row-Level Security on both `profiles` and `campaign_data`
- Installs the user profile policy (`profiles.id = auth.uid()`)
- Installs the campaign policy enforcing `company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())`

---

## 4. Test Account Provisioning

We must create two real authenticated users in Supabase Auth.

1. Navigate to **Authentication** → **Users** in your Supabase dashboard.
2. Click **Add User** → **Create User**.
3. Create the **Alpha Ltd** user:
   - **Email**: `alpha@test.com`
   - **Password**: Enter a secure password (e.g. `AlphaPassword2026!`)
   - Check **Auto Confirm User?** to `true` (skips email confirmation step).
   - Click **Create user**.
4. Create the **Beta Ltd** user:
   - **Email**: `beta@test.com`
   - **Password**: Enter a secure password (e.g. `BetaPassword2026!`)
   - Check **Auto Confirm User?** to `true`.
   - Click **Create user**.

---

## 5. Seed Demonstration Data & Profiles

Go back to the **SQL Editor** in Supabase and open `supabase/seed.sql`.

Run the seed script:
```sql
-- 1. Insert 5 deterministic campaigns for Alpha Ltd and 5 for Beta Ltd
DELETE FROM public.campaign_data WHERE company_name IN ('Alpha Ltd', 'Beta Ltd');

INSERT INTO public.campaign_data (company_name, channel, leads) VALUES
    ('Alpha Ltd', 'Google', 142),
    ('Alpha Ltd', 'Meta', 96),
    ('Alpha Ltd', 'LinkedIn', 61),
    ('Alpha Ltd', 'Email', 44),
    ('Alpha Ltd', 'Organic', 78),
    ('Beta Ltd', 'Google', 118),
    ('Beta Ltd', 'Meta', 133),
    ('Beta Ltd', 'LinkedIn', 52),
    ('Beta Ltd', 'Email', 39),
    ('Beta Ltd', 'Organic', 84);

-- 2. Dynamically bind profile tenant assignments by email
INSERT INTO public.profiles (id, company_name)
SELECT id, 'Alpha Ltd'
FROM auth.users
WHERE email = 'alpha@test.com'
ON CONFLICT (id) DO UPDATE SET company_name = 'Alpha Ltd';

INSERT INTO public.profiles (id, company_name)
SELECT id, 'Beta Ltd'
FROM auth.users
WHERE email = 'beta@test.com'
ON CONFLICT (id) DO UPDATE SET company_name = 'Beta Ltd';
```

---

## 6. Audit & Verify Setup

In the Supabase SQL Editor, run `supabase/verify-rls.sql` to verify:
1. Both tables have `rowsecurity = true`.
2. Both policies exist under `pg_policies`.
3. Profiles are linked to real Auth UUIDs.
4. Campaign data contains 5 rows for Alpha Ltd (421 leads) and 5 rows for Beta Ltd (426 leads).

---

## 7. Local Project Execution

1. In the project root, create your local environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Populate `.env.local` with your Supabase values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.
5. Sign in as `alpha@test.com` to observe Alpha Ltd's isolated metrics, chart, and table.
6. Sign out and sign in as `beta@test.com` to confirm immediate tenant data switching with zero leaks.
