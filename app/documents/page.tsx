"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Document {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export default function DocumentsPage() {
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

  async function deleteDocument(id: string) {
    if (!confirm('Delete this document?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setDocuments(documents.filter(doc => doc._id !== id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-[#0099cc] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Documents</h1>
          <p className="text-gray-500 mt-1">Manage your FastMind notes</p>
        </div>
        <Link
          href="/documents/new"
          className="bg-gradient-to-r from-[#0099cc] to-[#0077aa] text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg transition"
        >
          + New Document
        </Link>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-gray-500">No documents yet. Create your first one!</p>
          <Link
            href="/documents/new"
            className="inline-block mt-4 text-[#0099cc] hover:underline"
          >
            Create now →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-lg p-5 flex justify-between items-center hover:shadow-md transition border border-gray-100 group"
            >
              <Link href={`/documents/${doc._id}`} className="flex-1">
                <h2 className="text-lg font-semibold text-gray-800 group-hover:text-[#0099cc] transition">
                  {doc.title}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Updated {new Date(doc.updatedAt).toLocaleDateString()}
                </p>
              </Link>
              <button
                onClick={() => deleteDocument(doc._id)}
                className="text-red-400 hover:text-red-600 px-3 py-1 rounded transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
