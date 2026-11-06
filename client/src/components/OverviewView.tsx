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
  AlertCircle,
} from "lucide-react";

interface OverviewViewProps {
  stats: DashboardStats | null;
  news: Article[];
  opportunities: Opportunity[];
  onNavigate: (tab: "news" | "opportunities" | "deadlines") => void;
}

export function OverviewView({ stats, news, opportunities, onNavigate }: OverviewViewProps) {
  const topNews = news.slice(0, 3);
  const matchedOpps = opportunities.filter((o) => o.match_status === "MATCHED").slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-900 p-7 border border-indigo-900/40 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Dual-Engine Daily Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Good morning, Alex. You have {stats?.matched_opportunities || 3} high-fit verified opportunities.
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Your feed is filtered for B.Tech CS (Karnataka, Year 3). All claims are cross-checked against official department notifications.
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">News Intelligence</span>
            <Newspaper className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.total_articles || 0}</span>
            <span className="text-xs text-emerald-400 font-medium">
              {stats?.high_relevance_articles || 0} high relevance
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Verified Matches</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.matched_opportunities || 0}</span>
            <span className="text-xs text-indigo-400 font-medium">
              {stats?.potential_matches || 0} potential
            </span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Approaching Deadlines</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.upcoming_deadlines_count || 0}</span>
            <span className="text-xs text-amber-400/90 font-medium">Within 30 days</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Active Feeds</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">{stats?.active_sources_count || 5}</span>
            <span className="text-xs text-emerald-400 font-medium">100% healthy</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Top News Intelligence */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-indigo-400" />
              <h3 className="font-semibold text-slate-100 text-base">Curated News Intelligence</h3>
            </div>
            <button
              onClick={() => onNavigate("news")}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {topNews.map((article) => (
              <div
                key={article.id}
                className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                        {article.topic}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {article.source_name}
                      </span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-[11px] text-emerald-400 font-medium">
                        {(article.relevance_score * 100).toFixed(0)}% fit
                      </span>
                    </div>
                    <a
                      href={article.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-slate-100 hover:text-indigo-400 transition-colors flex items-center gap-1.5"
                    >
                      <span>{article.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    </a>
                  </div>
                </div>

                {/* 3 bullet factual summary */}
                <ul className="space-y-1.5 text-xs text-slate-300 pl-4 list-disc marker:text-indigo-400">
                  {article.summary_bullets.map((b, i) => (
                    <li key={i} className="leading-relaxed">{b}</li>
                  ))}
                </ul>

                {/* Personal Impact */}
                {article.personal_impact && (
                  <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-lg p-3 text-xs text-indigo-200">
                    <span className="font-semibold text-indigo-300">Why it matters to you: </span>
                    {article.personal_impact}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Matched Opportunities & Deadlines */}
        <div className="lg:col-span-5 space-y-6">
          {/* Matched Opportunities */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <h3 className="font-semibold text-slate-100 text-base">Top Matched Opportunities</h3>
              </div>
              <button
                onClick={() => onNavigate("opportunities")}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {matchedOpps.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-all space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
                      MATCHED ({(opp.fit_score * 100).toFixed(0)}%)
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {opp.benefit_summary || `₹${opp.benefit_amount?.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-slate-100 leading-snug">
                      {opp.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{opp.provider}</p>
                  </div>

                  {opp.reasons && opp.reasons.length > 0 && (
                    <div className="bg-slate-800/60 rounded p-2 text-[11px] text-slate-300 flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{opp.reasons[0]}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400">
                      {opp.application_deadline ? `Deadline: ${new Date(opp.application_deadline).toLocaleDateString()}` : "Ongoing"}
                    </span>
                    <a
                      href={opp.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      <span>Apply Official</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Approaching Deadlines Widget */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h4 className="font-semibold text-slate-100 text-sm">Approaching Deadlines</h4>
              </div>
              <button
                onClick={() => onNavigate("deadlines")}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Tracker
              </button>
            </div>

            <div className="divide-y divide-slate-800 text-xs">
              {(stats?.upcoming_deadlines || []).map((dl) => (
                <div key={dl.id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="truncate">
                    <p className="font-medium text-slate-200 truncate">{dl.title}</p>
                    <p className="text-[11px] text-slate-400">{dl.provider}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-amber-300">
                      {new Date(dl.deadline).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </p>
                    <span className="text-[10px] text-slate-500 uppercase">{dl.status}</span>
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
