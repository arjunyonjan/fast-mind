"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, X } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import dynamic from "next/dynamic";

const AdvancedEditor = dynamic(() => import("@/components/editor/AdvancedEditor"), { ssr: false, loading: () => <div className="h-48 bg-gray-50 animate-pulse rounded" /> });

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
        router.push(`/documents/${data.document.id}`);
      } else { showToast(data.error || "Failed", "error"); setLoading(false); }
    } catch { showToast("Failed", "error"); setLoading(false); }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-8 pb-24">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition mb-6">
          <ArrowLeft size={14} /> Back
        </Link>
        <form onSubmit={handleSubmit}>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={generateSlug} className="w-full text-4xl font-bold text-gray-900 bg-transparent border-0 focus:outline-none focus:ring-0 p-0 mb-2 placeholder:text-gray-200" placeholder="Untitled" autoFocus />
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-8 pb-2 border-b border-gray-100">
            <span className="text-gray-300">/</span>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 font-mono text-sm bg-transparent border-0 focus:outline-none focus:ring-0 p-0" placeholder="your-slug" />
          </div>
          <AdvancedEditor content={content} onChange={setContent} placeholder="Write something..." />
        </form>
      </div>
      
      {/* Floating action bar - higher z-index, below debug panel if needed */}
      <div className="fixed bottom-0 right-0 left-64 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 px-6 flex justify-end gap-3 z-40 shadow-lg">
        <Link href="/" className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition">
          Cancel
        </Link>
        <button 
          onClick={handleSubmit}
          disabled={loading} 
          className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-medium rounded-lg hover:shadow-md disabled:opacity-50 transition flex items-center gap-2"
        >
          <Save size={16} />
          {loading ? "Publishing..." : "Publish"}
        </button>
      </div>
    </>
  );
}