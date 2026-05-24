"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Search } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";

interface Doc { _id: string; title: string; content: string; updatedAt: string; }

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/documents").then(r => r.json()).then(data => { if (data.success) setDocs(data.documents); }).finally(() => setLoading(false));
  }, []);

  const filtered = docs.filter(d => d.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {loading && <div className="fixed top-0 left-0 right-0 h-0.5 z-50"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-loading-bar" /></div>}
      <AppSidebar />
      <main className="flex-1 overflow-y-auto p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-semibold flex items-center gap-2 mb-6"><FileText size={20} /> Documents</h1>
          <div className="relative mb-6">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-800 dark:text-zinc-300 placeholder-zinc-400 outline-none focus:border-zinc-400 transition" />
          </div>
          {filtered.length === 0 ? (
            <p className="text-zinc-400 italic text-center py-16">{search ? "No matches." : "No documents yet."}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(doc => (
                <Link key={doc._id} href={`/documents/${doc._id}`} className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4 hover:border-gray-300 dark:hover:border-zinc-600 transition group">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-zinc-800 flex items-center justify-center shrink-0 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 transition-colors"><FileText size={14} className="text-cyan-500" /></div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-cyan-500 transition-colors">{doc.title}</h3>
                      {doc.content && <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{doc.content.replace(/<[^>]*>/g, "").substring(0, 100)}</p>}
                      <p className="text-xs text-zinc-400 mt-2">{new Date(doc.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}