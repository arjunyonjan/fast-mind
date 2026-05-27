"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Search, Plus, RefreshCw, Calendar, List, Grid3X3, MoreHorizontal, Trash2, X } from "lucide-react";

interface Doc { _id: string; title: string; content: string; updatedAt: string; }

export default function DocumentsPage() {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "grid">("list");
  const [sortBy, setSortBy] = useState<"updatedAt" | "title">("updatedAt");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/documents").then(r => r.json()).then(data => { if (data.success) setDocs(data.documents); }).finally(() => setLoading(false));
  }, []);

  const refresh = () => {
    setLoading(true);
    fetch("/api/documents").then(r => r.json()).then(data => { if (data.success) setDocs(data.documents); }).finally(() => setLoading(false));
  };

  const deleteDoc = async (id: string) => {
    await fetch("/api/documents/" + id, { method: "DELETE" });
    setDocs(p => p.filter(d => d._id !== id));
    setDeleteId(null);
  };

  const filtered = docs
    .filter(d => d.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "title") return a.title.localeCompare(b.title);
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  // Group by date range
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groups = {
    today: filtered.filter(d => new Date(d.updatedAt) >= today),
    thisWeek: filtered.filter(d => new Date(d.updatedAt) >= weekAgo && new Date(d.updatedAt) < today),
    thisMonth: filtered.filter(d => new Date(d.updatedAt) >= monthAgo && new Date(d.updatedAt) < weekAgo),
    older: filtered.filter(d => new Date(d.updatedAt) < monthAgo),
  };

  const formatRelativeDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (d >= today) return "Today";
    if (d >= weekAgo) return d.toLocaleDateString('en-GB', { weekday: 'long' });
    if (d >= monthAgo) return Math.ceil((today.getTime() - d.getTime()) / (7 * 24 * 60 * 60 * 1000)) + " days ago";
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const stripHtml = (html: string) => html.replace(/<[^>]*>/g, "").substring(0, 120);

  const wordCount = (html: string) => {
    const text = stripHtml(html);
    return text ? text.split(/\s+/).filter(Boolean).length : 0;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {loading && <div className="fixed top-0 left-0 right-0 h-0.5 z-50"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-loading-bar" /></div>}

      {/* Header */}
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <FileText size={16} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Documents</h1>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">{docs.length} total · {docs.reduce((sum, d) => sum + wordCount(d.content), 0).toLocaleString()} words</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition" title="Refresh">
              <RefreshCw size={15} />
            </button>
            <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
              <button onClick={() => setView("list")} className={`p-1.5 rounded-md text-xs transition ${view === "list" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-white" : "text-zinc-500"}`}>
                <List size={14} />
              </button>
              <button onClick={() => setView("grid")} className={`p-1.5 rounded-md text-xs transition ${view === "grid" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-white" : "text-zinc-500"}`}>
                <Grid3X3 size={14} />
              </button>
            </div>
            <Link href="/documents/new" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition">
              <Plus size={14} /> New
            </Link>
          </div>
        </div>

        {/* Search + Sort */}
        <div className="flex items-center gap-3 mt-3">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-emerald-400 transition"
            />
          </div>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as "updatedAt" | "title")}
            className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-zinc-500 dark:text-zinc-400 outline-none focus:border-emerald-400 transition"
          >
            <option value="updatedAt">Last modified</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
              <FileText size={20} className="text-zinc-400" />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">{search ? "No matches found" : "No documents yet"}</p>
            {!search && (
              <Link href="/documents/new" className="mt-2 text-emerald-500 hover:text-emerald-400 text-sm font-medium">Create one →</Link>
            )}
          </div>
        ) : view === "list" ? (
          /* ===== LIST VIEW ===== */
          <div className="max-w-5xl mx-auto px-6 py-4">
            {/* Column headers */}
            <div className="flex items-center gap-4 px-3 py-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex-1">Name</div>
              <div className="w-24">Words</div>
              <div className="w-28">Modified</div>
              <div className="w-8" />
            </div>

            {Object.entries(groups).map(([key, group]) => (
              group.length > 0 && (
                <div key={key}>
                  <div className="flex items-center gap-2 px-3 py-2 mt-4 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {key === "today" ? "Today" : key === "thisWeek" ? "This week" : key === "thisMonth" ? "This month" : "Older"} ({group.length})
                    </span>
                  </div>

                  {group.map(doc => (
                    <div key={doc._id} className="group border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                      <div className="flex items-center gap-4 px-3 py-2.5">
                        <Link href={`/documents/${doc._id}`} className="flex-1 min-w-0 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                            <FileText size={14} className="text-emerald-500" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate block group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {doc.title}
                            </span>
                            {doc.content && (
                              <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate block">{stripHtml(doc.content)}</span>
                            )}
                          </div>
                        </Link>
                        <div className="w-24 text-xs text-zinc-400 dark:text-zinc-500">
                          {wordCount(doc.content).toLocaleString()}
                        </div>
                        <div className="w-28 text-xs flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
                          <Calendar size={10} />
                          {formatRelativeDate(doc.updatedAt)}
                        </div>
                        <div className="w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setDeleteId(doc._id); }} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500 transition">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
        ) : (
          /* ===== GRID VIEW ===== */
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(doc => (
                <Link key={doc._id} href={`/documents/${doc._id}`} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 hover:-translate-y-0.5 transition-all duration-200 relative">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                      <FileText size={15} className="text-emerald-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{doc.title}</h3>
                      {doc.content && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-2">{stripHtml(doc.content)}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
                        <span>{wordCount(doc.content).toLocaleString()} words</span>
                        <span>{formatRelativeDate(doc.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDeleteId(doc._id); }}
                    className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition"
                  >
                    <X size={12} />
                  </button>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-80 text-center mx-4" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500" /></div>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Delete document?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Cancel</button>
              <button onClick={() => deleteDoc(deleteId)} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
