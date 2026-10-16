-- ==============================================================================
-- INSIGRA REPORTS - RLS VERIFICATION SCRIPT
-- Diagnostic and Audit Queries for Security Verification
-- ==============================================================================

-- 1. Verify Row-Level Security is ENABLED on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity AS rls_enabled,
    forcerowsecurity AS rls_forced
FROM pg_tables
WHERE tablename IN ('profiles', 'campaign_data')
  AND schemaname = 'public';

-- 2. Inspect Active RLS Policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('profiles', 'campaign_data')
  AND schemaname = 'public';

-- 3. Verify Table Grants (Ensure only SELECT is granted to authenticated role)
SELECT 
    table_schema,
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants
WHERE table_name IN ('profiles', 'campaign_data')
  AND table_schema = 'public'
  AND grantee IN ('anon', 'authenticated', 'public')
ORDER BY table_name, grantee;

-- 4. Audit Test Accounts and Profiles
SELECT 
    u.id AS auth_user_id,
    u.email,
    u.email_confirmed_at,
    p.company_name,
    p.created_at AS profile_created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email IN ('alpha@test.com', 'beta@test.com');

-- 5. Audit Campaign Data Row Distribution (Admin view)
SELECT 
    company_name, 
    COUNT(*) as total_campaigns,
    SUM(leads) as total_leads,
    STRING_AGG(channel || ': ' || leads::text, ', ' ORDER BY leads DESC) as channel_breakdown
FROM public.campaign_data
GROUP BY company_name;
