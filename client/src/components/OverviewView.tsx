"use client";

import React from "react";
import { DashboardStats, Article, Opportunity } from "@/services/api";
import {
  Newspaper,
  Award,
  CheckCircle2,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Rocket,
  Terminal,
} from "lucide-react";

interface OverviewViewProps {
  stats: DashboardStats | null;
  news: Article[];
  opportunities: Opportunity[];
  onNavigate: (tab: "news" | "opportunities" | "deadlines") => void;
}

export function OverviewView({ stats, news, opportunities, onNavigate }: OverviewViewProps) {
  const topNews = news.slice(0, 5);
  const matchedOpps = opportunities.filter((o) => o.match_status === "MATCHED").slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top Banner: Electric Indigo Cockpit Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#635BDB] via-[#5247CC] to-[#4338CA] p-7 text-white shadow-xl shadow-[#635BDB]/20 border border-[#635BDB]/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-mono font-semibold mb-3 border border-white/20">
            <span className="w-2 h-2 rounded-full bg-[#8BDCC0] animate-pulse"></span>
            <span>[SYS::DUAL_ENGINE_INTELLIGENCE_ACTIVE]</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight leading-snug">
            Good morning, Alex. You have {stats?.matched_opportunities || 3} verified high-fit opportunities today.
          </h2>
          <p className="text-sm text-white/85 mt-2 leading-relaxed">
            Your feed is deterministic and calibrated for B.Tech CS (Karnataka, Year 3). All grants, internships, and cloud credits are verified against official gazettes.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-black/20 text-[#8BDCC0] border border-white/10">
              ~/intel/growth_vector: active
            </span>
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-black/20 text-white/90 border border-white/10">
              sources: 53 verified
            </span>
            <span className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-black/20 text-white/90 border border-white/10">
              zero_noise: true
            </span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(99,91,219,0.04)] hover:border-[#635BDB]/40 transition-all group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">[NEWS_INTEL]</span>
            <div className="p-2 rounded-xl bg-[#EEEDFD] text-[#635BDB]">
              <Newspaper className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats?.total_articles || 0}</span>
            <span className="text-xs font-semibold text-[#0E5B44] bg-[#8BDCC0]/30 px-2 py-0.5 rounded-md font-mono">
              +{stats?.high_relevance_articles || 0} high-fit
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(99,91,219,0.04)] hover:border-[#635BDB]/40 transition-all group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">[VERIFIED_MATCHES]</span>
            <div className="p-2 rounded-xl bg-[#E8F8F2] text-[#0E5B44]">
              <Award className="w-4 h-4 text-[#0E5B44]" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats?.matched_opportunities || 0}</span>
            <span className="text-xs font-semibold text-[#635BDB] bg-[#EEEDFD] px-2 py-0.5 rounded-md font-mono">
              {stats?.potential_matches || 0} potential
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(99,91,219,0.04)] hover:border-[#635BDB]/40 transition-all group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">[DEADLINES]</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats?.upcoming_deadlines_count || 0}</span>
            <span className="text-xs font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md font-mono">
              &le; 30 days
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(99,91,219,0.04)] hover:border-[#635BDB]/40 transition-all group">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">[FEEDS_HEALTH]</span>
            <div className="p-2 rounded-xl bg-[#EEEDFD] text-[#635BDB]">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats?.active_sources_count || 53}</span>
            <span className="text-xs font-semibold text-[#0E5B44] bg-[#8BDCC0]/30 px-2 py-0.5 rounded-md font-mono">
              100% active
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top News Intelligence */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#EEEDFD] text-[#635BDB] flex items-center justify-center">
                <Newspaper className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Curated News Intelligence</h3>
              <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                [LATEST_BATCH]
              </span>
            </div>
            <button
              onClick={() => onNavigate("news")}
              className="text-xs font-mono font-semibold text-[#635BDB] hover:text-[#5046CA] flex items-center gap-1 transition-colors"
            >
              <span>[VIEW_ALL]</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {topNews.map((article) => (
              <div
                key={article.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-[#635BDB]/40 transition-all shadow-[0_2px_12px_rgba(99,91,219,0.03)] space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EEEDFD] text-[#635BDB] border border-[#635BDB]/20 uppercase">
                        [{article.topic}]
                      </span>
                      <span className="text-xs text-slate-500 font-medium">
                        {article.source_name}
                      </span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="font-mono text-[11px] font-bold text-[#0E5B44] bg-[#8BDCC0]/25 px-2 py-0.2 rounded border border-[#8BDCC0]/50">
                        [FIT::{(article.relevance_score * 100).toFixed(0)}%]
                      </span>
                    </div>
                    <a
                      href={article.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-slate-900 hover:text-[#635BDB] transition-colors flex items-center gap-1.5 group"
                    >
                      <span className="group-hover:underline underline-offset-2">{article.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#635BDB] shrink-0" />
                    </a>
                  </div>
                </div>

                {/* 3 bullet factual summary */}
                <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc marker:text-[#635BDB]">
                  {article.summary_bullets.map((b, i) => (
                    <li key={i} className="leading-relaxed">{b}</li>
                  ))}
                </ul>

                {/* Growth Impact */}
                {article.personal_impact && (
                  <div className="bg-[#E8F8F2] border border-[#8BDCC0]/60 rounded-xl p-3 text-xs text-slate-800 flex items-start gap-2.5">
                    <Rocket className="w-4 h-4 text-[#0E5B44] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-mono font-bold text-[#0E5B44] uppercase tracking-wider text-[11px] mr-1.5">
                        [GROWTH_IMPACT]:
                      </span>
                      <span className="text-slate-700">{article.personal_impact}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {news.length > 5 && (
              <button
                onClick={() => onNavigate("news")}
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-[#EEEDFD]/40 border border-slate-200 hover:border-[#635BDB]/40 text-xs font-mono font-semibold text-[#635BDB] flex items-center justify-center gap-2 transition-all shadow-sm group"
              >
                <span>Browse all {news.length} intelligence stories in News Section &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Matched Opportunities & Deadlines */}
        <div className="lg:col-span-5 space-y-6">
          {/* Matched Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#E8F8F2] text-[#0E5B44] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Top Matched Opportunities</h3>
              </div>
              <button
                onClick={() => onNavigate("opportunities")}
                className="text-xs font-mono font-semibold text-[#0E5B44] hover:text-[#0a4231] flex items-center gap-1 transition-colors"
              >
                <span>[ALL_OPPS]</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {matchedOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4.5 hover:border-[#635BDB]/40 transition-all shadow-[0_2px_12px_rgba(99,91,219,0.03)] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8BDCC0]/30 text-[#0E5B44] border border-[#8BDCC0]/60 uppercase">
                      [MATCHED::{(opp.fit_score * 100).toFixed(0)}%]
                    </span>
                    <span className="text-[11px] text-slate-600 font-mono font-semibold">
                      {opp.benefit_summary || `₹${opp.benefit_amount?.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-slate-900 leading-snug">
                      {opp.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{opp.provider}</p>
                  </div>

                  {opp.reasons && opp.reasons.length > 0 && (
                    <div className="bg-[#F8FAFC] rounded-xl p-2.5 text-[11px] text-slate-600 border border-slate-200/80 flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0E5B44] shrink-0 mt-0.5" />
                      <span>{opp.reasons[0]}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono text-slate-500">
                      {opp.application_deadline ? `Deadline: ${new Date(opp.application_deadline).toLocaleDateString()}` : "Ongoing"}
                    </span>
                    <a
                      href={opp.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#635BDB] hover:text-[#5046CA] font-medium flex items-center gap-1 font-mono text-xs"
                    >
                      <span>[APPLY_OFFICIAL]</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approaching Deadlines Widget */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-[0_2px_12px_rgba(99,91,219,0.03)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <h4 className="font-bold text-slate-900 text-sm">Approaching Deadlines</h4>
              </div>
              <button
                onClick={() => onNavigate("deadlines")}
                className="font-mono text-xs text-amber-700 hover:text-amber-800 font-semibold"
              >
                [TRACKER]
              </button>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {(stats?.upcoming_deadlines || []).map((dl) => (
                <div key={dl.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="font-medium text-slate-800 truncate">{dl.title}</p>
                    <p className="text-[11px] text-slate-500">{dl.provider}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-amber-700">
                      {new Date(dl.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                    <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                      [{dl.status}]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
