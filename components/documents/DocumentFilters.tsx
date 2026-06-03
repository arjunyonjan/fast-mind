"use client";
import { Search, List, Grid3X3, Plus, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";

interface DocumentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: "updatedAt" | "title";
  onSortChange: (value: "updatedAt" | "title") => void;
  view: "list" | "grid";
  onViewChange: (value: "list" | "grid") => void;
  onRefresh: () => void;
  totalDocs: number;
}

export function DocumentFilters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  onRefresh,
  totalDocs
}: DocumentFiltersProps) {
  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-4 shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <FileText size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Documents</h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">{totalDocs} total documents</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition" title="Refresh">
            <RefreshCw size={15} />
          </button>
          <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
            <button onClick={() => onViewChange("list")} className={`p-1.5 rounded-md text-xs transition ${view === "list" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-white" : "text-zinc-500"}`}>
              <List size={14} />
            </button>
            <button onClick={() => onViewChange("grid")} className={`p-1.5 rounded-md text-xs transition ${view === "grid" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-white" : "text-zinc-500"}`}>
              <Grid3X3 size={14} />
            </button>
          </div>
          <Link href="/documents/new" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition">
            <Plus size={14} /> New
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search documents..."
            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2 text-sm text-zinc-800 dark:text-zinc-200 placeholder-zinc-400 outline-none focus:border-emerald-400 transition"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as "updatedAt" | "title")}
          className="text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-2 text-zinc-500 dark:text-zinc-400 outline-none focus:border-emerald-400 transition"
        >
          <option value="updatedAt">Last modified</option>
          <option value="title">Title A-Z</option>
        </select>
      </div>
    </div>
  );
}