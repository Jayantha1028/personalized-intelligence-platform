"use client";

import React from "react";
import { NavTab } from "@/components/Sidebar";
import {
  LayoutDashboard,
  Newspaper,
  Award,
  Calendar,
  User,
} from "lucide-react";

interface MobileBottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  matchesCount?: number;
  deadlinesCount?: number;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
  matchesCount = 0,
  deadlinesCount = 0,
}: MobileBottomNavProps) {
  const tabs = [
    {
      id: "overview" as NavTab,
      label: "Cockpit",
      icon: LayoutDashboard,
    },
    {
      id: "news" as NavTab,
      label: "News",
      icon: Newspaper,
      badge: "25",
    },
    {
      id: "opportunities" as NavTab,
      label: "Opps",
      icon: Award,
      countBadge: matchesCount > 0 ? matchesCount : undefined,
    },
    {
      id: "deadlines" as NavTab,
      label: "Deadlines",
      icon: Calendar,
      countBadge: deadlinesCount > 0 ? deadlinesCount : undefined,
    },
    {
      id: "profile" as NavTab,
      label: "Profile",
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/92 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex items-center justify-around h-15 px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1.5 transition-all duration-150 select-none ${
                isActive
                  ? "text-[#635BDB] font-bold"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? "scale-110" : ""
                  }`}
                />

                {tab.countBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full text-[9px] font-mono font-bold bg-[#635BDB] text-white flex items-center justify-center shadow-xs">
                    {tab.countBadge}
                  </span>
                )}

                {tab.badge && !tab.countBadge && (
                  <span className="absolute -top-1 -right-2 px-1 rounded-full text-[8.5px] font-mono font-bold bg-emerald-500 text-white flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10.5px] tracking-tight mt-1 font-sans">
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#635BDB]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
