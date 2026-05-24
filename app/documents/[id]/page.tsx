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
  const [showDelete, setShowDelete] = useState(false);

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
            <Link href="/documents" className="text-gray-400 dark:text-zinc-500 hover:text-cyan-500 transition flex items-center gap-1 text-sm"><ArrowLeft size={14} /> Documents</Link><span className="text-gray-300 dark:text-zinc-600">/</span>
            <FileText size={20} className="text-cyan-500" />
            {editing ? (
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="text-xl font-semibold bg-transparent border-b border-gray-300 dark:border-zinc-600 outline-none text-gray-800 dark:text-zinc-200" autoFocus />
            ) : (
              <h1 className="text-xl font-semibold text-gray-800 dark:text-zinc-200">{doc.title}</h1>
            )}
          </div>
          <div className="flex items-center gap-1">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition"><Save size={14} /> {saving ? "Saving..." : "Save"}</button>
                <button onClick={() => { setEditing(false); setTitle(doc.title); setContent(doc.content); }} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition"><X size={18} /></button>
              </>
            ) : (
              <>
                <button onClick={() => setEditing(true)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 transition" title="Edit"><Edit3 size={17} /></button>
                <button onClick={() => setShowDelete(true)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition" title="Delete"><Trash2 size={17} /></button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto w-full px-6 py-10 flex-1">
        {editing ? (
          <TipTapEditor content={content} onChange={setContent} />
        ) : (
          <>
            <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:mb-4 prose-headings:mt-8 prose-headings:mb-4 prose-headings:text-gray-800 dark:prose-headings:text-zinc-200 prose-p:text-gray-600 dark:prose-p:text-zinc-400 prose-strong:text-gray-800 dark:prose-strong:text-zinc-200 prose-a:text-cyan-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: doc.content }} />
            <div className="mt-12 pt-6 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500">
              <span>Updated {new Date(doc.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />Published</span>
            </div>
          </>
        )}
      </div>

      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDelete(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 w-80 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500" /></div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200 mb-1">Delete document?</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition">Cancel</button>
              <button onClick={() => { setShowDelete(false); handleDelete(); }} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}