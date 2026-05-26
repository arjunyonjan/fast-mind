import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ToastProvider';
import ThemeProvider from "@/components/ThemeProvider";
import { ClientProviders } from '@/components/ClientProviders';

export const metadata: Metadata = { title: 'FastMind', description: 'Lightning-fast document writing' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ToastProvider>
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/80">
              <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <a href="/" className="flex items-center gap-2">
                  <span className="text-2xl">?</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">FastMind</span>
                </a>
                <div className="flex gap-4">
                  <a href="/documents" className="text-gray-600 hover:text-cyan-500 transition">My Docs</a>
                  <a href="/documents/new" className="text-gray-600 hover:text-cyan-500 transition">New Doc</a>
                </div>
              </div>
            </nav>
            <main>{children}</main>
            <ClientProviders />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

