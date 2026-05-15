"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import RingLoader from '@/components/RingLoader';
import { useToast } from '@/components/ToastProvider';

const AdvancedEditor = dynamic(() => import('@/components/editor/AdvancedEditor'), {
  ssr: false,
  loading: () => <div className="border rounded-xl"><div className="h-12 bg-gray-100 animate-pulse" /><div className="h-[400px] bg-gray-50 animate-pulse" /></div>
});

export default function EditDocumentPage() {
  const params = useParams(); const router = useRouter(); const id = params.id as string;
  const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`/api/documents/${id}`).then(res => res.json()).then(data => { if (data.success) { setTitle(data.document.title); setContent(data.document.content || ''); } setLoading(false); });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch(`/api/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }) });
    if ((await res.json()).success) { showToast('Document saved!', 'success'); router.push(`/documents/${id}`); }
    else { showToast('Failed to save', 'error'); setSaving(false); }
  }

  if (loading) return <RingLoader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href={`/documents/${id}`} className="text-cyan-500 hover:text-cyan-600 text-sm">← Back</Link>
      <div className="mt-6">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full text-4xl font-bold text-gray-900 border-0 focus:outline-none focus:ring-0 p-0 mb-6" />
        <AdvancedEditor content={content} onChange={setContent} />
        <div className="flex gap-3 mt-6 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border">
          <button onClick={handleSubmit} disabled={saving} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
          <Link href={`/documents/${id}`} className="px-6 py-3 border rounded-xl text-gray-700 hover:bg-gray-50 text-center">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
