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
import EnvIndicator from "@/components/EnvIndicator";

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
        <EnvIndicator />
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