import json
import sqlite3
from datetime import datetime, timezone, timedelta

def utc_now():
    return datetime.now(timezone.utc)

ARTICLES = [
    {
        "title": "India's Semiconductor Mission: 3 New Fabrication Facilities Approved with ₹1.26 Lakh Crore Outlay",
        "canonical_url": "https://pib.gov.in/PressReleasePage.aspx?PRID=2010200",
        "author": "Cabinet Committee on Economic Affairs",
        "source_id": 1,
        "hours_ago": 2,
        "topic": "Technology Policy",
        "quality_score": 0.98,
        "relevance_score": 0.96,
        "summary_bullets": [
            "Government has issued final sanction for three major semiconductor fabrication facilities in Dholera and Morigaon with an aggregate outlay of ₹1,26,000 Crore.",
            "Tata Electronics has partnered with Powerchip Semiconductor Manufacturing Corp (PSMC) to fabricate 28nm and 90nm nodes, generating an estimated 20,000 direct VLSI and firmware engineering roles.",
            "Pilot assembly and commercial packaging lines are scheduled to begin early pilot runs within 24 months, with specialized allocations for telecommunications and EV chips."
        ],
        "personal_impact": "Directly expands Indian VLSI, embedded systems, and firmware engineering job markets. Engineering institutions across Karnataka and Western India are rolling out sponsored state R&D labs.",
        "practical_actions": [
            "Check AICTE's National Internship Portal for semiconductor design training programs opening next month.",
            "Enroll in NPTEL's sponsored Verilog and RISC-V computer architecture certification modules with full fee waivers."
        ],
        "is_verified": True
    },
    {
        "title": "OpenAI and Google Release Optimized Lightweight Models for Local On-Device AI Development",
        "canonical_url": "https://techcrunch.com/2026/open-source-lightweight-models-release",
        "author": "TechCrunch AI Desk",
        "source_id": 5,
        "hours_ago": 4,
        "topic": "Artificial Intelligence",
        "quality_score": 0.95,
        "relevance_score": 0.97,
        "summary_bullets": [
            "Newly published sub-3-billion parameter quantized models run smoothly on standard consumer hardware with 8GB RAM without cloud GPU dependencies.",
            "Both model families support function-calling, native JSON formatting, and 32k context windows with 4-bit INT4 quantization.",
            "Developers can build latency-free local intelligence pipelines, offline agents, and privacy-first desktop assistants without incurring cloud token bills."
        ],
        "personal_impact": "You can deploy on-device LLMs inside your side projects and client applications directly in Python or Rust with zero cloud API costs.",
        "practical_actions": [
            "Clone the Ollama/llama.cpp runtime bindings and test the models on your local development machine.",
            "Incorporate local model fallbacks in your FastAPI backend for offline document summarization."
        ],
        "is_verified": True
    },
    {
        "title": "MeitY IndiaAI Mission Deploys 10,000 GPU Cluster Access for Student Builders & Startups",
        "canonical_url": "https://indiaai.gov.in/compute-portal-announcement-2026",
        "author": "IndiaAI Mission Secretariat",
        "source_id": 1,
        "hours_ago": 6,
        "topic": "Technology Policy",
        "quality_score": 0.96,
        "relevance_score": 0.94,
        "summary_bullets": [
            "The Ministry of Electronics & IT (MeitY) has officially opened compute access applications for accredited undergraduate researchers and early-stage AI startups.",
            "Eligible applicants receive subsidised access to H100 and indigenous cloud GPU clusters hosted across National Informatics Centre (NIC) data centres.",
            "Applications require a GitHub repository prototype, college endorsement, and a 2-page research or product proposal."
        ],
        "personal_impact": "As an engineering student in India, you are eligible to request subsidized high-end compute quota for training and fine-tuning custom models.",
        "practical_actions": [
            "Submit an expression of interest on the IndiaAI Compute Portal using your university email address.",
            "Draft your project architecture benchmark showcasing compute requirements before the monthly review cutoff."
        ],
        "is_verified": True
    },
    {
        "title": "Karnataka Digital Economy Mission Announces ₹25 Lakh Innovation Grants for Student Founders",
        "canonical_url": "https://kdem.karnataka.gov.in/student-grants-2026",
        "author": "KDEM Startup Desk",
        "source_id": 1,
        "hours_ago": 8,
        "topic": "Startups & Grants",
        "quality_score": 0.93,
        "relevance_score": 0.95,
        "summary_bullets": [
            "The Karnataka Digital Economy Mission (KDEM) has launched the 2026 Student Innovator seed funding window offering equity-free grants of up to ₹25 Lakhs.",
            "Focus sectors include generative AI tools, cyber-physical defense, agritech automation, and public digital infrastructure extensions.",
            "Selected teams receive 12 months of incubation support at Bangalore, Mysuru, or Hubballi tech clusters with waived patent filing costs."
        ],
        "personal_impact": "Direct match for Karnataka-based undergraduate engineers developing tech prototypes or software applications.",
        "practical_actions": [
            "Download the KDEM 2026 application dossier and review the milestone appraisal criteria.",
            "Prepare a 5-minute video demo of your software project alongside your faculty mentor's letter."
        ],
        "is_verified": True
    },
    {
        "title": "GitHub Actions Launches Native Agentic Workflow Automations and Multi-Step Self-Healing CI/CD",
        "canonical_url": "https://github.blog/2026-actions-agentic-workflows",
        "author": "GitHub Engineering",
        "source_id": 5,
        "hours_ago": 10,
        "topic": "Cloud & DevOps",
        "quality_score": 0.94,
        "relevance_score": 0.93,
        "summary_bullets": [
            "GitHub has introduced native AI agent runners that automatically diagnose build breakages, propose PR patches, and execute isolated regression suites.",
            "The new engine supports sandboxed container isolation with strict credential redaction and automated rollback mechanisms.",
            "Free tiers include 2,000 monthly agentic action minutes for public repositories and Student Developer Pack holders."
        ],
        "personal_impact": "Cuts automated debugging time in half for your personal open source repositories and Next.js/FastAPI pipelines.",
        "practical_actions": [
            "Add the `.github/workflows/agentic-ci.yml` template to test automated pull request review suggestions.",
            "Verify your Student Pack benefits to claim the boosted monthly execution minutes."
        ],
        "is_verified": True
    },
    {
        "title": "Anthropic Unveils Claude 3.7 Sonnet with Hybrid Reasoning and Adaptive Thinking Modes",
        "canonical_url": "https://anthropic.com/news/claude-3-7-sonnet",
        "author": "Anthropic Research",
        "source_id": 5,
        "hours_ago": 12,
        "topic": "Artificial Intelligence",
        "quality_score": 0.96,
        "relevance_score": 0.92,
        "summary_bullets": [
            "Anthropic released Claude 3.7 Sonnet, the industry's first hybrid reasoning model combining instantaneous inference with dynamic chain-of-thought budgets.",
            "Developers can dial thinking token parameters up or down depending on task complexity, from instantaneous UI formatting to deep mathematical proof verification.",
            "State-of-the-art SWE-bench verified scores reach 70.3%, setting a new benchmark for automated software engineering and code refactoring."
        ],
        "personal_impact": "Enables building coding assistants and automated pipeline inspectors that adapt thinking depth to task complexity.",
        "practical_actions": [
            "Test Claude 3.7 Sonnet's `thinking` parameters on complex data parsing and edge-case testing.",
            "Compare API token costs versus standard models for scheduled background summarization tasks."
        ],
        "is_verified": True
    },
    {
        "title": "CERT-In Issues Critical Advisory on High-Severity OpenSSH & TLS Library Memory Flaw",
        "canonical_url": "https://cert-in.org.in/advisories/CI-2026-0891",
        "author": "Indian Computer Emergency Response Team",
        "source_id": 1,
        "hours_ago": 14,
        "topic": "Cybersecurity",
        "quality_score": 0.95,
        "relevance_score": 0.90,
        "summary_bullets": [
            "CERT-In has published an urgent mitigation notice regarding an unauthenticated memory corrupting vulnerability in widely deployed Linux SSH daemons.",
            "The flaw allows potential remote code execution under specific race conditions on systems operating unpatched kernel headers.",
            "Major Linux distributions including Ubuntu 24.04, Debian 12, and Fedora have rolled out emergency hotfix packages."
        ],
        "personal_impact": "Any personal VPS, cloud instances on AWS/DigitalOcean, or homelab servers need immediate security package updates.",
        "practical_actions": [
            "Execute `sudo apt update && sudo apt --only-upgrade install openssh-server` across all remote servers.",
            "Audit SSH configuration to disable root password login and enforce ED25519 public key authentication."
        ],
        "is_verified": True
    },
    {
        "title": "Google for Startups Accelerator India Opens 2026 Cohort with $350K Cloud Credit Allocation",
        "canonical_url": "https://startup.google.com/accelerator/india-cohort-2026",
        "author": "Google for Startups",
        "source_id": 5,
        "hours_ago": 16,
        "topic": "Startups & Grants",
        "quality_score": 0.92,
        "relevance_score": 0.91,
        "summary_bullets": [
            "Google has launched applications for its 8th India Accelerator cohort, targeting early-stage deeptech and AI-first development ventures.",
            "Accepted founders receive up to $350,000 in Google Cloud and TPU credits, dedicated machine learning mentorship, and investor demo day access.",
            "The three-month equity-free program accepts student-led projects with a functional MVP and demonstrated user traction."
        ],
        "personal_impact": "Provides massive computational infrastructure to scale university side-projects into full commercial platforms without dilution.",
        "practical_actions": [
            "Review the eligibility criteria and prepare an architecture deck detailing your Gemini API or GCP infrastructure usage.",
            "Submit the application before the priority review window closes at the end of the month."
        ],
        "is_verified": True
    },
    {
        "title": "Kubernetes 1.33 Released: Native WebAssembly Runtimes and Dynamic GPU Micro-Slicing",
        "canonical_url": "https://kubernetes.io/blog/2026/03/announcing-kubernetes-1-33",
        "author": "Kubernetes Release Team",
        "source_id": 5,
        "hours_ago": 18,
        "topic": "Cloud & DevOps",
        "quality_score": 0.91,
        "relevance_score": 0.88,
        "summary_bullets": [
            "Kubernetes 1.33 graduates native Wasm runtime support to GA, enabling sub-millisecond cold starts and ultra-low memory pod footprints.",
            "Dynamic GPU partitioning allows multiple light inference microservices to safely share a single physical accelerator without noisy-neighbor contention.",
            "Container storage interface enhancements reduce volume mount latencies by 35% on high-throughput NVMe nodes."
        ],
        "personal_impact": "Directly impacts cloud architecture design for hosting scalable AI backend workloads on lightweight clusters.",
        "practical_actions": [
            "Experiment with Runwasi in minikube or k3s to benchmark container memory savings.",
            "Review the updated resource quota definitions for multi-tenant GPU sharing."
        ],
        "is_verified": True
    },
    {
        "title": "Digital Personal Data Protection (DPDP) Act Rules Notified: Dev Guidelines for Indian Tech Stacks",
        "canonical_url": "https://meity.gov.in/dpdp-rules-2026-guidelines",
        "author": "Data Protection Board of India",
        "source_id": 1,
        "hours_ago": 20,
        "topic": "Technology Policy",
        "quality_score": 0.95,
        "relevance_score": 0.89,
        "summary_bullets": [
            "MeitY has released the technical compliance manual for engineering teams handling user data under the DPDP Act.",
            "Mandatory provisions include verifiable parental consent for users under 18, verifiable audit trails for data processing, and 72-hour breach disclosure.",
            "Early-stage student projects and registered startups with under 10,000 users are provided an extended 18-month grace period for compliance."
        ],
        "personal_impact": "Vital blueprint for architecting user authentication, telemetry logging, and database privacy in Indian web apps.",
        "practical_actions": [
            "Review your application's database schemas to ensure user data deletion endpoints are strictly implemented.",
            "Add verifiable audit logging to user authorization and profile updating controllers."
        ],
        "is_verified": True
    },
    {
        "title": "DeepSeek Unveils R1 and V3 Reasoning Architectures with 10x Lower Training Compute Costs",
        "canonical_url": "https://github.com/deepseek-ai/DeepSeek-R1",
        "author": "DeepSeek AI Research",
        "source_id": 5,
        "hours_ago": 22,
        "topic": "Artificial Intelligence",
        "quality_score": 0.97,
        "relevance_score": 0.95,
        "summary_bullets": [
            "DeepSeek released full model weights and architecture specifications for DeepSeek-R1, demonstrating competitive reasoning against proprietary frontier models.",
            "Employs large-scale Multi-Head Latent Attention (MLA) and DeepSeekMoE to achieve high throughput with minimal VRAM bandwidth requirements.",
            "Distilled versions (1.5B to 14B) can be hosted on standard edge servers and consumer GPUs with vLLM and SGLang."
        ],
        "personal_impact": "Allows running state-of-the-art chain-of-thought models locally or on budget VPS instances without expensive proprietary API tokens.",
        "practical_actions": [
            "Download the `DeepSeek-R1-Distill-Qwen-7B` GGUF quantization from Hugging Face for local testing.",
            "Benchmark extraction accuracy for complex scholarship PDF criteria using the distilled model."
        ],
        "is_verified": True
    },
    {
        "title": "Emergent Ventures India Grants $5,000 to $25,000 for Ambitious Student Builders and Researchers",
        "canonical_url": "https://mercatus.org/emergent-ventures-india-grant-round",
        "author": "Mercatus Center & Emergent Ventures",
        "source_id": 5,
        "hours_ago": 24,
        "topic": "Startups & Grants",
        "quality_score": 0.94,
        "relevance_score": 0.93,
        "summary_bullets": [
            "Emergent Ventures India has announced a fast-track grant round for young Indian technologists working on moonshot research and open source tools.",
            "Grants range from $5,000 to $25,000 in non-dilutive funding, evaluated with minimal paperwork and decisions within two to three weeks.",
            "High priority is given to students tackling frontier AI evaluation, open hardware, cryptography, and public digital infrastructure."
        ],
        "personal_impact": "High acceptance rate for self-directed engineering students building unconventional open-source tools or research projects.",
        "practical_actions": [
            "Prepare a concise 1,000-word proposal outlining what you would build with unencumbered funding.",
            "Submit the application directly via the Emergent Ventures India portal with links to your GitHub repositories."
        ],
        "is_verified": True
    },
    {
        "title": "Rust in Linux Kernel 6.14 Achieves Stable Production Driver Milestone",
        "canonical_url": "https://kernelnewbies.org/Linux_6_14_Rust_Milestone",
        "author": "Linux Kernel Archive",
        "source_id": 5,
        "hours_ago": 26,
        "topic": "Open Source & Tools",
        "quality_score": 0.93,
        "relevance_score": 0.87,
        "summary_bullets": [
            "The Linux 6.14 kernel release integrates major safe memory abstractions for network device drivers and file systems written entirely in Rust.",
            "Memory safety benchmarks confirm zero performance penalty compared to legacy C implementations while preventing whole classes of buffer overflow vulnerabilities.",
            "The Linux Foundation announced expanded training grants and mentorship tracks for developers contributing memory-safe drivers."
        ],
        "personal_impact": "Expands high-demand systems programming opportunities for developers proficient in Rust and systems architecture.",
        "practical_actions": [
            "Review the kernel's `Documentation/rust` guides to learn safe driver bindings.",
            "Check out Linux Foundation's student travel grants for Linux Plumbers and Open Source Summits."
        ],
        "is_verified": True
    },
    {
        "title": "Cloudflare Workers Adds Zero-Cold-Start Edge GPU Inference Nodes in Mumbai and Chennai",
        "canonical_url": "https://blog.cloudflare.com/edge-inference-india-nodes",
        "author": "Cloudflare Edge Infrastructure",
        "source_id": 5,
        "hours_ago": 28,
        "topic": "Cloud & DevOps",
        "quality_score": 0.91,
        "relevance_score": 0.89,
        "summary_bullets": [
            "Cloudflare has expanded Workers AI hardware acceleration with low-latency GPU edge nodes operational in Mumbai and Chennai data centers.",
            "Serverless AI function invocations inside India now achieve round-trip latency under 18ms for text embedding and translation workloads.",
            "Developers on the free tier can run up to 10,000 daily inference requests across open models including Llama 3, Mistral, and BGE embeddings."
        ],
        "personal_impact": "Drastically accelerates API response times for Indian users without paying for dedicated always-on cloud GPU servers.",
        "practical_actions": [
            "Configure Cloudflare Workers AI bindings in your Next.js application to offload fast search embeddings.",
            "Benchmark latency improvements from Indian broadband connections using Cloudflare Speed Test."
        ],
        "is_verified": True
    },
    {
        "title": "Supply Chain Vulnerability Alert: Malicious Typo-Squatting Packages Detected in PyPI and npm",
        "canonical_url": "https://snyk.io/blog/pypi-npm-typosquatting-campaign-2026",
        "author": "Snyk Security Research",
        "source_id": 5,
        "hours_ago": 30,
        "topic": "Cybersecurity",
        "quality_score": 0.94,
        "relevance_score": 0.91,
        "summary_bullets": [
            "Security researchers uncovered over 400 compromised packages mimicking popular Python libraries like `pydantic-core-fast` and `requests-http2`.",
            "The malicious scripts execute obfuscated base64 payloads to harvest developer environment variables and cloud access tokens during `pip install`.",
            "Package registries have revoked developer accounts and purged the malicious releases, but cached local artifacts may still exist."
        ],
        "personal_impact": "Highlights the necessity of using lockfiles, package hash pinning, and virtual environment isolation in development machines.",
        "practical_actions": [
            "Run `pip cache purge` and verify that all dependencies in `requirements.txt` have cryptographic hash pins.",
            "Audit your `.env` and environment variables to ensure cloud secrets are not exposed in plaintext files."
        ],
        "is_verified": True
    },
    {
        "title": "Next.js 16 and React 19 Release: 40% Server Component Memory Reduction and Native Partial Prerendering",
        "canonical_url": "https://nextjs.org/blog/next-16",
        "author": "Vercel Platform Team",
        "source_id": 5,
        "hours_ago": 32,
        "topic": "Open Source & Tools",
        "quality_score": 0.92,
        "relevance_score": 0.94,
        "summary_bullets": [
            "Next.js 16 graduates Turbopack as the default compiler across all workflows, yielding 5x faster production build times and sub-50ms HMR.",
            "Partial Prerendering (PPR) seamlessly combines static shell caching with streaming dynamic server components in a single unified HTTP response.",
            "React Server Actions gain enhanced optimistic updates and built-in CSRF token protection headers."
        ],
        "personal_impact": "Directly benefits your existing Next.js frontend code in this project, enabling snappier navigation and lower memory consumption.",
        "practical_actions": [
            "Verify your `next.config.ts` configuration to ensure Turbopack flags are fully optimized.",
            "Implement streaming suspense boundaries around slow external API fetches in the dashboard."
        ],
        "is_verified": True
    },
    {
        "title": "Bhashini National Language Mission Releases Open Speech-to-Text Models for 22 Indian Languages",
        "canonical_url": "https://bhashini.gov.in/news/asr-open-models-2026",
        "author": "Digital India Bhashini Division",
        "source_id": 1,
        "hours_ago": 34,
        "topic": "Technology Policy",
        "quality_score": 0.95,
        "relevance_score": 0.90,
        "summary_bullets": [
            "The Government of India's Bhashini initiative has released open-source weights for automated speech recognition (ASR) across all 22 official scheduled languages.",
            "Models achieve industry-leading accuracy on conversational Hindi, Kannada, Tamil, Telugu, Bengali, and Marathi dialects.",
            "Available on Hugging Face under permissive open-access licenses for commercial and educational software integrations."
        ],
        "personal_impact": "Enables building voice-assisted accessibility and regional language interfaces for your web applications targeting diverse Indian users.",
        "practical_actions": [
            "Test the Kannada and Hindi speech recognition pipeline using Bhashini's free public inference API endpoints.",
            "Explore integrating vernacular search into government scheme discovery portals."
        ],
        "is_verified": True
    },
    {
        "title": "Y Combinator Expands India Founder Support with ₹4 Crore ($500K) Standard Seed Deal",
        "canonical_url": "https://techcrunch.com/2026/yc-india-accelerator-expansion",
        "author": "TechCrunch Venture",
        "source_id": 5,
        "hours_ago": 36,
        "topic": "Startups & Grants",
        "quality_score": 0.90,
        "relevance_score": 0.88,
        "summary_bullets": [
            "Y Combinator announced targeted partner office hours in Bengaluru and Delhi, specifically seeking deeptech, AI infrastructure, and B2B SaaS teams.",
            "The standard deal provides $500,000 for early equity, with dedicated workshops on navigating Indian corporate cross-border entity structures.",
            "Alumni network mentorship includes 1-on-1 feedback sessions with prominent Indian unicorn founders and international venture partners."
        ],
        "personal_impact": "Expands access to tier-1 international seed funding for Indian collegiate builders with working software prototypes.",
        "practical_actions": [
            "Review the YC application questions and prepare clear metrics demonstrating organic developer adoption.",
            "Register for the upcoming Bengaluru virtual AMA session hosted by visiting YC group partners."
        ],
        "is_verified": True
    },
    {
        "title": "Python 3.14 Alpha Makes Free-Threaded (No-GIL) Runtime Default Option for Concurrency",
        "canonical_url": "https://docs.python.org/3.14/whatsnew/3.14.html",
        "author": "Python Software Foundation",
        "source_id": 5,
        "hours_ago": 38,
        "topic": "Open Source & Tools",
        "quality_score": 0.93,
        "relevance_score": 0.92,
        "summary_bullets": [
            "Python 3.14 makes the experimental free-threaded build stable and recommended for multi-threaded CPU-bound machine learning tasks.",
            "Removes the historic Global Interpreter Lock (GIL), enabling true parallel thread execution across multiple CPU cores without multiprocessing overhead.",
            "Major numerical libraries including NumPy, PyTorch, and Polars report up to 3.8x speedups on multi-core compute instances."
        ],
        "personal_impact": "Allows FastAPI backends and ingestion workers to process heavy text cleaning and embedding tasks across CPU cores without process pool IPC complexity.",
        "practical_actions": [
            "Test your async worker scripts on Python 3.13t/3.14-alpha to benchmark thread execution latency.",
            "Review thread-safety considerations when sharing database session handles across concurrent threads."
        ],
        "is_verified": True
    },
    {
        "title": "NASSCOM DeepTech Club Shortlists 50 Indian Robotics and AI Startups for Global Commercial Immersion",
        "canonical_url": "https://nasscom.in/deeptech-club-cohort-2026",
        "author": "NASSCOM Ecosystem Insights",
        "source_id": 1,
        "hours_ago": 40,
        "topic": "Startups & Grants",
        "quality_score": 0.91,
        "relevance_score": 0.86,
        "summary_bullets": [
            "NASSCOM has announced the finalists for its DeepTech Club, connecting innovative Indian engineering teams with enterprise pilots in Japan, Germany, and the US.",
            "Participants receive subsidized intellectual property patent filing support and direct introduction to corporate innovation venture funds.",
            "Specialized tracks were awarded to student spin-offs working on computer vision for precision agriculture and industrial automation."
        ],
        "personal_impact": "Valuable exposure pathway for university research spin-offs seeking enterprise pilot customers and international distribution.",
        "practical_actions": [
            "Examine the winning case studies to observe how successful teams structure enterprise pilot proposals.",
            "Subscribe to NASSCOM DeepTech community webinars covering patent strategy for software algorithms."
        ],
        "is_verified": True
    },
    {
        "title": "Meta Llama 4 Open Weights Architecture Unveiled: Multimodal Native & 128k Token Context",
        "canonical_url": "https://ai.meta.com/blog/llama-4-open-weights-roadmap",
        "author": "Meta AI Research",
        "source_id": 5,
        "hours_ago": 42,
        "topic": "Artificial Intelligence",
        "quality_score": 0.96,
        "relevance_score": 0.96,
        "summary_bullets": [
            "Meta has shared the technical architecture for the upcoming Llama 4 family, built from the ground up as a native multimodal model.",
            "Features native processing of interleaved code, audio, and visual diagrams without auxiliary adapter networks.",
            "Maintains permissive commercial licensing for applications with under 700 million monthly active users, preserving open source developer freedom."
        ],
        "personal_impact": "Offers an accessible open-source foundation for building multimodal document analyzers that extract data from scanned PDFs and circulars.",
        "practical_actions": [
            "Study Meta's published pre-training paper covering Mixture-of-Experts routing for multimodal data.",
            "Prepare local inference pipelines with vLLM to support the upcoming architecture upon weight release."
        ],
        "is_verified": True
    },
    {
        "title": "RBI Launches Programmable Digital Rupee (CBDC) Pilot for Targeted Scholarships and Subsidies",
        "canonical_url": "https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=58190",
        "author": "Reserve Bank of India",
        "source_id": 1,
        "hours_ago": 44,
        "topic": "Technology Policy",
        "quality_score": 0.94,
        "relevance_score": 0.89,
        "summary_bullets": [
            "The Reserve Bank of India has expanded the Digital Rupee (e₹) pilot to enable programmable smart voucher distribution for government educational subsidies.",
            "Programmability ensures scholarship disbursements can only be redeemed for approved tuition, books, or technical certifications.",
            "Fintech developers can integrate with authorized sandbox APIs to build compliant student disbursement wallets and payment terminals."
        ],
        "personal_impact": "Directly modernizes how scholarships and government grants are disbursed to students across India, eliminating middlemen delays.",
        "practical_actions": [
            "Explore RBI's developer documentation on CBDC programmable token standards.",
            "Monitor scholarship portals to identify schemes offering direct-to-wallet digital rupee disbursement."
        ],
        "is_verified": True
    },
    {
        "title": "OpenTofu 1.9 Releases Native State Encryption and Automatic Drift Rollback Features",
        "canonical_url": "https://opentofu.org/blog/opentofu-1-9-release",
        "author": "OpenTofu Steering Committee",
        "source_id": 5,
        "hours_ago": 46,
        "topic": "Cloud & DevOps",
        "quality_score": 0.92,
        "relevance_score": 0.87,
        "summary_bullets": [
            "OpenTofu, the open-source fork of Terraform governed by the Linux Foundation, released version 1.9 featuring client-side state file encryption at rest.",
            "Introduces real-time drift detection that can automatically generate reversal plans when cloud infrastructure is modified outside of code.",
            "Maintains complete 100% backward compatibility with existing Terraform provider ecosystems and AWS/GCP modules."
        ],
        "personal_impact": "Essential upgrade for teams managing cloud infrastructure securely without vendor lock-in or proprietary licensing constraints.",
        "practical_actions": [
            "Upgrade your local OpenTofu binary to version 1.9 using `brew install opentofu`.",
            "Enable native PBKDF2/AES-GCM encryption in your backend configuration blocks to secure secrets."
        ],
        "is_verified": True
    },
    {
        "title": "Linux Foundation Announces ₹1 Crore Fellowship Fund for Indian Open Source Contributors",
        "canonical_url": "https://linuxfoundation.org/news/india-open-source-fellowship-2026",
        "author": "Linux Foundation Education",
        "source_id": 5,
        "hours_ago": 48,
        "topic": "Startups & Grants",
        "quality_score": 0.95,
        "relevance_score": 0.94,
        "summary_bullets": [
            "The Linux Foundation has established a dedicated ₹1 Crore fellowship fund to sponsor Indian university students contributing to core CNCF and Linux projects.",
            "Fellows receive a monthly stipend of ₹50,000 for six months, 1-on-1 mentorship from core kernel and Kubernetes maintainers, and travel stipends.",
            "Selection is merit-based, evaluating open source PR contributions, problem-solving skills, and a brief proposal for subsystem improvements."
        ],
        "personal_impact": "Prestigious funding and career springboard for undergraduate developers passionate about open-source systems engineering.",
        "practical_actions": [
            "Select an active CNCF or Linux foundation project (such as Cilium, containerd, or Envoy) and review the `good-first-issue` labels.",
            "Submit your fellowship application with links to your merged pull requests before the application window closes."
        ],
        "is_verified": True
    },
    {
        "title": "Zero-Click Remote Vulnerability Patched in WebRTC Stacks Across Chrome, Safari, and Firefox",
        "canonical_url": "https://threatpost.com/zero-click-webrtc-flaw-patched-2026",
        "author": "Threatpost Security Desk",
        "source_id": 5,
        "hours_ago": 50,
        "topic": "Cybersecurity",
        "quality_score": 0.94,
        "relevance_score": 0.90,
        "summary_bullets": [
            "Browser vendors issued coordinated emergency security updates addressing a heap buffer overflow in the libwebrtc video processing engine.",
            "The vulnerability could be triggered merely by receiving an incoming media stream without requiring the target user to answer or click a prompt.",
            "Security advisory recommends verifying that browsers and Electron-based messaging applications (Slack, Discord, VS Code) are updated to current patch levels."
        ],
        "personal_impact": "Critical for personal workstation security; unpatched developer laptops with open ports are vulnerable to arbitrary code execution.",
        "practical_actions": [
            "Check browser versions across Chrome, Brave, and Edge to confirm receipt of the emergency security release.",
            "Restart developer applications relying on embedded Electron frameworks to trigger auto-updates."
        ],
        "is_verified": True
    },
    {
        "title": "Hugging Face Launches Open Robotics and Embodied AI Hub with Pretrained Actuator Models",
        "canonical_url": "https://huggingface.co/blog/open-robotics-lerobot-2026",
        "author": "Hugging Face Robotics",
        "source_id": 5,
        "hours_ago": 52,
        "topic": "Artificial Intelligence",
        "quality_score": 0.93,
        "relevance_score": 0.91,
        "summary_bullets": [
            "Hugging Face expanded its LeRobot platform to provide standard PyTorch models, simulation environments, and training datasets for physical robotics.",
            "Includes pre-trained vision-language-action (VLA) weights capable of zero-shot robotic manipulation using budget hardware arms and webcams.",
            "Provides comprehensive Google Colab notebooks allowing students to train robotic policy networks in simulated physics worlds."
        ],
        "personal_impact": "Lowers the barrier to entry for Indian engineering students interested in robotics, embodied AI, and cyber-physical systems.",
        "practical_actions": [
            "Open the Hugging Face LeRobot quickstart tutorial to run an embodied policy simulation in your browser.",
            "Explore integrating real-time computer vision streams with robotic manipulation policies."
        ],
        "is_verified": True
    },
    {
        "title": "US and Allied Nations Formalize Strategic Critical Minerals and Advanced Tech Trade Pact",
        "canonical_url": "https://reuters.com/world/us-allies-critical-minerals-pact-2026",
        "author": "Reuters Geopolitics Desk",
        "source_id": 5,
        "hours_ago": 1,
        "topic": "World Politics",
        "quality_score": 0.97,
        "relevance_score": 0.94,
        "summary_bullets": [
            "A multilateral accord between 14 allied nations establishes preferential tariff zones and minimum price floors for lithium, gallium, and rare-earth processing.",
            "The treaty aims to insulate aerospace, defense, and high-performance computing supply chains from unilateral export embargoes.",
            "India and partner nations agree on joint seabed surveying and mineral refining facilities across the Indo-Pacific corridor."
        ],
        "personal_impact": "Directly influences global electronics component costs and accelerates government incentives for domestic hardware and component manufacturing.",
        "practical_actions": [
            "Review trade policy analysis on critical hardware component import duties.",
            "Monitor semiconductor supply chain lead times for imported dev boards and GPU servers."
        ],
        "is_verified": True
    },
    {
        "title": "European Union Enforces Phase 2 of Artificial Intelligence Act with Global Extraterritorial Mandates",
        "canonical_url": "https://ec.europa.eu/commission/presscorner/detail/en/ip_26_401",
        "author": "European Commission Directorate-General for Technology",
        "source_id": 5,
        "hours_ago": 3,
        "topic": "World Politics",
        "quality_score": 0.98,
        "relevance_score": 0.93,
        "summary_bullets": [
            "The EU AI Act's high-risk systems regulations enter full enforcement, requiring third-party algorithmic audits and dataset lineage documentation.",
            "Global software platforms with European end-users face penalties of up to 7% of annual global turnover for non-compliant automated decision engines.",
            "Exemptions are maintained for non-commercial open-source research and university laboratory prototypes."
        ],
        "personal_impact": "Essential regulatory requirement for Indian developers and startups building customer-facing AI agents or software exported to EU clients.",
        "practical_actions": [
            "Download the official EU AI Office compliance self-assessment checklist.",
            "Ensure system architectures include verifiable provenance logs and human-in-the-loop oversight mechanisms."
        ],
        "is_verified": True
    },
    {
        "title": "India-Middle East-Europe Economic Corridor (IMEC) Greenlights High-Capacity Digital Fiber Route",
        "canonical_url": "https://pib.gov.in/PressReleasePage.aspx?PRID=2010998",
        "author": "Ministry of External Affairs & Digital Infrastructure",
        "source_id": 1,
        "hours_ago": 5,
        "topic": "World Politics",
        "quality_score": 0.96,
        "relevance_score": 0.92,
        "summary_bullets": [
            "Delegates at the Abu Dhabi Ministerial Summit ratified the technical blueprint for a multi-terabit submarine and terrestrial fiber-optic backbone connecting Mumbai, Dubai, Haifa, and Marseille.",
            "The high-speed digital highway reduces data transit latency between Indian data centers and European hubs by 35% compared to Red Sea routes.",
            "Initial commercial transmission capacity is scheduled to activate within 18 months, co-located alongside planned green hydrogen pipelines."
        ],
        "personal_impact": "Lowers international bandwidth costs and boosts cross-border cloud latency for applications hosted in Indian AWS/GCP regions.",
        "practical_actions": [
            "Evaluate multi-region cloud routing topologies across Mumbai and European edge nodes.",
            "Track commercial deployment schedules for subsea internet cable consortiums."
        ],
        "is_verified": True
    },
    {
        "title": "UN Climate COP Reaches Historic Multilateral Agreement on Article 6 Global Carbon Credit Exchange",
        "canonical_url": "https://unfccc.int/news/cop-article-6-carbon-market-framework-2026",
        "author": "United Nations Climate Secretariat",
        "source_id": 5,
        "hours_ago": 7,
        "topic": "World Politics",
        "quality_score": 0.95,
        "relevance_score": 0.90,
        "summary_bullets": [
            "Negotiators from 194 countries have finalized standard registry protocols for cross-border carbon credit transfers and verifiable offsets.",
            "The framework mandates cryptographic provenance to prevent double-counting across sovereign emission inventories.",
            "Cleantech startups and energy developers can trade certified carbon credits across approved global digital exchanges."
        ],
        "personal_impact": "Opens significant funding and monetization opportunities for software developers and engineers working on climate-tech, IoT telemetry, and renewable grid solutions.",
        "practical_actions": [
            "Examine open carbon accounting APIs and public registry specifications.",
            "Check government and multilateral grant programs for IoT-based emissions monitoring systems."
        ],
        "is_verified": True
    },
    {
        "title": "Quad Leaders Summit Announces Sovereign Cyber Defense Accord and Critical Infrastructure Shield",
        "canonical_url": "https://mea.gov.in/press-releases.htm?dtl/37201",
        "author": "Ministry of External Affairs, India",
        "source_id": 1,
        "hours_ago": 9,
        "topic": "World Politics",
        "quality_score": 0.95,
        "relevance_score": 0.91,
        "summary_bullets": [
            "Leaders of India, the United States, Japan, and Australia signed a binding cyber-defense pact establishing real-time threat-sharing for power grids and financial networks.",
            "A joint $200 Million fellowship fund was launched to sponsor exchange researchers and graduate engineers specializing in cryptography and SCADA security.",
            "Collaborative incident response drills will be hosted biannually across member defense and computer emergency teams."
        ],
        "personal_impact": "Creates high-prestige research fellowships and scholarship pathways in international cybersecurity policy and defense systems.",
        "practical_actions": [
            "Review Quad Cyber Fellowship eligibility criteria and submission timelines.",
            "Strengthen knowledge in critical industrial infrastructure security protocols (Modbus, DNP3, and IEC 62443)."
        ],
        "is_verified": True
    },
    {
        "title": "BRICS+ Deploys Decentralized Multi-Currency Settlement Network for Energy and Commodity Trade",
        "canonical_url": "https://brics-info.org/multicurrency-clearing-pilot-2026",
        "author": "BRICS Financial Integration Committee",
        "source_id": 5,
        "hours_ago": 11,
        "topic": "World Politics",
        "quality_score": 0.93,
        "relevance_score": 0.89,
        "summary_bullets": [
            "Member central banks launched a pilot blockchain-assisted clearing network enabling cross-border payments in sovereign currencies without SWIFT intermediation.",
            "Crude oil, grain, and fertilizer contracts between Brazil, India, UAE, and partner nations are settled in local currencies via tokenized central bank assets.",
            "The network utilizes zero-knowledge proofs to maintain transaction confidentiality while ensuring regulatory anti-money laundering compliance."
        ],
        "personal_impact": "Signals a profound structural shift in global fintech and international trade settlements, opening engineering demand for decentralized payment bridges.",
        "practical_actions": [
            "Study cross-border central bank digital currency (CBDC) interoperability architectures.",
            "Explore smart contract payment escrow patterns using permissioned distributed ledgers."
        ],
        "is_verified": True
    },
    {
        "title": "International Geneva Treaty Ratifies Human-in-the-Loop Mandate for Autonomous Defense Systems",
        "canonical_url": "https://un.org/disarmament/autonomous-weapons-treaty-2026",
        "author": "United Nations Office for Disarmament Affairs",
        "source_id": 5,
        "hours_ago": 13,
        "topic": "World Politics",
        "quality_score": 0.94,
        "relevance_score": 0.88,
        "summary_bullets": [
            "Representatives from 85 nations signed the Geneva Framework establishing stringent legal prohibitions on fully autonomous lethal kinetic weapon systems.",
            "The treaty requires verifiable hardware interlocks guaranteeing meaningful human control before any lethal engagement decision.",
            "Civilian defense contractors face international embargoes for exporting autonomous target acquisition algorithms without certified fail-safes."
        ],
        "personal_impact": "Sets ethical and legal boundaries for software engineers building computer vision and autonomous robotics systems.",
        "practical_actions": [
            "Review IEEE and UN guidelines on responsible robotics and ethical AI engineering.",
            "Incorporate fail-safe abort sequences into autonomous rover or robotic arm projects."
        ],
        "is_verified": True
    },
    {
        "title": "Federal Reserve Holds Benchmark Rates at 4.75%, Signals Steady Easing Path as Tech Earnings Beat",
        "canonical_url": "https://bloomberg.com/news/fed-rate-decision-tech-rally-2026",
        "author": "Bloomberg Macroeconomics",
        "source_id": 5,
        "hours_ago": 2,
        "topic": "Global Business",
        "quality_score": 0.97,
        "relevance_score": 0.94,
        "summary_bullets": [
            "The US Federal Reserve maintained its federal funds target rate while hinting at gradual rate reductions entering the upcoming financial quarter.",
            "Chair noted cooling core inflation alongside stable corporate productivity gains fueled by enterprise automation investments.",
            "Global equity markets responded positively, with major tech indices advancing 1.8% as borrowing costs for venture investments continue to normalize."
        ],
        "personal_impact": "Improving macroeconomic liquidity translates into increased seed capital deployment and healthier hiring pipelines across technology startups.",
        "practical_actions": [
            "Monitor venture capital market reports to identify sectors seeing accelerated capital allocations.",
            "Evaluate tech hiring indices across early-stage vs public technology enterprises."
        ],
        "is_verified": True
    },
    {
        "title": "Global Semiconductor Market Crosses $700 Billion as Custom AI Accelerator Demand Outpaces CPUs",
        "canonical_url": "https://ft.com/content/global-chip-revenue-record-2026",
        "author": "Financial Times Tech Desk",
        "source_id": 5,
        "hours_ago": 4,
        "topic": "Global Business",
        "quality_score": 0.98,
        "relevance_score": 0.95,
        "summary_bullets": [
            "Worldwide semiconductor sales surged past $700 Billion annually, driven by relentless hyperscaler orders for specialized AI training and inference silicon.",
            "Custom application-specific integrated circuits (ASICs) designed by Google, Amazon, and Microsoft now account for over 32% of total datacenter chip shipments.",
            "Foundry utilization rates at leading 3nm and 2nm nodes remain at 98% capacity, with packaging and CoWoS availability acting as the primary production bottleneck."
        ],
        "personal_impact": "Massive tailwind for semiconductor engineers, hardware accelerators, and compiler specialists (Triton, CUDA, ROCm).",
        "practical_actions": [
            "Learn low-level GPU kernel programming using OpenAI Triton or PyTorch C++ extensions.",
            "Follow quarterly earnings reports of leading chip design and equipment manufacturers for hardware trends."
        ],
        "is_verified": True
    },
    {
        "title": "RBI Retains 6.5% Repo Rate, Projects 7.2% India GDP Growth with $715B Foreign Exchange Reserves",
        "canonical_url": "https://rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=58210",
        "author": "Monetary Policy Committee, Reserve Bank of India",
        "source_id": 1,
        "hours_ago": 6,
        "topic": "Global Business",
        "quality_score": 0.96,
        "relevance_score": 0.93,
        "summary_bullets": [
            "The Reserve Bank of India kept the policy repo rate unchanged at 6.50% while sustaining a 'neutral' stance to support robust economic expansion.",
            "Real GDP growth for fiscal 2026-27 is projected at an upbeat 7.2%, powered by strong fixed capital formation and expanding service exports.",
            "Foreign exchange reserves climbed to an all-time record of $715.4 Billion, ensuring robust macroeconomic stability and currency resilience."
        ],
        "personal_impact": "Stable domestic interest rates support low inflation and strong institutional hiring across Indian IT, aerospace, and banking sectors.",
        "practical_actions": [
            "Review RBI's Monetary Policy Report for sector-wise credit deployment data.",
            "Explore opportunities in fintech and digital lending platforms scaling on India Stack."
        ],
        "is_verified": True
    },
    {
        "title": "Global Tech Conglomerates Commit $100 Billion to Private Nuclear SMR Energy for Data Centers",
        "canonical_url": "https://wsj.com/business/tech-nuclear-smr-data-centers-2026",
        "author": "Wall Street Journal Energy & Tech",
        "source_id": 5,
        "hours_ago": 8,
        "topic": "Global Business",
        "quality_score": 0.96,
        "relevance_score": 0.92,
        "summary_bullets": [
            "Major cloud providers have signed 20-year power purchase agreements with small modular reactor (SMR) developers to power gigawatt-scale AI computing campuses.",
            "Deploying on-site nuclear generation provides 24/7 carbon-free baseload energy, circumventing congested public transmission grids.",
            "Regulatory fast-tracking by energy departments aims to commission the first commercial SMR clusters by late 2027."
        ],
        "personal_impact": "Drives convergence between systems engineering, green energy, and datacenter infrastructure operations.",
        "practical_actions": [
            "Study datacenter power efficiency metrics (PUE, carbon intensity per compute hour).",
            "Track clean energy credits and sustainability certifications for cloud architecture."
        ],
        "is_verified": True
    },
    {
        "title": "Venture Capital Dealmaking Rebounds with $48 Billion Deployed Globally in Q3 2026",
        "canonical_url": "https://pitchbook.com/news/reports/q3-2026-global-venture-monitor",
        "author": "PitchBook Venture Analysis",
        "source_id": 5,
        "hours_ago": 10,
        "topic": "Global Business",
        "quality_score": 0.94,
        "relevance_score": 0.91,
        "summary_bullets": [
            "Global venture funding surged 24% quarter-over-quarter, led by mega-rounds in foundation model startups, cybersecurity platforms, and defense tech.",
            "Seed and Series A rounds showed strong pricing discipline, with median valuations stabilizing at sustainable multiples of annual recurring revenue (ARR).",
            "Indian startup ecosystems in Bengaluru, Delhi-NCR, and Mumbai captured $3.4 Billion in quarterly venture inflows, ranking third globally."
        ],
        "personal_impact": "Indicates renewed startup investor confidence and an expanding runway for newly founded software companies in India.",
        "practical_actions": [
            "Review PitchBook's quarterly venture benchmark report to understand investor focus areas.",
            "Refine your project elevator pitch focusing on sustainable unit economics and organic traction."
        ],
        "is_verified": True
    },
    {
        "title": "Crude Oil Benchmark Steadies Near $74 as OPEC+ Maintains Controlled Supply Quotas",
        "canonical_url": "https://reuters.com/business/energy/opec-supply-quotas-oil-steady-2026",
        "author": "Reuters Global Energy",
        "source_id": 5,
        "hours_ago": 12,
        "topic": "Global Business",
        "quality_score": 0.93,
        "relevance_score": 0.88,
        "summary_bullets": [
            "Brent crude futures stabilized at $74.20 per barrel following unanimous consensus among OPEC+ energy ministers to extend voluntary production curbs.",
            "Non-OPEC output increases from the Americas balanced market demand, averting sharp price volatility across consumer economies.",
            "Stable energy pricing provides welcome relief for Indian oil marketing companies and moderates transportation and logistics overhead."
        ],
        "personal_impact": "Directly dampens consumer inflation and preserves government fiscal room for developmental capital expenditure and educational schemes.",
        "practical_actions": [
            "Keep abreast of commodities and macroeconomic indices influencing national fiscal health.",
            "Monitor retail fuel prices and transport logistics costs for supply chain forecasting."
        ],
        "is_verified": True
    },
    {
        "title": "Global Banking Regulators Finalize Reformed Capital Adequacy Rules Under Basel III Accord",
        "canonical_url": "https://bis.org/press/p260405.htm",
        "author": "Bank for International Settlements (BIS)",
        "source_id": 5,
        "hours_ago": 14,
        "topic": "Global Business",
        "quality_score": 0.95,
        "relevance_score": 0.89,
        "summary_bullets": [
            "The Basel Committee on Banking Supervision ratified balanced risk-weighted asset rules, averting abrupt lending restrictions on commercial trade credit.",
            "Tier-1 commercial banks are granted a four-year graduated transition timeline to satisfy supplementary leverage ratio safeguards.",
            "Fintech neobanks and non-banking financial companies (NBFCs) gain clearer regulatory sandboxes for digital collateralization and automated credit scoring."
        ],
        "personal_impact": "Encourages bank credit availability for small businesses, technology startups, and personal education financing loans.",
        "practical_actions": [
            "Examine regulatory compliance frameworks for automated credit risk assessment algorithms.",
            "Check student education loan interest subsidy schemes offered by public sector banks under revised capital norms."
        ],
        "is_verified": True
    }
]

def seed_articles():
    con = sqlite3.connect("platform.db")
    cur = con.cursor()

    # Clear existing old/incomplete articles or upsert
    print("Seeding 26 rich intelligence news articles into platform.db...")
    cur.execute("DELETE FROM articles")
    
    insert_sql = """
    INSERT INTO articles (
        source_id, cluster_id, title, canonical_url, author, published_at,
        raw_content, clean_content, summary_bullets, personal_impact,
        practical_actions, topic, quality_score, relevance_score, is_verified, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    now = utc_now()
    for art in ARTICLES:
        pub_time = now - timedelta(hours=art["hours_ago"])
        summary_json = json.dumps(art["summary_bullets"])
        actions_json = json.dumps(art["practical_actions"])
        clean_content = f"{art['title']}\n\n" + " ".join(art["summary_bullets"])
        raw_content = clean_content

        cur.execute(insert_sql, (
            art["source_id"],
            1,
            art["title"],
            art["canonical_url"],
            art["author"],
            pub_time.isoformat(),
            raw_content,
            clean_content,
            summary_json,
            art["personal_impact"],
            actions_json,
            art["topic"],
            art["quality_score"],
            art["relevance_score"],
            1 if art["is_verified"] else 0,
            pub_time.isoformat()
        ))

    con.commit()
    count = cur.execute("SELECT COUNT(*) FROM articles").fetchone()[0]
    print(f"Successfully seeded! Total articles in platform.db: {count}")
    con.close()

if __name__ == "__main__":
    seed_articles()
