import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Antigravity | Personalized Intelligence & Opportunity Engine",
  description:
    "Ad-free India-first personal intelligence hub for verified news, tech insights, scholarships, and developer benefits.",
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
        {children}
      </body>
    </html>
  );
}
