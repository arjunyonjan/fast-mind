"use client";
import Link from "next/link";
import { FileText, Calendar, Trash2, X } from "lucide-react";

interface Doc { _id: string; title: string; content: string; updatedAt: string; }

interface DocumentCardProps {
  doc: Doc;
  view: "list" | "grid";
  wordCount: (html: string) => number;
  formatRelativeDate: (dateStr: string) => string;
  stripHtml: (html: string) => string;
  onDelete: (id: string) => void;
}

export function DocumentCard({ doc, view, wordCount, formatRelativeDate, stripHtml, onDelete }: DocumentCardProps) {
  if (view === "list") {
    return (
      <div className="group border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
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
          <div className="w-24 text-xs text-zinc-400 dark:text-zinc-500">{wordCount(doc.content).toLocaleString()}</div>
          <div className="w-28 text-xs flex items-center gap-1 text-zinc-400 dark:text-zinc-500">
            <Calendar size={10} /> {formatRelativeDate(doc.updatedAt)}
          </div>
          <div className="w-8 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onDelete(doc._id)} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500 transition">
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/documents/${doc._id}`} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-800 hover:-translate-y-0.5 transition-all duration-200 relative">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
          <FileText size={15} className="text-emerald-500" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{doc.title}</h3>
          {doc.content && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 line-clamp-2">{stripHtml(doc.content)}</p>}
          <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-400">
            <span>{wordCount(doc.content).toLocaleString()} words</span>
            <span>{formatRelativeDate(doc.updatedAt)}</span>
          </div>
        </div>
      </div>
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(doc._id); }} className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition">
        <X size={12} />
      </button>
    </Link>
  );
}