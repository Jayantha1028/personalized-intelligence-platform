import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { PWAProvider } from "@/components/PWAProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#635BDB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://antigravity.platform"),
  title: "Antigravity | Personalized Intelligence & Opportunity Engine",
  description:
    "Ad-free India-first personal intelligence hub for verified news, tech insights, scholarships, and developer benefits.",
  applicationName: "Antigravity",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Antigravity",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "64x64" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "Antigravity | Personalized Intelligence & Opportunity Engine",
    description:
      "Ad-free India-first personal intelligence hub for verified news, tech insights, scholarships, and developer benefits.",
    url: "https://antigravity.platform",
    siteName: "Antigravity",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Antigravity Intelligence Cockpit",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antigravity | Personalized Intelligence & Opportunity Engine",
    description: "Personalized dual-engine news intelligence and verified opportunity cockpit.",
    images: ["/icons/icon-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F7F8FC] text-slate-900 selection:bg-[#635BDB]/20 selection:text-[#635BDB]">
        <PWAProvider>
          {children}
        </PWAProvider>
      </body>
    </html>
  );
}
