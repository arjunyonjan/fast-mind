"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, FileText } from "lucide-react";
import TipTapEditor from "@/components/TipTapEditor";

export default function NewDocument() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!title.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: title.trim(), content }) });
      const data = await res.json();
      if (data.success) router.push(`/documents/${data.document._id}`);
    } catch (e) { console.error("[NewDoc]", e); } finally { setSaving(false); }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="border-b border-gray-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/documents" className="flex items-center gap-2 text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200"><ArrowLeft size={18} /> Back</Link>
          <button onClick={handleSave} disabled={!title.trim() || saving} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium disabled:opacity-50 hover:shadow-md transition"><Save size={16} /> {saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
      <div className="max-w-3xl mx-auto w-full px-4 py-8 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <FileText size={24} className="text-cyan-500" />
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title..." className="text-3xl font-bold bg-transparent border-none outline-none text-gray-800 dark:text-zinc-200 placeholder-gray-300 dark:placeholder-zinc-600 w-full" autoFocus />
        </div>
        <TipTapEditor content={content} onChange={setContent} />
      </div>
    </div>
  );
}