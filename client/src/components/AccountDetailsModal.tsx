"use client";

import React from "react";
import {
  X,
  User,
  ShieldCheck,
  MapPin,
  GraduationCap,
  Mail,
  Phone,
  KeyRound,
  LogOut,
  Edit3,
  RefreshCw,
  Zap,
} from "lucide-react";
import { UserProfile, AuthUser, logoutUser } from "@/services/api";

interface AccountDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  authUser: AuthUser | null;
  onNavigateToProfile: () => void;
  onOpenSwitchAccount: () => void;
  onSignOut: () => void;
}

export function AccountDetailsModal({
  isOpen,
  onClose,
  profile,
  authUser,
  onNavigateToProfile,
  onOpenSwitchAccount,
  onSignOut,
}: AccountDetailsModalProps) {
  if (!isOpen) return null;

  const fullName = profile?.full_name || authUser?.full_name || "Alex Sharma";
  const email = profile?.email || authUser?.email || "alex.sharma@example.in";
  const role = profile?.role || authUser?.role || "STUDENT";
  const phone = profile?.phone || "+91 98860 12345";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    logoutUser();
    onSignOut();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Avatar & Header */}
        <div className="text-center pt-2 pb-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-cyan-400 text-slate-950 font-black text-xl flex items-center justify-center shadow-lg shadow-cyan-500/25 mx-auto ring-4 ring-slate-800">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-slate-900"></span>
          </div>

          <h3 className="text-lg font-bold text-slate-100 mt-3">{fullName}</h3>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400">
              {role}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              {profile?.state || "Karnataka"}, {profile?.country || "India"}
            </span>
          </div>
        </div>

        {/* Detailed Account Card (Inspired by reference microservices portal) */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-3 text-xs mb-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email
            </span>
            <span className="font-mono font-medium text-slate-200">{email}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" /> Contact Phone
            </span>
            <span className="font-medium text-slate-200">{phone || "Not configured"}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" /> Degree / Track
            </span>
            <span className="font-medium text-slate-200 text-right truncate max-w-[200px]">
              {profile?.course_or_degree || "B.Tech Computer Science"}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Account Status
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Verified Profile
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" /> Session Security
            </span>
            <span className="font-mono text-[11px] text-cyan-300">256-Bit HS256 Token</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onNavigateToProfile();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Full Profile & Criteria</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onOpenSwitchAccount();
              }}
              className="py-2 px-3 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white transition text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Switch Demo Persona</span>
            </button>

            <button
              onClick={handleLogout}
              className="py-2 px-3 rounded-xl border border-rose-900/60 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 transition text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
