"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Sparkles,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Building2,
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
      setError(err.message || "Sign in failed. Check your credentials.");
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
      setError("Password must be at least 8 characters.");
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
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Tabs */}
        <div className="flex border-b border-slate-200 bg-[#F8FAFC] p-1.5 relative font-mono">
          <button
            type="button"
            onClick={() => {
              setActiveTab("signin");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "signin"
                ? "bg-[#635BDB] text-white shadow-md shadow-[#635BDB]/25"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>[SIGN_IN]</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("register");
              setError(null);
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
              activeTab === "register"
                ? "bg-[#635BDB] text-white shadow-md shadow-[#635BDB]/25"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>[REGISTER]</span>
          </button>
          <button
            onClick={onClose}
            className="absolute right-3.5 top-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#E8F8F2] border border-[#8BDCC0]/80 flex items-center gap-2.5 text-xs text-[#0E5B44] font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0E5B44]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW 1: SIGN IN */}
          {activeTab === "signin" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Welcome to Antigravity
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sign in with cryptographically verified scrypt session credentials.
                </p>
              </div>

              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. alex.sharma@example.in"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Enter account password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#635BDB]/25 transition-all flex items-center justify-center gap-2 font-mono"
                >
                  {loading ? (
                    <span>[AUTHENTICATING...]</span>
                  ) : (
                    <>
                      <span>[SIGN_IN]</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center text-xs text-slate-500 pt-1">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className="text-[#635BDB] hover:text-[#5046CA] font-semibold"
                >
                  Register new account &rarr;
                </button>
              </div>

              {/* Instant Demo Access Divider */}
              <div className="pt-2">
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-3 text-[10px] uppercase tracking-wider text-slate-400 font-bold shrink-0 font-mono">
                    Instant Demo Cockpits
                  </span>
                  <div className="border-t border-slate-200 w-full"></div>
                </div>

                <div className="mt-3 space-y-2">
                  <button
                    type="button"
                    onClick={() => handleDemoAccess("student")}
                    disabled={loading}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:border-[#635BDB]/50 hover:bg-white transition text-left flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EEEDFD] text-[#635BDB] flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#635BDB] transition-colors">
                          Alex Sharma &bull; Demo Student
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Karnataka B.Tech CS &bull; 1-Click Cockpit
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#635BDB] group-hover:translate-x-0.5 transition-transform font-mono">
                      &rarr;
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoAccess("fellow")}
                    disabled={loading}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:border-[#0E5B44]/50 hover:bg-white transition text-left flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#E8F8F2] text-[#0E5B44] flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-[#0E5B44] transition-colors">
                          Ananya Rao &bull; Karnataka Fellow
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          M.Tech AI Researcher &amp; KDEM Grant Lead
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0E5B44] group-hover:translate-x-0.5 transition-transform font-mono">
                      &rarr;
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoAccess("admin")}
                    disabled={loading}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:border-amber-400 hover:bg-white transition text-left flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                          Platform Administrator
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          System Architect &bull; Root Cockpit
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform font-mono">
                      &rarr;
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
                <h3 className="text-base font-bold text-slate-900 tracking-tight">
                  Create Platform Account
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unlock personalized grant eligibility, tech task tracking, and news intelligence.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Hegde"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Role Track
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white font-mono"
                  >
                    <option value="STUDENT">Student / Undergrad</option>
                    <option value="RESEARCHER">Researcher / Postgrad</option>
                    <option value="FOUNDER">Startup Founder</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    State / Region
                  </label>
                  <input
                    type="text"
                    value={regState}
                    onChange={(e) => setRegState(e.target.value)}
                    className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Course or Specialization
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.Tech Computer Science"
                  value={regDegree}
                  onChange={(e) => setRegDegree(e.target.value)}
                  className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Password (min 8)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Create password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Re-enter password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#635BDB]/25 transition-all flex items-center justify-center gap-2 font-mono"
              >
                {loading ? "[CREATING_USER...]" : "[CREATE_ACCOUNT]"}
              </button>

              <div className="text-center text-xs text-slate-500 pt-1">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="text-[#635BDB] hover:text-[#5046CA] font-semibold"
                >
                  Sign in here &rarr;
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
