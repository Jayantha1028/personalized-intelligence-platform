"use client";

import React from "react";
import {
  LayoutDashboard,
  Newspaper,
  Award,
  Calendar,
  UserCheck,
  Radio,
  ShieldCheck,
  Sparkles,
  Bookmark,
} from "lucide-react";

export type NavTab = "overview" | "news" | "opportunities" | "deadlines" | "saved" | "profile" | "sources";

interface SidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  matchedCount?: number;
  deadlinesCount?: number;
  savedCount?: number;
}

export function Sidebar({ currentTab, onTabChange, matchedCount = 0, deadlinesCount = 0, savedCount = 0 }: SidebarProps) {
  const navItems: { id: NavTab; label: string; icon: any; badge?: number; section?: string }[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "news", label: "News Intelligence", icon: Newspaper, section: "ENGINES" },
    { id: "opportunities", label: "Opportunities & Benefits", icon: Award, badge: matchedCount },
    { id: "deadlines", label: "Deadline Tracker", icon: Calendar, badge: deadlinesCount, section: "MANAGEMENT" },
    { id: "saved", label: "Applications & Saved", icon: Bookmark, badge: savedCount },
    { id: "profile", label: "Profile & Eligibility", icon: UserCheck },
    { id: "sources", label: "Source Health", icon: Radio },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none min-h-screen text-slate-200">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-white leading-none">Antigravity</h1>
              <p className="text-[11px] text-slate-400 font-medium mt-1">Intelligence & Opportunities</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item, idx) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <p className="px-3 pt-4 pb-1.5 text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                    {item.section}
                  </p>
                )}
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-indigo-950 text-indigo-400 border border-indigo-800/60"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Deterministic Engine Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Grounded official evidence &middot; Zero hallucinated rules
          </p>
        </div>
      </div>
    </aside>
  );
}
