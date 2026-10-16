import React from "react";
import { formatNumber } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentBg,
  accentBorder,
  accentText,
}: MetricCardProps) {
  const displayVal = typeof value === "number" ? formatNumber(value) : value;
  const isZero = value === 0 || value === "0";

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
            {title}
          </p>
          <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {displayVal}
          </div>
        </div>

        <div className={`p-2.5 rounded-xl border ${accentBg} ${accentBorder} ${accentText}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500">{subtitle || "Derived from campaign records"}</span>
        {!isZero && trend && (
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-[11px]">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
