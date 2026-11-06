"use client";

import React from "react";
import { Opportunity } from "@/services/api";
import { Calendar, Clock, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";

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
        <h2 className="text-xl font-bold text-white tracking-tight">Deadline Tracker</h2>
        <p className="text-sm text-slate-400 mt-1">
          Chronological schedule of application cutoffs for scholarships, internships, and grants.
        </p>
      </div>

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-3 px-4">Opportunity</th>
              <th className="py-3 px-4">Provider</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Closing Date</th>
              <th className="py-3 px-4">Time Left</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {withDeadlines.map((opp) => {
              const daysLeft = getDaysLeft(opp.application_deadline!);
              const isUrgent = daysLeft <= 14;

              return (
                <tr key={opp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-semibold text-slate-100 max-w-xs">
                    <p className="truncate">{opp.title}</p>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {opp.benefit_summary || `₹${opp.benefit_amount?.toLocaleString()}`}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400">{opp.provider}</td>
                  <td className="py-4 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                      {opp.category.replace("_", " ")}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-300">
                    {new Date(opp.application_deadline!).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                        isUrgent
                          ? "bg-rose-950 text-rose-300 border border-rose-800/60"
                          : "bg-amber-950 text-amber-300 border border-amber-800/60"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {daysLeft > 0 ? `${daysLeft} days left` : "Ending today"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <a
                      href={opp.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      <span>Apply</span>
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
