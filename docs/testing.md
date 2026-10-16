# Insigra Reports — Testing & Verification Guide

This document details the multi-tenant test matrix, instructions for running automated integration tests, and a manual verification checklist.

---

## 1. Multi-Tenant Test Matrix

| Test Scenario | Actor | Request / Action | Expected Result | Enforcement Layer |
| :--- | :--- | :--- | :--- | :--- |
| **Unauthenticated Read** | Anon / Guest | `GET /dashboard` | HTTP 307 Redirect to `/login` | Next.js Middleware |
| **Direct Anon DB Query** | Anon Client | `SELECT * FROM campaign_data` | 0 rows returned or 42501 Permission Denied | PostgreSQL RLS / Table Revoke |
| **Alpha Ltd Isolation** | `alpha@test.com` | `SELECT * FROM campaign_data` | Exactly 5 Alpha Ltd rows (Total leads: 421) | PostgreSQL RLS Policy |
| **Beta Ltd Cross-Read** | `alpha@test.com` | `SELECT * FROM campaign_data WHERE company_name = 'Beta Ltd'` | 0 rows returned | PostgreSQL RLS Policy |
| **Beta Ltd Isolation** | `beta@test.com` | `SELECT * FROM campaign_data` | Exactly 5 Beta Ltd rows (Total leads: 426) | PostgreSQL RLS Policy |
| **Alpha Ltd Cross-Read** | `beta@test.com` | `SELECT * FROM campaign_data WHERE company_name = 'Alpha Ltd'` | 0 rows returned | PostgreSQL RLS Policy |
| **Missing Profile** | User with no profile | `SELECT * FROM campaign_data` | 0 rows returned; Dashboard shows profile setup notice | PostgreSQL RLS Policy & UI Handler |
| **Unauthorized Profile Mutation** | Authenticated User | `UPDATE profiles SET company_name = 'Beta Ltd'` | 42501 Permission Denied | PostgreSQL Table Privileges |
| **Sign-Out Session Invalidation** | Authenticated User | Click "Sign Out" | Session cookies destroyed, redirected to `/login`, `/dashboard` blocked | Supabase Auth + Route Handler |

---

## 2. Running the Automated Test Suite

An automated integration test script is located at `tests/tenant-isolation.test.ts`.

### Running Tests:
```bash
npm test
# or
npx tsx tests/tenant-isolation.test.ts
```

### Pre-requisites for Live Test Execution:
The test suite requires valid Supabase credentials in your `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
TEST_ALPHA_PASSWORD=YourAlphaPasswordHere!
TEST_BETA_PASSWORD=YourBetaPasswordHere!
```

If run without configured credentials, the script exits cleanly explaining that Supabase credentials are required and points the user to the setup guide.

---

## 3. Manual Verification Checklist (Recruiter Walkthrough)

1. **Verify Alpha Ltd**:
   - Navigate to `/login`.
   - Click the "Alpha Ltd" preset or type `alpha@test.com` and password.
   - Click "Sign In to Dashboard".
   - **Verify Metrics**: Total Leads shows **421**, Active Channels shows **5**, Visible Records shows **5**.
   - **Verify Chart**: Bar chart displays Google (142), Meta (96), Organic (78), LinkedIn (61), Email (44).
   - **Verify Table**: Table contains only Alpha Ltd rows. No Beta Ltd rows exist in DOM or Network payload.
2. **Verify Sign Out**:
   - Click the "Sign Out" button in the top right.
   - User is redirected to `/login`. Attempting to navigate back to `/dashboard` immediately redirects to `/login`.
3. **Verify Beta Ltd**:
   - Sign in as `beta@test.com`.
   - **Verify Metrics**: Total Leads updates to **426**, Active Channels shows **5**, Visible Records shows **5**.
   - **Verify Chart**: Bar chart displays Meta (133), Google (118), Organic (84), LinkedIn (52), Email (39).
   - **Verify Table**: Table contains only Beta Ltd rows. No Alpha Ltd rows exist.
4. **Verify Client-Side Search & Filter**:
   - In the search box, type "Google" → Table filters to 1 row instantly.
   - Select "LinkedIn" in the channel dropdown → Table filters to LinkedIn.
   - Type an invalid term like "TikTok" → Empty state gracefully indicates "No channels matched your search".
