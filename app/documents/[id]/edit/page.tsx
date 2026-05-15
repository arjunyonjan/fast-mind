"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[300px] border rounded-lg animate-pulse bg-gray-50" />
});

export default function EditDocumentPage() {
  const params = useParams(); const router = useRouter(); const id = params.id as string;
  const [title, setTitle] = useState(''); const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);

  useEffect(() => { fetchDocument(); }, [id]);

  async function fetchDocument() {
    try { const res = await fetch(`/api/documents/${id}`); const data = await res.json();
      if (data.success) { setTitle(data.document.title); setContent(data.document.content || ''); }
    } catch (error) { console.error('Error:', error);
    } finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true);
    try { const res = await fetch(`/api/documents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, content }) });
      if ((await res.json()).success) router.push(`/documents/${id}`);
      else alert('Failed to save');
    } catch (error) { alert('Failed to save');
    } finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center items-center h-64 text-cyan-500">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href={`/documents/${id}`} className="text-cyan-500 hover:text-cyan-600 text-sm">← Back</Link>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">Edit Document</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <RichTextEditor content={content} onChange={setContent} placeholder="Write your content here..." />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="submit" disabled={saving}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href={`/documents/${id}`} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
