export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

export interface DashboardStats {
  total_articles: number;
  high_relevance_articles: number;
  total_opportunities: number;
  matched_opportunities: number;
  potential_matches: number;
  upcoming_deadlines_count: number;
  active_sources_count: number;
  upcoming_deadlines: DeadlineItem[];
}

export interface DeadlineItem {
  id: number;
  title: string;
  provider: string;
  category: string;
  deadline: string;
  official_url: string;
  status: string;
}

export interface Article {
  id: number;
  source_name: string;
  title: string;
  canonical_url: string;
  author?: string;
  published_at?: string;
  summary_bullets: string[];
  personal_impact?: string;
  practical_actions: string[];
  topic: string;
  quality_score: number;
  relevance_score: number;
  is_verified: boolean;
  created_at: string;
  user_feedback?: "like" | "dislike" | null;
  dynamic_relevance?: number;
}

export interface Opportunity {
  id: number;
  title: string;
  category: "scholarship" | "government_scheme" | "company_offer" | "career" | "student_program";
  provider: string;
  country: string;
  region: string;
  description: string;
  benefit_type: string;
  benefit_amount?: number;
  currency?: string;
  benefit_summary?: string;
  eligibility_rules: Record<string, any>;
  application_deadline?: string;
  official_url: string;
  supporting_url?: string;
  verification_status: "officially_verified" | "partially_verified" | "unverified" | "expired";
  status: "open" | "upcoming" | "closed" | "expired";
  match_status: "MATCHED" | "POTENTIALLY_ELIGIBLE" | "NOT_ELIGIBLE" | "UNKNOWN";
  fit_score: number;
  reasons: string[];
  missing_criteria: string[];
}

export interface UserProfile {
  id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  role?: string;
  country: string;
  state?: string;
  education_level?: string;
  course_or_degree?: string;
  academic_year?: number;
  annual_income?: number;
  age?: number;
  phone?: string;
  headline?: string;
  skills: string[];
  preferences: Record<string, any>;
}

export interface AuthUser {
  id: number;
  email: string;
  full_name?: string;
  role: "STUDENT" | "RESEARCHER" | "ADMIN" | string;
  is_admin: boolean;
  is_active: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  tokenType: string;
  user: AuthUser;
  profile?: Partial<UserProfile>;
}

export interface AuthSessionResponse {
  status: string;
  user: AuthUser;
  session: {
    tokenType: string;
    algorithm: string;
    security: string;
    role: string;
  };
  profile?: UserProfile;
}

export const AUTH_TOKEN_KEY = "antigravity_auth_token";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Authentication API methods inspired by Enterprise Microservices Architecture
export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Authentication failed");
  }
  const data: AuthResponse = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string;
  role?: string;
  state?: string;
  course_or_degree?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  const data: AuthResponse = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function demoLogin(accountType: "student" | "fellow" | "admin" = "student"): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/demo-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ account_type: accountType }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Demo login failed");
  }
  const data: AuthResponse = await res.json();
  if (data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function fetchCurrentUser(): Promise<AuthSessionResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch session");
  return res.json();
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Password change failed");
  }
  return res.json();
}

export function logoutUser(): void {
  clearAuthToken();
}

export interface Source {
  id: number;
  name: string;
  slug: string;
  category: string;
  source_type: string;
  base_url: string;
  feed_url?: string;
  country: string;
  region: string;
  trust_level: string;
  enabled: boolean;
  fetch_interval_minutes: number;
  last_fetched_at?: string;
  last_status: string;
  failure_count: number;
}

// API fetch helpers
export async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export interface ArticleFeedbackSummary {
  feedbacks: Record<number, "like" | "dislike">;
  topic_weights: Record<string, number>;
  total_likes: number;
  total_dislikes: number;
  boosted_topics: string[];
  deprioritized_topics: string[];
}

export async function fetchNews(
  topic?: string,
  limit: number = 25,
  sortBy?: string,
  maxDays: number = 2
): Promise<Article[]> {
  const params = new URLSearchParams();
  if (topic && topic !== "All") params.append("topic", topic);
  params.append("limit", Math.min(limit, 25).toString());
  params.append("max_days", maxDays.toString());
  if (sortBy) params.append("sort_by", sortBy);

  const url = `${API_BASE_URL}/news?${params.toString()}`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export async function sendArticleFeedback(
  articleId: number,
  feedback: "like" | "dislike" | "neutral"
): Promise<{
  article_id: number;
  feedback: string | null;
  topic: string;
  topic_weight: number;
  active_weights: Record<string, number>;
  message: string;
}> {
  const res = await fetch(`${API_BASE_URL}/news/${articleId}/feedback`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ feedback }),
  });
  if (!res.ok) throw new Error("Failed to submit feedback");
  return res.json();
}

export async function fetchFeedbackSummary(): Promise<ArticleFeedbackSummary> {
  const res = await fetch(`${API_BASE_URL}/news/feedback/summary`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch feedback summary");
  return res.json();
}

export async function resetFeedTuning(): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/news/feedback/reset`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to reset feed tuning");
  return res.json();
}

export async function fetchOpportunities(category?: string): Promise<Opportunity[]> {
  const url = category && category !== "All"
    ? `${API_BASE_URL}/opportunities?category=${encodeURIComponent(category)}`
    : `${API_BASE_URL}/opportunities`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch opportunities");
  return res.json();
}

export async function fetchProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
}

export async function syncNewsFeeds(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/news/sync?max_items=5`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger sync");
  return res.json();
}

export async function scrapeArticleUrl(url: string, topic?: string): Promise<Article> {
  const res = await fetch(`${API_BASE_URL}/news/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, topic }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to scrape URL");
  }
  return res.json();
}

export interface SavedItem {
  id: number;
  item_type: string;
  item_id: number;
  notes?: string;
  title: string;
  category: string;
  link: string;
  created_at: string;
}

export interface ApplicationItem {
  id: number;
  opportunity_id: number;
  opportunity_title: string;
  provider: string;
  category: string;
  benefit_summary?: string;
  official_url: string;
  status: "interested" | "in_progress" | "applied" | "awarded" | "rejected";
  applied_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  notification_type: string;
  reference_type?: string;
  reference_id?: number;
  is_read: boolean;
  channel: string;
  created_at: string;
}

export interface NotificationListResponse {
  unread_count: number;
  items: NotificationItem[];
}

export async function fetchSources(): Promise<Source[]> {
  const res = await fetch(`${API_BASE_URL}/sources`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sources");
  return res.json();
}

// Saved Items
export async function fetchSavedItems(): Promise<SavedItem[]> {
  const res = await fetch(`${API_BASE_URL}/saved-items`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch saved items");
  return res.json();
}

export async function saveItem(item_type: "article" | "opportunity", item_id: number, notes?: string): Promise<SavedItem> {
  const res = await fetch(`${API_BASE_URL}/saved-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item_type, item_id, notes }),
  });
  if (!res.ok) throw new Error("Failed to save item");
  return res.json();
}

export async function deleteSavedItem(id: number): Promise<void> {
  await fetch(`${API_BASE_URL}/saved-items/${id}`, { method: "DELETE" });
}

// Application Tracking
export async function fetchApplications(): Promise<ApplicationItem[]> {
  const res = await fetch(`${API_BASE_URL}/applications`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

export async function trackApplication(opportunity_id: number, status: string = "interested", notes?: string): Promise<ApplicationItem> {
  const res = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ opportunity_id, status, notes }),
  });
  if (!res.ok) throw new Error("Failed to track application");
  return res.json();
}

export async function updateApplicationStatus(id: number, status: string, notes?: string): Promise<ApplicationItem> {
  const res = await fetch(`${API_BASE_URL}/applications/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes }),
  });
  if (!res.ok) throw new Error("Failed to update application");
  return res.json();
}

// Notifications
export async function fetchNotifications(): Promise<NotificationListResponse> {
  const res = await fetch(`${API_BASE_URL}/notifications`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}

export async function dispatchNotifications(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/notifications/dispatch`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to dispatch notifications");
  return res.json();
}

export async function markNotificationRead(id: number): Promise<void> {
  await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: "PUT" });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch(`${API_BASE_URL}/notifications/read-all`, { method: "PUT" });
}

// -------------------------------------------------------------
// Document & Circular Intelligence (Collected Microservices)
// -------------------------------------------------------------
export interface SampleCircular {
  id: string;
  title: string;
  provider: string;
  category: string;
  text: string;
}

export interface ParsedCircularResponse {
  title: string;
  provider: string;
  category: string;
  extracted_entities: {
    emails: string[];
    phone_numbers: string[];
    monetary_amounts: string[];
    dates: string[];
  };
  detected_deadline?: string;
  detected_benefit_amount?: number;
  detected_currency: string;
  benefit_summary: string;
  eligibility_signals: string[];
  suggested_rules: Record<string, any>;
  confidence_score: number;
}

export async function fetchSampleCirculars(): Promise<SampleCircular[]> {
  const res = await fetch(`${API_BASE_URL}/circulars/samples`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sample circulars");
  return res.json();
}

export async function analyzeCircular(data: {
  title?: string;
  text: string;
  provider?: string;
  category?: string;
}): Promise<ParsedCircularResponse> {
  const res = await fetch(`${API_BASE_URL}/circulars/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to analyze circular");
  return res.json();
}

// -------------------------------------------------------------
// Developer Security Advisories & CVE Radar
// -------------------------------------------------------------
export interface SecurityAdvisory {
  cve_id: string;
  target_image: string;
  package: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  cvss: number;
  description: string;
  fixed_in?: string;
  remediation?: string;
  mitre_technique?: string;
}

export interface SecurityAdvisoriesResponse {
  total_matched: number;
  summary: {
    critical_count: number;
    high_count: number;
    medium_count: number;
    total_tracked: number;
  };
  advisories: SecurityAdvisory[];
}

export async function fetchSecurityAdvisories(
  severity?: string,
  keyword?: string,
  minCvss?: number
): Promise<SecurityAdvisoriesResponse> {
  const params = new URLSearchParams();
  if (severity && severity !== "All") params.append("severity", severity);
  if (keyword) params.append("keyword", keyword);
  if (minCvss) params.append("min_cvss", String(minCvss));

  const url = `${API_BASE_URL}/security/advisories?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch security advisories");
  return res.json();
}

export async function fetchSecuritySignatures(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/security/signatures`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch security signatures");
  return res.json();
}

// -------------------------------------------------------------
// Academic Records Simulator
// -------------------------------------------------------------
export interface StudentRecord {
  id: number;
  name: string;
  class: string;
  specialization: string;
  mentor: string;
  attendance: number;
  cgpa: number;
}

export interface AcademicRecordsResponse {
  total_matched: number;
  students: StudentRecord[];
}

export async function fetchAcademicRecords(specialization?: string): Promise<AcademicRecordsResponse> {
  const url = specialization && specialization !== "All"
    ? `${API_BASE_URL}/academic/records?specialization=${encodeURIComponent(specialization)}`
    : `${API_BASE_URL}/academic/records`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch academic records");
  return res.json();
}

export async function syncAcademicRecord(studentId: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/academic/sync-profile/${studentId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to sync academic record");
  return res.json();
}

// -------------------------------------------------------------
// AI Application Drafter (SOP, Cold Email, Checklist)
// -------------------------------------------------------------
export interface ApplicationKitResponse {
  opportunity_id: number;
  opportunity_title: string;
  provider: string;
  applicant_name: string;
  tone: string;
  statement_of_purpose: string;
  cold_email_subject: string;
  cold_email_pitch: string;
  application_checklist: string[];
  strategic_tips: string[];
  generated_at: string;
}

export async function draftApplication(
  oppId: number,
  tone: "academic" | "professional" | "startup" = "academic",
  targetRole?: string,
  customAchievements?: string[]
): Promise<ApplicationKitResponse> {
  const res = await fetch(`${API_BASE_URL}/opportunities/${oppId}/draft-application`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      tone,
      target_role: targetRole,
      custom_achievements: customAchievements,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to draft application");
  }
  return res.json();
}

// -------------------------------------------------------------
// Autonomous Background Ingestion & Scheduler
// -------------------------------------------------------------
export interface SchedulerStatusResponse {
  is_running: boolean;
  is_syncing: boolean;
  interval_minutes: number;
  sync_count: number;
  last_sync_time: string | null;
  next_run_time: string | null;
  last_sync_result: any;
}

export async function fetchSchedulerStatus(): Promise<SchedulerStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/scheduler/status`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch scheduler status");
  return res.json();
}

export async function triggerSchedulerSync(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE_URL}/scheduler/trigger`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger autonomous sync");
  return res.json();
}

export async function configureScheduler(
  intervalMinutes?: number,
  enabled?: boolean
): Promise<SchedulerStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/scheduler/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ interval_minutes: intervalMinutes, enabled }),
  });
  if (!res.ok) throw new Error("Failed to configure scheduler");
  return res.json();
}

// -------------------------------------------------------------
// Telegram Push Alerts & Dispatcher
// -------------------------------------------------------------
export interface TelegramConfigResponse {
  is_configured: boolean;
  bot_token_preview: string;
  chat_id: string;
  channels: string[];
}

export async function fetchTelegramConfig(): Promise<TelegramConfigResponse> {
  const res = await fetch(`${API_BASE_URL}/notifications/telegram/config`, {
    headers: getAuthHeaders(),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch Telegram config");
  return res.json();
}

export async function testTelegramAlert(
  botToken?: string,
  chatId?: string,
  customMessage?: string
): Promise<{ success: boolean; error?: string; message?: string; status_code?: number }> {
  const res = await fetch(`${API_BASE_URL}/notifications/telegram/test`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      bot_token: botToken,
      chat_id: chatId,
      custom_message: customMessage,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to dispatch Telegram test");
  }
  return res.json();
}

export async function saveTelegramConfig(
  botToken: string,
  chatId: string,
  enabled: boolean = true
): Promise<{ status: string; message: string; is_configured: boolean }> {
  const res = await fetch(`${API_BASE_URL}/notifications/telegram/config`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      bot_token: botToken,
      chat_id: chatId,
      enabled,
    }),
  });
  if (!res.ok) throw new Error("Failed to save Telegram config");
  return res.json();
}

// -------------------------------------------------------------
// Calendar Export URLs
// -------------------------------------------------------------
export function getAllDeadlinesIcsUrl(): string {
  return `${API_BASE_URL}/opportunities/export/all-deadlines.ics`;
}

export function getOpportunityIcsUrl(oppId: number): string {
  return `${API_BASE_URL}/opportunities/${oppId}/calendar.ics`;
}

