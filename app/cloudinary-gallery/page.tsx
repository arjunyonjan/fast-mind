import { Suspense } from 'react'
import GalleryClient from './gallery-client'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export default function CloudinaryGalleryPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Cloudinary Gallery</h1>
      <Suspense fallback={<GallerySkeleton />}>
        <GalleryClient />
      </Suspense>
    </main>
  )
}

function GallerySkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
      ))}
    </div>
  )
}
