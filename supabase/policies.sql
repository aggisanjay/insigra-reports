-- ==============================================================================
-- INSIGRA REPORTS - ROW-LEVEL SECURITY (RLS) POLICIES
-- Strict PostgreSQL Tenant Isolation
-- ==============================================================================

-- 1. Enable Row-Level Security on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.campaign_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_data FORCE ROW LEVEL SECURITY;

-- 2. Profiles Security Policies
DROP POLICY IF EXISTS "Users can only read their own profile" ON public.profiles;
CREATE POLICY "Users can only read their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    id = auth.uid()
);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
    id = auth.uid()
);

-- 3. Campaign Data Security Policy
-- Rule: An authenticated user can only select campaign records that belong to the
-- company registered in their profile.
DROP POLICY IF EXISTS "Users can only read their own company campaigns" ON public.campaign_data;
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
