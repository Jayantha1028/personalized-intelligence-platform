"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Building2,
  Flame,
  Zap,
} from "lucide-react";
import { loginUser, registerUser, demoLogin, AuthResponse } from "@/services/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: AuthResponse) => void;
  initialTab?: "signin" | "register";
}

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialTab = "signin",
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"signin" | "register">(initialTab);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sign In Form State
  const [loginEmail, setLoginEmail] = useState("alex.sharma@example.in");
  const [loginPassword, setLoginPassword] = useState("StudentPass123!");

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState("STUDENT");
  const [regState, setRegState] = useState("Karnataka");
  const [regDegree, setRegDegree] = useState("B.Tech Computer Science");

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(loginEmail, loginPassword);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (regPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await registerUser({
        full_name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        state: regState,
        course_or_degree: regDegree,
      });
      setSuccessMsg("Account created successfully! Signing you in...");
      setTimeout(() => {
        onSuccess(res);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = async (persona: "student" | "fellow" | "admin") => {
    setLoading(true);
    setError(null);
    try {
      const res = await demoLogin(persona);
      onSuccess(res);
      onClose();
    } catch (err: any) {
      setError(err.message || "Demo sign in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-1.5 relative">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "signin"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              activeTab === "register"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {activeTab === "signin" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 tracking-tight">
                  Welcome to Antigravity
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in with 256-bit cryptographically verified session token.
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex.sharma@example.in"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Enter account password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Authenticating session...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-slate-400 pt-1">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Register new account →
                </button>
              </div>

              {/* Instant Demo Access Divider */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-800 w-full"></div>
                  <span className="bg-slate-900 px-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold shrink-0">
                    Instant Demo Access
                  </span>
                  <div className="border-t border-slate-800 w-full"></div>
                </div>

                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleDemoAccess("student")}
                    disabled={loading}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-cyan-600/60 hover:bg-slate-950 transition text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors">
                          Alex Sharma • Demo Student
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Karnataka B.Tech CS • 1-Click Sign In
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoAccess("fellow")}
                    disabled={loading}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-cyan-600/60 hover:bg-slate-950 transition text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition-colors">
                          Ananya Rao • Karnataka Fellow
                        </div>
                        <div className="text-[10px] text-slate-400">
                          M.Tech AI Researcher & KDEM Grant Lead
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoAccess("admin")}
                    disabled={loading}
                    className="w-full p-2.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:border-amber-600/60 hover:bg-slate-950 transition text-left flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-300 transition-colors">
                          Platform Administrator
                        </div>
                        <div className="text-[10px] text-slate-400">
                          System Architect • Root Access
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                      →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: REGISTER */}
          {activeTab === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 tracking-tight">
                  Create Platform Account
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unlock personalized grant eligibility, tech task tracking, and news intelligence.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Hegde"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Role Track
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="STUDENT">Student / Undergrad</option>
                    <option value="RESEARCHER">Researcher / Postgrad</option>
                    <option value="FOUNDER">Startup Founder</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Course or Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={regDegree}
                  onChange={(e) => setRegDegree(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Password (min 8)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Create password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? "Creating cryptographic user..." : "🚀 Create Account"}
              </button>

              <div className="text-center text-xs text-slate-400 pt-1">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Sign in here →
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
