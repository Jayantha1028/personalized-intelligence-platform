"use client";

import React from "react";
import { UserProfile, AuthUser } from "@/services/api";
import {
  Search,
  MapPin,
  GraduationCap,
  RefreshCw,
  Bell,
  User,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  Zap,
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

  const isKarnatakaResident = (profile?.state || "").toLowerCase().includes("karnataka");

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search verified news, schemes, scholarships, cloud credits..."
            className="w-full bg-slate-950/70 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3.5">
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1.5 rounded-md hover:bg-slate-800"
            title="Refresh feeds and matches"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>Sync</span>
          </button>
        )}

        {/* Notifications Bell */}
        {onToggleNotifications && (
          <button
            onClick={onToggleNotifications}
            className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-md hover:bg-slate-800"
            title="Alerts and notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            )}
          </button>
        )}

        {/* Guest or Authenticated Menu (Inspired by reference microservices portal) */}
        {profile || authUser ? (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <button
              onClick={onOpenAccountModal}
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-800/80 border border-transparent hover:border-slate-700/80 transition text-left group"
              title="Click to view Account Details & Switch Persona"
            >
              <div className="text-right hidden sm:block">
                <div className="flex items-center justify-end gap-1.5">
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                    {displayName}
                  </p>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                    {role}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-500" />
                    {profile?.state || "Karnataka"}
                  </span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <GraduationCap className="w-3 h-3 text-slate-500" />
                    Yr {profile?.academic_year || 3} {profile?.course_or_degree?.split(" ")[0]}
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center ring-2 ring-cyan-500/30 shadow-md shadow-cyan-500/20">
                  {initials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <button
              onClick={() => onOpenAuthModal?.("signin")}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              Sign In
            </button>
            <button
              onClick={() => onOpenAuthModal?.("register")}
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition shadow-sm shadow-cyan-500/25"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
