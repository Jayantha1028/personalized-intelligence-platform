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
  Layers,
  Flame,
  ArrowUpRight,
  Filter,
  Check,
  Code2,
  Compass,
  Cpu,
  Globe2,
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
    title: "VTU 8th-Sem Capstone Industry Accreditation Submission",
    description: "Complete AI/ML project synopsis approval sheet signed by department HOD and industry mentor.",
    category: "Research & Academics",
    priority: "Medium",
    deadline: "Dec 20, 2026",
    completed: false,
    impactScore: 85,
  },
];

const CURATED_TECH_BLOGS: TechBlog[] = [
  {
    id: "blog-netflix",
    name: "Netflix TechBlog",
    org: "Netflix",
    category: "Distributed Systems",
    url: "https://netflixtechblog.com",
    description: "World-class engineering case studies on global microservice orchestration, resilience, Chaos Engineering, and caching.",
    featuredArticle: "Building High-Throughput Edge Gateways with Zuul 3 and Netty",
    keyTakeaway: "Non-blocking reactive I/O and zero-copy packet routing reduce p99 latency by 42% at petabyte scale.",
    readTime: "9 min",
    difficulty: "Advanced",
  },
  {
    id: "blog-uber",
    name: "Uber Engineering",
    org: "Uber",
    category: "Distributed Systems",
    url: "https://www.uber.com/blog/engineering",
    description: "Scalable real-time dispatch systems, geospatial index trees (H3), Kafka pipelines, and high-concurrency microservices.",
    featuredArticle: "H3 Hexagonal Hierarchical Spatial Index for Realtime Dispatch",
    keyTakeaway: "Using discrete hexagonal partitions eliminates distortion at high latitudes compared to Cartesian grids.",
    readTime: "12 min",
    difficulty: "Advanced",
  },
  {
    id: "blog-anthropic",
    name: "Anthropic Research & Engineering",
    org: "Anthropic",
    category: "AI & ML",
    url: "https://www.anthropic.com/research",
    description: "Groundbreaking papers and engineering posts on AI interpretability, prompt caching, RLHF, and agentic workflows.",
    featuredArticle: "Building Effective Agents: Workflows vs Autonomous Systems",
    keyTakeaway: "Deterministic orchestrators with narrow LLM tool invocations drastically outperform unconstrained autonomous loops in production.",
    readTime: "14 min",
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
    readTime: "10 min",
    difficulty: "Intermediate",
  },
  {
    id: "blog-fowler",
    name: "Martin Fowler Architecture",
    org: "ThoughtWorks",
    category: "System Design",
    url: "https://martinfowler.com",
    description: "The gold standard for enterprise software architecture, Domain-Driven Design (DDD), refactoring, and microservices trade-offs.",
    featuredArticle: "Modular Monolith vs Microservices: When to Partition Your System",
    keyTakeaway: "Premature microservice decomposition introduces distributed state complexity without the organizational boundaries to justify it.",
    readTime: "13 min",
    difficulty: "Intermediate",
  },
  {
    id: "blog-aws",
    name: "AWS Architecture Blog",
    org: "Amazon Web Services",
    category: "Cloud & Infra",
    url: "https://aws.amazon.com/blogs/architecture",
    description: "Practical reference architectures, event-driven designs with EventBridge & SQS, and Well-Architected Framework guidelines.",
    featuredArticle: "Patterns for Event-Driven Microservices with Low Latency Queues",
    keyTakeaway: "Saga patterns with compensating events provide eventual consistency without distributed 2-phase commit locking overhead.",
    readTime: "10 min",
    difficulty: "Beginner",
  },
];

export function TechBlogsAndTasksView() {
  const [activeTab, setActiveTab] = useState<"tasks" | "blogs">("tasks");
  const [tasks, setTasks] = useState<GrowthTask[]>(INITIAL_TASKS);
  const [selectedTaskCategory, setSelectedTaskCategory] = useState<string>("All");
  const [selectedBlogCategory, setSelectedBlogCategory] = useState<string>("All");

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskCategory, setNewTaskCategory] = useState<GrowthTask["category"]>("Karnataka & Grants");
  const [newTaskPriority, setNewTaskPriority] = useState<GrowthTask["priority"]>("High");
  const [newTaskDeadline, setNewTaskDeadline] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Load persisted tasks from localStorage on client side
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

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: GrowthTask = {
      id: "task-" + Date.now(),
      title: newTaskTitle.trim(),
      description: "Custom user goal prioritized for personal career & engineering growth.",
      category: newTaskCategory,
      priority: newTaskPriority,
      deadline: newTaskDeadline || "TBD",
      completed: false,
      impactScore: 90,
    };
    saveTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setNewTaskDeadline("");
    setShowAddModal(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const taskCategories = ["All", "Karnataka & Grants", "Certifications", "Engineering & AI", "Research & Academics", "Career"];
  const blogCategories = ["All", "AI & ML", "Distributed Systems", "Cloud & Infra", "System Design"];

  const filteredTasks = tasks.filter((t) =>
    selectedTaskCategory === "All" ? true : t.category === selectedTaskCategory
  );

  const filteredBlogs = CURATED_TECH_BLOGS.filter((b) =>
    selectedBlogCategory === "All" ? true : b.category === selectedBlogCategory
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
              Personal Growth Engine
            </span>
            <span className="text-xs text-slate-400">Career & Architecture Execution</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1 flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            Tech Blogs & Actionable Tasks
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Replace passive security alerts with concrete growth tasks (grants, certs, hackathons) and high-signal engineering blogs.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("tasks")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "tasks"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Growth Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "blogs"
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Tech Blogs ({CURATED_TECH_BLOGS.length})
          </button>
        </div>
      </div>

      {/* ----------------- SUB-TAB: GROWTH TASKS ----------------- */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          {/* Progress Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold text-slate-200">Execution Velocity</h3>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-400">
                  {completedCount} / {tasks.length} Completed ({progressPercent}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-3">
                Action items directly linked to your Karnataka residency, academic profile, and software career trajectory.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Quick Action</span>
                <h4 className="text-sm font-medium text-slate-200 mt-1">Add Milestone</h4>
                <p className="text-xs text-slate-400 mt-0.5">Track your personal projects, exams, or fellowship drafts.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 w-full inline-flex items-center justify-center gap-2 px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold rounded-lg text-xs transition"
              >
                <Plus className="w-4 h-4" /> Add Growth Task
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
            </span>
            {taskCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedTaskCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  selectedTaskCategory === cat
                    ? "bg-cyan-950 border-cyan-600 text-cyan-300 font-medium"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Task List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 text-sm">
                No tasks found for this category.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                    task.completed
                      ? "bg-slate-900/40 border-slate-800/60 opacity-70"
                      : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm"
                  }`}
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition shrink-0 ${
                      task.completed
                        ? "bg-cyan-500 border-cyan-400 text-slate-950"
                        : "border-slate-700 hover:border-cyan-500 text-transparent"
                    }`}
                    title={task.completed ? "Mark incomplete" : "Mark completed"}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-semibold text-slate-200 leading-snug ${
                          task.completed ? "line-through text-slate-400" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                          task.priority === "Urgent"
                            ? "bg-rose-950/80 border-rose-800 text-rose-300"
                            : task.priority === "High"
                            ? "bg-amber-950/80 border-amber-800 text-amber-300"
                            : "bg-slate-800 border-slate-700 text-slate-300"
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        {task.category}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1 ml-auto">
                        <Clock className="w-3 h-3 text-slate-400" /> Deadline: {task.deadline}
                      </span>
                    </div>

                    <p
                      className={`text-xs mt-1.5 text-slate-400 leading-relaxed ${
                        task.completed ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {task.description}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition shrink-0"
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
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-cyan-400" /> Add New Growth Task
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-slate-400 hover:text-slate-200 text-sm"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddTask} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Task Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Register for Google Cloud Arcade Hackathon"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Category</label>
                      <select
                        value={newTaskCategory}
                        onChange={(e) => setNewTaskCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Karnataka & Grants">Karnataka & Grants</option>
                        <option value="Certifications">Certifications</option>
                        <option value="Engineering & AI">Engineering & AI</option>
                        <option value="Research & Academics">Research & Academics</option>
                        <option value="Career">Career</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 font-medium block mb-1">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                      >
                        <option value="Urgent">Urgent</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 font-medium block mb-1">Target Deadline</label>
                    <input
                      type="text"
                      placeholder="e.g. Dec 31, 2026"
                      value={newTaskDeadline}
                      onChange={(e) => setNewTaskDeadline(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition"
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" /> Tier-1 Engineering & Architectural Insights
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                High-leverage engineering writeups from organizations operating at extreme scale. These architecture patterns elevate you from standard coding to principal system design.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-3 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {CURATED_TECH_BLOGS.length} Selected Desks
              </span>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Focus Domain:
            </span>
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedBlogCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                  selectedBlogCategory === cat
                    ? "bg-cyan-950 border-cyan-600 text-cyan-300 font-medium"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-700/60 transition-all flex flex-col justify-between group shadow-sm hover:shadow-cyan-900/10"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-400">
                        {blog.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {blog.readTime}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-100 text-base group-hover:text-cyan-300 transition-colors">
                    {blog.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {blog.description}
                  </p>

                  {/* Architecture Takeaway Box */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
                      Architecture Takeaway
                    </span>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                      "{blog.keyTakeaway}"
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="truncate max-w-[200px] text-slate-400">
                        Top: {blog.featuredArticle}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Level: <span className="text-slate-300">{blog.difficulty}</span>
                  </span>
                  <a
                    href={blog.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition group/link"
                  >
                    Open Publication
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
