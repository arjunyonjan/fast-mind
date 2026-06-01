'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Document = {
  id: string
  title: string
  content: string
  createdAt: string
}

export const dynamic = 'force-dynamic'

export default function DocumentPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id

  const [doc, setDoc] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    async function fetchDoc() {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`/api/documents/${id}`)
        if (!res.ok) throw new Error('Document not found')
        const data = await res.json()
        setDoc(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document')
      } finally {
        setLoading(false)
      }
    }

    fetchDoc()
  }, [id])

  if (!params) return <div className="flex items-center justify-center min-h-screen"><div className="text-lg">Loading...</div></div>

  if (!id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Document ID</h1>
          <button
            onClick={() => router.push('/documents')}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Back to Documents
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading document...</div>
      </div>
    )
  }

  if (error || !doc) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Document Not Found</h1>
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/documents')}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Back to Documents
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{doc.title}</h1>
      <div className="prose prose-lg max-w-none">{doc.content}</div>
    </div>
  )
}
