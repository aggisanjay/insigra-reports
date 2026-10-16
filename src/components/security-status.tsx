"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Code2, 
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

interface SecurityStatusProps {
  userId: string;
  userEmail: string;
  companyName: string;
  recordCount: number;
}

export function SecurityStatus({
  userId,
  userEmail,
  companyName,
  recordCount,
}: SecurityStatusProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-purple-50/70 via-slate-50 to-white border border-purple-200/80 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900">
                PostgreSQL Row-Level Security (RLS) Active
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ISOLATED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict database-tier tenant boundary for <strong className="text-slate-800 font-semibold">{companyName}</strong>. 
              Zero client-side company filtering.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200/80 transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>{expanded ? "Hide Security Details" : "View Security Proof"}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-purple-100/80 space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Authenticated Supabase JWT Session
              </span>
              <div className="font-mono text-[11px] text-slate-700 break-all space-y-0.5">
                <div><strong className="text-slate-500">auth.uid():</strong> {userId}</div>
                <div><strong className="text-slate-500">email:</strong> {userEmail}</div>
                <div><strong className="text-slate-500">tenant profile:</strong> {companyName}</div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                PostgreSQL RLS Engine Execution
              </span>
              <div className="text-[11px] text-slate-600 leading-relaxed">
                Frontend issues <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700 font-mono">supabase.from(&apos;campaign_data&apos;).select(&apos;*&apos;)</code> without filters.
                Postgres silently discards all rows not matching <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">company_name = (SELECT company_name FROM profiles WHERE id = auth.uid())</code>.
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Why Frontend Filtering Is Rejected:</strong> An attacker inspecting Network requests could easily strip a <code className="font-mono">?company_name=eq.Alpha</code> filter or replay requests for Beta Ltd. By enforcing security strictly in PostgreSQL RLS, the database rejects cross-tenant requests at the storage engine level.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
