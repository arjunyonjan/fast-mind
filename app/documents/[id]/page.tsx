"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Edit3, Trash2, Save, X } from "lucide-react";
import TipTapEditor from "@/components/TipTapEditor";

interface Doc { _id: string; title: string; content: string; updatedAt: string; }

export default function DocumentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/documents/" + id)
      .then((r) => r.json())
      .then((data) => { if (data.success) { setDoc(data.document); setTitle(data.document.title); setContent(data.document.content); } })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    const res = await fetch("/api/documents/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content }) });
    const data = await res.json();
    if (data.success) { setDoc(data.document); setEditing(false); }
    setSaving(false);
  }, [id, title, content]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (editing) handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editing, handleSave]);

  const handleDelete = async () => {
    if (!confirm("Delete this document?")) return;
    await fetch("/api/documents/" + id, { method: "DELETE" });
    router.push("/documents");
  };

  if (loading) return <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!doc) return <div className="flex items-center justify-center h-full text-gray-500">Document not found.</div>;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="border-b border-gray-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/documents" className="text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"><ArrowLeft size={18} /></Link>
            <FileText size={20} className="text-cyan-500" />
            {editing ? (
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-zinc-600 outline-none text-gray-800 dark:text-zinc-200" autoFocus />
            ) : (
              <h1 className="text-xl font-semibold text-gray-800 dark:text-zinc-200">{doc.title}</h1>
            )}
          </div>
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition"><Save size={14} /> {saving ? "Saving..." : "Save"}</button>
                <button onClick={() => { setEditing(false); setTitle(doc.title); setContent(doc.content); }} className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300"><X size={18} /></button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"><Edit3 size={14} /> Edit</button>
                <button onClick={handleDelete} className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 size={14} /> Delete</button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto w-full px-4 py-8 flex-1">
        {editing ? (
          <TipTapEditor content={content} onChange={setContent} />
        ) : (
          <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-zinc-300 leading-relaxed" dangerouslySetInnerHTML={{ __html: doc.content }} />
        )}
        <p className="text-xs text-gray-400 dark:text-zinc-500 mt-8">Updated {new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  );
}