"use client";

import React from "react";
import { UserProfile } from "@/services/api";
import { Search, MapPin, GraduationCap, RefreshCw } from "lucide-react";

interface HeaderProps {
  profile?: UserProfile | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ profile, onRefresh, isRefreshing = false }: HeaderProps) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search verified news, schemes, scholarships, cloud credits..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1.5 rounded-md hover:bg-slate-800"
            title="Refresh feeds and matches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
            <span>Sync</span>
          </button>
        )}

        {/* Profile Pill */}
        {profile ? (
          <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-200">Alex Sharma</p>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" />
                  {profile.state || "Karnataka"}, {profile.country}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-indigo-400">
                  <GraduationCap className="w-3 h-3" />
                  Year {profile.academic_year || 3} {profile.course_or_degree?.split(" ")[0]}
                </span>
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-xs ring-2 ring-indigo-500/30">
              AS
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400">Loading user profile...</div>
        )}
      </div>
    </header>
  );
}
