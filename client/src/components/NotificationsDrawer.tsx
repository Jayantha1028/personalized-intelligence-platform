"use client";

import React, { useState } from "react";
import {
  NotificationItem,
  markNotificationRead,
  markAllNotificationsRead,
  dispatchNotifications,
} from "@/services/api";
import {
  Bell,
  CheckCheck,
  Clock,
  Sparkles,
  ExternalLink,
  X,
  RefreshCw,
  AlertCircle,
  Award,
} from "lucide-react";

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onRefresh: () => void;
}

export function NotificationsDrawer({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  onRefresh,
}: NotificationsDrawerProps) {
  const [scanning, setScanning] = useState(false);

  if (!isOpen) return null;

  const handleScan = async () => {
    setScanning(true);
    try {
      await dispatchNotifications();
      onRefresh();
    } catch (e) {
      console.error("Scan failed", e);
    } finally {
      setScanning(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await markNotificationRead(id);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-100">Notifications & Alerts</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-600 text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded hover:bg-slate-800"
              title="Scan deadlines and new matches now"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin text-indigo-400" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors rounded hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center text-slate-400 p-6 space-y-2">
              <CheckCheck className="w-8 h-8 text-emerald-400/80 mb-2" />
              <p className="font-semibold text-slate-200">All caught up!</p>
              <p className="text-xs text-slate-500">
                You will be notified immediately when scholarship deadlines approach or new 90%+ matches are found.
              </p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isDeadline = notif.notification_type === "deadline_approaching";

              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && handleMarkRead(notif.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    notif.is_read
                      ? "bg-slate-900/40 border-slate-800/60 opacity-70"
                      : "bg-slate-800/60 border-slate-700 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isDeadline ? (
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <Award className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                      <span className="font-semibold text-xs text-slate-200">
                        {notif.title}
                      </span>
                    </div>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0 mt-1"></span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-5">
                    {notif.message}
                  </p>

                  <div className="mt-2.5 pl-5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                    <span className="capitalize">{notif.channel} alert</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
            <button
              onClick={handleMarkAllRead}
              className="text-slate-400 hover:text-slate-200 font-medium transition-colors"
            >
              Mark all as read
            </button>
            <span className="text-[11px] text-slate-500">Idempotent alerts enabled</span>
          </div>
        )}
      </div>
    </div>
  );
}
