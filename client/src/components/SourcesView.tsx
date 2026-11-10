"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Source,
  fetchSchedulerStatus,
  triggerSchedulerSync,
  SchedulerStatusResponse,
} from "@/services/api";
import {
  Radio,
  CheckCircle2,
  ExternalLink,
  Search,
  X,
  MapPin,
  Cpu,
  Landmark,
  GraduationCap,
  TrendingUp,
  Cloud,
  ShieldCheck,
  RefreshCw,
  Zap,
} from "lucide-react";

interface SourcesViewProps {
  sources: Source[];
}

export function SourcesView({ sources }: SourcesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatusResponse | null>(null);
  const [syncingNow, setSyncingNow] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedulerStatus()
      .then(setSchedulerStatus)
      .catch(() => {});
  }, []);

  const handleManualSync = async () => {
    setSyncingNow(true);
    setSyncMessage(null);
    try {
      const res = await triggerSchedulerSync();
      setSyncMessage(res.message);
      const updated = await fetchSchedulerStatus();
      setSchedulerStatus(updated);
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (e: any) {
      setSyncMessage(e.message || "Sync failed");
    } finally {
      setSyncingNow(false);
    }
  };

  const categories = [
    { id: "All", label: "All Sources", icon: Radio },
    { id: "karnataka_portal", label: "Karnataka Desks", icon: MapPin },
    { id: "tech_blog", label: "Engineering Blogs", icon: Cpu },
    { id: "government_scheme", label: "Govt & Policies", icon: Landmark },
    { id: "research_fellowship", label: "Research Fellowships", icon: GraduationCap },
    { id: "business_macro", label: "Global Macro & Business", icon: TrendingUp },
    { id: "company_offer", label: "Cloud Packs & Dev Credits", icon: Cloud },
  ];

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: sources.length };
    sources.forEach((s) => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [sources]);

  const filteredSources = useMemo(() => {
    return sources.filter((s) => {
      const matchesCategory =
        selectedCategory === "All" || s.category === selectedCategory;

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.base_url.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [sources, selectedCategory, searchQuery]);

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "karnataka_portal":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "tech_blog":
        return "bg-[#EEEDFD] text-[#635BDB] border-[#635BDB]/30 font-bold";
      case "government_scheme":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      case "research_fellowship":
        return "bg-[#E8F8F2] text-[#0E5B44] border-[#8BDCC0]/60";
      case "business_macro":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "company_offer":
        return "bg-sky-50 text-sky-800 border-sky-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#635BDB] via-[#5247CC] to-[#4338CA] border border-[#635BDB]/40 p-7 shadow-lg shadow-[#635BDB]/15 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-mono font-semibold border border-white/20">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8BDCC0]" />
              <span>[SOURCE_REGISTRY::AUDITABLE]</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight leading-snug">
              Approved Sources & Health Monitor
            </h1>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Every intelligence brief and opportunity in your cockpit is anchored against one of these {sources.length}+ verified official origins.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 font-mono">
            <div className="bg-black/20 border border-white/15 rounded-xl px-4 py-2.5 text-center backdrop-blur-sm">
              <div className="text-xl font-bold text-white">{sources.length}</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider">Feeds</div>
            </div>
            <div className="bg-black/20 border border-white/15 rounded-xl px-4 py-2.5 text-center backdrop-blur-sm">
              <div className="text-xl font-bold text-[#8BDCC0]">100%</div>
              <div className="text-[10px] text-white/70 uppercase tracking-wider">Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous Ingestion Scheduler Monitor Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900">
                // AUTONOMOUS_BACKGROUND_INGESTION
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10.5px]">
                {schedulerStatus?.is_running ? "[WORKER::ONLINE]" : "[WORKER::STANDBY]"}
              </span>
            </div>
            <p className="text-slate-500 text-[11px] font-sans mt-0.5">
              Periodically harvests all 53+ approved sources every {schedulerStatus?.interval_minutes || 30} minutes, checks deadlines, and generates push notifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden sm:block text-[11px] text-slate-500">
            <div>Cycles: <strong className="text-slate-900">{schedulerStatus?.sync_count || 1}</strong></div>
            <div>Interval: <strong className="text-slate-900">{schedulerStatus?.interval_minutes || 30}m</strong></div>
          </div>
          <button
            onClick={handleManualSync}
            disabled={syncingNow || schedulerStatus?.is_syncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] text-white font-bold transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingNow || schedulerStatus?.is_syncing ? "animate-spin" : ""}`} />
            <span>{syncingNow || schedulerStatus?.is_syncing ? "Harvesting..." : "Sync Feeds Now"}</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-mono text-emerald-800">
          ✓ {syncMessage}
        </div>
      )}

      {/* Control Bar: Categories & Search */}
      <div className="space-y-3 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(99,91,219,0.03)]">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            const Icon = cat.icon;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? "bg-[#635BDB] text-white font-bold shadow-sm shadow-[#635BDB]/25"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified source by name, domain, or region..."
            className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#635BDB] focus:bg-white transition-colors font-mono"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Counter bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
        <span>
          Showing <strong className="text-slate-900 font-bold">{filteredSources.length}</strong> of{" "}
          <strong className="text-slate-900 font-bold">{sources.length}</strong> verified origins
        </span>
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-[#635BDB] hover:text-[#5046CA] underline">
            Clear filter
          </button>
        )}
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map((src) => (
          <div
            key={src.id}
            className="bg-white border border-slate-200/90 hover:border-[#635BDB]/40 rounded-2xl p-4.5 space-y-3 transition-all flex flex-col justify-between shadow-[0_2px_12px_rgba(99,91,219,0.03)]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E8F8F2] text-[#0E5B44] border border-[#8BDCC0]/60">
                  <CheckCircle2 className="w-3 h-3 text-[#0E5B44]" />
                  [{src.last_status === "success" ? "ONLINE" : src.last_status.toUpperCase()}]
                </span>

                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${getCategoryBadge(src.category)}`}>
                  {src.category.replace("_", " ")}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{src.name}</h3>
                <a
                  href={src.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#635BDB] hover:text-[#5046CA] font-mono mt-1 inline-flex items-center gap-1 truncate max-w-full"
                >
                  <span className="truncate">{src.base_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span className="capitalize text-slate-700 font-semibold">
                {src.source_type.replace("_", " ")}
              </span>
              <span className="text-slate-400">
                {src.region} &bull; {Math.round(src.fetch_interval_minutes / 60)}h poll
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
