"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, ArrowLeft } from "lucide-react";

interface Doc { _id: string; title: string; content: string; updatedAt: string; }

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/documents")
      .then((r) => r.json())
      .then((data) => { if (data.success) setDocs(data.documents); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
            <h1 className="text-2xl font-semibold flex items-center gap-2"><FileText size={20} /> All Documents</h1>
          </div>
          <Link href="/documents/new" className="flex items-center gap-1 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition"><Plus size={16} /> New</Link>
        </div>
        {docs.length === 0 ? (
          <p className="text-gray-400 italic text-center py-12">No documents yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {docs.map((doc) => (
              <Link key={doc._id} href={`/documents/${doc._id}`} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 transition">
                <h3 className="font-semibold text-gray-800 truncate">{doc.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{new Date(doc.updatedAt).toLocaleDateString()}</p>
                {doc.content && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{doc.content.replace(/<[^>]*>/g, "").substring(0, 120)}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}