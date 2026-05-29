"use client";
import { useEffect, useState, useLayoutEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Edit, Trash2, Calendar, FileText, Clock, MoreHorizontal } from "lucide-react";
import RingLoader from "@/components/RingLoader";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/components/ToastProvider";

interface Document {
  _id: string;
  title: string;
  content: string;
  updatedAt: string;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").trim();
}

function wordCount(html: string) {
  const text = stripHtml(html);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function readTime(html: string) {
  const words = wordCount(html);
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

export default function ViewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Copy code blocks
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
  }, []);

  // Track scroll progress
  const handleScroll = (e: Event) => {
    const target = e.target as HTMLElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight - target.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    setScrollProgress(progress);
  };

  useEffect(() => {
    const scrollContainer = document.querySelector("[data-scroll-container]");
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
      return () => scrollContainer.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Fetch document
  useEffect(() => {
    fetch(`/api/documents/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDoc(data.document);
        setLoading(false);
      });
  }, [id]);

  // Strip inline color/background styles synchronously after DOM updates
  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const all = contentRef.current.querySelectorAll('*');
    all.forEach(el => {
      const s = (el as HTMLElement).style;
      if (s.color) s.color = '';
      if (s.backgroundColor) s.backgroundColor = '';
      if (s.background) s.background = '';
      if (s.borderLeftColor) s.borderLeftColor = '';
    });
  }, [doc?.content, doc?._id]);

  async function handleDelete() {
    setShowModal(false);
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) {
      showToast("Document deleted", "success");
      router.push("/documents");
    } else {
      showToast("Failed to delete", "error");
    }
  }

  if (loading) return <RingLoader />;
  if (!doc) return <div className="flex items-center justify-center h-full text-zinc-500">Document not found</div>;

  const wc = wordCount(doc.content);
  const text = stripHtml(doc.content);

  return (
    <>
      <ConfirmModal
        isOpen={showModal}
        title="Delete Document"
        message={`Delete "${doc.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />

      {/* Force text colors - overrides TipTap inline styles */}
      <style>{`
        .doc-content * { color: #18181b !important; }
        .doc-content a { color: #059669 !important; }
        .doc-content blockquote { border-left-color: #34d399 !important; }
        .doc-content code:not(pre code) { background-color: #f3f4f6 !important; }
        .doc-content pre { background-color: #111827 !important; color: #e5e7eb !important; }
        .doc-content pre code { color: #e5e7eb !important; }
        .doc-content th { background-color: #f9fafb !important; }
        .doc-content hr { border-color: #e5e7eb !important; }
        .doc-content table { border-color: #e5e7eb !important; }
        .doc-content td { border-color: #e5e7eb !important; }

        .dark .doc-content * { color: #ffffff !important; }
        .dark .doc-content a { color: #34d399 !important; }
        .dark .doc-content blockquote { border-left-color: #059669 !important; color: #e5e5e5 !important; }
        .dark .doc-content code:not(pre code) { background-color: #27272a !important; }
        .dark .doc-content pre { background-color: #09090b !important; }
        .dark .doc-content th { background-color: #18181b !important; }
        .dark .doc-content hr { border-color: #27272a !important; }
        .dark .doc-content table { border-color: #27272a !important; }
        .dark .doc-content td { border-color: #27272a !important; }
      `}</style>

      <div className="flex flex-col h-full min-h-0 bg-zinc-50 dark:bg-zinc-950">
        {/* Top bar */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-2.5 shrink-0 bg-white dark:bg-zinc-900">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/documents"
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
              >
                <ArrowLeft size={16} />
              </Link>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate max-w-[200px] sm:max-w-md">
                {doc.title}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href={`/documents/${id}/edit`}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition"
              >
                <Edit size={14} />
                <span className="hidden sm:inline">Edit</span>
              </Link>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
              >
                <Trash2 size={14} />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-px bg-zinc-200 dark:bg-zinc-800 shrink-0">
          <div
            className="h-full bg-emerald-500 transition-all duration-150"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Scrollable content */}
        <div data-scroll-container className="flex-1 min-h-0 overflow-y-auto bg-white dark:bg-zinc-900">
          <div className="max-w-3xl mx-auto px-6 sm:px-8 py-10 sm:py-16">
            {/* Title section */}
            <div className="mb-8 sm:mb-12">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">
                {doc.title}
              </h1>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-xs text-zinc-500 dark:text-white">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                {wc > 0 && (
                  <>
                    <span className="flex items-center gap-1.5">
                      <FileText size={12} />
                      {wc.toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} />
                      {readTime(doc.content)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-zinc-200 dark:bg-zinc-800 mb-8 sm:mb-12" />

            {/* Content */}
            <div ref={contentRef} key={doc?._id} className="doc-content leading-relaxed [&>p]:mb-4 [&>p]:leading-8 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>li]:mb-1 [&>blockquote]:border-l-4 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:my-4 [&>pre]:rounded-lg [&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:my-4 [&>pre]:text-sm [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm [&>code]:font-mono [&>img]:rounded-xl [&>img]:my-6 [&>img]:max-w-full [&>table]:w-full [&>table]:border-collapse [&>table]:my-4 [&>th]:px-3 [&>th]:py-2 [&>th]:text-left [&>th]:font-semibold [&>td]:px-3 [&>td]:py-2 text-zinc-900 dark:text-white"
            >
              {text ? (
                <div dangerouslySetInnerHTML={{ __html: doc.content }} />
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <FileText size={20} className="text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-2">This document is empty</p>
                  <Link
                    href={`/documents/${id}/edit`}
                    className="text-emerald-500 hover:text-emerald-400 text-sm font-medium"
                  >
                    Start writing →
                  </Link>
                </div>
              )}
            </div>

            {/* Bottom spacing */}
            <div className="h-24" />
          </div>
        </div>
      </div>
    </>
  );
}
