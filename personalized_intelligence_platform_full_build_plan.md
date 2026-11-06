# Personalized Intelligence & Opportunities Platform
## Complete Build Plan and Technical Blueprint

**Version:** 1.0  
**Date:** 6 November 2026  
**Scope:** India-first personal web application, extensible to global opportunities

---

## 1. Executive Summary

Build an ad-free, personalized intelligence platform that helps a user answer two questions:

1. What important information should I know?
2. What opportunities, benefits, discounts, scholarships, grants, and programs could benefit me?

The platform combines two independent processing pipelines:

- **News Intelligence:** discovers, cleans, deduplicates, ranks, summarizes, and explains relevant news.
- **Opportunity Intelligence:** discovers offers and programs, extracts their conditions, verifies them against issuing sources, evaluates profile fit, and tracks deadlines.

Both pipelines share source management, ingestion infrastructure, storage, user preferences, monitoring, and the dashboard.

The system should be reliable and auditable, but no external-source application can guarantee perfect operation. Websites change, APIs fail, and program terms change. The engineering goal is graceful failure, traceability, tested recovery, and clear uncertainty.

## 2. Product Goals

The application must:

1. Collect information from approved sources on a schedule.
2. Remove irrelevant page elements and advertising content from extracted text.
3. Detect duplicate and closely related stories.
4. Rank news against editable user interests.
5. Produce evidence-grounded summaries and personal-impact explanations.
6. Discover scholarships, government schemes, company offers, cloud credits, student programs, internships, jobs, fellowships, grants, competitions, and useful discounts.
7. Normalize each opportunity into a common data structure.
8. Verify claims against the issuing organization's official source wherever possible.
9. Match opportunities against an optional user profile.
10. Distinguish confirmed matches, potential matches, unknown eligibility, and ineligibility.
11. Track opening dates, deadlines, expiry, and changes.
12. Let users save, dismiss, apply, or mark opportunities as claimed.
13. Notify users about important new items and approaching deadlines.
14. Provide source health, processing logs, backups, and recovery procedures.

### Non-goals for the first release

- Automatically submitting scholarship or government applications.
- Collecting Aadhaar, bank credentials, passwords, or identity documents.
- Scraping sites in violation of their terms or access controls.
- Guaranteeing eligibility or benefit receipt.
- Building a complex microservice or Kubernetes deployment before it is needed.
- Training a custom large language model.

## 3. Main Product Sections

1. **Overview:** personalized daily summary, important news, new opportunities, upcoming deadlines.
2. **News:** technology, AI, cloud, cybersecurity, software, science, business, government, and other selected topics.
3. **Offers & Benefits:** software, subscriptions, student programs, cloud credits, discounts, rewards.
4. **Scholarships:** national, state, university, private, merit-based, and need-based opportunities.
5. **Government Benefits:** central and state schemes, subsidies, grants, financial assistance, and public services.
6. **Career & Opportunities:** internships, jobs, fellowships, hackathons, competitions, certifications, research and startup programs.
7. **Personal Insights:** why an item matters, possible actions, and practical implications.
8. **Saved Items:** bookmarked articles and opportunities.
9. **Deadline Tracker:** opening dates, closing dates, reminders, and status.
10. **Notifications:** important alerts and daily digest.
11. **Settings:** profile, interests, regions, notification preferences, privacy controls.
12. **Admin / Maintenance:** source registry, extraction failures, verification queue, job health, and audit history.

## 4. Recommended Architecture

Use a **modular monolith** for the first version. Keep modules separate in code, but deploy them together initially. This is simpler to build and maintain than microservices.

```text
                 APPROVED INFORMATION SOURCES
 RSS / APIs / Official Portals / Company Pages / Publisher Feeds
                              |
                              v
                     SOURCE REGISTRY
                              |
                              v
                       INGESTION LAYER
        Fetchers / Scheduling / Retries / Rate Limits / Logs
                              |
                              v
                    COMMON PROCESSING LAYER
       Extraction / Cleaning / Normalization / Deduplication
                              |
                 +------------+------------+
                 |                         |
                 v                         v
          NEWS INTELLIGENCE        OPPORTUNITY INTELLIGENCE
          - Topic classification  - Opportunity extraction
          - Embeddings             - Eligibility rule extraction
          - Relevance scoring      - Official-source verification
          - Quality assessment     - Benefit and deadline checks
          - Summarization          - Profile matching
          - Personal impact        - Opportunity ranking
                 |                         |
                 +------------+------------+
                              |
                              v
                  POSTGRESQL + PGVECTOR
       Articles / Opportunities / Users / Matches / Evidence
                              |
                              v
                    FASTAPI APPLICATION
                              |
                              v
                    NEXT.JS WEB DASHBOARD
                              |
                 +------------+------------+
                 |                         |
                 v                         v
            USER ACTIONS             NOTIFICATIONS
       Save / Dismiss / Apply       Email / Telegram
       Feedback / Track status      Daily digest / Alerts
```

### Reliability principle

A failure in one source or one pipeline must not stop the other sources or pipeline. Each ingestion and processing job should be independently logged, retryable, and idempotent.

## 5. Technology Stack

| Layer | Recommended technology | Purpose |
|---|---|---|
| Frontend | Next.js + React | Responsive web dashboard |
| Styling | Tailwind CSS | Consistent UI |
| Backend | Python + FastAPI | APIs and business logic |
| Database | PostgreSQL | Persistent structured data |
| Vector search | pgvector | Semantic similarity |
| RSS | feedparser | RSS/Atom collection |
| Extraction | Trafilatura | Main article text extraction |
| HTTP | httpx | External requests |
| Embeddings | Sentence Transformers | Semantic matching |
| Initial embedding model | all-MiniLM-L6-v2 | Lightweight starting point |
| LLM | Ollama or an API provider | Extraction, classification, summaries |
| Initial scheduler | APScheduler | Scheduled jobs |
| Later job queue | Redis + Celery | Background processing at greater scale |
| Deployment | Docker Compose | Reproducible local/VM deployment |
| Notifications | Telegram Bot / email | Alerts and digest |
| Testing | pytest + frontend test tooling | Automated quality checks |

Do not introduce Kubernetes, Kafka, or microservices in the initial release. Add infrastructure only when measured requirements justify it.

## 6. Source Collection Strategy

### 6.1 Source categories

**News and technology**
- Publisher RSS/Atom feeds.
- Official company and product blogs.
- Open-source release feeds and GitHub APIs.
- AI and research organization announcements.
- CISA, NIST, CERT-In, and relevant security advisories.
- NASA, ESA, and science organization feeds.
- Government press releases and policy announcements.

**Scholarships and education**
- National Scholarship Portal: https://scholarships.gov.in/
- AICTE internship portal: https://internship.aicte-india.org/
- University and institution scholarship pages.
- Official foundation and corporate scholarship pages.

**Government schemes**
- myScheme: https://www.myscheme.gov.in/
- India Portal: https://www.india.gov.in/
- Press Information Bureau: https://pib.gov.in/
- Karnataka Government: https://www.karnataka.gov.in/
- Relevant central and state department websites.

**Jobs and careers**
- National Career Service: https://ncs.gov.in/
- AICTE internship portal.
- Official company careers pages.
- University placement and research pages.
- Recognized internship, fellowship, and competition organizers.

**Company and technology benefits**
Monitor official program pages from GitHub, Microsoft, AWS, Google, NVIDIA, Oracle, JetBrains, Cisco, and other selected companies. Examples are discovery targets, not a claim that a particular offer is currently available or that every user qualifies.

### 6.2 Source collection rules

- Prefer official APIs and RSS feeds.
- Use web extraction only when permitted and necessary.
- Respect robots directives, terms of service, rate limits, and access controls.
- Do not bypass logins, CAPTCHAs, paywalls, or technical restrictions.
- Store the source URL and retrieval timestamp.
- Track last successful fetch, last attempted fetch, status code, failure count, and extraction quality.
- Use separate fetch intervals per source.
- Never treat a failed fetch as proof that an offer has ended.
- Do not rely on one source for an important category.

### 6.3 Source registry

Each source should be configurable rather than hardcoded.

Example:

```yaml
name: National Scholarship Portal
category: scholarship
source_type: official_website
base_url: https://scholarships.gov.in/
country: India
region: National
trust_level: official
enabled: true
fetch_interval_hours: 24
```

The registry should also include terms/access review status, parser type, last success, next run, and source owner/department where known.

## 7. Common Ingestion and Processing Layer

Every record should pass through the following stages:

1. Fetch from the source.
2. Validate the response and content type.
3. Normalize URL, title, dates, publisher, and text.
4. Extract main content where permitted.
5. Remove navigation, scripts, advertising elements, and irrelevant page content.
6. Detect language.
7. Identify duplicates.
8. Classify as news, scholarship, government scheme, offer, career opportunity, or another category.
9. Save original evidence and normalized data.
10. Route to the appropriate pipeline.

Use timeouts, exponential-backoff retries, per-domain rate limits, and structured logs.

### Deduplication

Use multiple signals:

- Canonical URL.
- Normalized title.
- Publisher and publication date.
- SimHash or MinHash.
- Embedding similarity.

Keep original source records and group similar stories into clusters. Do not discard independent reporting that adds useful evidence or a different perspective.

## 8. News Intelligence Engine

### 8.1 Processing stages

1. Topic classification.
2. Embedding generation.
3. Semantic interest matching.
4. Content quality assessment.
5. Source authority assessment.
6. Freshness calculation.
7. Personal-impact analysis.
8. Summary generation.
9. Evidence checks.
10. Ranking and display.

### 8.2 Initial ranking formula

Use normalized components from 0 to 1:

`NewsScore = 0.35R + 0.20Q + 0.15A + 0.10F + 0.10T + 0.10P`

Where:

- R = relevance to selected interests.
- Q = content quality and factual density.
- A = source authority.
- F = freshness.
- T = topic importance.
- P = personal impact.

These are starting weights, not scientifically proven values. Tune them using a labelled evaluation set and user feedback.

Do not describe a relevance score as the probability that an article is true.

### 8.3 News item presentation

Every item should display:

- Headline.
- Publisher and publication date.
- Original article link.
- Three concise factual summary points.
- Why it matters to the user.
- Possible practical actions.
- Relevance and quality indicators.
- Verification or evidence status.
- Related coverage, when useful.

### 8.4 LLM restrictions

Use an LLM for classification, extraction, summarization, and explanations. It must not invent facts, dates, financial values, or actions.

Store supporting source references for generated claims. Treat retrieved web content as untrusted input and defend against prompt injection. Do not give an LLM unrestricted access to secrets, databases, or arbitrary tools.

## 9. Opportunity Intelligence Engine

### 9.1 Opportunity categories

- Scholarships and grants.
- Government schemes and subsidies.
- Student programs.
- Free software and subscriptions.
- Cloud credits.
- Company benefits and discounts.
- Internships and jobs.
- Certifications and free courses.
- Hackathons and competitions.
- Research fellowships and grants.
- Startup incubation and funding.
- Consumer rewards and promotions.

### 9.2 Opportunity pipeline

```text
Collect from source
       |
Extract opportunity details
       |
Normalize common schema
       |
Identify duplicates
       |
Verify issuing organization
       |
Extract eligibility conditions
       |
Check dates and current status
       |
Match against user profile
       |
Calculate benefit and relevance
       |
Save evidence and present result
       |
Track changes and expiry
```

### 9.3 Required opportunity fields

- Title and category.
- Provider/issuing organization.
- Country and region.
- Description.
- Benefit type and amount.
- Currency and benefit conditions.
- Eligibility rules.
- Application opening and closing dates.
- Official application URL.
- Supporting source URL and evidence.
- Verification status.
- First discovered and last verified timestamps.
- Current status: upcoming, open, closed, expired, withdrawn, or unknown.
- Terms, restrictions, renewal, and payment conditions.
- User-specific match status.

### 9.4 Example normalized record

```json
{
  "title": "Example Student Scholarship",
  "category": "scholarship",
  "provider": "Example Organization",
  "country": "India",
  "region": "National",
  "benefit_type": "financial",
  "benefit_amount": 25000,
  "currency": "INR",
  "eligibility": {
    "education_level": ["undergraduate"],
    "minimum_marks": 75,
    "income_limit": 300000
  },
  "application_deadline": "2026-12-15",
  "official_url": "https://example.org",
  "verification_status": "pending"
}
```

This is fictional example data, not a real scholarship.

## 10. Eligibility Matching Engine

Use deterministic rules for eligibility. An LLM can extract candidate rules from documents, but the extracted rules must be validated before they become active matching criteria.

### 10.1 Profile fields

| Field | Collection policy |
|---|---|
| Country and state | Required for localized discovery |
| Education level | Recommended/required for education matching |
| Course and specialization | Optional but useful |
| Academic year | Optional but useful |
| Skills and interests | Optional |
| Age range | Optional; collect only when relevant |
| Income range | Optional; collect only when relevant |
| Employment status | Optional |
| Opportunity preferences | Recommended |

Do not collect Aadhaar, bank credentials, passwords, or identity documents for ordinary recommendations. Collect sensitive information only where necessary, with explicit consent and appropriate security.

### 10.2 Eligibility outcomes

- `MATCHED`: all known mandatory conditions pass.
- `POTENTIALLY_ELIGIBLE`: no known disqualifying condition, but one or more requirements need verification.
- `NOT_ELIGIBLE`: at least one mandatory condition fails.
- `UNKNOWN`: criteria are too incomplete to evaluate.

Missing data must never be treated as a pass.

### 10.3 Simplified example

```python
def check_eligibility(profile, rules):
    unknown = []
    failed = []

    if profile.education_level is None:
        unknown.append("education_level")
    elif profile.education_level not in rules.education_levels:
        failed.append("education_level")

    if rules.income_limit is not None:
        if profile.annual_income is None:
            unknown.append("annual_income")
        elif profile.annual_income > rules.income_limit:
            failed.append("annual_income")

    if failed:
        return "NOT_ELIGIBLE"

    if unknown:
        return "POTENTIALLY_ELIGIBLE"

    return "MATCHED"
```

Production implementation must support AND/OR conditions, exceptions, region rules, age ranges, academic criteria, dates, and source-specific conditions.

### 10.4 Opportunity ranking

Initial formula:

`OpportunityScore = 0.30E + 0.25B + 0.20R + 0.15U + 0.10C`

Where:

- E = eligibility confidence.
- B = benefit value.
- R = personal relevance.
- U = urgency.
- C = source confidence.

This is a ranking aid, not an eligibility decision. Hard eligibility failures, expiry, and verification status must take precedence over a high score.

## 11. Verification and Trust Framework

Use four visible states:

1. **Officially verified:** supporting evidence is available from the issuing organization.
2. **Partially verified:** credible secondary evidence exists, but official confirmation is incomplete.
3. **Unverified:** discovered but not sufficiently checked.
4. **Expired/withdrawn:** no longer available according to verified evidence.

For every important claim preserve:

- Source URL.
- Supporting text or document reference.
- Retrieval time.
- Source publication/update date when known.
- Verification time.
- Verification outcome.
- Conflicting evidence, if any.

A discovery source is not necessarily a verification source. A social post may lead to a scholarship, but the official scholarship notification should be checked before it is called officially verified.

## 12. Database Design

Use PostgreSQL with pgvector.

Recommended tables:

| Table | Purpose |
|---|---|
| users | Accounts |
| user_profiles | Education, location, optional eligibility data |
| user_interests | Selected topics |
| sources | Source registry |
| source_runs | Fetch history |
| articles | Collected news |
| article_clusters | Related/duplicate stories |
| article_scores | Relevance and quality |
| opportunities | Normalized opportunities |
| eligibility_rules | Structured conditions |
| opportunity_matches | User-specific results |
| verification_records | Evidence and verification history |
| saved_items | Bookmarks |
| applications | Application tracking |
| notifications | Notification history |
| user_feedback | Relevance feedback |
| job_runs | Job execution and errors |

Use foreign keys, constraints, indexes, migrations, and timestamps. Add unique constraints or idempotency keys to prevent duplicate records and notifications.

### Relationships

```text
USERS 1---1 USER_PROFILES
USERS 1---N USER_INTERESTS
SOURCES 1---N ARTICLES
SOURCES 1---N OPPORTUNITIES
SOURCES 1---N SOURCE_RUNS
ARTICLES 1---N ARTICLE_SCORES
ARTICLES N---1 ARTICLE_CLUSTERS
OPPORTUNITIES 1---N ELIGIBILITY_RULES
USERS 1---N OPPORTUNITY_MATCHES
OPPORTUNITIES 1---N OPPORTUNITY_MATCHES
OPPORTUNITIES 1---N VERIFICATION_RECORDS
USERS 1---N SAVED_ITEMS
USERS 1---N APPLICATIONS
USERS 1---N NOTIFICATIONS
```

## 13. Frontend and Dashboard

### 13.1 Main navigation

- Overview.
- News.
- Offers & Benefits.
- Scholarships.
- Government Schemes.
- Career & Internships.
- Personal Insights.
- Saved Items.
- Deadline Tracker.
- Notifications.
- Settings.

### 13.2 Dashboard widgets

- Relevant news count.
- New opportunities.
- Potential eligibility matches.
- Upcoming deadlines.
- Important alerts.
- Recently added offers.
- Saved items.
- Daily digest.

These widgets must use real database values, not hardcoded demo counts.

### 13.3 Opportunity detail page

Display:

- Provider and title.
- Benefit and its conditions.
- Eligibility requirements.
- Why it matches.
- Missing information.
- Opening and closing dates.
- Verification status.
- Last verified date.
- Official application link.
- Save, dismiss, and application tracking actions.

## 14. API Design

Initial FastAPI endpoints:

| Method | Endpoint | Function |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/profile` | Read profile |
| PUT | `/api/profile` | Update profile |
| GET | `/api/news` | Personalized news |
| GET | `/api/news/{id}` | Article details |
| GET | `/api/opportunities` | Opportunities |
| GET | `/api/opportunities/{id}` | Opportunity details |
| GET | `/api/scholarships` | Scholarships |
| GET | `/api/government-schemes` | Government benefits |
| GET | `/api/offers` | Company offers |
| POST | `/api/saved-items` | Save an item |
| GET | `/api/deadlines` | Upcoming deadlines |
| POST | `/api/feedback` | User feedback |
| GET | `/api/notifications` | Notifications |
| GET | `/api/admin/sources` | Source management |
| GET | `/api/admin/health` | System health |

Protect private and administrative endpoints with authentication and authorization.

## 15. Background Processing and Scheduling

Start with APScheduler for a simple deployment. Move to Celery and Redis when you need durable queues, multiple workers, and more complex retries.

Suggested initial intervals:

| Job | Starting interval |
|---|---|
| High-priority news feeds | 30–60 minutes |
| Other news feeds | 2–6 hours |
| Government opportunities | 12–24 hours |
| Company offers | 12–24 hours |
| Deadline and expiry checks | Daily |
| Eligibility matching | On new opportunity/profile change |
| Source health report | Daily |
| User digest | Daily |

Respect source-specific rate limits and access conditions. Do not poll a source more often than its update frequency justifies.

### Notification policy

- Important breaking news: immediate alert.
- New potential scholarship match: alert.
- Approaching deadline: alert.
- New relevant company benefit: alert.
- Routine news: daily digest.
- Unchanged opportunities: suppress repeated alerts.
- Failed verification: show uncertainty; do not claim no opportunity exists.

## 16. Project Folder Structure

```text
personal-intelligence/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── auth.py
│   │   │   ├── profile.py
│   │   │   ├── news.py
│   │   │   ├── opportunities.py
│   │   │   ├── scholarships.py
│   │   │   ├── schemes.py
│   │   │   └── notifications.py
│   │   ├── ingestion/
│   │   │   ├── rss_fetcher.py
│   │   │   ├── api_fetcher.py
│   │   │   ├── web_fetcher.py
│   │   │   └── source_registry.py
│   │   ├── processing/
│   │   │   ├── cleaner.py
│   │   │   ├── normalizer.py
│   │   │   ├── deduplicator.py
│   │   │   └── classifier.py
│   │   ├── news_engine/
│   │   │   ├── embeddings.py
│   │   │   ├── relevance.py
│   │   │   ├── quality.py
│   │   │   ├── summarizer.py
│   │   │   └── impact_analyzer.py
│   │   ├── opportunity_engine/
│   │   │   ├── extractor.py
│   │   │   ├── eligibility.py
│   │   │   ├── benefit_scorer.py
│   │   │   ├── verifier.py
│   │   │   └── deadline_tracker.py
│   │   ├── personalization/
│   │   ├── notifications/
│   │   ├── database/
│   │   └── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── package.json
├── source_configs/
│   ├── news_sources.yaml
│   ├── government_sources.yaml
│   └── company_sources.yaml
├── database/
│   └── migrations/
├── scripts/
│   ├── initialize_db.py
│   ├── import_sources.py
│   └── run_pipeline.py
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── security/
│   └── acceptance/
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

Create modules incrementally. Do not create dozens of empty files before their responsibilities are implemented.

## 17. Security and Privacy

Implement:

- Argon2id password hashing or an established identity provider.
- Secure session handling.
- HTTPS.
- Role-based access control.
- Request validation.
- SQL injection protection through parameterized queries/ORM.
- CSRF protections where applicable.
- Rate limiting.
- Secrets stored outside source control.
- Encryption in transit and appropriate protection at rest.
- Database backups.
- Audit logging for sensitive actions.
- User data export and deletion procedures.
- Retention policies for personal data.

Never expose PostgreSQL, Redis, or Ollama directly to the public internet.

Treat all scraped content as untrusted. Defend against prompt injection and unsafe URLs. Do not automatically execute downloaded code or follow arbitrary links without validation.

## 18. Testing and Quality Gates

### 18.1 Unit tests

Test:

- URL normalization.
- Date parsing and time zones.
- Duplicate detection.
- News scoring.
- Eligibility rules.
- Benefit calculations.
- Deadline status.
- Notification deduplication.
- Source trust and verification states.

### 18.2 Integration tests

Test:

- Feed fetch to database.
- Article extraction to summary.
- Opportunity extraction to eligibility matching.
- Database migrations.
- API authentication and permissions.
- Notification delivery and retry.
- Backup and restore.

### 18.3 Essential failure scenarios

| Scenario | Expected behavior |
|---|---|
| Feed returns invalid XML | Log and continue |
| One source is down | Other sources continue |
| Same article appears repeatedly | Group into a story cluster |
| Article date missing | Mark unknown |
| Opportunity deadline passed | Mark expired when supported by evidence |
| Income information missing | Eligibility remains uncertain |
| Official page conflicts with aggregator | Record discrepancy and prefer current official evidence |
| LLM invents an amount | Reject unsupported field |
| Notification service fails | Retry idempotently |
| User updates profile | Recalculate affected matches |
| Source stops working | Show health warning |
| Database restore | Recover verified backup successfully |

### 18.4 Initial acceptance targets

These are targets for the test environment, not guarantees:

| Metric | Acceptance target |
|---|---|
| Duplicate visible stories | No duplicates within a correctly identified cluster |
| Eligibility rules | 100% correct on defined test cases |
| Officially verified records | Every such record has supporting official evidence |
| Expired opportunities | Zero falsely shown as open in acceptance tests |
| Source failure isolation | A single failed source does not stop the pipeline |
| Notifications | No duplicate alerts for the same event |
| Recovery | Successful backup restoration test |
| Authorization | No cross-user data access in security tests |

Track precision and recall for relevance matching using a manually labelled dataset. Review false positives and false negatives, not just total article counts.

## 19. Deployment Plan

### Local development

Use Docker Compose with:

- Next.js frontend.
- FastAPI backend.
- PostgreSQL + pgvector.
- Background worker.
- Scheduler.
- Redis when required.
- Ollama optionally.

### Production deployment

Use a cloud VM or managed platform after the application is stable.

Required components:

- HTTPS reverse proxy.
- Persistent database.
- Automated backups.
- Application logs.
- Health endpoints.
- Resource monitoring.
- Database migrations.
- Restore procedure.
- Secrets management.
- Alerting for failed jobs.

## 20. Eight-Week Development Roadmap

| Week | Work | Deliverable |
|---|---|---|
| 1 | Repository, Docker, backend, frontend, database | Running application skeleton |
| 2 | RSS/API ingestion, extraction, cleaning, deduplication | Automated news collection |
| 3 | Embeddings, scoring, summaries, impact analysis | Personalized news engine |
| 4 | Government, scholarship, company sources | Opportunity discovery engine |
| 5 | User profile, eligibility, verification, deadlines | Personalized matching |
| 6 | Dashboard, search, saved items, tracking | Usable web application |
| 7 | Notifications, monitoring, security and testing | Reliable release candidate |
| 8 | Acceptance testing, deployment, documentation | Initial production release |

The schedule assumes a focused solo developer and should be adjusted based on available time, source access, and feature complexity.

## 21. Implementation Milestones and Definition of Done

### Milestone 1: Foundation
- [ ] Git repository created.
- [ ] Docker Compose runs successfully.
- [ ] Frontend loads.
- [ ] Backend health endpoint works.
- [ ] PostgreSQL connection works.
- [ ] Database migrations run.

### Milestone 2: News
- [ ] Source registry created.
- [ ] RSS ingestion works.
- [ ] Article extraction works.
- [ ] Cleaning and deduplication work.
- [ ] Articles persist in database.
- [ ] News API returns records.
- [ ] Dashboard displays articles.
- [ ] Relevance scoring is tested.
- [ ] Summaries have source references.

### Milestone 3: Opportunities
- [ ] Government sources configured.
- [ ] Scholarship sources configured.
- [ ] Company program sources configured.
- [ ] Opportunity schema implemented.
- [ ] Extraction validated.
- [ ] Verification evidence stored.
- [ ] Deadlines and expiry work.
- [ ] Opportunity dashboard works.

### Milestone 4: Personalization
- [ ] Profile setup works.
- [ ] Interests are editable.
- [ ] Eligibility rules are deterministic.
- [ ] Missing information is handled safely.
- [ ] Matching results are stored.
- [ ] Feedback changes future ranking.

### Milestone 5: Production readiness
- [ ] Authentication and authorization tested.
- [ ] Notifications are idempotent.
- [ ] Failed sources do not crash other jobs.
- [ ] Logs and health monitoring work.
- [ ] Backup and restoration tested.
- [ ] Security tests pass.
- [ ] Documentation and deployment instructions complete.

Do not move to the next milestone until the current milestone's acceptance tests pass.

## 22. What to Build First

The first working version should deliberately be small:

1. One working frontend.
2. One working FastAPI backend.
3. One PostgreSQL database.
4. Five to ten reliable news sources.
5. A small number of official opportunity sources.
6. A basic profile.
7. News relevance scoring.
8. Structured opportunity records.
9. Simple eligibility rules.
10. A dashboard and daily digest.

Then expand sources and categories based on observed results.

Do not start by integrating 100 websites or building a complex AI agent. Prove the end-to-end workflow with a small, verifiable set first.

## 23. Final Engineering Principles

1. Official source evidence takes priority over aggregator claims.
2. Discovery is not verification.
3. Relevance is not factual accuracy.
4. Missing eligibility data is not a match.
5. Expired offers must not be presented as active.
6. A source failure must not stop unrelated processing.
7. LLM output must be checked against evidence.
8. Personal data must be minimized and protected.
9. Every background task must be logged and recoverable.
10. Every release must pass automated tests.
11. Feedback should improve personalization without hiding important information.
12. The application should tell users when it is uncertain.

---

## Final Recommendation

Build the platform as a modular, India-first personal intelligence application with two separate engines: News Intelligence and Opportunity Intelligence.

The first engine helps you understand what is happening. The second helps you discover what you can actually benefit from.

The most important competitive advantage will not be AI-generated summaries. It will be **reliable discovery, evidence-backed eligibility matching, useful personalization, and deadline awareness**.

That is the standard the implementation should aim for.
