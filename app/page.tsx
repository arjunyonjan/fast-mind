"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Document {
  _id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg mb-4">
          <span className="text-3xl">⚡</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          FastMind
        </h1>
        <p className="text-gray-500 mt-2">Lightning-fast document writing and organization</p>
        <Link
          href="/documents/new"
          className="inline-block mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2.5 rounded-lg font-medium hover:shadow-lg transition"
        >
          + New Document
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Documents</h2>
        
        {loading ? (
          <div className="text-center py-8 text-cyan-500">Loading...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-400">No documents yet. Create your first one!</p>
          </div>
        ) : (
          documents.map((doc) => (
            <Link
              key={doc._id}
              href={`/documents/${doc._id}`}
              className="block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 transition group"
            >
              <h3 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition">
                {doc.title}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Updated {new Date(doc.updatedAt).toLocaleDateString()}
              </p>
              {doc.content && (
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {doc.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                </p>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
