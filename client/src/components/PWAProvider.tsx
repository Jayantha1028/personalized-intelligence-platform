"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Download,
  Share,
  PlusSquare,
  X,
  Smartphone,
  Sparkles,
  Check,
  Bell,
} from "lucide-react";

interface PWAContextType {
  isInstallable: boolean;
  isIOS: boolean;
  isStandalone: boolean;
  promptInstall: () => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  pushPermissionStatus: NotificationPermission;
}

const PWAContext = createContext<PWAContextType>({
  isInstallable: false,
  isIOS: false,
  isStandalone: false,
  promptInstall: async () => {},
  requestPushPermission: async () => false,
  pushPermissionStatus: "default",
});

export const usePWA = () => useContext(PWAContext);

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [pushStatus, setPushStatus] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if running in standalone mode (installed PWA)
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes("android-app://");
    setIsStandalone(isStandaloneMode);

    // 2. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // 3. Register Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });
    }

    // 4. Capture native Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
      // Show install banner if not already dismissed in this session
      const dismissed = sessionStorage.getItem("antigravity_pwa_dismissed");
      if (!dismissed && !isStandaloneMode) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. Check Push Notification status
    if ("Notification" in window) {
      setPushStatus(Notification.permission);
    }

    // 6. Show iOS guidance banner if on iOS browser and not standalone
    if (isIOSDevice && !isStandaloneMode) {
      const dismissed = sessionStorage.getItem("antigravity_ios_pwa_dismissed");
      if (!dismissed) {
        // Wait 3 seconds after page load before unobtrusively offering install
        const timer = setTimeout(() => {
          setShowIOSPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const promptInstall = async () => {
    if (isIOS) {
      setShowIOSPrompt(true);
      return;
    }

    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPushStatus(permission);
      return permission === "granted";
    } catch (e) {
      console.warn("Failed requesting notification permission", e);
      return false;
    }
  };

  const dismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("antigravity_pwa_dismissed", "true");
  };

  const dismissIOSPrompt = () => {
    setShowIOSPrompt(false);
    sessionStorage.setItem("antigravity_ios_pwa_dismissed", "true");
  };

  return (
    <PWAContext.Provider
      value={{
        isInstallable,
        isIOS,
        isStandalone,
        promptInstall,
        requestPushPermission,
        pushPermissionStatus: pushStatus,
      }}
    >
      {children}

      {/* Android & Desktop Chrome PWA Install Pill Banner */}
      {showInstallBanner && !isStandalone && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
          <div className="bg-white border-2 border-[#635BDB] rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 font-sans">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#635BDB] flex items-center justify-center text-white shrink-0 shadow-md shadow-[#635BDB]/25">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  Install Antigravity Native App
                </h4>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Instant launch, zero browser address bar, and offline dispatches.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={promptInstall}
                className="px-3.5 py-1.5 rounded-xl bg-[#635BDB] hover:bg-[#5046CA] text-white text-xs font-bold transition shadow-sm font-mono whitespace-nowrap"
              >
                Install
              </button>
              <button
                onClick={dismissBanner}
                className="p-1 text-slate-400 hover:text-slate-700 transition"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* iOS Safari "Add to Home Screen" Bottom Sheet Modal */}
      {showIOSPrompt && !isStandalone && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#635BDB] flex items-center justify-center text-white shadow-md shadow-[#635BDB]/25">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Install on iPhone / iPad
                  </h3>
                  <span className="text-[10px] font-mono text-[#635BDB] font-semibold">
                    Apple WebKit Standalone App
                  </span>
                </div>
              </div>
              <button
                onClick={dismissIOSPrompt}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Install Antigravity to your iOS Home Screen for fullscreen operation, custom status bar styling, and instant push updates:
            </p>

            <div className="space-y-2.5 bg-[#F8FAFC] p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700 font-medium">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#635BDB] shrink-0">
                  <Share className="w-3.5 h-3.5" />
                </div>
                <span>1. Tap the <strong className="text-slate-900">Share</strong> icon in Safari&apos;s bottom toolbar.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#635BDB] shrink-0">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <span>2. Scroll down and tap <strong className="text-slate-900">&quot;Add to Home Screen&quot;</strong>.</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>3. Tap <strong className="text-slate-900">&quot;Add&quot;</strong> in top-right corner.</span>
              </div>
            </div>

            <button
              onClick={dismissIOSPrompt}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold transition hover:bg-slate-800"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </PWAContext.Provider>
  );
}
