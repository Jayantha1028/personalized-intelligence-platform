"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  BookOpen,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  Check,
  Code2,
  Copy,
  Terminal,
} from "lucide-react";

interface GrowthTask {
  id: string;
  title: string;
  description: string;
  category: "Karnataka & Grants" | "Certifications" | "Engineering & AI" | "Research & Academics" | "Career";
  priority: "High" | "Medium" | "Urgent";
  deadline: string;
  completed: boolean;
  impactScore: number;
}

interface TechBlog {
  id: string;
  name: string;
  org: string;
  category: "AI & ML" | "Distributed Systems" | "Cloud & Infra" | "System Design";
  url: string;
  description: string;
  featuredArticle: string;
  keyTakeaway: string;
  codeSnippet?: string;
  readTime: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const INITIAL_TASKS: GrowthTask[] = [
  {
    id: "task-1",
    title: "Apply for KDEM Elevate Karnataka ₹50L Idea2PoC Seed Grant",
    description: "Submit product architecture blueprint and Karnataka student founder pitch before the Q2 cycle deadline.",
    category: "Karnataka & Grants",
    priority: "Urgent",
    deadline: "Dec 15, 2026",
    completed: false,
    impactScore: 98,
  },
  {
    id: "task-2",
    title: "Claim FutureSkills Prime Karnataka 100% AWS Solutions Architect Voucher",
    description: "Enroll through collegiate VTU student portal to unlock free exam scheduling & practice test bundle.",
    category: "Certifications",
    priority: "High",
    deadline: "Nov 28, 2026",
    completed: false,
    impactScore: 94,
  },
  {
    id: "task-3",
    title: "Build & Benchmark Local Ollama / vLLM Multi-Agent Pipeline",
    description: "Benchmark Qwen-2.5-Coder and Llama-3.2 locally on Apple Silicon for automated news summarization agent.",
    category: "Engineering & AI",
    priority: "High",
    deadline: "Dec 05, 2026",
    completed: true,
    impactScore: 90,
  },
  {
    id: "task-4",
    title: "Submit 2-page Abstract for IISc CDS Summer Research Fellowship",
    description: "Draft research proposal on high-throughput RAG indexing and graph memory retrieval for Indian regional languages.",
    category: "Research & Academics",
    priority: "High",
    deadline: "Jan 10, 2027",
    completed: false,
    impactScore: 96,
  },
  {
    id: "task-5",
    title: "Register for Bengaluru Tech Summit (BTS) Hackathon 2026",
    description: "Team registration with 2 classmates for AI GovTech track at Palace Grounds, Bengaluru.",
    category: "Karnataka & Grants",
    priority: "Medium",
    deadline: "Nov 30, 2026",
    completed: false,
    impactScore: 88,
  },
  {
    id: "task-6",
    title: "Complete Anthropic Model Context Protocol (MCP) Server Implementation",
    description: "Build MCP client connecting SQLite database schema & feed ingestion service to Claude Desktop / Cursor.",
    category: "Engineering & AI",
    priority: "Medium",
    deadline: "Dec 20, 2026",
    completed: true,
    impactScore: 92,
  },
];

const CURATED_TECH_BLOGS: TechBlog[] = [
  {
    id: "blog-netflix",
    name: "Netflix Technology Blog",
    org: "Netflix",
    category: "Distributed Systems",
    url: "https://netflixtechblog.com",
    description: "World-class architectural writeups on fault-tolerant microservices, chaos engineering, globally replicated caches, and video delivery CDNs.",
    featuredArticle: "Fault Tolerance in Go and Java with Adaptive Concurrency Limits",
    keyTakeaway: "Dynamic queue-based concurrency limits prevent cascading thread-pool exhaustion during downstream service degradation.",
    codeSnippet: `// Dynamic Concurrency Limiter (Netflix Vegas Algorithm)
type VegasLimiter struct {
    rttNoLoad time.Duration
    limit     int
}
func (l *VegasLimiter) OnSample(rtt time.Duration) {
    if rtt > l.rttNoLoad * 1.25 { l.limit-- } else { l.limit++ }
}`,
    readTime: "12 min",
    difficulty: "Advanced",
  },
  {
    id: "blog-uber",
    name: "Uber Engineering",
    org: "Uber",
    category: "Distributed Systems",
    url: "https://www.uber.com/en-IN/blog/engineering",
    description: "Real-time geospatial indexing (H3 hexagonal hierarchical system), massive Kafka event streams, and dispatch matching algorithms.",
    featuredArticle: "H3: Uber's Hexagonal Hierarchical Spatial Index",
    keyTakeaway: "Partitioning the globe into nested hexagons preserves equidistant neighbor transitions unlike rectangular coordinate grids.",
    codeSnippet: `// H3 Hexagonal Cell Indexing
H3Index h3 = geoToH3(12.9716, 77.5946, 9); // Bengaluru coordinates
List<H3Index> ring = kRing(h3, 1); // Exact equidistant 1-hop radius`,
    readTime: "9 min",
    difficulty: "Intermediate",
  },
  {
    id: "blog-meta",
    name: "Meta AI Engineering",
    org: "Meta AI",
    category: "AI & ML",
    url: "https://ai.meta.com/blog",
    description: "Open source foundation models (Llama series), PyTorch distributed training (FSDP), and large-scale AI cluster infrastructure.",
    featuredArticle: "The Llama 3 Architecture: Dense Pre-training and GQA Optimizations",
    keyTakeaway: "Grouped Query Attention (GQA) cuts KV-cache VRAM footprint by 4x while preserving full context recall.",
    codeSnippet: `// Grouped Query Attention (GQA)
num_key_value_heads = 8  // Shared across 32 query heads
vram_savings = (1 - 8/32) * 100 // 75% reduction in KV Cache`,
    readTime: "15 min",
    difficulty: "Advanced",
  },
  {
    id: "blog-cloudflare",
    name: "Cloudflare Blog",
    org: "Cloudflare",
    category: "Cloud & Infra",
    url: "https://blog.cloudflare.com",
    description: "Deep dive networking internals, eBPF packet filtering, Rust edge execution, DNSSEC, and modern web protocols (HTTP/3).",
    featuredArticle: "How we built Pingora: Replacing NGINX with Memory-Safe Rust at Edge",
    keyTakeaway: "Replacing C with Rust yielded a 70% CPU efficiency gain and eliminated memory safety vulnerability classes entirely.",
    codeSnippet: `// Pingora Rust Upstream Proxy Filter
async fn request_filter(&self, session: &mut Session) -> Result<bool> {
    if session.req_header().uri.path().starts_with("/healthz") {
        return Ok(true);
    }
}`,
    readTime: "11 min",
    difficulty: "Advanced",
  },
  {
    id: "blog-stripe",
    name: "Stripe Engineering",
    org: "Stripe",
    category: "System Design",
    url: "https://stripe.com/blog/engineering",
    description: "Mission-critical five-nines financial infrastructure, distributed ledger consistency, and idempotent API design.",
    featuredArticle: "Designing Idempotency Keys in Distributed Payment Systems",
    keyTakeaway: "Atomic database transaction locks combined with deterministic hash fingerprints prevent double billing under retry storms.",
    codeSnippet: `// Idempotency Key Lock Guard
SELECT * FROM idempotency_keys 
WHERE key = $1 AND expires_at > NOW() 
FOR UPDATE NOWAIT;`,
    readTime: "8 min",
    difficulty: "Intermediate",
  },
  {
    id: "blog-github",
    name: "GitHub Engineering",
    org: "GitHub",
    category: "Cloud & Infra",
    url: "https://github.blog/category/engineering",
    description: "Architecting large-scale Git virtual file systems, high-availability MySQL clusters, and Codespaces container orchestration.",
    featuredArticle: "How GitHub deploys with Zero Downtime across Multi-Region Clusters",
    keyTakeaway: "Blue-green canary deployments with automated telemetry circuit-breakers roll back breaking commits in under 10 seconds.",
    codeSnippet: `// Deployment Canary Circuit Breaker
if http_error_rate_5xx > 0.001 {
    trigger_canary_rollback(deployment_id);
}`,
    readTime: "10 min",
    difficulty: "Intermediate",
  },
];

export function TechBlogsAndTasksView() {
  const [activeTab, setActiveTab] = useState<"tasks" | "blogs">("tasks");
  const [tasks, setTasks] = useState<GrowthTask[]>(INITIAL_TASKS);
  const [selectedTaskCategory, setSelectedTaskCategory] = useState<string>("All");
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>("All");
  const [copiedBlogId, setCopiedBlogId] = useState<string | null>(null);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<GrowthTask["category"]>("Karnataka & Grants");
  const [newTaskPriority, setNewTaskPriority] = useState<GrowthTask["priority"]>("High");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("antigravity_growth_tasks");
      if (saved) {
        setTasks(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveTasks = (newTasks: GrowthTask[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem("antigravity_growth_tasks", JSON.stringify(newTasks));
    } catch {
      // ignore
    }
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    saveTasks(updated);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: GrowthTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      description: "Custom user-added action item for technical & academic trajectory.",
      category: newTaskCategory,
      priority: newTaskPriority,
      deadline: newTaskDeadline || "Open",
      completed: false,
      impactScore: newTaskPriority === "Urgent" ? 95 : newTaskPriority === "High" ? 85 : 75,
    };

    saveTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setShowAddModal(false);
  };

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedBlogId(id);
    setTimeout(() => setCopiedBlogId(null), 2000);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const taskCategories = ["All", "Karnataka & Grants", "Certifications", "Engineering & AI", "Research & Academics"];
  const filteredTasks = tasks.filter((t) => selectedTaskCategory === "All" || t.category === selectedTaskCategory);

  const blogCategories = ["All", "AI & ML", "Distributed Systems", "Cloud & Infra", "System Design"];
  const filteredBlogs = CURATED_TECH_BLOGS.filter((b) => selectedBlogCategory === "All" || b.category === selectedBlogCategory);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[#0E5B44] bg-[#8BDCC0]/30 px-2 py-0.5 rounded-md border border-[#8BDCC0]/60">
              [GROWTH_PIPELINE::ACTIVE]
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-[#635BDB]" />
            Tech Blogs & Actionable Tasks
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Focus on high-leverage execution (Karnataka grants, AWS vouchers, research fellowships) and principal system design blogs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-white border border-slate-200/90 p-1.5 rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "tasks"
                ? "bg-[#635BDB] text-white shadow-md shadow-[#635BDB]/25"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Growth Tasks ({tasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === "blogs"
                ? "bg-[#635BDB] text-white shadow-md shadow-[#635BDB]/25"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Tech Blogs ({CURATED_TECH_BLOGS.length})</span>
          </button>
        </div>
      </div>

      {/* ----------------- SUB-TAB: GROWTH TASKS ----------------- */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-[0_2px_12px_rgba(99,91,219,0.04)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#EEEDFD] text-[#635BDB]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Execution Velocity</h3>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-[#8BDCC0]/30 text-[#0E5B44] border border-[#8BDCC0]/60">
                  [{completedCount}/{tasks.length} Completed &bull; {progressPercent}%]
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#635BDB] h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-3 font-medium">
                Action items directly mapped to your Karnataka residency, CS undergraduate status, and cloud computing path.
              </p>
            </div>

            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-[0_2px_12px_rgba(99,91,219,0.04)]">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  // QUICK_ACTION
                </span>
                <h4 className="text-sm font-bold text-slate-900 mt-1">Add Milestone</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Track a hackathon, certification, or fellowship deadline.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#635BDB] hover:bg-[#5046CA] text-white font-semibold rounded-xl text-xs transition shadow-sm shadow-[#635BDB]/25"
              >
                <Plus className="w-4 h-4" /> Add Growth Task
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-500 font-medium flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#635BDB]" /> [FILTER]:
            </span>
            {taskCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTaskCategory(cat)}
                className={`text-xs font-mono px-3 py-1.5 rounded-xl border transition ${
                  selectedTaskCategory === cat
                    ? "bg-[#635BDB] border-[#635BDB] text-white font-semibold shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-500 text-sm">
                No tasks found for this category.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    task.completed
                      ? "bg-white/60 border-slate-200/60 opacity-70"
                      : "bg-white border-slate-200/90 hover:border-[#635BDB]/40 shadow-[0_2px_12px_rgba(99,91,219,0.03)]"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center border transition shrink-0 ${
                      task.completed
                        ? "bg-[#8BDCC0] border-[#8BDCC0] text-[#0E5B44]"
                        : "border-slate-300 hover:border-[#635BDB] text-transparent"
                    }`}
                    title={task.completed ? "Mark incomplete" : "Mark completed"}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-bold text-slate-900 leading-snug ${
                          task.completed ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
                          task.priority === "Urgent"
                            ? "bg-rose-50 border-rose-200 text-rose-700"
                            : task.priority === "High"
                            ? "bg-amber-50 border-amber-200 text-amber-700"
                            : "bg-slate-100 border-slate-200 text-slate-700"
                        }`}
                      >
                        [{task.priority.toUpperCase()}]
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EEEDFD] text-[#635BDB] border border-[#635BDB]/20">
                        {task.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{task.description}</p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Deadline: <strong className="text-slate-700">{task.deadline}</strong>
                      </span>
                      <span>&bull;</span>
                      <span className="text-[#0E5B44] font-bold">
                        Fit Score: {task.impactScore}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add Task Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#635BDB]">[NEW_TASK]</span>
                    <h3 className="text-base font-bold text-slate-900">Add Milestone</h3>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-700 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Task Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apply for Google Summer of Code 2027"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Category</label>
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value as any)}
                        className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB]"
                      >
                        <option value="Karnataka & Grants">Karnataka & Grants</option>
                        <option value="Certifications">Certifications</option>
                        <option value="Engineering & AI">Engineering & AI</option>
                        <option value="Research & Academics">Research & Academics</option>
                        <option value="Career">Career & Placement</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB]"
                      >
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Deadline Date</label>
                    <input
                      type="text"
                      placeholder="e.g. Dec 25, 2026"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full bg-[#F1F4FA] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#635BDB]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#635BDB] hover:bg-[#5046CA] text-white transition shadow-sm"
                    >
                      Create Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- SUB-TAB: CURATED TECH BLOGS ----------------- */}
      {activeTab === "blogs" && (
        <div className="space-y-6">
          {/* Header info */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_2px_12px_rgba(99,91,219,0.04)]">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-[#635BDB] bg-[#EEEDFD] px-2 py-0.5 rounded border border-[#635BDB]/20">
                  [SYSTEM_DESIGN::TIER_1]
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mt-1">
                <Code2 className="w-5 h-5 text-[#635BDB]" /> Architectural & Engineering Insights
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                High-signal technical writeups from teams operating distributed systems at global scale. Includes terminal-ready code blocks and takeaways.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#F8FAFC] text-slate-700 border border-slate-200 font-semibold">
                {CURATED_TECH_BLOGS.length} Selected Desks
              </span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-slate-500 font-medium flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#635BDB]" /> [DOMAIN]:
            </span>
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedBlogCategory(cat)}
                className={`text-xs font-mono px-3 py-1.5 rounded-xl border transition ${
                  selectedBlogCategory === cat
                    ? "bg-[#635BDB] border-[#635BDB] text-white font-semibold shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Cards Grid with Terminal Code Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-[#635BDB]/50 transition-all flex flex-col justify-between group shadow-[0_2px_12px_rgba(99,91,219,0.03)]"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#EEEDFD] border border-[#635BDB]/20 text-[#635BDB]">
                      {blog.category}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {blog.readTime}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base group-hover:text-[#635BDB] transition-colors">
                    {blog.name}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                    {blog.description}
                  </p>

                  {/* Terminal-Inspired Code Block Container */}
                  <div className="mt-4 rounded-xl overflow-hidden border border-slate-800 bg-[#0F172A] shadow-md">
                    {/* Window Title Bar with macOS dots */}
                    <div className="bg-[#1E293B] px-3 py-2 flex items-center justify-between border-b border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8BDCC0] inline-block"></span>
                        <span className="ml-2 font-mono text-[10px] text-slate-400 font-semibold truncate max-w-[130px]">
                          takeaway.sh
                        </span>
                      </div>
                      {blog.codeSnippet && (
                        <button
                          onClick={() => handleCopyCode(blog.id, blog.codeSnippet!)}
                          className="font-mono text-[10px] text-slate-400 hover:text-[#8BDCC0] flex items-center gap-1 transition"
                          title="Copy snippet"
                        >
                          <Copy className="w-3 h-3" />
                          <span>{copiedBlogId === blog.id ? "Copied" : "Copy"}</span>
                        </button>
                      )}
                    </div>

                    <div className="p-3">
                      <p className="text-[11px] font-mono text-[#8BDCC0] leading-relaxed">
                        &gt; {blog.keyTakeaway}
                      </p>

                      {blog.codeSnippet && (
                        <pre className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto scrollbar-none leading-relaxed">
                          <code>{blog.codeSnippet}</code>
                        </pre>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-500 font-medium truncate">
                    Top Story: <span className="text-slate-800 font-semibold">{blog.featuredArticle}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Level: <strong className="text-slate-700">{blog.difficulty}</strong>
                  </span>
                  <a
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-[#635BDB] hover:text-[#5046CA] transition group/link"
                  >
                    <span>[OPEN_DESK]</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
