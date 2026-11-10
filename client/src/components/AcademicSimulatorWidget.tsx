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
  UserCheck,
  Loader2,
  Sparkles,
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
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5 shadow-[0_2px_12px_rgba(99,91,219,0.03)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEEDFD] text-[#635BDB] flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              Academic Records Verification Simulator
            </h3>
            <p className="text-xs text-slate-500">
              Simulates university SIS integration via institutional datasets to deterministically prove student CGPA and branch eligibility.
            </p>
          </div>
        </div>

        {verifiedId && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#E8F8F2] text-[#0E5B44] border border-[#8BDCC0]/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0E5B44]" />
            [VERIFIED::#{verifiedId}]
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-xs text-slate-500 flex items-center gap-2 py-4 font-mono">
          <Loader2 className="w-4 h-4 animate-spin text-[#635BDB]" />
          <span>[FETCHING_STUDENT_REGISTRY...]</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2">
              // SELECT_SIMULATED_STUDENT_RECORD:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {students.slice(0, 6).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudentId(s.id)}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    selectedStudentId === s.id
                      ? "bg-[#EEEDFD] border-[#635BDB] text-slate-900 shadow-sm"
                      : "bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{s.name}</span>
                    <span className="font-mono text-[#0E5B44] bg-[#8BDCC0]/25 px-1.5 py-0.2 rounded border border-[#8BDCC0]/40">
                      {s.cgpa} CGPA
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-mono">
                    <span>{s.specialization} &bull; {s.class}</span>
                    <span>{s.attendance}% Attd</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedStudent && (
            <div className="bg-[#F8FAFC] border border-slate-200/90 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-xs space-y-1">
                <span className="text-slate-400 font-mono text-[10px] uppercase font-bold">// VERIFIED_ATTRIBUTES</span>
                <p className="font-bold text-slate-900">
                  {selectedStudent.name} &bull; {selectedStudent.class} ({selectedStudent.specialization})
                </p>
                <p className="text-slate-500 text-[11px]">
                  Assigned Faculty Mentor: {selectedStudent.mentor}
                </p>
              </div>

              <button
                onClick={handleSync}
                disabled={syncing}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] disabled:opacity-50 text-white font-bold text-xs shadow-sm shadow-[#635BDB]/25 transition-all shrink-0 font-mono"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>[SYNCING...]</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>[SYNC_WITH_PROFILE]</span>
                  </>
                )}
              </button>
            </div>
          )}

          {syncSuccessMessage && (
            <div className="bg-[#E8F8F2] border border-[#8BDCC0]/80 rounded-xl p-3 text-xs text-[#0E5B44] flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-[#0E5B44] shrink-0" />
              <span>{syncSuccessMessage} Matches updated!</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
