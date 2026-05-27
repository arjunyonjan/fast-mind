"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
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
  const { showToast } = useToast();

  // Hook for copying code blocks – must be before any conditional returns
  useEffect(() => {
    const handleCopy = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const pre = target.closest("pre");
      if (pre) {
        const code = pre.querySelector("code");
        if (code) {
          navigator.clipboard.writeText(code.innerText);
          const toast = document.createElement("div");
          toast.innerText = "Copied!";
          toast.style.position = "fixed";
          toast.style.bottom = "20px";
          toast.style.right = "20px";
          toast.style.background = "#1f2937";
          toast.style.color = "white";
          toast.style.padding = "6px 12px";
          toast.style.borderRadius = "8px";
          toast.style.fontSize = "12px";
          toast.style.zIndex = "9999";
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 1500);
        }
      }
    };
    document.addEventListener("click", handleCopy);
    return () => document.removeEventListener("click", handleCopy);
  }, []); // Empty dependency array – effect runs once after mount

  // Data fetching effect
  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDoc(data.document);
        setLoading(false);
      });
  }, [id]);

  async function handleDelete() {
    setShowModal(false);
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast("Document deleted", "success");
      router.push("/");
    } else {
      showToast("Failed to delete", "error");
    }
  }

  if (loading) return <RingLoader />;
  if (!doc) return <div className="text-center py-12">Document not found</div>;

  return (
    <>
      <ConfirmModal
        isOpen={showModal}
        title="Delete Document"
        message={`Delete "${doc.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition"
            >
              <ArrowLeft size={16} />
              Back to all documents
            </Link>
          </div>

          <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                  {doc.title}
                </h1>
                <div className="flex gap-2">
                  <Link
                    href={`/documents/${id}/edit`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Edit size={15} />
                    Edit
                  </Link>
                  <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition"
                  >
                    <Trash2 size={15} />
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-400">
                Last updated {new Date(doc.updatedAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>

            <div className="px-8 py-8 prose prose-gray prose-lg max-w-none">
              {doc.content ? (
                <div dangerouslySetInnerHTML={{ __html: doc.content }} />
              ) : (
                <p className="text-gray-400 italic">No content yet. Start writing by editing this document.</p>
              )}
            </div>
          </article>
        </div>
      </div>
    </>
  );
}