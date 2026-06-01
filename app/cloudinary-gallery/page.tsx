"use client"

import { useState, useEffect } from "react"
import { ImageIcon, ExternalLink, RefreshCw, Search, X } from "lucide-react"

interface CloudinaryImage {
  public_id: string
  url: string
  width: number
  height: number
  format: string
  created_at: string
}

export default function CloudinaryGalleryPage() {
  const [images, setImages] = useState<CloudinaryImage[]>([])
  const [filteredImages, setFilteredImages] = useState<CloudinaryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  const getThumbnailUrl = (originalUrl: string) => {
    return originalUrl.replace('/upload/', '/upload/w_150,h_150,c_fill,q_auto,f_auto/')
  }

  const getFilename = (publicId: string) => {
    const parts = publicId.split('/')
    const filename = parts.pop() || publicId
    return filename.length > 25 ? filename.slice(0, 22) + '...' : filename
  }

  const getFileExt = (format: string) => {
    return format.toUpperCase()
  }

  const fetchImages = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch("/api/cloudinary")
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || `Error ${res.status}`)
        return
      }
      
      setImages(data.images || [])
      setFilteredImages(data.images || [])
    } catch (err) {
      setError("Failed to load images")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchImages()
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredImages(images)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = images.filter(img => 
        img.public_id.toLowerCase().includes(term) ||
        img.format.toLowerCase().includes(term)
      )
      setFilteredImages(filtered)
    }
  }, [searchTerm, images])

  const clearSearch = () => {
    setSearchTerm("")
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center space-y-3">
          <p className="text-red-500">{error}</p>
          <button onClick={fetchImages} className="px-4 py-2 bg-cyan-500 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 px-2">
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-white">Cloudinary Gallery</h1>
            <p className="text-xs text-zinc-500">
              {filteredImages.length} / {images.length} images
            </p>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search images..."
                className="w-full pl-8 pr-8 py-1.5 text-sm bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
              {searchTerm && (
                <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  <X size={12} className="text-zinc-400 hover:text-zinc-600" />
                </button>
              )}
            </div>
            
            <button onClick={fetchImages} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <RefreshCw size={14} className="text-zinc-500" />
            </button>
          </div>
        </div>
        
        {filteredImages.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <ImageIcon size={40} className="text-zinc-400 mx-auto mb-2" />
              <p className="text-zinc-500 text-sm">No images matching "{searchTerm}"</p>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          {filteredImages.map((img) => (
            <a
              key={img.public_id}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 hover:ring-1 hover:ring-cyan-400 transition-all"
            >
              <img
                src={getThumbnailUrl(img.url)}
                alt={getFilename(img.public_id)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <ExternalLink className="text-white" size={14} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text- px-1 py-0.5 truncate text-center opacity-0 group-hover:opacity-100 transition-opacity">
                {getFilename(img.public_id)}.{img.format}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
