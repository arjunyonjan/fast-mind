export const dynamic = 'force-dynamic';

import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import { ToastProvider } from "@/components/ToastProvider";
import ThemeProvider from "@/components/ThemeProvider";
import CommandLauncher from '@/components/CommandLauncher';
import { ClientProviders } from "@/components/ClientProviders";
import AppSidebar from "@/components/AppSidebar";
import MobileMenuButton from "@/components/MobileMenuButton";

export const metadata: Metadata = {
  title: "FastMind",
  description: "Lightning-fast document writing and AI assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 dark:bg-zinc-950 h-screen overflow-hidden">
    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium shadow-sm bg-black/80 backdrop-blur-sm">
  <div className={`w-1.5 h-1.5 rounded-full ${typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`}></div>
  <span className="text-white">{typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'LIVE' : 'LOCAL'}</span>
</div>
        <ThemeProvider>
          <ToastProvider>
            <MobileMenuButton />
            <div className="flex h-screen">
              <AppSidebar />
              <div className="flex-1 min-w-0 flex flex-col min-h-0">
                <main className="flex-1 min-h-0">{children}</main>
              </div>
            </div>
            <Suspense fallback={null}>
              <CommandLauncher />
            <ClientProviders />
            </Suspense>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}