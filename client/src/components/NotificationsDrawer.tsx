"use client";

import React, { useState, useEffect } from "react";
import {
  NotificationItem,
  markNotificationRead,
  markAllNotificationsRead,
  dispatchNotifications,
  fetchTelegramConfig,
  testTelegramAlert,
  saveTelegramConfig,
  TelegramConfigResponse,
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
  Send,
  Check,
  Settings,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Radio,
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
  const [showConfig, setShowConfig] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfigResponse | null>(null);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTelegramConfig()
        .then((cfg) => {
          setTelegramConfig(cfg);
          if (cfg.chat_id) setChatId(cfg.chat_id);
        })
        .catch(() => {});
    }
  }, [isOpen]);

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

  const handleTestTelegram = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testTelegramAlert(botToken || undefined, chatId || undefined);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, error: e.message || "Test failed" });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveTelegram = async () => {
    setSaving(true);
    try {
      const res = await saveTelegramConfig(botToken, chatId, true);
      setTelegramConfig((prev) => prev ? { ...prev, is_configured: res.is_configured, chat_id: chatId } : null);
      setTestResult({ success: true, message: "Settings saved successfully!" });
    } catch (e: any) {
      setTestResult({ success: false, error: e.message || "Failed to save settings" });
    } finally {
      setSaving(false);
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
        <div className="p-5 border-b border-slate-200 bg-[#F8FAFC]">
          <div className="flex items-center justify-between">
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
                onClick={() => setShowConfig(!showConfig)}
                className={`p-1.5 transition-colors rounded-lg ${
                  showConfig ? "bg-[#635BDB]/10 text-[#635BDB]" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                }`}
                title="Configure Telegram Push Gateway"
              >
                <Settings className="w-4 h-4" />
              </button>
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

          {/* Telegram Gateway Status Bar */}
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono px-2 py-1.5 rounded-lg bg-white border border-slate-200">
            <div className="flex items-center gap-1.5">
              <Radio className={`w-3 h-3 ${telegramConfig?.is_configured ? "text-emerald-500 animate-pulse" : "text-slate-400"}`} />
              <span className="font-semibold text-slate-700">Telegram Gateway:</span>
              <span className={telegramConfig?.is_configured ? "text-emerald-600 font-bold" : "text-slate-400 font-medium"}>
                {telegramConfig?.is_configured ? "[ONLINE]" : "[STANDBY]"}
              </span>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="text-[#635BDB] hover:underline font-semibold"
            >
              {showConfig ? "Hide Config" : "Setup"}
            </button>
          </div>

          {/* Collapsible Telegram Configuration Panel */}
          {showConfig && (
            <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 font-mono">
                  // TELEGRAM_PUSH_CREDENTIALS
                </span>
                <span className="text-[10px] text-slate-400">@BotFather</span>
              </div>

              <div>
                <label className="text-[10.5px] font-mono text-slate-500 block mb-1">
                  Bot Token (from @BotFather):
                </label>
                <input
                  type="password"
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder={telegramConfig?.bot_token_preview || "123456789:ABCdefGHIjklMNO..."}
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#635BDB]"
                />
              </div>

              <div>
                <label className="text-[10.5px] font-mono text-slate-500 block mb-1">
                  Chat ID (your Telegram User/Group ID):
                </label>
                <input
                  type="text"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  placeholder="e.g. 987654321"
                  className="w-full text-xs font-mono px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#635BDB]"
                />
              </div>

              {testResult && (
                <div
                  className={`p-2 rounded-lg text-[11px] font-mono ${
                    testResult.success
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {testResult.success ? `✓ ${testResult.message}` : `✗ ${testResult.error}`}
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={testing || (!chatId && !telegramConfig?.chat_id)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold disabled:opacity-40 transition shadow-sm font-mono"
                >
                  <Send className={`w-3 h-3 ${testing ? "animate-spin" : ""}`} />
                  <span>{testing ? "Testing..." : "Send Test Ping"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveTelegram}
                  disabled={saving || !botToken}
                  className="px-3 py-1 rounded-lg bg-[#635BDB] hover:bg-[#5046CA] text-white text-xs font-bold font-mono transition shadow-sm disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Save Config"}
                </button>
              </div>
            </div>
          )}
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
