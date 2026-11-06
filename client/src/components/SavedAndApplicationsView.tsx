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
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  FileText,
  Award,
  Sparkles,
  ChevronRight,
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
        return "bg-emerald-950 text-emerald-300 border-emerald-800/60";
      case "applied":
        return "bg-indigo-950 text-indigo-300 border-indigo-800/60";
      case "in_progress":
        return "bg-amber-950 text-amber-300 border-amber-800/60";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Action & Progress Tracking</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track submitted scholarship applications, claimed cloud credits, and saved reading items.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveSubTab("applications")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === "applications"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveSubTab("bookmarks")}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              activeSubTab === "bookmarks"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
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
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300">No applications tracked yet</p>
              <p className="text-xs">
                Browse matched opportunities and click "Track Application" to monitor deadlines and claim progress.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all space-y-3.5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                        app.status
                      )}`}
                    >
                      {app.status.replace("_", " ")}
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono font-medium">
                      {app.benefit_summary}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-100 text-base leading-snug">
                      {app.opportunity_title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">{app.provider}</p>
                  </div>

                  {app.notes && (
                    <div className="bg-slate-800/50 rounded-lg p-2.5 text-xs text-slate-300 border border-slate-800">
                      <span className="text-slate-400 font-semibold block text-[10px] uppercase">Notes</span>
                      {app.notes}
                    </div>
                  )}

                  {/* Status advance selector & link */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">Update status:</span>
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500"
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
                      className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      <span>Portal</span>
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
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
              No saved items bookmarked yet.
            </div>
          ) : (
            savedItems.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start gap-3 truncate">
                  <div className="w-8 h-8 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center shrink-0 mt-0.5">
                    {item.item_type === "opportunity" ? (
                      <Award className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <FileText className="w-4 h-4 text-sky-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 uppercase">
                        {item.item_type}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.category}</span>
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-slate-200 hover:text-indigo-400 transition-colors text-sm truncate block"
                    >
                      {item.title}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-slate-400 hover:text-indigo-400 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDeleteSaved(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
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
