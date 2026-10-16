"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CampaignRecord } from "@/types/database";
import { BarChart3 } from "lucide-react";

interface LeadsChartProps {
  data: CampaignRecord[];
  companyName: string;
}

const BAR_COLORS = [
  "#7C3AED", // Purple 600
  "#8B5CF6", // Purple 500
  "#6366F1", // Indigo 500
  "#3B82F6", // Blue 500
  "#06B6D4", // Cyan 500
];

export function LeadsChart({ data, companyName }: LeadsChartProps) {
  // Aggregate data by channel (in case there are multiple entries per channel)
  const chartData = useMemo(() => {
    const channelMap: Record<string, number> = {};
    for (const item of data) {
      channelMap[item.channel] = (channelMap[item.channel] || 0) + item.leads;
    }
    return Object.entries(channelMap).map(([channel, leads]) => ({
      channel,
      leads,
    })).sort((a, b) => b.leads - a.leads);
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm h-80 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-3">
          <BarChart3 className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-slate-800">No Campaign Data Available</h4>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          No records currently found for {companyName}.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            Leads Acquired by Marketing Channel
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time channel performance breakdown for {companyName}
          </p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-100/80 shrink-0">
          {chartData.length} Active Channels
        </div>
      </div>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 15, right: 15, left: -10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="channel"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              dx={-5}
            />
            <Tooltip
              cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white rounded-lg px-3 py-2 shadow-lg text-xs space-y-1">
                      <p className="font-semibold text-slate-200">{item.channel}</p>
                      <p className="text-purple-300 font-bold text-sm">
                        {item.leads} <span className="text-slate-400 font-normal text-xs">leads</span>
                      </p>
                      <p className="text-[10px] text-slate-400 border-t border-slate-800 pt-1">
                        {companyName}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="leads" radius={[6, 6, 0, 0]} maxBarSize={48}>
              {chartData.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={BAR_COLORS[index % BAR_COLORS.length]} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
