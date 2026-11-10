"use client";

import React, { useState, useEffect } from "react";
import {
  SampleCircular,
  ParsedCircularResponse,
  fetchSampleCirculars,
  analyzeCircular,
} from "@/services/api";
import {
  X,
  FileText,
  Calendar,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Mail,
  Loader2,
} from "lucide-react";

interface CircularIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpportunityCreated?: () => void;
}

export function CircularIntelligenceModal({
  isOpen,
  onClose,
  onOpportunityCreated,
}: CircularIntelligenceModalProps) {
  const [samples, setSamples] = useState<SampleCircular[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string>("");
  const [inputText, setInputText] = useState<string>("");
  const [inputTitle, setInputTitle] = useState<string>("");
  const [inputProvider, setInputProvider] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [parsedResult, setParsedResult] = useState<ParsedCircularResponse | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSampleCirculars()
        .then((data) => {
          setSamples(data);
          if (data.length > 0 && !selectedSampleId) {
            handleSelectSample(data[0]);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSelectSample = (sample: SampleCircular) => {
    setSelectedSampleId(sample.id);
    setInputTitle(sample.title);
    setInputProvider(sample.provider);
    setInputText(sample.text);
    setParsedResult(null);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const res = await analyzeCircular({
        title: inputTitle || "Official Circular",
        provider: inputProvider || "Official Authority",
        text: inputText,
      });
      setParsedResult(res);
      onOpportunityCreated?.();
    } catch (err) {
      console.error("Failed to analyze circular", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EEEDFD] text-[#635BDB] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-[#635BDB]">[DOCUMENT_NLP_ENGINE]</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Document & Circular Intelligence
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic regex and NLP entity extraction for official Indian government circulars.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sample Loaders */}
          <div>
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 block mb-2">
              // SELECT_CURATED_OFFICIAL_CIRCULAR_SAMPLE:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`text-left p-3.5 rounded-xl border text-xs transition-all ${
                    selectedSampleId === s.id
                      ? "bg-[#EEEDFD] border-[#635BDB] text-slate-900 shadow-sm"
                      : "bg-[#F8FAFC] border-slate-200 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="font-bold text-slate-900 line-clamp-1">{s.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 font-mono">{s.provider}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form Textarea */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Circular Title
                </label>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Issuing Provider
                </label>
                <input
                  type="text"
                  value={inputProvider}
                  onChange={(e) => setInputProvider(e.target.value)}
                  className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Official Notification / Circular Text
              </label>
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste scheme notification, guidelines, or circular text here..."
                className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl p-3 text-xs text-slate-900 font-mono focus:outline-none focus:border-[#635BDB] focus:bg-white leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading || !inputText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-[#635BDB]/25 transition-all font-mono"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>[EXTRACTING_CIRCULAR...]</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>[PARSE_&_EXTRACT_ENTITIES]</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Parsed Output Card */}
          {parsedResult && (
            <div className="bg-[#F8FAFC] border border-[#8BDCC0] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0E5B44]" />
                  <span className="font-bold text-sm text-slate-900 font-mono">
                    [EXTRACTED_CIRCULAR_INTELLIGENCE]
                  </span>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#E8F8F2] text-[#0E5B44] border border-[#8BDCC0]/60">
                  [CONFIDENCE::{(parsedResult.confidence_score * 100).toFixed(0)}%]
                </span>
              </div>

              {/* Grid of Key Facts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                    Detected Deadline
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-bold text-amber-700 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{parsedResult.detected_deadline || "Ongoing / Rolling"}</span>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                    Detected Value
                  </span>
                  <span className="font-bold text-[#635BDB] mt-1 block font-mono text-sm">
                    {parsedResult.benefit_summary}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                    Contact Channel
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-700 truncate font-mono">
                    <Mail className="w-3.5 h-3.5 text-[#635BDB] shrink-0" />
                    <span className="truncate">
                      {parsedResult.extracted_entities.emails[0] || "See official portal"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Eligibility Signals */}
              {parsedResult.eligibility_signals.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider block">
                    // ELIGIBILITY_REQUIREMENTS_EXTRACTED:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parsedResult.eligibility_signals.map((sig, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 flex items-start gap-2 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0E5B44] shrink-0 mt-0.5" />
                        <span>{sig}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-[#F8FAFC] flex justify-end font-mono">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 transition-colors"
          >
            [CLOSE]
          </button>
        </div>
      </div>
    </div>
  );
}
