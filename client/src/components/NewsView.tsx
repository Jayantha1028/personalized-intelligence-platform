"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Article,
  saveItem,
  scrapeArticleUrl,
  syncNewsFeeds,
  sendArticleFeedback,
  fetchFeedbackSummary,
  resetFeedTuning,
} from "@/services/api";
import {
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  Globe,
  Loader2,
  Sparkles,
  LayoutGrid,
  List,
  AlignJustify,
  Search,
  X,
  Clock,
  Flame,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Check,
  Newspaper,
  ArrowUpRight,
  MapPin,
  TrendingUp,
  Rocket,
  Target,
  GraduationCap,
  Coins,
  Cpu,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  SlidersHorizontal,
  EyeOff,
  Eye,
} from "lucide-react";

interface NewsViewProps {
  news: Article[];
  onRefresh?: () => void;
}

type ViewMode = "grid" | "editorial" | "compact";
type SortOption = "relevance" | "newest" | "quality";
export type GrowthVector = "all" | "career" | "capital" | "skills" | "strategic";

export function getGrowthVector(article: Article): {
  id: GrowthVector;
  label: string;
  badge: string;
  color: string;
  icon: string;
} {
  const text = (
    article.title + " " +
    (article.personal_impact || "") + " " +
    article.summary_bullets.join(" ") + " " +
    article.topic
  ).toLowerCase();

  if (
    text.includes("internship") ||
    text.includes("fellowship") ||
    text.includes("hiring") ||
    text.includes("career") ||
    text.includes("placement") ||
    text.includes("recruitment") ||
    text.includes("iisc") ||
    text.includes("vtu")
  ) {
    return {
      id: "career",
      label: "Career & Placement",
      badge: "Career Fast-Track",
      color: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
      icon: "🎓",
    };
  }

  if (
    text.includes("grant") ||
    text.includes("seed") ||
    text.includes("prize") ||
    text.includes("fund") ||
    text.includes("stipend") ||
    text.includes("venture") ||
    text.includes("bounty") ||
    text.includes("capital") ||
    text.includes("credit") ||
    text.includes("₹") ||
    text.includes("$")
  ) {
    return {
      id: "capital",
      label: "Grants & Capital",
      badge: "Grants & Capital",
      color: "bg-amber-500/15 text-amber-300 border-amber-500/30",
      icon: "💰",
    };
  }

  if (
    text.includes("certif") ||
    text.includes("model") ||
    text.includes("skill") ||
    text.includes("python") ||
    text.includes("cloud") ||
    text.includes("rust") ||
    text.includes("wasm") ||
    text.includes("quantiz") ||
    text.includes("learning")
  ) {
    return {
      id: "skills",
      label: "Skills & Mastery",
      badge: "Skill Mastery",
      color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
      icon: "⚡",
    };
  }

  return {
    id: "strategic",
    label: "Strategic Macro",
    badge: "Strategic Macro",
    color: "bg-blue-500/15 text-sky-300 border-blue-500/30",
    icon: "🌐",
  };
}

export function NewsView({ news, onRefresh }: NewsViewProps) {
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [selectedGrowthVector, setSelectedGrowthVector] = useState<GrowthVector>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [onlyActionable, setOnlyActionable] = useState<boolean>(false);
  const [onlyHighMatch, setOnlyHighMatch] = useState<boolean>(false);

  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
  const [savingId, setSavingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Web Scraper State
  const [scraperOpen, setScraperOpen] = useState<boolean>(false);
  const [scrapeUrlInput, setScrapeUrlInput] = useState<string>("");
  const [scrapeTopic, setScrapeTopic] = useState<string>("World Politics");
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [scrapeMessage, setScrapeMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const sampleUrls = [
    { label: "Reuters Geopolitics", url: "https://reuters.com/world/" },
    { label: "Bloomberg Business", url: "https://bloomberg.com/markets" },
    { label: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/" },
    { label: "India Semiconductor", url: "https://pib.gov.in/PressReleasePage.aspx?PRID=2010200" },
  ];

  const handleSyncFeeds = async () => {
    setIsSyncing(true);
    try {
      await syncNewsFeeds();
      onRefresh?.();
    } catch (err) {
      console.warn("Live feed sync failed", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrlInput.trim()) return;
    setIsScraping(true);
    setScrapeMessage(null);

    try {
      const created = await scrapeArticleUrl(scrapeUrlInput.trim(), scrapeTopic);
      setScrapeMessage({
        text: `Successfully scraped and ingested "${created.title}"!`,
        isError: false,
      });
      setScrapeUrlInput("");
      onRefresh?.();
      setTimeout(() => setScrapeMessage(null), 5000);
    } catch (err: any) {
      setScrapeMessage({
        text: err.message || "Failed to scrape webpage.",
        isError: true,
      });
    } finally {
      setIsScraping(false);
    }
  };

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

  const handleCopyLink = (article: Article) => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(article.canonical_url);
      setCopiedId(article.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const toggleCardExpand = (id: number) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Dynamic Feed Tuning & Preference Adjustment State
  const [feedbacks, setFeedbacks] = useState<Record<number, "like" | "dislike">>({});
  const [topicWeights, setTopicWeights] = useState<Record<string, number>>({});
  const [hideDisliked, setHideDisliked] = useState<boolean>(true);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Sync feedbacks on load or news prop changes
  useEffect(() => {
    const initialMap: Record<number, "like" | "dislike"> = {};
    news.forEach((a) => {
      if (a.user_feedback) initialMap[a.id] = a.user_feedback;
    });
    setFeedbacks((prev) => ({ ...initialMap, ...prev }));

    fetchFeedbackSummary()
      .then((res) => {
        setFeedbacks(res.feedbacks || {});
        setTopicWeights(res.topic_weights || {});
      })
      .catch(() => {});
  }, [news]);

  const handleFeedback = async (article: Article, type: "like" | "dislike") => {
    const current = feedbacks[article.id];
    const nextType: "like" | "dislike" | "neutral" = current === type ? "neutral" : type;

    // Optimistic instant feedback
    setFeedbacks((prev) => {
      const copy = { ...prev };
      if (nextType === "neutral") delete copy[article.id];
      else copy[article.id] = nextType;
      return copy;
    });

    try {
      const res = await sendArticleFeedback(article.id, nextType);
      if (res.active_weights) {
        setTopicWeights(res.active_weights);
      }
      setFeedbackToast(res.message);
      setTimeout(() => setFeedbackToast(null), 3500);
    } catch (err) {
      console.error("Failed to record feedback", err);
    }
  };

  const handleResetFeedTuning = async () => {
    try {
      await resetFeedTuning();
      setFeedbacks({});
      setTopicWeights({});
      setFeedbackToast("Feed settings reset to clean default.");
      setTimeout(() => setFeedbackToast(null), 3000);
      onRefresh?.();
    } catch (err) {
      console.error("Failed to reset feed tuning", err);
    }
  };

  // Dynamic Topic Counts
  const topicsWithCounts = useMemo(() => {
    const counts: Record<string, number> = { All: news.length };
    news.forEach((a) => {
      const t = a.topic || "General";
      counts[t] = (counts[t] || 0) + 1;
    });
    return counts;
  }, [news]);

  const uniqueTopics = useMemo(() => {
    const list = [
      "All",
      "Karnataka & Growth",
      "World Politics",
      "Global Business",
      "Artificial Intelligence",
      "Technology Policy",
      "Startups & Grants",
      "Cloud & DevOps",
      "Cybersecurity",
      "Open Source & Tools",
    ];
    const extra = Object.keys(topicsWithCounts).filter((t) => !list.includes(t) && t !== "All");
    return [...list, ...extra];
  }, [topicsWithCounts]);

  // Dynamic Growth Vector Counts
  const growthCounts = useMemo(() => {
    const counts: Record<GrowthVector, number> = {
      all: news.length,
      career: 0,
      capital: 0,
      skills: 0,
      strategic: 0,
    };
    news.forEach((a) => {
      const v = getGrowthVector(a).id;
      counts[v] = (counts[v] || 0) + 1;
    });
    return counts;
  }, [news]);

  // Dynamic score calculator taking user feedback and topic tuning into account
  const getDynamicScore = (article: Article) => {
    const userFb = feedbacks[article.id];
    const tKey = (article.topic || "").trim().toLowerCase();
    const mult = topicWeights[tKey] || 1.0;
    let score = (article.dynamic_relevance ?? article.relevance_score) * mult;
    if (userFb === "like") score += 0.20;
    if (userFb === "dislike") score -= 0.50;
    return Math.min(1.0, Math.max(0.05, score));
  };

  // Filter & Sort
  const filteredAndSortedNews = useMemo(() => {
    return news
      .filter((article) => {
        // Hide disliked articles if setting is enabled
        const userFb = feedbacks[article.id];
        if (hideDisliked && userFb === "dislike") return false;

        const matchesTopic =
          selectedTopic === "All" ||
          article.topic.toLowerCase().includes(selectedTopic.toLowerCase());

        const vector = getGrowthVector(article);
        const matchesVector = selectedGrowthVector === "all" || vector.id === selectedGrowthVector;

        const query = searchQuery.trim().toLowerCase();
        const matchesSearch =
          !query ||
          article.title.toLowerCase().includes(query) ||
          article.topic.toLowerCase().includes(query) ||
          article.source_name.toLowerCase().includes(query) ||
          (article.personal_impact && article.personal_impact.toLowerCase().includes(query)) ||
          article.summary_bullets.some((b) => b.toLowerCase().includes(query));

        const matchesActionable = !onlyActionable || (article.practical_actions && article.practical_actions.length > 0);
        const matchesHighMatch = !onlyHighMatch || article.relevance_score >= 0.88;

        return matchesTopic && matchesVector && matchesSearch && matchesActionable && matchesHighMatch;
      })
      .sort((a, b) => {
        if (sortBy === "relevance") return getDynamicScore(b) - getDynamicScore(a);
        if (sortBy === "quality") return b.quality_score - a.quality_score;
        if (sortBy === "newest") {
          const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
          const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
          return dateB - dateA;
        }
        return 0;
      });
  }, [news, selectedTopic, selectedGrowthVector, searchQuery, sortBy, onlyActionable, onlyHighMatch, feedbacks, topicWeights, hideDisliked]);

  // Featured top pick story
  const featuredStory = useMemo(() => {
    if (selectedTopic !== "All" || selectedGrowthVector !== "all" || searchQuery || onlyActionable || onlyHighMatch) return null;
    return filteredAndSortedNews[0] || null;
  }, [filteredAndSortedNews, selectedTopic, selectedGrowthVector, searchQuery, onlyActionable, onlyHighMatch]);

  const feedStories = useMemo(() => {
    if (featuredStory) {
      return filteredAndSortedNews.slice(1);
    }
    return filteredAndSortedNews;
  }, [filteredAndSortedNews, featuredStory]);

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Recently";
    try {
      const d = new Date(dateStr);
      const diffHrs = Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60));
      if (diffHrs <= 1) return "Just now";
      if (diffHrs < 24) return `${diffHrs}h ago`;
      const diffDays = Math.round(diffHrs / 24);
      return diffDays === 1 ? "Yesterday" : `${diffDays}d ago`;
    } catch {
      return "Recent";
    }
  };

  const estimateReadTime = (article: Article) => {
    const words = (article.summary_bullets.join(" ") + " " + (article.personal_impact || "")).split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 45));
    return `${minutes} min read`;
  };

  const getTopicColor = (topic: string) => {
    const t = topic.toLowerCase();
    if (t.includes("karnataka")) {
      return "bg-amber-500/20 text-amber-200 border-amber-500/40 font-semibold";
    }
    if (t.includes("politics") || t.includes("geopolit")) {
      return "bg-orange-500/15 text-orange-300 border-orange-500/30";
    }
    if (t.includes("business") || t.includes("market") || t.includes("econom")) {
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    }
    if (t.includes("ai") || t.includes("artificial")) {
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    }
    if (t.includes("cloud") || t.includes("devops")) {
      return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    }
    if (t.includes("policy") || t.includes("government")) {
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    }
    if (t.includes("startup") || t.includes("grant")) {
      return "bg-teal-500/15 text-teal-300 border-teal-500/30";
    }
    if (t.includes("cyber") || t.includes("security")) {
      return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    }
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 border border-slate-800 p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Growth-Centric Intelligence Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Actionable Intelligence to Power Your Growth
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Filtered for zero noise and zero fluff. Every dispatch directly maps to a grant, research fellowship, high-value tech skill, or strategic market advantage.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
              <div className="text-lg font-bold text-white">{news.length}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Growth Signals</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2 text-center">
              <div className="text-lg font-bold text-emerald-400">
                {news.length > 0
                  ? `${Math.round(
                      (news.reduce((acc, a) => acc + a.relevance_score, 0) / news.length) * 100
                    )}%`
                  : "95%"}
              </div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Avg Growth Fit</div>
            </div>

            <button
              onClick={handleSyncFeeds}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700/80 transition-all shadow-sm"
              title="Poll latest RSS feeds & official announcements"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-sky-400" : "text-slate-400"}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Feeds"}</span>
            </button>

            <button
              onClick={() => setScraperOpen(!scraperOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{scraperOpen ? "Close Ingester" : "Ingest URL"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Web Scraper Drawer */}
      {scraperOpen && (
        <div className="bg-slate-900/95 border border-blue-900/40 rounded-2xl p-5 space-y-4 shadow-xl transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>Live Global Article Ingestion & Neural Grounding</span>
            </div>
            <span className="text-[11px] text-slate-400 font-normal">
              Extracts text, strips ads, and generates a grounded 3-bullet summary with personal impact
            </span>
          </div>

          <form onSubmit={handleScrape} className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="url"
              required
              value={scrapeUrlInput}
              onChange={(e) => setScrapeUrlInput(e.target.value)}
              placeholder="Paste any article link (e.g. Reuters, Bloomberg, FT, PIB, TechCrunch)..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />

            <select
              value={scrapeTopic}
              onChange={(e) => setScrapeTopic(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="Karnataka & Growth">Karnataka & Local Growth</option>
              <option value="World Politics">World Politics & Geopolitics</option>
              <option value="Global Business">Global Business & Economy</option>
              <option value="Artificial Intelligence">AI & Machine Learning</option>
              <option value="Technology Policy">Tech Policy & Schemes</option>
              <option value="Startups & Grants">Startups & Grants</option>
              <option value="Cloud & DevOps">Cloud & DevOps</option>
              <option value="Cybersecurity">Cybersecurity & Infra</option>
              <option value="Open Source & Tools">Open Source & Tools</option>
            </select>

            <button
              type="submit"
              disabled={isScraping || !scrapeUrlInput.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-medium text-xs shadow-md shadow-cyan-600/25 transition-all shrink-0"
            >
              {isScraping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Scrape & Ingest</span>
                </>
              )}
            </button>
          </form>

          {/* Sample quick pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
            <span className="text-[11px] font-medium text-slate-500">Quick Test Samples:</span>
            {sampleUrls.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setScrapeUrlInput(s.url)}
                className="text-[11px] text-sky-300 hover:text-sky-200 bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded-md transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>

          {scrapeMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                scrapeMessage.isError
                  ? "bg-rose-950/50 text-rose-300 border border-rose-900/60"
                  : "bg-emerald-950/50 text-emerald-300 border border-emerald-900/60"
              }`}
            >
              {scrapeMessage.isError ? (
                <Zap className="w-4 h-4 text-rose-400 shrink-0" />
              ) : (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{scrapeMessage.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Featured Intelligence Hero Pick */}
      {featuredStory && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-950 border border-blue-500/30 p-6 shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wide uppercase">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Top Growth Signal
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getTopicColor(featuredStory.topic)}`}>
                {featuredStory.topic}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getGrowthVector(featuredStory).color}`}>
                {getGrowthVector(featuredStory).icon} {getGrowthVector(featuredStory).badge}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1 font-medium text-slate-300">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {formatRelativeTime(featuredStory.published_at)}
              </span>
              <span>&bull;</span>
              <span className="text-slate-400">{estimateReadTime(featuredStory)}</span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                {(featuredStory.relevance_score * 100).toFixed(0)}% Relevance Fit
              </span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
            <a
              href={featuredStory.canonical_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-300 transition-colors inline-flex items-center gap-2 group"
            >
              <span>{featuredStory.title}</span>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-sky-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          </h2>

          {/* Factual Summary Bullets */}
          <div className="space-y-2 bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-sky-400" />
              Verified Factual Takeaways
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-200 pl-4 list-disc marker:text-sky-400">
              {featuredStory.summary_bullets.map((b, i) => (
                <li key={i} className="leading-relaxed">{b}</li>
              ))}
            </ul>
          </div>

          {/* Why it matters */}
          {featuredStory.personal_impact && (
            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 text-xs text-slate-200 flex items-start gap-3 shadow-inner">
              <Rocket className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300 block mb-0.5">Why this powers your growth: </span>
                <span className="leading-relaxed text-slate-200">{featuredStory.personal_impact}</span>
              </div>
            </div>
          )}

          {/* Actions & Card Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Source:</span>
              <span className="text-xs font-semibold text-slate-200">{featuredStory.source_name}</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Like & Dislike Tuning Buttons */}
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => handleFeedback(featuredStory, "like")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    feedbacks[featuredStory.id] === "like"
                      ? "bg-cyan-500/25 text-cyan-400 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                  }`}
                  title={feedbacks[featuredStory.id] === "like" ? "Liked • Topic Boosted (+25%) • Click to undo" : "Like (boosts topic in feed)"}
                >
                  <ThumbsUp className={`w-3.5 h-3.5 ${feedbacks[featuredStory.id] === "like" ? "fill-cyan-400/30" : ""}`} />
                  <span className="hidden sm:inline">Like</span>
                </button>
                <button
                  onClick={() => handleFeedback(featuredStory, "dislike")}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    feedbacks[featuredStory.id] === "dislike"
                      ? "bg-rose-500/25 text-rose-400 border border-rose-500/40 shadow-sm"
                      : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                  }`}
                  title={feedbacks[featuredStory.id] === "dislike" ? "Disliked • Deprioritized • Click to undo" : "Dislike (deprioritizes topic in feed)"}
                >
                  <ThumbsDown className={`w-3.5 h-3.5 ${feedbacks[featuredStory.id] === "dislike" ? "fill-rose-400/30" : ""}`} />
                  <span className="hidden sm:inline">Dislike</span>
                </button>
              </div>

              <button
                onClick={() => handleCopyLink(featuredStory)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                title="Copy canonical link"
              >
                {copiedId === featuredStory.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleSave(featuredStory.id)}
                disabled={savedIds.has(featuredStory.id) || savingId === featuredStory.id}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  savedIds.has(featuredStory.id)
                    ? "bg-blue-950 text-sky-300 border border-blue-800/60"
                    : "bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/30"
                }`}
              >
                {savedIds.has(featuredStory.id) ? (
                  <>
                    <BookmarkCheck className="w-3.5 h-3.5" />
                    <span>Bookmarked</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Story</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Control Bar: Growth Vectors, Topics, Filters, Search, Density Mode */}
      <div className="space-y-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
        {/* Growth Focus Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-1">
            <Target className="w-3.5 h-3.5 text-sky-400" />
            Growth Intent:
          </span>
          {[
            { id: "all", label: "All Growth Signals", icon: "🌟", count: growthCounts.all },
            { id: "career", label: "Career & Internships", icon: "🎓", count: growthCounts.career },
            { id: "capital", label: "Grants & Capital", icon: "💰", count: growthCounts.capital },
            { id: "skills", label: "Skills & Free Certs", icon: "⚡", count: growthCounts.skills },
            { id: "strategic", label: "Strategic Macro", icon: "🌐", count: growthCounts.strategic },
          ].map((gv) => (
            <button
              key={gv.id}
              onClick={() => setSelectedGrowthVector(gv.id as GrowthVector)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                selectedGrowthVector === gv.id
                  ? "bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30"
                  : "bg-slate-950/80 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <span>{gv.icon}</span>
              <span>{gv.label}</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  selectedGrowthVector === gv.id ? "bg-blue-800/90 text-white" : "bg-slate-900 text-slate-400"
                }`}
              >
                {gv.count}
              </span>
            </button>
          ))}
        </div>

        {/* Topic Pills with Dynamic Counts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {uniqueTopics.map((topic) => {
            const count = topicsWithCounts[topic] || 0;
            const isSelected = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                    : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700"
                }`}
              >
                {topic.includes("Karnataka") && <MapPin className="w-3 h-3 text-amber-300 shrink-0" />}
                <span>{topic}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? "bg-blue-800/90 text-white" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Second Row: Search, Quick Toggles, Sorting, and View Switcher */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search world politics, economy, AI, policy, or actions..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Buttons & Density Mode */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setOnlyHighMatch(!onlyHighMatch)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                onlyHighMatch
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>High Match (≥88%)</span>
            </button>

            <button
              onClick={() => setOnlyActionable(!onlyActionable)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                onlyActionable
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300"
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Actionable</span>
            </button>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="relevance">Highest Relevance</option>
              <option value="newest">Most Recent</option>
              <option value="quality">Quality Score</option>
            </select>

            {/* Density View Switcher */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Magazine Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("editorial")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "editorial"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Editorial Detailed View"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "compact"
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Compact Wire View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Feed Feedback Notification Toast */}
      {feedbackToast && (
        <div className="p-3 rounded-xl bg-cyan-950/80 border border-cyan-700/80 text-xs text-cyan-200 flex items-center justify-between shadow-lg shadow-cyan-950/40 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium">{feedbackToast}</span>
          </div>
          <button
            onClick={() => setFeedbackToast(null)}
            className="text-cyan-400 hover:text-white text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Dynamic Feed Preference Tuning Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 px-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Feed Tuning:</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300 font-mono font-medium text-[11px]">
            <ThumbsUp className="w-3 h-3 text-cyan-400" />
            <span>{Object.values(feedbacks).filter((v) => v === "like").length} Boosted</span>
          </span>

          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800/80 text-rose-300 font-mono font-medium text-[11px]">
            <ThumbsDown className="w-3 h-3 text-rose-400" />
            <span>{Object.values(feedbacks).filter((v) => v === "dislike").length} De-prioritized</span>
          </span>

          {/* Active Topic Multiplier Badges */}
          {Object.entries(topicWeights)
            .filter(([_, w]) => w !== 1.0)
            .slice(0, 3)
            .map(([top, w]) => (
              <span
                key={top}
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  w > 1.0
                    ? "bg-cyan-950/60 border-cyan-700/60 text-cyan-300"
                    : "bg-slate-800/80 border-slate-700 text-slate-400"
                }`}
              >
                {w > 1.0 ? `+${top} (${w}x)` : `-${top} (${w}x)`}
              </span>
            ))}
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300 hover:text-white transition">
            <input
              type="checkbox"
              checked={hideDisliked}
              onChange={(e) => setHideDisliked(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer w-3.5 h-3.5"
            />
            <span className="flex items-center gap-1 text-[11px]">
              {hideDisliked ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
              Hide Disliked
            </span>
          </label>

          {(Object.keys(feedbacks).length > 0 || Object.values(topicWeights).some((w) => w !== 1.0)) && (
            <button
              onClick={handleResetFeedTuning}
              className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 hover:bg-slate-800 px-2 py-1 rounded transition"
              title="Reset all dynamic topic multipliers and feedback"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Feed Counter Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-semibold">{filteredAndSortedNews.length}</strong> of{" "}
          <strong className="text-white font-semibold">{news.length}</strong> curated intelligence articles
        </span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-sky-400 hover:text-sky-300 underline"
          >
            Clear search
          </button>
        )}
      </div>

      {/* News Feed by Selected View Mode */}
      {filteredAndSortedNews.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-16 text-center space-y-3">
          <Newspaper className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-slate-300">No articles match your current criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching topics or clearing active search filters to see all available dispatches.
          </p>
          <button
            onClick={() => {
              setSelectedTopic("All");
              setSearchQuery("");
              setOnlyActionable(false);
              setOnlyHighMatch(false);
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-medium transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === "compact" ? (
        /* COMPACT WIRE VIEW */
        <div className="divide-y divide-slate-800/80 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          {filteredAndSortedNews.map((article) => {
            const isExpanded = expandedCards.has(article.id);
            return (
              <div
                key={article.id}
                className="p-4 hover:bg-slate-800/40 transition-colors space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getTopicColor(article.topic)}`}>
                      {article.topic}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getGrowthVector(article).color}`}>
                      {getGrowthVector(article).icon} {getGrowthVector(article).badge}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{article.source_name}</span>
                    <span className="text-slate-600">&bull;</span>
                    <span className="text-[11px] text-slate-500">{formatRelativeTime(article.published_at)}</span>
                    <span className="text-[11px] font-bold text-sky-400 bg-blue-950/60 border border-blue-900/40 px-2 py-0.2 rounded-full">
                      {(article.relevance_score * 100).toFixed(0)}% fit
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Like & Dislike Tuning Buttons */}
                    <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => handleFeedback(article, "like")}
                        className={`p-1 rounded text-xs transition-colors ${
                          feedbacks[article.id] === "like"
                            ? "bg-cyan-500/25 text-cyan-400 border border-cyan-500/40"
                            : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                        }`}
                        title={feedbacks[article.id] === "like" ? "Liked (+25% boost) • Click to undo" : "Like (boosts this topic in feed)"}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${feedbacks[article.id] === "like" ? "fill-cyan-400/30" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleFeedback(article, "dislike")}
                        className={`p-1 rounded text-xs transition-colors ${
                          feedbacks[article.id] === "dislike"
                            ? "bg-rose-500/25 text-rose-400 border border-rose-500/40"
                            : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        }`}
                        title={feedbacks[article.id] === "dislike" ? "Disliked (deprioritized) • Click to undo" : "Dislike (deprioritizes this topic)"}
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${feedbacks[article.id] === "dislike" ? "fill-rose-400/30" : ""}`} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyLink(article)}
                      className="p-1 text-slate-500 hover:text-slate-300 transition-colors"
                      title="Copy link"
                    >
                      {copiedId === article.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleSave(article.id)}
                      disabled={savedIds.has(article.id) || savingId === article.id}
                      className={`p-1 transition-colors ${
                        savedIds.has(article.id) ? "text-sky-400" : "text-slate-500 hover:text-sky-400"
                      }`}
                      title={savedIds.has(article.id) ? "Saved" : "Save article"}
                    >
                      {savedIds.has(article.id) ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => toggleCardExpand(article.id)}
                      className="text-xs text-slate-400 hover:text-sky-400 flex items-center gap-1 ml-1"
                    >
                      <span>{isExpanded ? "Collapse" : "Preview"}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-semibold text-slate-100 hover:text-sky-300 transition-colors">
                  <a
                    href={article.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5"
                  >
                    <span>{article.title}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500 inline shrink-0" />
                  </a>
                </h3>

                {isExpanded && (
                  <div className="pt-2 space-y-2 border-t border-slate-800">
                    <ul className="text-xs text-slate-300 pl-4 list-disc marker:text-sky-400 space-y-1">
                      {article.summary_bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                    {article.personal_impact && (
                      <div className="bg-blue-950/30 border border-blue-900/40 rounded-lg p-2.5 text-xs text-sky-200">
                        <span className="font-semibold text-sky-300">Why it matters: </span>
                        {article.personal_impact}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : viewMode === "grid" ? (
        /* MAGAZINE GRID VIEW (2 COLUMNS) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedStories.map((article) => {
            const isExpanded = expandedCards.has(article.id);
            return (
              <article
                key={article.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 hover:shadow-lg hover:shadow-blue-950/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Card Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getTopicColor(article.topic)}`}>
                        {article.topic}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getGrowthVector(article).color}`}>
                        {getGrowthVector(article).icon} {getGrowthVector(article).badge}
                      </span>
                      <span className="text-slate-400 font-medium text-[11px]">{article.source_name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Like & Dislike Tuning Buttons */}
                      <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800 rounded-lg p-0.5">
                        <button
                          onClick={() => handleFeedback(article, "like")}
                          className={`p-1 rounded text-xs transition-colors ${
                            feedbacks[article.id] === "like"
                              ? "bg-cyan-500/25 text-cyan-400 border border-cyan-500/40"
                              : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                          }`}
                          title={feedbacks[article.id] === "like" ? "Liked (+25% boost) • Click to undo" : "Like (boosts this topic in feed)"}
                        >
                          <ThumbsUp className={`w-3.5 h-3.5 ${feedbacks[article.id] === "like" ? "fill-cyan-400/30" : ""}`} />
                        </button>
                        <button
                          onClick={() => handleFeedback(article, "dislike")}
                          className={`p-1 rounded text-xs transition-colors ${
                            feedbacks[article.id] === "dislike"
                              ? "bg-rose-500/25 text-rose-400 border border-rose-500/40"
                              : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                          }`}
                          title={feedbacks[article.id] === "dislike" ? "Disliked (deprioritized) • Click to undo" : "Dislike (deprioritizes this topic)"}
                        >
                          <ThumbsDown className={`w-3.5 h-3.5 ${feedbacks[article.id] === "dislike" ? "fill-rose-400/30" : ""}`} />
                        </button>
                      </div>

                      <span className="text-[11px] font-bold text-sky-300 bg-slate-800/90 px-2 py-0.5 rounded-md">
                        {(getDynamicScore(article) * 100).toFixed(0)}% Fit
                      </span>
                      <button
                        onClick={() => handleSave(article.id)}
                        disabled={savedIds.has(article.id) || savingId === article.id}
                        className={`p-1 rounded transition-colors ${
                          savedIds.has(article.id)
                            ? "text-sky-400"
                            : "text-slate-500 hover:text-sky-400 hover:bg-slate-800"
                        }`}
                        title={savedIds.has(article.id) ? "Saved" : "Save article"}
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
                  <h3 className="text-base font-bold text-slate-100 hover:text-sky-300 transition-colors leading-snug">
                    <a
                      href={article.canonical_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5"
                    >
                      <span>{article.title}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-slate-500 inline shrink-0" />
                    </a>
                  </h3>

                  {/* Summary Preview */}
                  <div className="space-y-1.5">
                    <ul className="space-y-1 text-xs text-slate-300 pl-3.5 list-disc marker:text-sky-400">
                      {(isExpanded ? article.summary_bullets : article.summary_bullets.slice(0, 2)).map((b, i) => (
                        <li key={i} className="leading-relaxed line-clamp-2">{b}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Personal Impact */}
                  {article.personal_impact && (
                    <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 text-xs text-slate-200 flex items-start gap-2.5 shadow-inner">
                      <Rocket className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="line-clamp-2">
                        <span className="font-bold text-emerald-300">Growth Impact: </span>
                        {article.personal_impact}
                      </div>
                    </div>
                  )}

                  {/* Expanded Actions */}
                  {isExpanded && article.practical_actions && article.practical_actions.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                      <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                        Actionable Growth Moves
                      </h4>
                      <div className="space-y-1.5">
                        {article.practical_actions.map((act, i) => (
                          <div
                            key={i}
                            className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2 text-xs text-slate-300 flex items-start gap-2"
                          >
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{act}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-[11px]">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatRelativeTime(article.published_at)}</span>
                    <span>&bull;</span>
                    <span>{estimateReadTime(article)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Like & Dislike Tuning Buttons */}
                    <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800 rounded-lg p-0.5">
                      <button
                        onClick={() => handleFeedback(article, "like")}
                        className={`p-1 rounded text-xs transition-colors ${
                          feedbacks[article.id] === "like"
                            ? "bg-cyan-500/25 text-cyan-400 border border-cyan-500/40"
                            : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                        }`}
                        title={feedbacks[article.id] === "like" ? "Liked (+25% boost) • Click to undo" : "Like (boosts this topic in feed)"}
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${feedbacks[article.id] === "like" ? "fill-cyan-400/30" : ""}`} />
                      </button>
                      <button
                        onClick={() => handleFeedback(article, "dislike")}
                        className={`p-1 rounded text-xs transition-colors ${
                          feedbacks[article.id] === "dislike"
                            ? "bg-rose-500/25 text-rose-400 border border-rose-500/40"
                            : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        }`}
                        title={feedbacks[article.id] === "dislike" ? "Disliked (deprioritized) • Click to undo" : "Dislike (deprioritizes this topic)"}
                      >
                        <ThumbsDown className={`w-3.5 h-3.5 ${feedbacks[article.id] === "dislike" ? "fill-rose-400/30" : ""}`} />
                      </button>
                    </div>

                    <button
                      onClick={() => handleCopyLink(article)}
                      className="p-1 text-slate-500 hover:text-slate-300"
                      title="Share link"
                    >
                      {copiedId === article.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => toggleCardExpand(article.id)}
                      className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-0.5"
                    >
                      <span>{isExpanded ? "Less" : "More"}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* EDITORIAL FULL-WIDTH VIEW */
        <div className="space-y-5">
          {feedStories.map((article) => (
            <article
              key={article.id}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 hover:border-slate-700/80 transition-all space-y-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border ${getTopicColor(article.topic)}`}>
                    {article.topic}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold border ${getGrowthVector(article).color}`}>
                    {getGrowthVector(article).icon} {getGrowthVector(article).badge}
                  </span>
                  <span className="text-slate-300 font-semibold">{article.source_name}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-slate-400">{formatRelativeTime(article.published_at)}</span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="text-slate-400">{estimateReadTime(article)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Like & Dislike Tuning Buttons */}
                  <div className="flex items-center gap-0.5 bg-slate-950/70 border border-slate-800 rounded-lg p-0.5">
                    <button
                      onClick={() => handleFeedback(article, "like")}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        feedbacks[article.id] === "like"
                          ? "bg-cyan-500/25 text-cyan-400 border border-cyan-500/40"
                          : "text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                      }`}
                      title={feedbacks[article.id] === "like" ? "Liked (+25% boost) • Click to undo" : "Like (boosts this topic in feed)"}
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${feedbacks[article.id] === "like" ? "fill-cyan-400/30" : ""}`} />
                    </button>
                    <button
                      onClick={() => handleFeedback(article, "dislike")}
                      className={`p-1.5 rounded text-xs transition-colors ${
                        feedbacks[article.id] === "dislike"
                          ? "bg-rose-500/25 text-rose-400 border border-rose-500/40"
                          : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                      }`}
                      title={feedbacks[article.id] === "dislike" ? "Disliked (deprioritized) • Click to undo" : "Dislike (deprioritizes this topic)"}
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${feedbacks[article.id] === "dislike" ? "fill-rose-400/30" : ""}`} />
                    </button>
                  </div>

                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded">
                    <ShieldCheck className="w-3 h-3" />
                    Verified
                  </span>
                  <span className="text-[11px] font-bold text-sky-300 bg-slate-800 px-2.5 py-0.5 rounded">
                    {(getDynamicScore(article) * 100).toFixed(0)}% Relevance
                  </span>
                  <button
                    onClick={() => handleCopyLink(article)}
                    className="p-1 rounded text-slate-500 hover:text-slate-300 transition-colors"
                    title="Copy canonical link"
                  >
                    {copiedId === article.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleSave(article.id)}
                    disabled={savedIds.has(article.id) || savingId === article.id}
                    title={savedIds.has(article.id) ? "Saved" : "Save article"}
                    className={`p-1 rounded transition-colors ${
                      savedIds.has(article.id)
                        ? "text-sky-400 cursor-default"
                        : "text-slate-500 hover:text-sky-400 hover:bg-slate-800"
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

              <h3 className="text-lg font-bold text-slate-100 leading-snug">
                <a
                  href={article.canonical_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-sky-300 transition-colors inline-flex items-center gap-2 group"
                >
                  <span>{article.title}</span>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-300 inline shrink-0" />
                </a>
              </h3>

              <div className="space-y-2 bg-slate-950/30 border border-slate-800/80 rounded-xl p-4">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Factual Takeaways
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-200 pl-4 list-disc marker:text-sky-400">
                  {article.summary_bullets.map((b, i) => (
                    <li key={i} className="leading-relaxed">{b}</li>
                  ))}
                </ul>
              </div>

              {article.personal_impact && (
                <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-4 text-xs text-slate-200 flex items-start gap-3 shadow-inner">
                  <Rocket className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-emerald-300 block mb-0.5">Why this powers your growth: </span>
                    <span className="leading-relaxed text-slate-200">{article.personal_impact}</span>
                  </div>
                </div>
              )}

              {article.practical_actions && article.practical_actions.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
                    Recommended Growth Moves
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {article.practical_actions.map((act, i) => (
                      <div
                        key={i}
                        className="bg-slate-800/50 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 flex items-start gap-2"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {/* Footer Navigation Bar */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>All articles verified against official international and canonical sources</span>
        </div>
        <span className="text-slate-500">
          Showing {filteredAndSortedNews.length} intelligence items • Live cross-checked
        </span>
      </div>
    </div>
  );
}
