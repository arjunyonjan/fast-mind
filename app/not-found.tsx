import { Suspense } from 'react'
import NotFoundContent from './not-found-content'

export const dynamic = 'force-dynamic'

export default function NotFound() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    }>
      <NotFoundContent />
    </Suspense>
  )
}
