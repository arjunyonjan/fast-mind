import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import ThemeProvider from "@/components/ThemeProvider";
import { ClientProviders } from "@/components/ClientProviders";
import AppSidebar from "@/components/AppSidebar";

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
        <ThemeProvider>
          <ToastProvider>
            <div className="flex h-screen">
              <AppSidebar />
              <div className="flex-1 min-w-0 flex flex-col h-screen">
                <main className="flex-1 min-h-0 h-full">{children}</main>
              </div>
            </div>
            <ClientProviders />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}