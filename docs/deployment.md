# Insigra Reports — Production Deployment Guide

This guide covers deploying Insigra Reports to **Vercel** with a live **Supabase** backend.

---

## 1. Push Repository to GitHub

1. Initialize a git repository if not already done:
   ```bash
   git init
   git add .
   git commit -m "feat: complete Insigra Reports multi-tenant dashboard"
   ```
2. Create a new repository on [GitHub](https://github.com/new).
3. Push your code:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/insigra-reports.git
   git push -u origin main
   ```

---

## 2. Deploy on Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New...** → **Project**.
2. Select your `insigra-reports` GitHub repository.
3. Keep default build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `next build`
   - **Output Directory**: `.next`
4. Expand **Environment Variables** and enter:
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://<your-project>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<your-anon-key>`
5. Click **Deploy**.

---

## 3. Configure Supabase Authentication Redirects

Once Vercel finishes the deployment, you will receive a production URL (e.g., `https://insigra-reports-xyz.vercel.app`).

1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** → **URL Configuration**.
3. Set **Site URL** to your Vercel deployment URL:
   ```
   https://insigra-reports-xyz.vercel.app
   ```
4. Under **Redirect URLs**, add:
   ```
   https://insigra-reports-xyz.vercel.app/**
   http://localhost:3000/**
   ```
5. Save changes.

---

## 4. Deployed Application Verification

1. Open your live Vercel URL in an Incognito window.
2. Sign in as `alpha@test.com`. Confirm that Alpha Ltd's 5 records and 421 total leads render.
3. Sign out and sign in as `beta@test.com`. Confirm that Beta Ltd's 5 records and 426 total leads render.
4. Test keyboard accessibility, mobile responsive layout, and search filters.
