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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-[#F8FAFC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-[#635BDB]" />
            <h3 className="font-bold text-base text-slate-900">Notifications & Alerts</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[#635BDB] text-white">
                {unreadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScan}
              disabled={scanning}
              className="p-1.5 text-slate-500 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-200"
              title="Scan deadlines and new matches now"
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin text-[#635BDB]" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No notifications yet. Alerts for imminent deadlines and opportunity eligibility will appear here.
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 transition-colors ${
                  !notif.is_read ? "bg-[#EEEDFD]/30 border-l-4 border-[#635BDB]" : "bg-white hover:bg-[#F8FAFC]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    {notif.notification_type === "deadline_warning" ? (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : (
                      <Award className="w-4 h-4 text-[#0E5B44] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {notif.title}
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(notif.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="text-[10px] font-mono text-[#635BDB] hover:text-[#5046CA] whitespace-nowrap"
                    >
                      [MARK_READ]
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-[#F8FAFC] flex items-center justify-between text-xs">
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-40 transition-colors font-mono font-semibold"
          >
            <CheckCheck className="w-4 h-4" />
            <span>[MARK_ALL_READ]</span>
          </button>
          <span className="text-[11px] font-mono text-slate-400">Deterministic Engine v2.4</span>
        </div>
      </div>
    </div>
  );
}
