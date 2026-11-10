"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  Copy,
  Check,
  Download,
  FileText,
  Mail,
  CheckSquare,
  Lightbulb,
  Loader2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import {
  Opportunity,
  ApplicationKitResponse,
  draftApplication,
} from "@/services/api";

interface ApplicationKitModalProps {
  opportunity: Opportunity;
  onClose: () => void;
}

type TabType = "sop" | "email" | "checklist" | "tips";
type ToneType = "academic" | "professional" | "startup";

export function ApplicationKitModal({ opportunity, onClose }: ApplicationKitModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("sop");
  const [tone, setTone] = useState<ToneType>("academic");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [kit, setKit] = useState<ApplicationKitResponse | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const loadDraft = async (selectedTone: ToneType) => {
    setLoading(true);
    setError(null);
    try {
      const data = await draftApplication(opportunity.id, selectedTone);
      setKit(data);
    } catch (err: any) {
      setError(err.message || "Failed to draft application kit.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDraft(tone);
  }, [opportunity.id, tone]);

  const handleCopy = (text: string, section: string) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2500);
    }
  };

  const handleDownloadMarkdown = () => {
    if (!kit) return;
    const content = `# Application Kit: ${kit.opportunity_title}
**Provider:** ${kit.provider}
**Applicant:** ${kit.applicant_name}
**Tone:** ${kit.tone.toUpperCase()}
**Generated:** ${new Date(kit.generated_at).toLocaleString()}

---

## 1. Statement of Purpose & Motivation Letter
\`\`\`
${kit.statement_of_purpose}
\`\`\`

---

## 2. Cold Outreach Email
**Subject:** ${kit.cold_email_subject}

${kit.cold_email_pitch}

---

## 3. Prerequisite & Document Checklist
${kit.application_checklist.map((item, idx) => `- [ ] ${item}`).join("\n")}

---

## 4. Strategic Advice
${kit.strategic_tips.map((tip) => `• ${tip}`).join("\n")}
`;

    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application-kit-${opportunity.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F7F8FC] border border-slate-300 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#635BDB]/10 border border-[#635BDB]/20 flex items-center justify-center text-[#635BDB]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#635BDB]/10 text-[#635BDB] font-semibold border border-[#635BDB]/20">
                  [AI_APPLICATION_KIT::GENERATOR]
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Target: {opportunity.provider}
                </span>
              </div>
              <h2 className="text-base font-bold text-slate-900 truncate max-w-xl">
                {opportunity.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Selector & Tab Navigation Bar */}
        <div className="bg-white/80 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Tone Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">Tone:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              {(["academic", "professional", "startup"] as ToneType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-3 py-1 rounded-md capitalize transition font-medium ${
                    tone === t
                      ? "bg-white text-[#635BDB] shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Action Tabs */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab("sop")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "sop"
                  ? "bg-[#635BDB] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Statement of Purpose</span>
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "email"
                  ? "bg-[#635BDB] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Cold Email Pitch</span>
            </button>
            <button
              onClick={() => setActiveTab("checklist")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "checklist"
                  ? "bg-[#635BDB] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Checklist</span>
            </button>
            <button
              onClick={() => setActiveTab("tips")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === "tips"
                  ? "bg-[#635BDB] text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Strategy Tips</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 font-sans">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
              <Loader2 className="w-8 h-8 text-[#635BDB] animate-spin" />
              <p className="text-sm font-medium text-slate-700">
                Crafting customized {tone} application kit...
              </p>
              <p className="text-xs text-slate-500 font-mono">
                Matching student profile attributes with {opportunity.provider}&apos;s eligibility rules
              </p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-center space-y-2">
              <ShieldAlert className="w-6 h-6 text-rose-600 mx-auto" />
              <p className="text-sm font-bold text-rose-800">{error}</p>
              <button
                onClick={() => loadDraft(tone)}
                className="text-xs text-[#635BDB] underline"
              >
                Retry Generation
              </button>
            </div>
          ) : kit ? (
            <div className="space-y-4">
              {/* TAB 1: SOP */}
              {activeTab === "sop" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">
                      Tailored Motivation Dossier ({kit.tone.toUpperCase()} TONE)
                    </span>
                    <button
                      onClick={() => handleCopy(kit.statement_of_purpose, "sop")}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
                    >
                      {copiedSection === "sop" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Statement</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap selection:bg-[#635BDB]/20 selection:text-[#635BDB]">
                    {kit.statement_of_purpose}
                  </div>
                </div>
              )}

              {/* TAB 2: COLD EMAIL */}
              {activeTab === "email" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">
                      Coordinator / Faculty Outreach Email
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          `Subject: ${kit.cold_email_subject}\n\n${kit.cold_email_pitch}`,
                          "email"
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
                    >
                      {copiedSection === "email" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          <span>Copy Complete Email</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 flex items-center justify-between">
                    <span>
                      <strong className="text-slate-900">Subject:</strong> {kit.cold_email_subject}
                    </span>
                    <button
                      onClick={() => handleCopy(kit.cold_email_subject, "subject")}
                      className="text-[#635BDB] hover:underline text-[11px]"
                    >
                      {copiedSection === "subject" ? "Copied" : "Copy Subject"}
                    </button>
                  </div>

                  <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-wrap">
                    {kit.cold_email_pitch}
                  </div>
                </div>
              )}

              {/* TAB 3: CHECKLIST */}
              {activeTab === "checklist" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">
                      Required Documents & Eligibility Gateways
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      {Object.values(checkedItems).filter(Boolean).length} of{" "}
                      {kit.application_checklist.length} ready
                    </span>
                  </div>

                  <div className="space-y-2">
                    {kit.application_checklist.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => toggleCheck(idx)}
                        className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer ${
                          checkedItems[idx]
                            ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                            : "bg-white border-slate-200 text-slate-800 hover:border-slate-300"
                        }`}
                      >
                        <div className="mt-0.5">
                          <input
                            type="checkbox"
                            checked={!!checkedItems[idx]}
                            onChange={() => toggleCheck(idx)}
                            className="rounded border-slate-300 text-[#635BDB] focus:ring-[#635BDB]"
                          />
                        </div>
                        <span className={`text-xs ${checkedItems[idx] ? "line-through opacity-80" : ""}`}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: TIPS */}
              {activeTab === "tips" && (
                <div className="space-y-3">
                  <span className="text-xs font-mono text-slate-500">
                    Tactical Strategy & Application Timing
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {kit.strategic_tips.map((tip, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2"
                      >
                        <div className="flex items-center gap-2 text-[#635BDB]">
                          <Lightbulb className="w-4 h-4" />
                          <span className="font-mono text-xs font-bold uppercase">
                            Strategy Note #{idx + 1}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href={opportunity.official_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#635BDB] font-medium transition"
            >
              <span>Official Submission Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadMarkdown}
              disabled={!kit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download (.MD)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
