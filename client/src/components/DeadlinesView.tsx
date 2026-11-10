"use client";

import React from "react";
import { Opportunity } from "@/services/api";
import { Clock, ExternalLink } from "lucide-react";

interface DeadlinesViewProps {
  opportunities: Opportunity[];
}

export function DeadlinesView({ opportunities }: DeadlinesViewProps) {
  const withDeadlines = opportunities
    .filter((o) => o.application_deadline)
    .sort(
      (a, b) =>
        new Date(a.application_deadline!).getTime() -
        new Date(b.application_deadline!).getTime()
    );

  const getDaysLeft = (dateStr: string) => {
    const diffMs = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-[#635BDB] bg-[#EEEDFD] px-2 py-0.5 rounded border border-[#635BDB]/20">
            [SCHEDULE::CHRONOLOGICAL]
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Deadline Tracker</h2>
        <p className="text-sm text-slate-600 mt-1">
          Chronological schedule of application cutoffs for scholarships, internships, and grants.
        </p>
      </div>

      <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(99,91,219,0.03)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] text-slate-500 font-mono uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-5 font-bold">// OPPORTUNITY</th>
              <th className="py-3 px-5 font-bold">PROVIDER</th>
              <th className="py-3 px-5 font-bold">CATEGORY</th>
              <th className="py-3 px-5 font-bold">CLOSING DATE</th>
              <th className="py-3 px-5 font-bold">COUNTDOWN</th>
              <th className="py-3 px-5 text-right font-bold">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {withDeadlines.map((opp) => {
              const daysLeft = getDaysLeft(opp.application_deadline!);
              const isUrgent = daysLeft <= 14;

              return (
                <tr key={opp.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 px-5 font-bold text-slate-900 max-w-xs">
                    <p className="truncate">{opp.title}</p>
                    <span className="text-[11px] text-[#635BDB] font-mono font-semibold">
                      {opp.benefit_summary || `₹${opp.benefit_amount?.toLocaleString()}`}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-600 font-medium">{opp.provider}</td>
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#EEEDFD] text-[#635BDB] border border-[#635BDB]/20 uppercase">
                      {opp.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-5 font-mono text-slate-700">
                    {new Date(opp.application_deadline!).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-5">
                    <span
                      className={`inline-flex items-center gap-1 font-mono font-bold px-2.5 py-0.5 rounded-md text-[11px] ${
                        isUrgent
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {daysLeft > 0 ? `${daysLeft}d left` : "Ending today"}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-right font-mono">
                    <a
                      href={opp.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#635BDB] hover:text-[#5046CA] font-bold transition-colors"
                    >
                      <span>[APPLY]</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
