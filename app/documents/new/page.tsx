"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDocumentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSlug = () => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(generated);
  };

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
        router.push(`/documents/${data.document.id}`);
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Failed to create document');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Document</h1>
        <p className="text-gray-500 mt-1">Write your next great idea</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={generateSlug}
            placeholder="My Awesome Document"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Slug (URL)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="my-awesome-document"
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm"
            />
            <button
              type="button"
              onClick={generateSlug}
              className="px-4 py-2.5 text-cyan-600 font-medium bg-cyan-50 rounded-lg hover:bg-cyan-100 transition"
            >
              Auto
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            /documents/{slug || 'your-slug'}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            placeholder="Write your content here... Supports markdown."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-mono text-sm resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-400">✨ Markdown supported</span>
            <span className="text-xs text-gray-400">{content.length} characters</span>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-medium hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Publish Document'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/documents')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="mt-6 p-4 bg-cyan-50 rounded-lg border border-cyan-100">
        <p className="text-sm text-cyan-800">
          <span className="font-medium">💡 Pro Tip:</span> Use markdown for formatting: # Heading, **bold**, *italic*, `code`
        </p>
      </div>
    </div>
  );
}

