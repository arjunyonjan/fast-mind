"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import RingLoader from '@/components/RingLoader';
import { useToast } from '@/components/ToastProvider';
import ConfirmModal from '@/components/ConfirmModal';

interface Document { _id: string; title: string; content: string; updatedAt: string; }

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchDocs = () => { fetch('/api/documents').then(res => res.json()).then(data => { if (data.success) setDocuments(data.documents); setLoading(false); }); };
  useEffect(() => { fetchDocs(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/documents/${deleteId}`, { method: 'DELETE' });
    if ((await res.json()).success) { showToast('Document deleted!', 'success'); fetchDocs(); }
    else showToast('Failed to delete', 'error');
    setDeleteId(null);
  };

  if (loading) return <RingLoader />;

  return (
    <>
      <ConfirmModal isOpen={!!deleteId} title="Delete Document" message="This action cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold text-gray-900">My Documents</h1><Link href="/documents/new" className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-5 py-2 rounded-lg">+ New</Link></div>
        {documents.length === 0 ? <div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-400">No documents yet.</p></div> :
          <div className="space-y-3">{documents.map((doc) => (
            <div key={doc._id} className="bg-white border rounded-xl p-5 flex justify-between items-center hover:shadow-md">
              <Link href={`/documents/${doc._id}`} className="flex-1"><h2 className="font-semibold group-hover:text-cyan-600">{doc.title}</h2><p className="text-sm text-gray-400">{new Date(doc.updatedAt).toLocaleDateString()}</p></Link>
              <button onClick={() => setDeleteId(doc._id)} className="text-red-500 hover:text-red-700 px-3 py-1">Delete</button>
            </div>
          ))}</div>}
      </div>
    </>
  );
}
