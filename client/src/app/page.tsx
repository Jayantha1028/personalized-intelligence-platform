"use client";

import React, { useEffect, useState } from "react";
import {
  fetchStats,
  fetchNews,
  fetchOpportunities,
  fetchProfile,
  fetchSources,
  syncNewsFeeds,
  DashboardStats,
  Article,
  Opportunity,
  UserProfile,
  Source,
} from "@/services/api";
import { Sidebar, NavTab } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { OverviewView } from "@/components/OverviewView";
import { NewsView } from "@/components/NewsView";
import { OpportunitiesView } from "@/components/OpportunitiesView";
import { DeadlinesView } from "@/components/DeadlinesView";
import { ProfileView } from "@/components/ProfileView";
import { SourcesView } from "@/components/SourcesView";
import { Loader2 } from "lucide-react";

export default function Home() {
  const [currentTab, setCurrentTab] = useState<NavTab>("overview");
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [news, setNews] = useState<Article[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const [statsData, newsData, oppsData, profileData, sourcesData] = await Promise.all([
        fetchStats().catch(() => null),
        fetchNews().catch(() => []),
        fetchOpportunities().catch(() => []),
        fetchProfile().catch(() => null),
        fetchSources().catch(() => []),
      ]);

      setStats(statsData);
      setNews(newsData);
      setOpportunities(oppsData);
      setProfile(profileData);
      setSources(sourcesData);
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

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        matchedCount={stats?.matched_opportunities}
        deadlinesCount={stats?.upcoming_deadlines_count}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          profile={profile}
          onRefresh={handleRefresh}
          isRefreshing={refreshing}
        />

        <main className="flex-1 p-8 overflow-y-auto">
          {loading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
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

              {currentTab === "news" && <NewsView news={news} />}

              {currentTab === "opportunities" && (
                <OpportunitiesView opportunities={opportunities} />
              )}

              {currentTab === "deadlines" && (
                <DeadlinesView opportunities={opportunities} />
              )}

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
    </div>
  );
}
