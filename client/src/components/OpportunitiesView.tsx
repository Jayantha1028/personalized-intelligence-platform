"use client";

import React, { useState } from "react";
import { Opportunity, trackApplication } from "@/services/api";
import { CircularIntelligenceModal } from "@/components/CircularIntelligenceModal";
import {
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building,
  ListChecks,
  FileText,
} from "lucide-react";

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  onRefresh?: () => void;
}

export function OpportunitiesView({ opportunities, onRefresh }: OpportunitiesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedMatch, setSelectedMatch] = useState<string>("All");
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [circularModalOpen, setCircularModalOpen] = useState<boolean>(false);

  const handleTrack = async (oppId: number) => {
    if (trackedIds.has(oppId) || trackingId === oppId) return;
    setTrackingId(oppId);
    try {
      await trackApplication(oppId, "interested");
      setTrackedIds((prev) => new Set(prev).add(oppId));
      onRefresh?.();
    } catch (err) {
      console.error("Failed to track application", err);
    } finally {
      setTrackingId(null);
    }
  };

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[#635BDB] bg-[#EEEDFD] px-2 py-0.5 rounded border border-[#635BDB]/20">
              [DETERMINISTIC_RULES::GROUNDED]
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Opportunity & Benefit Intelligence
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Verified scholarships, Karnataka state grants, cloud developer packs, and research fellowships matched against your profile.
          </p>
        </div>

        <button
          onClick={() => setCircularModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#EEEDFD]/50 border border-slate-200 hover:border-[#635BDB]/40 text-[#635BDB] font-mono font-semibold text-xs shadow-sm transition-all shrink-0"
        >
          <FileText className="w-4 h-4 text-[#635BDB]" />
          <span>[ANALYZE_CIRCULAR]</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? "bg-[#635BDB] text-white shadow-sm shadow-[#635BDB]/25 font-bold"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Match status selector */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-sm font-mono">
          {matchOptions.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMatch(m)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                selectedMatch === m
                  ? "bg-[#635BDB] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {m === "All" ? "All" : m === "MATCHED" ? "[MATCHED]" : "[POTENTIAL]"}
            </button>
          ))}
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-2 bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-500 shadow-sm font-mono text-sm">
            [NO_MATCHING_RECORDS_FOUND]
          </div>
        ) : (
          filtered.map((opp) => {
            const isMatched = opp.match_status === "MATCHED";
            const isPotential = opp.match_status === "POTENTIALLY_ELIGIBLE";

            return (
              <div
                key={opp.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-[#635BDB]/50 transition-all flex flex-col justify-between space-y-4 shadow-[0_2px_12px_rgba(99,91,219,0.03)]"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Match Pill + Verified Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${
                        isMatched
                          ? "bg-[#8BDCC0]/30 text-[#0E5B44] border border-[#8BDCC0]/60"
                          : isPotential
                          ? "bg-amber-50 text-amber-800 border border-amber-300"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      [{opp.match_status}::{(opp.fit_score * 100).toFixed(0)}%]
                    </span>

                    <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-[#0E5B44] bg-[#8BDCC0]/25 border border-[#8BDCC0]/50 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#0E5B44]" />
                      [VERIFIED]
                    </span>
                  </div>

                  {/* Title & Provider */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {opp.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{opp.provider}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-slate-500 font-mono">{opp.region}</span>
                    </div>
                  </div>

                  {/* Benefit Summary Box */}
                  <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-3.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Estimated Benefit Value
                    </span>
                    <span className="text-base font-bold text-[#635BDB] font-mono">
                      {opp.benefit_summary || `₹${opp.benefit_amount?.toLocaleString("en-IN")}`}
                    </span>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {opp.description}
                    </p>
                  </div>

                  {/* Deterministic Criteria Breakdown */}
                  {opp.reasons && opp.reasons.length > 0 && (
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                        // ELIGIBILITY_FIT_VERIFICATION
                      </span>
                      {opp.reasons.map((r, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-slate-700 bg-[#F1F4FA] p-2.5 rounded-xl border border-slate-200/60"
                        >
                          {isMatched ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#0E5B44] shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          )}
                          <span className="leading-relaxed">{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {opp.missing_criteria && opp.missing_criteria.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-[11px] text-amber-800 flex items-start gap-2 font-mono">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>[NOTICE]: {opp.missing_criteria[0]}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>
                      {opp.application_deadline
                        ? `Closes ${new Date(opp.application_deadline).toLocaleDateString()}`
                        : "Ongoing"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleTrack(opp.id)}
                      disabled={trackedIds.has(opp.id) || trackingId === opp.id}
                      title={trackedIds.has(opp.id) ? "Already tracking" : "Track this application"}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-colors text-xs ${
                        trackedIds.has(opp.id)
                          ? "bg-[#E8F8F2] text-[#0E5B44] border border-[#8BDCC0]/60 cursor-default"
                          : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-sm"
                      }`}
                    >
                      <ListChecks className="w-3.5 h-3.5" />
                      <span>{trackedIds.has(opp.id) ? "[TRACKING]" : "[TRACK]"}</span>
                    </button>

                    <a
                      href={opp.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] text-white font-bold transition-colors shadow-sm shadow-[#635BDB]/25 text-xs font-mono"
                    >
                      <span>[APPLY_OFFICIAL]</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Circular Intelligence Modal */}
      <CircularIntelligenceModal
        isOpen={circularModalOpen}
        onClose={() => setCircularModalOpen(false)}
        onOpportunityCreated={onRefresh}
      />
    </div>
  );
}
