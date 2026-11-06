"use client";

import React, { useState } from "react";
import { Opportunity } from "@/services/api";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  Tag,
} from "lucide-react";

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
}

export function OpportunitiesView({ opportunities }: OpportunitiesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedMatch, setSelectedMatch] = useState<string>("All");

  const categories = [
    { id: "All", label: "All Opportunities" },
    { id: "scholarship", label: "Scholarships" },
    { id: "government_scheme", label: "Government Schemes" },
    { id: "company_offer", label: "Company Offers & Credits" },
    { id: "career", label: "Career & Internships" },
  ];

  const matchOptions = ["All", "MATCHED", "POTENTIALLY_ELIGIBLE"];

  const filtered = opportunities.filter((opp) => {
    const matchesCat =
      selectedCategory === "All" || opp.category === selectedCategory;
    const matchesMatch =
      selectedMatch === "All" || opp.match_status === selectedMatch;
    return matchesCat && matchesMatch;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Opportunity & Benefit Intelligence
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Verified scholarships, government schemes, developer credits, and internships matched against your profile using deterministic rules.
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Match status selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          {matchOptions.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMatch(m)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                selectedMatch === m
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {m === "All" ? "All Matches" : m}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            No opportunities match the selected criteria.
          </div>
        ) : (
          filtered.map((opp) => {
            const isMatched = opp.match_status === "MATCHED";
            const isPotential = opp.match_status === "POTENTIALLY_ELIGIBLE";

            return (
              <div
                key={opp.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
              >
                <div className="space-y-3">
                  {/* Top Bar: Match Pill + Verified Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        isMatched
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60"
                          : isPotential
                          ? "bg-amber-950 text-amber-300 border border-amber-800/60"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {opp.match_status} ({(opp.fit_score * 100).toFixed(0)}%)
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/30 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      Officially Verified
                    </span>
                  </div>

                  {/* Title & Provider */}
                  <div>
                    <h3 className="text-base font-bold text-slate-100 leading-snug">
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      <span>{opp.provider}</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-slate-400">{opp.region}</span>
                    </div>
                  </div>

                  {/* Benefit Summary Box */}
                  <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Estimated Benefit Value
                    </span>
                    <span className="text-sm font-semibold text-emerald-300 font-mono">
                      {opp.benefit_summary || `₹${opp.benefit_amount?.toLocaleString("en-IN")}`}
                    </span>
                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {opp.description}
                    </p>
                  </div>

                  {/* Deterministic Criteria Breakdown */}
                  {opp.reasons && opp.reasons.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                        Eligibility Fit Breakdown
                      </span>
                      {opp.reasons.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-1.5 text-slate-200 bg-slate-800/40 p-2 rounded"
                        >
                          {isMatched ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          )}
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {opp.missing_criteria && opp.missing_criteria.length > 0 && (
                    <div className="bg-amber-950/30 border border-amber-900/40 rounded p-2 text-[11px] text-amber-200/90 flex items-start gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Notice:</strong> {opp.missing_criteria[0]}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {opp.application_deadline
                        ? `Closes ${new Date(opp.application_deadline).toLocaleDateString()}`
                        : "Ongoing"}
                    </span>
                  </div>

                  <a
                    href={opp.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors shadow-sm"
                  >
                    <span>Apply on Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
