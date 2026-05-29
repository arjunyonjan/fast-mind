"use client";
import Link from "next/link";
import { Brain, BookOpen, FileText } from "lucide-react";

export default function DocsIndex() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={28} className="text-cyan-500" />
          <h1 className="text-3xl font-bold text-white">Documentation</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/docs/brain-panel" className="group p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-cyan-500 transition">
            <div className="flex items-center gap-3 mb-2"><Brain size={20} className="text-purple-500" /><h2 className="text-lg font-semibold">Brain Panel Architecture</h2></div>
            <p className="text-sm text-zinc-400">Modular React components, hooks, metrics calculation flow, and real-time brain health tracking.</p>
          </Link>
          <div className="p-5 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl opacity-50"><FileText size={20} className="text-zinc-400 mb-2" /><h3 className="font-medium">More docs coming...</h3></div>
        </div>
      </div>
    </div>
  );
}