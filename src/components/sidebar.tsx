"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  BarChart3, 
  Building2, 
  X,
  CheckCircle2
} from "lucide-react";

interface SidebarProps {
  companyName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ companyName, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out
        lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-sm tracking-tight block">Insigra Reports</span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block">Marketing Intelligence</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Organization Badge */}
        <div className="p-4 mx-4 my-4 bg-slate-50 border border-slate-200/80 rounded-xl">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            Current Organization
          </div>
          <div className="font-bold text-slate-900 text-sm truncate flex items-center justify-between">
            <span>{companyName}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" title="Workspace Active" />
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Active Workspace
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 space-y-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-3 py-2">
            Analytics
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-900 border border-purple-100 transition"
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Campaign Performance</span>
          </Link>
        </nav>

        {/* Clean Minimalist Footer */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>Insigra Engine</span>
            <span className="font-mono text-slate-400">v1.0.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
