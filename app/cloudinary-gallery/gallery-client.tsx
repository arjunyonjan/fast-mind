'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type CloudinaryImage = {
  public_id: string
  secure_url: string
  width: number
  height: number
}

export default function GalleryClient() {
  const params = useSearchParams()
  const query = params?.get('q') ?? ''
  const folder = params?.get('folder') ?? ''
  
  const [images, setImages] = useState<CloudinaryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!params) {
      setLoading(false)
      return
    }

    async function fetchImages() {
      try {
        setLoading(true)
        setError(null)
        const searchParams = new URLSearchParams()
        if (query) searchParams.set('q', query)
        if (folder) searchParams.set('folder', folder)
        
        const res = await fetch(`/api/cloudinary?${searchParams.toString()}`)
        if (!res.ok) throw new Error('Failed to fetch images')
        
        const data = await res.json()
        setImages(data.resources || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [params, query, folder])

  if (!params) return <div className="text-center py-12">Loading...</div>
  if (loading) return <div className="text-center py-12">Loading gallery...</div>
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>
  if (images.length === 0) return <div className="text-center py-12">No images found</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((img) => (
        <div key={img.public_id} className="group relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img
            src={img.secure_url}
            alt={img.public_id}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
