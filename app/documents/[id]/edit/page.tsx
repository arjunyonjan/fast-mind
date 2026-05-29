"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import RingLoader from "@/components/RingLoader";
import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, Save, X } from "lucide-react";

const AdvancedEditor = dynamic(() => import("@/components/editor/AdvancedEditor"), {
  ssr: false,
  loading: () => <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl"><div className="h-12 bg-zinc-100 dark:bg-zinc-900 animate-pulse" /><div className="h-[400px] bg-zinc-50 dark:bg-zinc-900/50 animate-pulse" /></div>
});

export default function EditDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTitle(data.document.title);
          setContent(data.document.content || "");
        }
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content })
      });
      const data = await res.json();
      if (data.success) {
        showToast("Document saved!", "success");
        router.push(`/documents/${id}`);
      } else {
        showToast("Failed to save", "error");
        setSaving(false);
      }
    } catch (err) {
      showToast("Network error", "error");
      setSaving(false);
    }
  };

  // Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [title, content]);

  if (loading) return <RingLoader />;

  return (
    <div className="flex flex-col h-full min-h-0 bg-zinc-50 dark:bg-zinc-950">
      {/* Top bar — shrink-0 so it stays fixed */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-2.5 shrink-0 bg-white dark:bg-zinc-900">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href={`/documents/${id}`}
              className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 transition"
            >
              <ArrowLeft size={16} />
            </Link>
            <span className="text-sm text-zinc-400 dark:text-zinc-500">Editing</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/documents/${id}`)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
            >
              <X size={14} />
              <span className="hidden sm:inline">Discard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable editor area */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-10">
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white border-0 focus:outline-none focus:ring-0 p-0 mb-8 bg-transparent placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
            placeholder="Document title..."
          />

          {/* Editor */}
          <AdvancedEditor content={content} onChange={setContent} />

          {/* Spacer so save bar doesn't overlap content */}
          <div className="h-4" />
        </form>
      </div>

      {/* Save bar — sticky at bottom */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-3 shrink-0 bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/20 transition-all text-sm"
          >
            <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link
            href={`/documents/${id}`}
            className="px-6 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-center transition"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
