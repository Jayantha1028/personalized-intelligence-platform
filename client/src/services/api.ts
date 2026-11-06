export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

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
  country: string;
  state?: string;
  education_level?: string;
  course_or_degree?: string;
  academic_year?: number;
  annual_income?: number;
  age?: number;
  skills: string[];
  preferences: Record<string, any>;
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

export async function fetchNews(topic?: string): Promise<Article[]> {
  const url = topic && topic !== "All" 
    ? `${API_BASE_URL}/news?topic=${encodeURIComponent(topic)}`
    : `${API_BASE_URL}/news`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch news");
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
  const res = await fetch(`${API_BASE_URL}/profile`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE_URL}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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
