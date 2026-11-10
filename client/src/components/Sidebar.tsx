"use client";

import React from "react";
import {
  LayoutDashboard,
  Newspaper,
  Award,
  Calendar,
  UserCheck,
  Radio,
  Sparkles,
  Bookmark,
  CheckSquare,
  Terminal,
} from "lucide-react";

export type NavTab = "overview" | "news" | "opportunities" | "deadlines" | "saved" | "tasks" | "profile" | "sources";

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
    { id: "tasks", label: "Tech Blogs & Tasks", icon: CheckSquare },
    { id: "profile", label: "Profile & Eligibility", icon: UserCheck },
    { id: "sources", label: "Source Health", icon: Radio },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-white/90 backdrop-blur-md border-r border-slate-200/90 flex-col justify-between shrink-0 select-none min-h-screen text-slate-700 shadow-[2px_0_12px_rgba(99,91,219,0.03)]">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#635BDB] flex items-center justify-center shadow-md shadow-[#635BDB]/30 text-white">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-bold text-base tracking-tight text-slate-900 leading-none">Antigravity</h1>
                <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EEEDFD] text-[#635BDB] border border-[#635BDB]/20">
                  v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Intelligence Cockpit</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            const Icon = item.icon;

            return (
              <React.Fragment key={item.id}>
                {item.section && (
                  <div className="px-3 pt-4 pb-1.5 flex items-center justify-between">
                    <p className="font-mono text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      // {item.section}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#635BDB] text-white shadow-md shadow-[#635BDB]/25 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-[#F1F4FA]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-mono font-semibold ${
                        isActive
                          ? "bg-white/25 text-white"
                          : "bg-[#EEEDFD] text-[#635BDB] border border-[#635BDB]/30"
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

      {/* Footer Info with Terminal-Inspired Details */}
      <div className="p-4 border-t border-slate-200/80">
        <div className="bg-[#F8FAFC] rounded-xl p-3 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[11px] font-bold text-[#0E5B44]">
              <span className="w-2 h-2 rounded-full bg-[#8BDCC0] ring-4 ring-[#8BDCC0]/30 animate-pulse"></span>
              <span>[SYS::ACTIVE]</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">0.04ms</span>
          </div>
          <p className="font-mono text-[11px] text-slate-500 mt-1.5 leading-relaxed">
            Deterministic Engine &bull; Zero Hallucinated Rules
          </p>
        </div>
      </div>
    </aside>
  );
}
