"use client";

import React, { useEffect, useState } from "react";
import {
  fetchStats,
  fetchNews,
  fetchOpportunities,
  fetchProfile,
  fetchSources,
  fetchSavedItems,
  fetchApplications,
  fetchNotifications,
  syncNewsFeeds,
  fetchCurrentUser,
  DashboardStats,
  Article,
  Opportunity,
  UserProfile,
  Source,
  SavedItem,
  ApplicationItem,
  NotificationListResponse,
  AuthUser,
  AuthResponse,
} from "@/services/api";
import { Sidebar, NavTab } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { OverviewView } from "@/components/OverviewView";
import { NewsView } from "@/components/NewsView";
import { OpportunitiesView } from "@/components/OpportunitiesView";
import { DeadlinesView } from "@/components/DeadlinesView";
import { ProfileView } from "@/components/ProfileView";
import { SourcesView } from "@/components/SourcesView";
import { SavedAndApplicationsView } from "@/components/SavedAndApplicationsView";
import { NotificationsDrawer } from "@/components/NotificationsDrawer";
import { TechBlogsAndTasksView } from "@/components/TechBlogsAndTasksView";
import { AuthModal } from "@/components/AuthModal";
import { AccountDetailsModal } from "@/components/AccountDetailsModal";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [news, setNews] = useState<Article[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationListResponse>({
    unread_count: 0,
    items: [],
  });
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "register">("signin");
  const [accountModalOpen, setAccountModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [
        statsData,
        newsData,
        oppsData,
        profileData,
        sourcesData,
        savedData,
        appsData,
        notifsData,
        sessionData,
      ] = await Promise.all([
        fetchStats().catch(() => null),
        fetchNews("All", 50).catch(() => []),
        fetchOpportunities().catch(() => []),
        fetchProfile().catch(() => null),
        fetchSources().catch(() => []),
        fetchSavedItems().catch(() => []),
        fetchApplications().catch(() => []),
        fetchNotifications().catch(() => ({ unread_count: 0, items: [] })),
        fetchCurrentUser().catch(() => null),
      ]);

      setStats(statsData);
      setNews(newsData);
      setOpportunities(oppsData);
      setProfile(profileData);
      setSources(sourcesData);
      setSavedItems(savedData);
      setApplications(appsData);
      setNotifications(notifsData);
      if (sessionData && sessionData.user) {
        setAuthUser(sessionData.user);
      }
    } catch (err) {
      console.error("Error loading intelligence data", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncNewsFeeds();
    } catch (err) {
      console.warn("Live feed sync failed, falling back to cached records", err);
    }
    await loadData();
    setRefreshing(false);
  };

  const handleProfileUpdated = (updated: UserProfile) => {
    setProfile(updated);
    // Reload opportunities & stats with recalculated matches
    loadData();
  };

  const handleAuthSuccess = (res: AuthResponse) => {
    setAuthUser(res.user);
    if (res.profile) {
      setProfile((prev) => (prev ? { ...prev, ...res.profile } : (res.profile as any)));
    }
    loadData();
  };

  const handleSignOut = () => {
    setAuthUser(null);
    loadData();
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        matchedCount={stats?.matched_opportunities}
        deadlinesCount={stats?.upcoming_deadlines_count}
        savedCount={applications.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          profile={profile}
          authUser={authUser}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
          unreadNotificationsCount={notifications.unread_count}
          onToggleNotifications={() => setNotificationsOpen(true)}
          onOpenAuthModal={(tab) => {
            setAuthModalTab(tab || "signin");
            setAuthModalOpen(true);
          }}
          onOpenAccountModal={() => setAccountModalOpen(true)}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              <p className="text-sm font-medium">Connecting to Intelligence Engine...</p>
            </div>
          ) : (
            <>
              {currentTab === "overview" && (
                <OverviewView
                  stats={stats}
                  news={news}
                  opportunities={opportunities}
                  onNavigate={(tab) => setCurrentTab(tab as NavTab)}
                />
              )}

              {currentTab === "news" && <NewsView news={news} onRefresh={loadData} />}

              {currentTab === "opportunities" && (
                <OpportunitiesView opportunities={opportunities} onRefresh={loadData} />
              )}

              {currentTab === "deadlines" && (
                <DeadlinesView opportunities={opportunities} />
              )}

              {currentTab === "saved" && (
                <SavedAndApplicationsView
                  savedItems={savedItems}
                  applications={applications}
                  onRefresh={loadData}
                />
              )}

              {currentTab === "tasks" && <TechBlogsAndTasksView />}

              {currentTab === "profile" && profile && (
                <ProfileView
                  profile={profile}
                  onProfileUpdated={handleProfileUpdated}
                />
              )}

              {currentTab === "sources" && <SourcesView sources={sources} />}
            </>
          )}
        </main>
      </div>

      {/* Notifications Drawer */}
      <NotificationsDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications.items}
        unreadCount={notifications.unread_count}
        onRefresh={loadData}
      />

      {/* Auth Modal (Sign In / Register / Quick Demo Logins) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialTab={authModalTab}
      />

      {/* Account Details & Session Modal */}
      <AccountDetailsModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        profile={profile}
        authUser={authUser}
        onNavigateToProfile={() => setCurrentTab("profile")}
        onOpenSwitchAccount={() => {
          setAuthModalTab("signin");
          setAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
