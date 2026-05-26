"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import RingLoader from "@/components/RingLoader";
import { useToast } from "@/components/ToastProvider";
import { ArrowLeft, Save } from "lucide-react";

const AdvancedEditor = dynamic(() => import("@/components/editor/AdvancedEditor"), {
  ssr: false,
  loading: () => <div className="border rounded-xl"><div className="h-12 bg-gray-100 animate-pulse" /><div className="h-[400px] bg-gray-50 animate-pulse" /></div>
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

  if (loading) return <RingLoader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href={`/documents/${id}`} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft size={18} /> Back
      </Link>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-bold text-gray-900 border-0 focus:outline-none focus:ring-0 p-0 mb-6"
          placeholder="Document title..."
        />
        <AdvancedEditor content={content} onChange={setContent} />
        <div className="flex gap-3 mt-6 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={18} /> {saving ? "Saving..." : "Save Changes"}
          </button>
          <Link href={`/documents/${id}`} className="px-6 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}