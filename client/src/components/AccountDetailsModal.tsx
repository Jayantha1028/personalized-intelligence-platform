"use client";

import React from "react";
import {
  X,
  ShieldCheck,
  MapPin,
  GraduationCap,
  Mail,
  Phone,
  KeyRound,
  LogOut,
  Edit3,
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
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Avatar & Header */}
        <div className="text-center pt-2 pb-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-2xl bg-[#635BDB] text-white font-mono font-bold text-xl flex items-center justify-center shadow-lg shadow-[#635BDB]/25 mx-auto ring-4 ring-[#EEEDFD]">
              {initials}
            </div>
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#8BDCC0] ring-2 ring-white"></span>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mt-3">{fullName}</h3>
          <div className="flex items-center justify-center gap-2 mt-1 font-mono">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EEEDFD] border border-[#635BDB]/30 text-[#635BDB]">
              [{role}]
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1 font-sans">
              <MapPin className="w-3 h-3 text-[#635BDB]" />
              {profile?.state || "Karnataka"}, {profile?.country || "India"}
            </span>
          </div>
        </div>

        {/* Detailed Account Card */}
        <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4 space-y-3 text-xs mb-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium flex items-center gap-1.5 font-mono">
              <Mail className="w-3.5 h-3.5 text-[#635BDB]" /> Email
            </span>
            <span className="font-mono font-bold text-slate-800">{email}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium flex items-center gap-1.5 font-mono">
              <Phone className="w-3.5 h-3.5 text-[#635BDB]" /> Phone
            </span>
            <span className="font-medium text-slate-700">{phone || "Not configured"}</span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium flex items-center gap-1.5 font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-[#635BDB]" /> Track
            </span>
            <span className="font-medium text-slate-800 text-right truncate max-w-[200px]">
              {profile?.course_or_degree || "B.Tech Computer Science"}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium flex items-center gap-1.5 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0E5B44]" /> Status
            </span>
            <span className="text-[#0E5B44] font-bold flex items-center gap-1 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#8BDCC0] animate-pulse"></span>
              [ACTIVE_VERIFIED]
            </span>
          </div>

          <div className="flex items-center justify-between font-mono">
            <span className="text-slate-500 font-medium flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#635BDB]" /> Security
            </span>
            <span className="text-[11px] text-[#635BDB] font-bold">[SCRYPT_AUTH_VALID]</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={() => {
              onClose();
              onNavigateToProfile();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] text-white font-bold text-xs shadow-md shadow-[#635BDB]/20 transition-all flex items-center justify-center gap-2 font-mono"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>[EDIT_FULL_PROFILE]</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
            <button
              onClick={() => {
                onClose();
                onOpenSwitchAccount();
              }}
              className="py-2 px-3 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 text-slate-700 transition text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Switch Persona</span>
            </button>

            <button
              onClick={handleLogout}
              className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
