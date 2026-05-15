"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import RingLoader from '@/components/RingLoader';

interface Document { _id: string; title: string; content: string; updatedAt: string; }

export default function ViewDocumentPage() {
  const params = useParams(); const router = useRouter(); const id = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null); const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(res => res.json())
      .then(data => { if (data.success) setDoc(data.document); setLoading(false); });
  }, [id]);

  async function handleDelete() {
    if (!confirm('Delete this document?')) return;
    const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
    if ((await res.json()).success) router.push('/');
  }

  if (loading) return <RingLoader />;
  if (!doc) return <div className="text-center py-12"><Link href="/" className="text-cyan-500">← Back</Link></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/" className="text-cyan-500 hover:text-cyan-600 text-sm">← Back home</Link>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-3xl font-bold text-gray-900">{doc.title}</h1>
          <div className="flex gap-3 mt-4">
            <Link href={`/documents/${id}/edit`} className="px-4 py-1.5 bg-cyan-500 text-white text-sm rounded-lg hover:bg-cyan-600">Edit</Link>
            <button onClick={handleDelete} className="px-4 py-1.5 border border-red-300 text-red-600 text-sm rounded-lg hover:bg-red-50">Delete</button>
          </div>
        </div>
        <div className="p-6 prose prose-cyan max-w-none">
          {doc.content ? <div dangerouslySetInnerHTML={{ __html: doc.content }} /> : <p className="text-gray-400 italic">No content yet.</p>}
        </div>
        <div className="p-4 bg-gray-50 border-t text-xs text-gray-400">Updated: {new Date(doc.updatedAt).toLocaleString()}</div>
      </div>
    </div>
  );
}
