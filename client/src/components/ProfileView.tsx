"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, updateProfile } from "@/services/api";
import { AcademicSimulatorWidget } from "@/components/AcademicSimulatorWidget";
import { UserCheck, Save, CheckCircle, AlertCircle, Shield } from "lucide-react";

interface ProfileViewProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export function ProfileView({ profile, onProfileUpdated }: ProfileViewProps) {
  const [formData, setFormData] = useState({
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

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Eligibility Profile & Criteria
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Your profile parameters are strictly used for client-side and deterministic server-side opportunity matching. No sensitive documents are ever requested or stored.
        </p>
      </div>

      {/* Institutional Academic Verification Simulator */}
      <AcademicSimulatorWidget
        currentProfile={profile}
        onProfileUpdated={onProfileUpdated}
      />

      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                State / Domicile
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Education Level
              </label>
              <select
                value={formData.education_level}
                onChange={(e) => setFormData({ ...formData, education_level: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="undergraduate">Undergraduate (B.Tech, B.Sc, B.Com, etc.)</option>
                <option value="postgraduate">Postgraduate (M.Tech, M.Sc, MBA)</option>
                <option value="diploma">Diploma</option>
                <option value="school">Higher Secondary (11th/12th)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Academic Year
              </label>
              <select
                value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value={1}>Year 1</option>
                <option value={2}>Year 2</option>
                <option value={3}>Year 3</option>
                <option value={4}>Year 4</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Degree / Specialization
              </label>
              <input
                type="text"
                value={formData.course_or_degree}
                onChange={(e) => setFormData({ ...formData, course_or_degree: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Annual Family Income (₹ INR)
              </label>
              <input
                type="number"
                value={formData.annual_income}
                onChange={(e) => setFormData({ ...formData, annual_income: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Used to test scholarship ceiling limits (e.g. NSP ₹4.5L cutoff)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Technical Skills (Comma separated)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Zero Aadhaar, Bank Details, or Passwords Stored</span>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Saved & Recalculated!
                </span>
              )}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Profile & Update Matches"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
