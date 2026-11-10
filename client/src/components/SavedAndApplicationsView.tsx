"use client";

import React, { useState } from "react";
import {
  SavedItem,
  ApplicationItem,
  deleteSavedItem,
  updateApplicationStatus,
} from "@/services/api";
import {
  Bookmark,
  ExternalLink,
  Trash2,
  FileText,
  Award,
} from "lucide-react";

interface SavedAndApplicationsViewProps {
  savedItems: SavedItem[];
  applications: ApplicationItem[];
  onRefresh: () => void;
}

export function SavedAndApplicationsView({
  savedItems,
  applications,
  onRefresh,
}: SavedAndApplicationsViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<"applications" | "bookmarks">("applications");

  const handleDeleteSaved = async (id: number) => {
    try {
      await deleteSavedItem(id);
      onRefresh();
    } catch (e) {
      console.error("Failed to delete bookmark", e);
    }
  };

  const handleStatusChange = async (appId: number, newStatus: string) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      onRefresh();
    } catch (e) {
      console.error("Failed to update application status", e);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "awarded":
        return "bg-[#E8F8F2] text-[#0E5B44] border-[#8BDCC0]/60";
      case "applied":
        return "bg-[#EEEDFD] text-[#635BDB] border-[#635BDB]/30";
      case "in_progress":
        return "bg-amber-50 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[#635BDB] bg-[#EEEDFD] px-2 py-0.5 rounded border border-[#635BDB]/20">
              [LIFECYCLE_TRACKER::ACTIVE]
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">Action & Progress Tracking</h2>
          <p className="text-sm text-slate-600 mt-1">
            Track submitted scholarship applications, claimed cloud credits, and saved reading items.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl p-1 text-xs shadow-sm font-mono">
          <button
            onClick={() => setActiveSubTab("applications")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeSubTab === "applications"
                ? "bg-[#635BDB] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveSubTab("bookmarks")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              activeSubTab === "bookmarks"
                ? "bg-[#635BDB] text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Bookmarks ({savedItems.length})
          </button>
        </div>
      </div>

      {/* Subtab 1: Application Tracker */}
      {activeSubTab === "applications" && (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-500 space-y-2 shadow-sm font-mono text-sm">
              <p className="font-bold text-slate-800">[NO_APPLICATIONS_TRACKED]</p>
              <p className="text-xs text-slate-500">
                Browse matched opportunities and click "Track" to monitor submission status and claim verification.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-[#635BDB]/40 transition-all space-y-3.5 shadow-[0_2px_12px_rgba(99,91,219,0.03)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      [{app.status.replace("_", " ")}]
                    </span>
                    <span className="text-[11px] text-[#635BDB] font-mono font-bold">
                      {app.benefit_summary}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {app.opportunity_title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{app.provider}</p>
                  </div>

                  {app.notes && (
                    <div className="bg-[#F8FAFC] rounded-xl p-2.5 text-xs text-slate-600 border border-slate-200/80 font-mono">
                      <span className="text-slate-400 font-bold block text-[10px] uppercase">// NOTES</span>
                      {app.notes}
                    </div>
                  )}

                  {/* Status advance selector & link */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Status:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="bg-[#F1F4FA] border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 focus:outline-none focus:border-[#635BDB] font-mono font-semibold"
                      >
                        <option value="interested">Interested</option>
                        <option value="in_progress">In Progress</option>
                        <option value="applied">Applied</option>
                        <option value="awarded">Awarded / Claimed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <a
                      href={app.official_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#635BDB] hover:text-[#5046CA] font-bold"
                    >
                      <span>[PORTAL]</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Subtab 2: Bookmarks */}
      {activeSubTab === "bookmarks" && (
        <div className="space-y-3">
          {savedItems.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center text-slate-500 shadow-sm font-mono text-sm">
              [NO_BOOKMARKED_RECORDS]
            </div>
          ) : (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#635BDB]/40 transition-colors shadow-[0_2px_12px_rgba(99,91,219,0.03)]"
              >
                <div className="flex items-start gap-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-[#EEEDFD] text-[#635BDB] border border-[#635BDB]/20 flex items-center justify-center shrink-0 mt-0.5">
                    {item.item_type === "opportunity" ? (
                      <Award className="w-4 h-4 text-[#0E5B44]" />
                    ) : (
                      <FileText className="w-4 h-4 text-[#635BDB]" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                        [{item.item_type}]
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">{item.category}</span>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-slate-900 hover:text-[#635BDB] transition-colors text-sm truncate block"
                    >
                      {item.title}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-[#635BDB] rounded-lg hover:bg-[#EEEDFD]/50 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteSaved(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
