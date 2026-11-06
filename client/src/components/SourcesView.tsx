"use client";

import React from "react";
import { Source } from "@/services/api";
import { Radio, ShieldCheck, CheckCircle2, Clock, ExternalLink } from "lucide-react";

interface SourcesViewProps {
  sources: Source[];
}

export function SourcesView({ sources }: SourcesViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Approved Information Sources & Health
        </h2>
        <p className="text-sm text-slate-400 mt-1">
          Registered and auditable source registry. Every processed item is mapped to one of these verified origins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((src) => (
          <div
            key={src.id}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {src.last_status === "success" ? "Online & Healthy" : src.last_status}
              </span>

              <span className="text-[11px] font-medium text-slate-400">
                Polls every {Math.round(src.fetch_interval_minutes / 60)} hrs
              </span>
            </div>

            <div>
              <h3 className="font-bold text-slate-100 text-sm leading-snug">{src.name}</h3>
              <a
                href={src.base_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-mono mt-1 inline-flex items-center gap-1"
              >
                <span>{src.base_url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] uppercase font-semibold text-slate-300">
                  {src.category.replace("_", " ")}
                </span>
                <span>&bull;</span>
                <span className="capitalize">{src.source_type}</span>
              </div>

              <span className="text-slate-500 text-[11px]">{src.region}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
