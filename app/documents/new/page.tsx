"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import RingLoader from '@/components/RingLoader';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[300px] border rounded-lg animate-pulse bg-gray-50" />
});

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSlug = () => {
    setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, slug, content }),
    });
    const data = await res.json();
    if (data.success) router.push(`/documents/${data.document.id}`);
    else alert(data.error);
    setLoading(false);
  }

  if (loading) return <RingLoader />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/" className="text-cyan-500 hover:text-cyan-600 text-sm">← Back home</Link>
      <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-6">Create New Document</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={generateSlug} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500" required />
        </div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Slug (URL)</label>
          <div className="flex gap-2">
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-mono text-sm" />
            <button type="button" onClick={generateSlug} className="px-4 py-2.5 text-cyan-600 bg-cyan-50 rounded-lg hover:bg-cyan-100">Auto</button>
          </div>
          <p className="text-xs text-gray-400 mt-1">/documents/{slug || 'your-slug'}</p>
        </div>
        <div><RichTextEditor content={content} onChange={setContent} placeholder="Start writing..." /></div>
        <div className="flex gap-3">
          <button type="submit" className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition">
            ✨ Publish Document
          </button>
          <Link href="/" className="px-6 py-2.5 border rounded-lg text-gray-700 hover:bg-gray-50">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
