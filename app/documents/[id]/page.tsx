"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Copy, Check } from "lucide-react";
import RingLoader from "@/components/RingLoader";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";

interface Document {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export default function ViewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDoc(data.document);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const handleCopy = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const pre = target.closest("pre");
      if (pre) {
        const code = pre.querySelector("code");
        if (code) {
          navigator.clipboard.writeText(code.innerText);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }
      }
    };
    document.addEventListener("click", handleCopy);
    return () => document.removeEventListener("click", handleCopy);
  }, []);

  async function handleDelete() {
    setShowModal(false);
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if ((await res.json()).success) {
      showToast("Document deleted!", "success");
      router.push("/");
    } else {
      showToast("Failed to delete", "error");
    }
  }

  if (loading) return <RingLoader />;
  if (!doc) return <div className="text-center py-12">Document not found</div>;

  return (
    <>
      <ConfirmModal isOpen={showModal} title="Delete Document" message={`Delete "${doc.title}"?`} onConfirm={handleDelete} onCancel={() => setShowModal(false)} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft size={18} /> Back
          </Link>
          <div className="flex gap-2">
            <Link href={`/documents/${id}/edit`} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
              <Edit size={16} /> Edit
            </Link>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>

        <article className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{doc.title}</h1>
          <div className="text-sm text-gray-400 mb-8 pb-4 border-b">
            Updated {new Date(doc.updatedAt).toLocaleString()}
          </div>
          <div className="prose prose-lg prose-slate max-w-none prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-xl prose-pre:relative group">
            {doc.content ? (
              <div dangerouslySetInnerHTML={{ __html: doc.content }} />
            ) : (
              <p className="text-gray-400 italic">No content yet.</p>
            )}
          </div>
        </article>
      </div>
    </>
  );
}