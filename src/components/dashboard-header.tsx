"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  LogOut, 
  Menu, 
  User, 
  Building2, 
  ShieldCheck, 
  Loader2 
} from "lucide-react";

interface DashboardHeaderProps {
  userEmail: string;
  companyName: string;
  onOpenSidebar: () => void;
}

export function DashboardHeader({
  userEmail,
  companyName,
  onOpenSidebar,
}: DashboardHeaderProps) {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (err) {
      console.error("Sign-out error:", err);
      // Fallback redirect via server route
      window.location.href = "/auth/signout";
    }
  };

  const getInitials = (email: string) => {
    if (!email) return "U";
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Mobile Menu toggle + current breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
            Tenant:
          </span>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 border border-purple-200/70 text-purple-900 font-semibold text-xs">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>{companyName}</span>
          </div>
        </div>
      </div>

      {/* Right: User identity & Sign Out */}
      <div className="flex items-center gap-4">
        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-purple-700 shadow-sm">
            {getInitials(userEmail)}
          </div>
          <div className="hidden md:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-900 leading-tight">
              {userEmail}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              Authenticated Session
            </span>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          id="signout-button"
          className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-medium text-slate-700 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          title="Sign out of your session"
        >
          {signingOut ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
