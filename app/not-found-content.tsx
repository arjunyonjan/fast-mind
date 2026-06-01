'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function NotFoundContent() {
  const params = useSearchParams()
  const from = params?.get('from') ?? null

  if (!params) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-2">Page not found</p>
      {from && <p className="text-gray-500 mb-8">You came from: {from}</p>}
      <Link
        href="/"
        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}
