"use client";

import React from "react";
import { UserProfile, AuthUser } from "@/services/api";
import {
  Search,
  MapPin,
  GraduationCap,
  RefreshCw,
  Bell,
  ChevronDown,
  Terminal,
} from "lucide-react";

interface HeaderProps {
  profile?: UserProfile | null;
  authUser?: AuthUser | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  unreadNotificationsCount?: number;
  onToggleNotifications?: () => void;
  onOpenAuthModal?: (tab?: "signin" | "register") => void;
  onOpenAccountModal?: () => void;
}

export function Header({
  profile,
  authUser,
  onRefresh,
  isRefreshing = false,
  unreadNotificationsCount = 0,
  onToggleNotifications,
  onOpenAuthModal,
  onOpenAccountModal,
}: HeaderProps) {
  const displayName = profile?.full_name || authUser?.full_name || "Alex Sharma";
  const role = profile?.role || authUser?.role || "STUDENT";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20 shadow-[0_1px_8px_rgba(99,91,219,0.03)]">
      {/* Search Bar with Terminal Cue */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono text-[10px] text-[#635BDB] font-semibold">&gt;</span>
          </div>
          <input
            type="text"
            placeholder="Search verified news, schemes, scholarships, cloud credits..."
            className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#635BDB] focus:bg-white focus:ring-2 focus:ring-[#635BDB]/10 transition-all font-sans"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-600 hover:text-[#635BDB] transition-colors px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#635BDB]/30 bg-white hover:bg-[#EEEDFD]/50 shadow-sm"
            title="Refresh feeds and matches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#635BDB]" : "text-slate-500"}`} />
            <span>[SYNC]</span>
          </button>
        )}

        {/* Notifications Bell */}
        {onToggleNotifications && (
          <button
            onClick={onToggleNotifications}
            className="relative p-2 text-slate-500 hover:text-[#635BDB] transition-colors rounded-xl border border-slate-200 hover:border-[#635BDB]/30 bg-white shadow-sm"
            title="Alerts and notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8BDCC0] ring-2 ring-white animate-pulse"></span>
            )}
          </button>
        )}

        {/* Guest or Authenticated Menu */}
        {profile || authUser ? (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <button
              onClick={onOpenAccountModal}
              className="flex items-center gap-3 p-1.5 px-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-slate-200 hover:border-[#635BDB]/40 transition text-left group shadow-sm"
              title="Click to view Account Details & Switch Persona"
            >
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-xs font-semibold text-slate-800 group-hover:text-[#635BDB] transition-colors">
                    {displayName}
                  </p>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#EEEDFD] border border-[#635BDB]/30 text-[#635BDB]">
                    {role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#635BDB]" />
                    {profile?.state || "Karnataka"}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <GraduationCap className="w-3 h-3 text-slate-400" />
                    Yr {profile?.academic_year || 3} {profile?.course_or_degree?.split(" ")[0]}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-[#635BDB] text-white font-mono font-bold text-xs flex items-center justify-center ring-2 ring-[#635BDB]/20 shadow-sm shadow-[#635BDB]/20">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#8BDCC0] ring-2 ring-white"></span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#635BDB] transition" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <button
              onClick={() => onOpenAuthModal?.("signin")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#F1F4FA] transition"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuthModal?.("register")}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#635BDB] hover:bg-[#5046CA] text-white transition shadow-sm shadow-[#635BDB]/30"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
