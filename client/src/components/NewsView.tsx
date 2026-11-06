"use client";

import React, { useState } from "react";
import { Article, saveItem } from "@/services/api";
import {
  ExternalLink,
  ShieldCheck,
  Zap,
  Filter,
  CheckCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

interface NewsViewProps {
  news: Article[];
  onRefresh?: () => void;
}

export function NewsView({ news, onRefresh }: NewsViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);

  const handleSave = async (articleId: number) => {
    if (savedIds.has(articleId) || savingId === articleId) return;
    setSavingId(articleId);
    try {
      await saveItem("article", articleId);
      setSavedIds((prev) => new Set(prev).add(articleId));
      onRefresh?.();
    } catch (err) {
      console.error("Failed to save article", err);
    } finally {
      setSavingId(null);
    }
  };

  const topics = [
    "All",
    "Artificial Intelligence",
    "Technology Policy",
    "Startups & Grants",
    "Cloud & DevOps",
  ];

  const filteredNews = news.filter((article) => {
    const matchesTopic =
      selectedTopic === "All" ||
      article.topic.toLowerCase().includes(selectedTopic.toLowerCase());
    const matchesSearch =
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary_bullets.some((b) => b.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">News Intelligence Engine</h2>
        <p className="text-sm text-slate-400 mt-1">
          Evidence-grounded summaries, deduplicated stories, and personalized impact analysis for Indian developers & tech leaders.
        </p>
      </div>

      {/* Filter and Topic Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-2">
        <div className="flex flex-wrap gap-2">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTopic(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTopic === t
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by keyword..."
          className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-full sm:w-60"
        />
      </div>

      {/* Article Feed */}
      <div className="space-y-5">
        {filteredNews.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            No articles match the current filter.
          </div>
        ) : (
          filteredNews.map((article) => (
            <article
              key={article.id}
              className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 hover:border-slate-700/80 transition-all space-y-4 shadow-sm"
            >
              {/* Header metadata */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                    {article.topic}
                  </span>
                  <span className="text-slate-400 font-medium">{article.source_name}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-slate-400">
                    {article.published_at ? new Date(article.published_at).toLocaleDateString() : "Recent"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Source
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-300 bg-slate-800 px-2 py-0.5 rounded">
                    {(article.relevance_score * 100).toFixed(0)}% Relevance
                  </span>
                  <button
                    onClick={() => handleSave(article.id)}
                    disabled={savedIds.has(article.id) || savingId === article.id}
                    title={savedIds.has(article.id) ? "Saved" : "Save article"}
                    className={`p-1 rounded transition-colors ${
                      savedIds.has(article.id)
                        ? "text-indigo-400 cursor-default"
                        : "text-slate-500 hover:text-indigo-400 hover:bg-slate-800"
                    }`}
                  >
                    {savedIds.has(article.id) ? (
                      <BookmarkCheck className="w-4 h-4" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-slate-100 leading-snug">
                <a
                  href={article.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-indigo-400 transition-colors inline-flex items-center gap-2"
                >
                  <span>{article.title}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 inline shrink-0" />
                </a>
              </h3>

              {/* 3 Bullet Grounded Summary */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Factual Summary Points
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-200 pl-4 list-disc marker:text-indigo-400">
                  {article.summary_bullets.map((b, i) => (
                    <li key={i} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              </div>

              {/* Personal Impact */}
              {article.personal_impact && (
                <div className="bg-indigo-950/40 border border-indigo-900/60 rounded-lg p-3.5 text-xs text-indigo-200 flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-indigo-300">Why it matters to you: </span>
                    <span className="leading-relaxed">{article.personal_impact}</span>
                  </div>
                </div>
              )}

              {/* Practical Actions */}
              {article.practical_actions && article.practical_actions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Recommended Actions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {article.practical_actions.map((act, i) => (
                      <div
                        key={i}
                        className="bg-slate-800/50 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </div>
  );
}
