'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AppSidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Next 16: searchParams is null during prerender
  if (!searchParams) return null

  const link = (href: string, checkQuery?: { key: string; value: string }) => {
    const matchPath = pathname === href.split('?')[0]
    const matchQuery = checkQuery? searchParams.get(checkQuery.key) === checkQuery.value : true
    const isActive = matchPath && matchQuery
    return `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition whitespace-nowrap ${
      isActive? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-medium" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`
  }

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-gray-800 p-4">
      <nav className="space-y-1">
        <Link href="/documents" className={link("/documents")}>
          Documents
        </Link>
        <Link href="/documents?type=draft" className={link("/documents", { key: "type", value: "draft" })}>
          Drafts
        </Link>
        <Link href="/documents?type=published" className={link("/documents", { key: "type", value: "published" })}>
          Published
        </Link>
      </nav>
    </aside>
  )
}