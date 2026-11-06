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
  ArrowRight,
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">
                Document & Circular Intelligence
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Deterministic regex and NLP stream parsing for official Indian government circulars and scheme notices.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Sample Loaders */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              Select Curated Official Circular Sample:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {samples.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(s)}
                  className={`text-left p-3 rounded-xl border text-xs transition-all ${
                    selectedSampleId === s.id
                      ? "bg-indigo-950/60 border-indigo-500/80 text-white shadow-sm"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <p className="font-semibold text-slate-200 line-clamp-1">{s.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{s.provider}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Form Textarea */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Circular Title
                </label>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">
                  Issuing Provider
                </label>
                <input
                  type="text"
                  value={inputProvider}
                  onChange={(e) => setInputProvider(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">
                Official Notification / Circular Text
              </label>
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste scheme notification, guidelines, or circular text here..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAnalyze}
                disabled={loading || !inputText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium text-xs shadow-lg shadow-indigo-600/30 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting Circular Intelligence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Parse & Extract Entities</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Parsed Output Card */}
          {parsedResult && (
            <div className="bg-slate-950 border border-emerald-900/60 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-slate-100">
                    Extracted Circular Intelligence
                  </span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  {(parsedResult.confidence_score * 100).toFixed(0)}% Entity Confidence
                </span>
              </div>

              {/* Grid of Key Facts */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Detected Deadline
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold text-amber-300">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{parsedResult.detected_deadline || "Ongoing / Rolling"}</span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Detected Grant Value
                  </span>
                  <span className="font-semibold text-emerald-400 mt-1 block">
                    {parsedResult.benefit_summary}
                  </span>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                    Contact Email
                  </span>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-300 truncate">
                    <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {parsedResult.extracted_entities.emails[0] || "See official portal"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Eligibility Signals */}
              {parsedResult.eligibility_signals.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Deterministic Eligibility Requirements Detected:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {parsedResult.eligibility_signals.map((sig, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 flex items-start gap-2"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
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
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
