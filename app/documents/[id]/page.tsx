'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Calendar } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'
import dynamic from 'next/dynamic'

const AdvancedEditor = dynamic(() => import('@/components/editor/AdvancedEditor'), { 
  ssr: false, 
  loading: () => <div className="h-96 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-xl" /> 
})

type Document = {
  _id: string
  title: string
  content: string
  slug: string
  createdAt: string
  updatedAt: string
}

export default function DocumentPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { showToast } = useToast()
  
  const id = params?.id

  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    async function fetchDoc() {
      try {
        const res = await fetch(`/api/documents/${id}`)
        const data = await res.json()
        if (data.success) {
          setDoc(data.document)
          setEditTitle(data.document.title)
          setEditContent(data.document.content)
        } else {
          showToast('Document not found', 'error')
          router.push('/documents')
        }
      } catch {
        showToast('Failed to load document', 'error')
      } finally {
        setLoading(false)
      }
    }

    fetchDoc()
  }, [id, router, showToast])

  const handleSave = async () => {
    if (!doc) return
    setSaving(true)
    try {
      const res = await fetch(`/api/documents/${doc._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      })
      const data = await res.json()
      if (data.success) {
        setDoc(data.document)
        setIsEditing(false)
        showToast('Document saved', 'success')
      } else {
        showToast(data.error || 'Failed to save', 'error')
      }
    } catch {
      showToast('Failed to save', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!doc || !confirm('Delete this document?')) return
    try {
      const res = await fetch(`/api/documents/${doc._id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        showToast('Document deleted', 'success')
        router.push('/documents')
      } else {
        showToast('Failed to delete', 'error')
      }
    } catch {
      showToast('Failed to delete', 'error')
    }
  }

  if (!params) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-zinc-400">Loading...</div>
      </div>
    )
  }

  if (!id) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Invalid Document</h1>
          <Link href="/documents" className="text-cyan-500 hover:underline">Back to Documents</Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-zinc-400">Loading document...</div>
      </div>
    )
  }

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-xl font-semibold mb-2">Document Not Found</h1>
          <Link href="/documents" className="text-cyan-500 hover:underline">Back to Documents</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-zinc-950">
      <div className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/documents" className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {isEditing ? 'Editing Document' : doc.title}
              </h1>
              <p className="text-xs text-zinc-400 flex items-center gap-1">
                <Calendar size={12} />
                {new Date(doc.updatedAt).toLocaleDateString('en-GB', { 
                  day: 'numeric', 
                  month: 'short', 
                  year: 'numeric' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                  title="Edit"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-3xl font-bold text-zinc-900 dark:text-white bg-transparent border-0 focus:outline-none mb-6 placeholder:text-zinc-300"
                placeholder="Document title"
              />
              <AdvancedEditor content={editContent} onChange={setEditContent} />
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-6">{doc.title}</h1>
              <div 
                className="prose prose-zinc dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: doc.content }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
