"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import dynamic from "next/dynamic";

const AdvancedEditor = dynamic(() => import("@/components/editor/AdvancedEditor"), { ssr: false, loading: () => <div className="h-48 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" /> });

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const generateSlug = () => {
    const generated = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (generated) setSlug(generated);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { showToast("Please add a title", "error"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, slug: slug || title.toLowerCase().replace(/ /g, "-"), content }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Document created!", "success");
        router.push(`/documents/${data.document._id}`);
      } else { showToast(data.error || "Failed", "error"); setLoading(false); }
    } catch { showToast("Failed", "error"); setLoading(false); }
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-2.5 shrink-0 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/documents"
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
            >
              <ArrowLeft size={16} />
            </Link>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">New Document</span>
          </div>
          <button
            onClick={() => router.push("/documents")}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={generateSlug}
            className="w-full text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white bg-transparent border-0 focus:outline-none focus:ring-0 p-0 mb-2 placeholder:text-zinc-300 dark:placeholder:text-zinc-700 caret-zinc-900 dark:caret-white"
            placeholder="Untitled"
            autoFocus
          />
          {/* Slug */}
          <div className="flex items-center gap-2 text-sm text-zinc-400 dark:text-zinc-500 mb-8 pb-2 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-300 dark:text-zinc-600">/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 font-mono text-sm bg-transparent border-0 focus:outline-none focus:ring-0 p-0 text-zinc-500 dark:text-zinc-400 placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
              placeholder="your-slug"
            />
          </div>

          {/* Editor */}
          <AdvancedEditor content={content} onChange={setContent} placeholder="Write something..." />

          <div className="h-4" />
        </form>
      </div>

      {/* Save bar */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3 shrink-0 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-sm"
          >
            <Save size={16} />
            {loading ? "Publishing..." : "Publish"}
          </button>
          <Link
            href="/documents"
            className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-center transition"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
