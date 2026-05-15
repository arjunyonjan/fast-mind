import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FastMind',
  description: 'Write, edit, and organize your documents with lightning speed',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚡</text></svg>',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/80">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-xl font-bold bg-gradient-to-r from-[#0099cc] to-[#0077aa] bg-clip-text text-transparent">
                FastMind
              </span>
            </a>
            <div className="flex gap-4">
              <a href="/documents" className="text-gray-600 hover:text-[#0099cc] transition">
                My Docs
              </a>
              <a href="/documents/new" className="text-gray-600 hover:text-[#0099cc] transition">
                New Doc
              </a>
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
