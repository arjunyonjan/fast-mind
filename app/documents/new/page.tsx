"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import RingLoader from '@/components/RingLoader';
import { useToast } from '@/components/ToastProvider';

const AdvancedEditor = dynamic(() => import('@/components/editor/AdvancedEditor'), {
  ssr: false,
  loading: () => <div className="border rounded-xl overflow-hidden"><div className="h-12 bg-gray-100 animate-pulse" /><div className="h-[400px] bg-gray-50 animate-pulse" /></div>
});

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const generateSlug = () => setSlug(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, content }),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Document created successfully!', 'success');
        router.push(`/documents/${data.document.id}`);
      } else { showToast(data.error || 'Failed', 'error'); setLoading(false); }
    } catch (error) { showToast('Failed to create', 'error'); setLoading(false); }
  }

  if (loading) return <RingLoader />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Link href="/" className="text-cyan-500 hover:text-cyan-600 text-sm">← Back home</Link>
      <div className="mt-6">
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={generateSlug} placeholder="New document title..." className="w-full text-4xl font-bold text-gray-900 border-0 focus:outline-none focus:ring-0 p-0 mb-2 placeholder:text-gray-300" />
        <div className="flex gap-2 items-center text-sm text-gray-400 mb-6">
          <span>Slug:</span>
          <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="your-slug" className="px-2 py-1 border border-gray-200 rounded font-mono text-sm focus:ring-1 focus:ring-cyan-500" />
          <span className="text-cyan-500">/{slug || 'your-slug'}</span>
        </div>
        <AdvancedEditor content={content} onChange={setContent} placeholder="Start writing your story... Use the toolbar above for formatting." />
        <div className="flex gap-3 mt-6 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100">
          <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition">✨ Publish Document</button>
          <Link href="/" className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 text-center">Cancel</Link>
        </div>
      </div>
    </div>
  );
}
