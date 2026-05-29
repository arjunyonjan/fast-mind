"use client";
import Link from "next/link";
import { Brain, BookOpen, LayoutGrid, FileText, Activity } from "lucide-react";

export default function DocsIndex() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen size={28} className="text-cyan-500" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Technical Documentation</h1>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/docs/brain-panel" className="group p-5 border border-gray-200 dark:border-zinc-800 rounded-xl hover:border-cyan-500 transition">
            <div className="flex items-center gap-3 mb-2"><Brain size={20} className="text-purple-500" /><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Brain Panel Architecture</h2></div>
            <p className="text-sm text-gray-600 dark:text-zinc-400">Modular React components, hooks, metrics calculation flow, and real-time brain health tracking.</p>
          </Link>
          <div className="p-5 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl opacity-50"><FileText size={20} className="text-gray-400 mb-2" /><h3 className="font-medium text-gray-700 dark:text-gray-300">More docs coming...</h3></div>
        </div>
      </div>
    </div>
  );
}