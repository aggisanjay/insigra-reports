# Insigra Reports — 3-Minute Demo Video Recording Script

Use this script as a clear, professional walkthrough for your internship evaluation submission.

---

### [00:00 - 00:30] Introduction & Architecture Overview
* **Visual**: Starting on the Insigra Reports login page (`/login`).
* **Speaker**:
  > "Hi everyone, I'm presenting Insigra Reports — a multi-tenant marketing campaign analytics platform built with Next.js App Router, TypeScript, Tailwind CSS, and Supabase PostgreSQL.
  >
  > The primary objective of this application is strict, unbreakable tenant isolation between organizations — specifically Alpha Ltd and Beta Ltd. Rather than relying on fragile frontend filters, our security is enforced inside the PostgreSQL storage engine via Row-Level Security."

---

### [00:30 - 01:15] Alpha Ltd Demonstration
* **Visual**: Click the `alpha@test.com` preset button or type email, enter password, click "Sign In to Dashboard".
* **Speaker**:
  > "Let's authenticate as Alpha Ltd using `alpha@test.com`. Upon signing in, our Next.js middleware verifies the session, and the dashboard queries the database.
  >
  > Notice the metrics: Alpha Ltd has a total of 421 leads across 5 active channels.
  > In the leads-by-channel chart, Google leads with 142 leads, followed by Meta at 96, Organic at 78, LinkedIn at 61, and Email at 44.
  >
  > Below, the campaign breakdown table displays only Alpha Ltd records. We have full client-side search — for instance, typing 'Google' isolates that row instantly, and we can filter by channel."

---

### [01:15 - 01:50] Sign Out & Beta Ltd Tenant Switching
* **Visual**: Click "Sign Out" in the top navigation. Page redirects to `/login`. Sign in as `beta@test.com`.
* **Speaker**:
  > "Now, let's sign out. The session is cleanly destroyed, and unauthenticated access is immediately blocked.
  >
  > Next, let's sign in as Beta Ltd using `beta@test.com`.
  >
  > Instantly, the entire dashboard updates. Total leads now reads 426. In the chart, Meta is now the top performing channel with 133 leads, followed by Google at 118, and Organic at 84.
  >
  > Alpha Ltd's records are completely invisible — not because React hid them, but because PostgreSQL refused to return them."

---

### [01:50 - 02:35] The Row-Level Security (RLS) Policy
* **Visual**: Click "View Security Proof" on the Security Status panel or switch to code view displaying `supabase/policies.sql`.
* **Speaker**:
  > "Here is why this works: in our Next.js server code, we intentionally query `supabase.from('campaign_data').select('*')` without any company filter.
  >
  > In PostgreSQL, we enabled Row-Level Security and defined this policy:
  > `company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())`
  >
  > `auth.uid()` extracts the cryptographically verified user ID from the Supabase JWT. Postgres checks the user's registered organization in the `profiles` table and dynamically scopes the query.
  >
  > Even if a user modified client network requests or tampered with the browser JavaScript, PostgreSQL physically prevents cross-tenant data leakage."

---

### [02:35 - 03:00] Production Improvement & Closing
* **Speaker**:
  > "For a production rollout, a key improvement would be introducing multi-organization support with role-based access control (RBAC) — such as Admin, Editor, and Viewer roles within each tenant — plus audit logging triggers for data mutation.
  >
  > Thank you for reviewing Insigra Reports!"
