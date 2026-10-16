"use client";

import { useState, useMemo } from "react";
import { CampaignRecord } from "@/types/database";
import { formatNumber } from "@/lib/utils";
import { 
  Search, 
  Filter, 
  FileSpreadsheet, 
  ArrowUpDown,
  Building2,
  CheckCircle2
} from "lucide-react";

interface CampaignTableProps {
  data: CampaignRecord[];
  companyName: string;
}

export function CampaignTable({ data, companyName }: CampaignTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Extract distinct channels for filter dropdown
  const channels = useMemo(() => {
    const list = Array.from(new Set(data.map((r) => r.channel)));
    return list.sort();
  }, [data]);

  // Filter and sort records
  const filteredData = useMemo(() => {
    return data
      .filter((record) => {
        const matchesSearch = record.channel
          .toLowerCase()
          .includes(searchQuery.toLowerCase().trim());
        const matchesChannel =
          selectedChannel === "all" || record.channel === selectedChannel;
        return matchesSearch && matchesChannel;
      })
      .sort((a, b) => {
        if (sortOrder === "asc") {
          return a.leads - b.leads;
        } else {
          return b.leads - a.leads;
        }
      });
  }, [data, searchQuery, selectedChannel, sortOrder]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            Marketing Campaign Breakdown
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Channel-level acquisition breakdown for {companyName}
          </p>
        </div>

        {/* Search & Channel Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[180px] sm:min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search channel..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
            />
          </div>

          {/* Channel Select Filter */}
          <div className="relative">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              aria-label="Filter campaigns by channel"
              className="pl-3 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 transition appearance-none cursor-pointer"
            >
              <option value="all">All Channels ({data.length})</option>
              {channels.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition flex items-center gap-1 text-xs px-2.5 cursor-pointer"
            title="Toggle sort direction by leads"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">
              {sortOrder === "desc" ? "Highest" : "Lowest"}
            </span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="py-3 px-5">Marketing Channel</th>
              <th scope="col" className="py-3 px-5">Organization</th>
              <th scope="col" className="py-3 px-5">Leads Generated</th>
              <th scope="col" className="py-3 px-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr 
                  key={row.id} 
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    {row.channel}
                  </td>
                  <td className="py-3.5 px-5 text-slate-600">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                      <Building2 className="w-3 h-3 text-slate-500" />
                      {row.company_name}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-bold text-slate-900">
                    <span className="text-sm">{formatNumber(row.leads)}</span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Active
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="w-8 h-8 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No campaigns found</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                      {data.length === 0
                        ? `No records found for ${companyName}.`
                        : "No channels matched your search or filter criteria."}
                    </p>
                    {data.length > 0 && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedChannel("all");
                        }}
                        className="mt-3 text-xs font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
                      >
                        Reset filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800">{filteredData.length}</strong> of{" "}
          <strong className="text-slate-800">{data.length}</strong> campaign records
        </span>
        <span className="text-[11px] text-slate-400">
          Live Sync Active
        </span>
      </div>
    </div>
  );
}
