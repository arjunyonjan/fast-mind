'use client'

import { useEffect, useState } from 'react'

interface ApiCall {
  id: string
  method: string
  url: string
  status: number
  duration: number
  timestamp: number
}

export default function DebugPanel() {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const originalFetch = window.fetch

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const start = Date.now()
      const id = Math.random().toString(36).substring(7)

      // Fix: normalize url to string
      const urlStr = typeof input === 'string'
       ? input
        : input instanceof Request
         ? input.url
          : input.toString()

      const method = init?.method || 'GET'

      try {
        const res = await originalFetch(input, init)
        const duration = Date.now() - start

        setApiCalls(prev => [...prev, {
          id,
          method,
          url: urlStr,
          status: res.status,
          duration,
          timestamp: Date.now()
        }].slice(-10))

        // Fix: use urlStr instead of url
        if (urlStr.includes('/api/chat') && method === 'POST' && res.status === 200) {
          try {
            const body = JSON.parse(init?.body as string || '{}')
            const clone = res.clone()
            const json = await clone.json()
            const inputMsg = body.message || ''
            const reply = json.reply || ''
            console.log('[DebugPanel] Chat:', { input: inputMsg, reply })
          } catch (e) {
            console.error('[DebugPanel] Parse error:', e)
          }
        }

        return res
      } catch (err) {
        const duration = Date.now() - start
        setApiCalls(prev => [...prev, {
          id,
          method,
          url: urlStr,
          status: 0,
          duration,
          timestamp: Date.now()
        }].slice(-10))
        throw err
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-zinc-900 text-white text-xs rounded-lg border border-zinc-700 hover:bg-zinc-800"
      >
        Debug
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-96 bg-zinc-900 text-white text-xs rounded-lg border border-zinc-700 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700">
        <span className="font-semibold">API Calls</span>
        <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white">✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {apiCalls.length === 0 && <div className="text-zinc-500 text-center py-4">No calls yet</div>}
        {apiCalls.map(call => (
          <div key={call.id} className="p-2 bg-zinc-800 rounded text-">
            <div className="flex gap-2">
              <span className={call.method === 'POST'? 'text-green-400' : 'text-blue-400'}>{call.method}</span>
              <span className={call.status >= 400? 'text-red-400' : 'text-emerald-400'}>{call.status}</span>
              <span className="text-zinc-500">{call.duration}ms</span>
            </div>
            <div className="text-zinc-300 truncate mt-0.5">{call.url}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
