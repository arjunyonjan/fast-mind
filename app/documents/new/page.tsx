"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import dynamic from "next/dynamic";

const AdvancedEditor = dynamic(() => import("@/components/editor/AdvancedEditor"), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse">
      <div className="h-12 bg-gray-100 rounded-lg mb-4"></div>
      <div className="h-64 bg-gray-100 rounded-lg"></div>
    </div>
  ),
});

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
    if (!title.trim()) {
      showToast("Please add a title", "error");
      return;
    }
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
      } else {
        showToast(data.error || "Failed to create", "error");
        setLoading(false);
      }
    } catch {
      showToast("Failed to create", "error");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Back button */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition"
          >
            <ArrowLeft size={16} />
            Back to home
          </Link>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-cyan-50 rounded-xl">
                <FileText className="w-5 h-5 text-cyan-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">New Document</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={generateSlug}
                  className="w-full px-4 py-2.5 text-lg border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  placeholder="e.g., My Awesome Document"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL)</label>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">/documents/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
                    placeholder="your-slug"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Leave empty to auto-generate from title</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <AdvancedEditor content={content} onChange={setContent} placeholder="Start writing your story here..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-md disabled:opacity-50 transition"
                >
                  <Save size={18} />
                  {loading ? "Creating..." : "Publish Document"}
                </button>
                <Link
                  href="/"
                  className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}