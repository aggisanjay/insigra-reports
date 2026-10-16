"use client";

import { useState } from "react";
import { CampaignRecord, Profile } from "@/types/database";
import { Sidebar } from "@/components/sidebar";
import { DashboardHeader } from "@/components/dashboard-header";
import { MetricCard } from "@/components/metric-card";
import { LeadsChart } from "@/components/leads-chart";
import { CampaignTable } from "@/components/campaign-table";
import { 
  Users, 
  Layers, 
  BarChart2, 
  Building2, 
  RefreshCw
} from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardViewProps {
  user: {
    id: string;
    email: string;
  };
  profile: Profile | null;
  initialCampaigns: CampaignRecord[];
  fetchError: string | null;
}

export function DashboardView({
  user,
  profile,
  initialCampaigns,
  fetchError,
}: DashboardViewProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Derive display organization name
  const companyName = 
    profile?.company_name || 
    (user.email.includes("alpha") ? "Alpha Ltd" : user.email.includes("beta") ? "Beta Ltd" : "Organization");

  // Calculate metrics derived strictly from permitted campaign records
  const totalLeads = initialCampaigns.reduce((acc, row) => acc + row.leads, 0);
  const distinctChannels = new Set(initialCampaigns.map((row) => row.channel)).size;
  const totalRecords = initialCampaigns.length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        companyName={companyName}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Header */}
        <DashboardHeader
          userEmail={user.email}
          companyName={companyName}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        {/* Dashboard Body */}
        <main className="flex-1 p-5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Welcome Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Marketing Performance
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200">
                  <Building2 className="w-3.5 h-3.5 text-purple-700" />
                  {companyName}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Real-time marketing campaign overview and acquisition attribution.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
                title="Refresh database records"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-purple-600" : "text-slate-500"}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <MetricCard
              title="Total Leads"
              value={totalLeads}
              subtitle={`Total leads for ${companyName}`}
              trend="+18.4% vs benchmark"
              icon={<Users className="w-5 h-5" />}
              accentBg="bg-purple-50"
              accentBorder="border-purple-200"
              accentText="text-purple-700"
            />

            <MetricCard
              title="Active Channels"
              value={distinctChannels}
              subtitle="Distinct acquisition sources"
              icon={<Layers className="w-5 h-5" />}
              accentBg="bg-indigo-50"
              accentBorder="border-indigo-200"
              accentText="text-indigo-700"
            />

            <MetricCard
              title="Campaign Records"
              value={totalRecords}
              subtitle="Active tracking records"
              icon={<BarChart2 className="w-5 h-5" />}
              accentBg="bg-emerald-50"
              accentBorder="border-emerald-200"
              accentText="text-emerald-700"
            />
          </div>

          {/* Leads by Channel Chart */}
          <LeadsChart 
            data={initialCampaigns} 
            companyName={companyName} 
          />

          {/* Campaign Records Table */}
          <CampaignTable 
            data={initialCampaigns} 
            companyName={companyName} 
          />
        </main>
      </div>
    </div>
  );
}
