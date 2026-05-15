"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import RingLoader from '@/components/RingLoader';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[300px] border rounded-lg animate-pulse bg-gray-50" />
});

export default function EditDocumentPage() {
  const params = useParams(); const router = useRouter(); const id = params.id as string;
  const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then(res => res.json())
      .then(data => { if (data.success) { setTitle(data.document.title); setContent(data.document.content || ''); } setLoading(false); });
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    const res = await fetch(`/api/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }) });
    if ((await res.json()).success) router.push(`/documents/${id}`);
    else alert('Failed to save');
    setSaving(false);
  }

  if (loading) return <RingLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/documents/${id}`} className="text-cyan-500 hover:text-cyan-600 text-sm">← Back</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Edit Document</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href={`/documents/${id}`} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
