"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, updateProfile, changePassword } from "@/services/api";
import { AcademicSimulatorWidget } from "@/components/AcademicSimulatorWidget";
import {
  UserCheck,
  Save,
  CheckCircle,
  AlertCircle,
  Shield,
  User,
  Mail,
  KeyRound,
  GraduationCap,
} from "lucide-react";

interface ProfileViewProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export function ProfileView({ profile, onProfileUpdated }: ProfileViewProps) {
  const [formData, setFormData] = useState({
    full_name: profile.full_name || "Alex Sharma",
    phone: profile.phone || "+91 98860 12345",
    headline: profile.headline || "3rd Year Computer Science Undergrad @ VTU Bengaluru",
    country: profile.country || "India",
    state: profile.state || "Karnataka",
    education_level: profile.education_level || "undergraduate",
    course_or_degree: profile.course_or_degree || "B.Tech Computer Science",
    academic_year: profile.academic_year || 3,
    annual_income: profile.annual_income || 400000,
    age: profile.age || 21,
    skills: profile.skills ? profile.skills.join(", ") : "Python, Cloud, AI/ML",
  });

  useEffect(() => {
    setFormData({
      full_name: profile.full_name || "Alex Sharma",
      phone: profile.phone || "+91 98860 12345",
      headline: profile.headline || "3rd Year Computer Science Undergrad @ VTU Bengaluru",
      country: profile.country || "India",
      state: profile.state || "Karnataka",
      education_level: profile.education_level || "undergraduate",
      course_or_degree: profile.course_or_degree || "B.Tech Computer Science",
      academic_year: profile.academic_year || 3,
      annual_income: profile.annual_income || 400000,
      age: profile.age || 21,
      skills: profile.skills ? profile.skills.join(", ") : "Python, Cloud, AI/ML",
    });
  }, [profile]);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const skillsArray = formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const updated = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone,
        headline: formData.headline,
        country: formData.country,
        state: formData.state,
        education_level: formData.education_level,
        course_or_degree: formData.course_or_degree,
        academic_year: Number(formData.academic_year),
        annual_income: Number(formData.annual_income),
        age: Number(formData.age),
        skills: skillsArray,
      });

      onProfileUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update profile", err);
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPwd !== confirmPwd) {
      setPwdError("New passwords do not match.");
      return;
    }
    if (newPwd.length < 8) {
      setPwdError("New password must be at least 8 characters long.");
      return;
    }

    setPwdSaving(true);
    setPwdError(null);
    setPwdSuccess(null);
    try {
      await changePassword(currentPwd, newPwd);
      setPwdSuccess("Password updated successfully!");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setTimeout(() => setPwdSuccess(null), 3000);
    } catch (err: any) {
      setPwdError(err.message || "Failed to change password. Verify your current password.");
    } finally {
      setPwdSaving(false);
    }
  };

  const fullName = profile.full_name || formData.full_name;
  const role = profile.role || "STUDENT";
  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-[#635BDB] bg-[#EEEDFD] px-2 py-0.5 rounded border border-[#635BDB]/20">
            [IDENTITY::VERIFIED]
          </span>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-[#635BDB]" />
          User Profile & Opportunity Eligibility
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Manage your personal identity, contact details, and deterministic criteria used to calculate verified scholarships, grants, and fellowship matches.
        </p>
      </div>

      {/* Account Identity Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(99,91,219,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#635BDB] text-white font-mono font-bold text-xl flex items-center justify-center shadow-lg shadow-[#635BDB]/25 ring-4 ring-[#EEEDFD]">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#8BDCC0] ring-2 ring-white"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{fullName}</h3>
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-[#EEEDFD] border border-[#635BDB]/30 text-[#635BDB]">
                  [{role}]
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{profile.headline || formData.headline}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-mono">
                <span className="flex items-center gap-1 text-[11px] text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-[#635BDB]" /> {profile.email || "alex.sharma@example.in"}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1 text-[11px] text-[#0E5B44] font-medium">
                  <Shield className="w-3.5 h-3.5" /> 256-Bit Scrypt Auth Active
                </span>
              </div>
            </div>
          </div>
          <div className="flex sm:flex-col items-end justify-center font-mono">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700">
              User ID #{profile.user_id}
            </span>
          </div>
        </div>
      </div>

      {/* Institutional Academic Verification Simulator */}
      <AcademicSimulatorWidget
        currentProfile={profile}
        onProfileUpdated={onProfileUpdated}
      />

      {/* Profile & Eligibility Form */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(99,91,219,0.03)]">
        <div className="border-b border-slate-100 pb-3 mb-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-[#635BDB]" /> Personal Identity & Contact Information
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Your name and contact info are saved with cryptographic session integrity.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+91 98860 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Professional Bio / Headline
              </label>
              <input
                type="text"
                placeholder="e.g. 3rd Year Computer Science Undergrad @ VTU Bengaluru"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-5 mb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#635BDB]" /> Karnataka Eligibility & Opportunity Match Criteria
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parameters matched against government schemes (KDEM, NSP, MeitY) and international fellowships.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                State / Domicile
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Education Level
              </label>
              <select
                value={formData.education_level}
                onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              >
                <option value="undergraduate">Undergraduate (B.Tech, B.Sc, B.Com)</option>
                <option value="postgraduate">Postgraduate (M.Tech, M.Sc, MBA, PhD)</option>
                <option value="diploma">Polytechnic Diploma</option>
                <option value="school">Higher Secondary (PUC / 12th)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Year
              </label>
              <select
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: Number(e.target.value) })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white font-mono"
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Degree / Specialization
              </label>
              <input
                type="text"
                value={formData.course_or_degree}
                onChange={(e) => setFormData({ ...formData, course_or_degree: e.target.value })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Annual Family Income (₹ INR)
              </label>
              <input
                type="number"
                value={formData.annual_income}
                onChange={(e) => setFormData({ ...formData, annual_income: Number(e.target.value) })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white font-mono"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Evaluates state and national scholarship income ceilings (e.g., SSP ₹2.5L / NSP ₹4.5L).
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Technical Skills & Tools (Comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Shield className="w-4 h-4 text-[#0E5B44]" />
              <span>[EVALUATION::DETERMINISTIC_ENGINE]</span>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs text-[#0E5B44] font-bold font-mono">
                  <CheckCircle className="w-3.5 h-3.5" />
                  [SAVED_&_RECALCULATED]
                </span>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] text-white font-bold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Profile & Update Matches"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Security & Password Management Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(99,91,219,0.03)]">
        <div className="border-b border-slate-100 pb-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#635BDB]" /> Security & Credential Management
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Passwords encrypted with Python scrypt using unique 16-byte random salts.
          </p>
        </div>

        {pwdError && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        {pwdSuccess && (
          <div className="p-3 mb-4 rounded-xl bg-[#E8F8F2] border border-[#8BDCC0]/80 text-xs text-[#0E5B44] flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4 text-[#0E5B44] shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              placeholder="Enter existing password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password (min 8)
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="New password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                placeholder="Confirm password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pwdSaving}
            className="py-2.5 px-4 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] text-white font-bold text-xs transition shadow-sm font-mono"
          >
            {pwdSaving ? "[UPDATING...]" : "[UPDATE_PASSWORD]"}
          </button>
        </form>
      </div>
    </div>
  );
}
