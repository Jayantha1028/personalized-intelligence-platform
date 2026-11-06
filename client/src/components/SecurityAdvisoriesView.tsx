"use client";

import React, { useState, useEffect } from "react";
import {
  SecurityAdvisoriesResponse,
  SecurityAdvisory,
  fetchSecurityAdvisories,
} from "@/services/api";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Search,
  ShieldCheck,
  Server,
  Zap,
} from "lucide-react";

export function SecurityAdvisoriesView() {
  const [data, setData] = useState<SecurityAdvisoriesResponse | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const loadAdvisories = async () => {
    setLoading(true);
    try {
      const res = await fetchSecurityAdvisories(
        severityFilter !== "All" ? severityFilter : undefined,
        searchQuery || undefined
      );
      setData(res);
    } catch (err) {
      console.error("Failed to load security advisories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdvisories();
  }, [severityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAdvisories();
  };

  const severities = ["All", "CRITICAL", "HIGH", "MEDIUM"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          <span>Developer Security Advisories & CVE Radar</span>
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Real-time vulnerability feeds, container base image CVEs, and CIS benchmark hardening recommendations for developers.
        </p>
      </div>

      {/* Summary Stat Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
            <span className="text-xs text-slate-400 font-medium block">Total Tracked</span>
            <span className="text-2xl font-bold text-white mt-1 block">
              {data.summary.total_tracked}
            </span>
          </div>

          <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4">
            <span className="text-xs text-rose-300 font-medium block">Critical Severity</span>
            <span className="text-2xl font-bold text-rose-400 mt-1 block">
              {data.summary.critical_count}
            </span>
          </div>

          <div className="bg-orange-950/20 border border-orange-900/40 rounded-xl p-4">
            <span className="text-xs text-orange-300 font-medium block">High Severity</span>
            <span className="text-2xl font-bold text-orange-400 mt-1 block">
              {data.summary.high_count}
            </span>
          </div>

          <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4">
            <span className="text-xs text-amber-300 font-medium block">Medium Severity</span>
            <span className="text-2xl font-bold text-amber-400 mt-1 block">
              {data.summary.medium_count}
            </span>
          </div>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          {severities.map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                severityFilter === sev
                  ? sev === "CRITICAL"
                    ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                    : sev === "HIGH"
                    ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
                    : "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by CVE or package..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Advisories Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
            Loading vulnerability feeds...
          </div>
        ) : !data || data.advisories.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 text-xs">
            No advisories match the selected filters.
          </div>
        ) : (
          data.advisories.map((adv) => {
            const isCrit = adv.severity === "CRITICAL";
            const isHigh = adv.severity === "HIGH";

            return (
              <div
                key={`${adv.cve_id}-${adv.target_image}-${adv.package}`}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-3"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold tracking-wider ${
                        isCrit
                          ? "bg-rose-950 text-rose-300 border border-rose-800/60"
                          : isHigh
                          ? "bg-orange-950 text-orange-300 border border-orange-800/60"
                          : "bg-amber-950 text-amber-300 border border-amber-800/60"
                      }`}
                    >
                      {adv.severity}
                    </span>

                    <span className="font-mono font-bold text-slate-200">
                      {adv.cve_id}
                    </span>

                    <span className="text-slate-600">&bull;</span>
                    <span className="text-slate-400">Package: <strong className="text-slate-200">{adv.package}</strong></span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      CVSS {adv.cvss.toFixed(1)} / 10.0
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <Server className="w-3 h-3 text-slate-500" />
                      <span>{adv.target_image}</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {adv.description}
                </p>

                {/* Remediation Box */}
                {(adv.remediation || adv.fixed_in) && (
                  <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3 text-xs flex items-start gap-2.5">
                    <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-semibold text-emerald-400">Remediation Guidance:</span>
                      <p className="text-slate-300">
                        {adv.remediation || `Upgrade ${adv.package} to version >= ${adv.fixed_in}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
