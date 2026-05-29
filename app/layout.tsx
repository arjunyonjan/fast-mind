import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import ThemeProvider from "@/components/ThemeProvider";
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
      <body className="bg-gray-50 dark:bg-zinc-950 min-h-screen">
        <ThemeProvider>
          <ToastProvider>
            <MobileMenuButton />
            <div className="flex min-h-screen">
              <AppSidebar />
              <div className="flex-1 min-w-0 flex flex-col">
                <main className="flex-1 min-h-0">{children}</main>
              </div>
            </div>
            <ClientProviders />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}