import ThemeProvider from '@/components/ThemeProvider';
import DebugPanelWrapper from '@/components/DebugPanelWrapper';
import AppSidebar from '@/components/AppSidebar';
import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';

export const metadata: Metadata = { title: 'FastMind', description: 'Lightning-fast document writing' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ToastProvider>
            <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
              <AppSidebar />
              <main className="flex-1 overflow-y-auto">{children}</main>
            </div>
          </ToastProvider>
          <DebugPanelWrapper />
        </ThemeProvider>
      </body>
    </html>
  );
}