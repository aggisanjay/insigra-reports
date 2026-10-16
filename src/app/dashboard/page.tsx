import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard-view";
import { CampaignRecord, Profile } from "@/types/database";
import { KeyRound } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function DashboardPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Handle missing environment configuration cleanly
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("placeholder")) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 p-8 shadow-lg">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-4">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Supabase Configuration Required
          </h2>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Please configure your Supabase credentials in <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-purple-700">.env.local</code>.
          </p>
        </div>
      </main>
    );
  }

  const supabase = createClient();

  // 1. Authenticate user from session
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // 2. Fetch User Profile
  // RLS enforces: profiles.id = auth.uid()
  let { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  // If user profile is not yet in the table, attempt self-healing insert for test tenants
  if (!profileData && user.email) {
    const derivedCompany = user.email.includes("alpha")
      ? "Alpha Ltd"
      : user.email.includes("beta")
      ? "Beta Ltd"
      : null;

    if (derivedCompany) {
      const { data: createdProfile } = await (supabase
        .from("profiles") as any)
        .insert({ id: user.id, company_name: derivedCompany })
        .select()
        .maybeSingle();

      if (createdProfile) {
        profileData = createdProfile;
      }
    }
  }

  const profile: Profile | null = profileData || null;

  // 3. Query Campaign Data
  // CRITICAL SECURITY REQUIREMENT:
  // Intentionally query WITHOUT a company_name filter!
  // PostgreSQL Row-Level Security ensures only the authenticated tenant's rows are returned.
  const { data: campaignRows, error: campaignError } = await supabase
    .from("campaign_data")
    .select("*")
    .order("leads", { ascending: false });

  const campaigns: CampaignRecord[] = campaignRows || [];

  const fetchError = campaignError
    ? `Failed to load campaigns: ${campaignError.message}`
    : null;

  return (
    <DashboardView
      user={{
        id: user.id,
        email: user.email || "user@test.com",
      }}
      profile={profile}
      initialCampaigns={campaigns}
      fetchError={fetchError}
    />
  );
}
