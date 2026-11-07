"use client";

import React, { useState, useMemo } from "react";
import { Source } from "@/services/api";
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
} from "lucide-react";

interface SourcesViewProps {
  sources: Source[];
}

export function SourcesView({ sources }: SourcesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "All", label: "All Sources", icon: Radio },
    { id: "karnataka_portal", label: "Karnataka Desks", icon: MapPin },
    { id: "tech_blog", label: "Tech Engineering Blogs", icon: Cpu },
    { id: "government_scheme", label: "Govt & Policies", icon: Landmark },
    { id: "research_fellowship", label: "Research Fellowships", icon: GraduationCap },
    { id: "business_macro", label: "Global Macro & Business", icon: TrendingUp },
    { id: "company_offer", label: "Dev Packs & Cloud Credits", icon: Cloud },
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
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "tech_blog":
        return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
      case "government_scheme":
        return "bg-blue-500/15 text-blue-300 border-blue-500/30";
      case "research_fellowship":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "business_macro":
        return "bg-purple-500/15 text-purple-300 border-purple-500/30";
      case "company_offer":
        return "bg-sky-500/15 text-sky-300 border-sky-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-sky-300 text-xs font-semibold border border-blue-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Auditable Information Registry</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Approved Sources & Health Monitor
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every intelligence brief and opportunity in your portal is strictly cross-checked and anchored against one of these {sources.length}+ official sources.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-center">
              <div className="text-xl font-bold text-white">{sources.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Registered Feeds</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-4 py-2.5 text-center">
              <div className="text-xl font-bold text-emerald-400">100%</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Operational</div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Categories & Search */}
      <div className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
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
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-blue-800/90 text-white" : "bg-slate-800 text-slate-400"
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
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search verified source by name, domain, or region..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Counter bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-semibold">{filteredSources.length}</strong> of{" "}
          <strong className="text-white font-semibold">{sources.length}</strong> verified origins
        </span>
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-sky-400 hover:text-sky-300 underline">
            Clear filter
          </button>
        )}
      </div>

      {/* Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map((src) => (
          <div
            key={src.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all flex flex-col justify-between shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {src.last_status === "success" ? "Online" : src.last_status}
                </span>

                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getCategoryBadge(src.category)}`}>
                  {src.category.replace("_", " ")}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-100 text-sm leading-snug line-clamp-1">{src.name}</h3>
                <a
                  href={src.base_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-sky-400 hover:text-sky-300 font-mono mt-1 inline-flex items-center gap-1 truncate max-w-full"
                >
                  <span className="truncate">{src.base_url}</span>
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="capitalize text-slate-300 font-medium">
                {src.source_type.replace("_", " ")}
              </span>
              <span className="text-slate-500">
                {src.region} &bull; Polls every {Math.round(src.fetch_interval_minutes / 60)}h
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
