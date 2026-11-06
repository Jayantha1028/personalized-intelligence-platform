"use client";

import React, { useState, useEffect } from "react";
import {
  StudentRecord,
  fetchAcademicRecords,
  syncAcademicRecord,
  UserProfile,
} from "@/services/api";
import {
  GraduationCap,
  CheckCircle2,
  Building2,
  UserCheck,
  Loader2,
  Sparkles,
  Award,
} from "lucide-react";

interface AcademicSimulatorWidgetProps {
  currentProfile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
}

export function AcademicSimulatorWidget({
  currentProfile,
  onProfileUpdated,
}: AcademicSimulatorWidgetProps) {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchAcademicRecords()
      .then((res) => {
        setStudents(res.students);
        if (res.students.length > 0) {
          setSelectedStudentId(res.students[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSync = async () => {
    if (!selectedStudentId) return;
    setSyncing(true);
    setSyncSuccessMessage(null);
    try {
      const res = await syncAcademicRecord(selectedStudentId);
      setSyncSuccessMessage(res.message);

      // Re-trigger profile update callback so the entire platform syncs
      onProfileUpdated({
        ...currentProfile,
        course_or_degree: res.updated_profile.course_or_degree,
        academic_year: res.updated_profile.academic_year,
        preferences: {
          ...currentProfile.preferences,
          ...res.updated_profile,
        },
      });

      setTimeout(() => setSyncSuccessMessage(null), 5000);
    } catch (err) {
      console.error("Failed to sync academic record", err);
    } finally {
      setSyncing(false);
    }
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const verifiedId = currentProfile.preferences?.verified_student_id;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-snug">
              Academic Records Verification Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Simulates university SIS integration via institutional datasets to deterministically prove student CGPA and branch eligibility.
            </p>
          </div>
        </div>

        {verifiedId && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified (Student #{verifiedId})
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-xs text-slate-400 flex items-center gap-2 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Loading institutional student registry...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Simulated Student Record:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {students.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedStudentId === s.id
                      ? "bg-indigo-950/70 border-indigo-500 text-white shadow-md shadow-indigo-600/20"
                      : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold text-slate-200">
                    <span>{s.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{s.cgpa} CGPA</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>{s.specialization} &bull; {s.class}</span>
                    <span>{s.attendance}% Attd</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs space-y-1">
                <span className="text-slate-400">Verified Attributes to Sync:</span>
                <p className="font-semibold text-slate-200">
                  {selectedStudent.name} &bull; {selectedStudent.class} ({selectedStudent.specialization})
                </p>
                <p className="text-slate-400 text-[11px]">
                  Assigned Faculty Mentor: {selectedStudent.mentor}
                </p>
              </div>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-indigo-600/30 transition-all shrink-0"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Syncing & Re-scoring...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Sync with My Profile</span>
                  </>
                )}
              </button>
            </div>
          )}

          {syncSuccessMessage && (
            <div className="bg-emerald-950/50 border border-emerald-900/60 rounded-xl p-3 text-xs text-emerald-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{syncSuccessMessage} All scholarship & scheme matches have been dynamically updated!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
