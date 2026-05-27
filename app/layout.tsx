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
      <body className="bg-gray-50">
        <ThemeProvider>
          <ToastProvider>
            <AppSidebar />
            <div className="lg:pl-64">
              <nav className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/80 backdrop-blur-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                  <a href="/" className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                      FastMind
                    </span>
                  </a>
                  <div className="flex gap-4">
                    <a href="/documents" className="text-gray-600 hover:text-cyan-500 transition">
                      My Docs
                    </a>
                    <a href="/documents/new" className="text-gray-600 hover:text-cyan-500 transition">
                      New Doc
                    </a>
                  </div>
                </div>
              </nav>
              <main>{children}</main>
            </div>
            <ClientProviders />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}