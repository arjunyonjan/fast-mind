import ThemeProvider from '@/components/ThemeProvider';
import DebugPanelWrapper from '@/components/DebugPanelWrapper';
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
          <main>{children}</main>
        </ToastProvider>
        <DebugPanelWrapper />
              </ThemeProvider>`n</body>
    </html>
  );
}