'use client'

import { useEffect, useState } from 'react'

interface ApiCall {
  id: string
  method: string
  url: string
  status: number
  duration: number
  timestamp: number
  requestBody?: any
  responseBody?: any
}

interface ChatLog {
  id: string
  input: string
  reply: string
  model?: string
  timestamp: number
  duration?: number
}

export default function DebugPanel() {
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([])
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [tab, setTab] = useState<'api' | 'chat'>('api')
  const [filter, setFilter] = useState('')

  useEffect(() => {
    const originalFetch = window.fetch

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const start = Date.now()
      const id = Math.random().toString(36).substring(7)

      const urlStr = typeof input === 'string'
      ? input
        : input instanceof Request
        ? input.url
          : input.toString()

      const method = init?.method || 'GET'
      let requestBody: any = null

      if (init?.body) {
        try {
          requestBody = JSON.parse(init.body as string)
        } catch {
          requestBody = init.body
        }
      }

      try {
        const res = await originalFetch(input, init)
        const duration = Date.now() - start
        const clone = res.clone()

        let responseBody: any = null
        try {
          responseBody = await clone.json()
        } catch {
          responseBody = await clone.text()
        }

        const call: ApiCall = {
          id,
          method,
          url: urlStr,
          status: res.status,
          duration,
          timestamp: Date.now(),
          requestBody,
          responseBody
        }

        setApiCalls(prev => [call,...prev].slice(0, 50))

        // Chat logging
        if (urlStr.includes('/api/chat') && method === 'POST' && res.status === 200) {
          try {
            const inputMsg = requestBody?.message || ''
            const reply = responseBody?.reply || ''
            const model = responseBody?.model || ''
            if (inputMsg || reply) {
              setChatLogs(prev => [{
                id,
                input: inputMsg,
                reply,
                model,
                timestamp: Date.now(),
                duration
              },...prev].slice(0, 20))
            }
          } catch (e) {
            console.error('[DebugPanel] Chat parse error:', e)
          }
        }

        return res
      } catch (err: any) {
        const duration = Date.now() - start
        setApiCalls(prev => [{
          id,
          method,
          url: urlStr,
          status: 0,
          duration,
          timestamp: Date.now(),
          requestBody,
          responseBody: { error: err.message }
        },...prev].slice(0, 50))
        throw err
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  const filteredApiCalls = apiCalls.filter(c =>
   !filter || c.url.toLowerCase().includes(filter.toLowerCase()) || c.method.toLowerCase().includes(filter.toLowerCase())
  )

  const filteredChatLogs = chatLogs.filter(c =>
   !filter || c.input.toLowerCase().includes(filter.toLowerCase()) || c.reply.toLowerCase().includes(filter.toLowerCase())
  )

  const copyToClipboard = (obj: any) => {
    navigator.clipboard.writeText(JSON.stringify(obj, null, 2))
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-zinc-900 text-white text-xs rounded-lg border border-zinc-700 hover:bg-zinc-800 shadow-lg font-mono"
      >
        Debug {apiCalls.length > 0 && `(${apiCalls.length})`}
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w- max-h- bg-zinc-900 text-white text-xs rounded-lg border border-zinc-700 overflow-hidden flex flex-col shadow-2xl font-mono">
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-700 bg-zinc-950">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setTab('api')}
            className={`px-2 py-1 rounded ${tab === 'api'? 'bg-cyan-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
          >
            API ({apiCalls.length})
          </button>
          <button
            onClick={() => setTab('chat')}
            className={`px-2 py-1 rounded ${tab === 'chat'? 'bg-cyan-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
          >
            Chat ({chatLogs.length})
          </button>
          <button
            onClick={() => { setApiCalls([]); setChatLogs([]) }}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-red-900 text-zinc-400 hover:text-white"
          >
            Clear
          </button>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white text-lg leading-none">×</button>
      </div>

      <div className="px-3 py-2 border-b border-zinc-700">
        <input
          type="text"
          placeholder="Filter..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full px-2 py-1 bg-zinc-800 rounded border border-zinc-700 text-xs focus:outline-none focus:border-cyan-600"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {tab === 'api' && (
          <>
            {filteredApiCalls.length === 0 && <div className="text-zinc-500 text-center py-8">No API calls</div>}
            {filteredApiCalls.map(call => (
              <div key={call.id} className="p-2 bg-zinc-800 rounded border border-zinc-700">
                <div className="flex gap-2 items-center mb-1">
                  <span className={`font-bold ${call.method === 'POST'? 'text-green-400' : call.method === 'DELETE'? 'text-red-400' : call.method === 'PUT'? 'text-yellow-400' : 'text-blue-400'}`}>
                    {call.method}
                  </span>
                  <span className={`font-bold ${call.status >= 500? 'text-red-400' : call.status >= 400? 'text-orange-400' : call.status === 0? 'text-yellow-400' : 'text-emerald-400'}`}>
                    {call.status || 'ERR'}
                  </span>
                  <span className="text-zinc-500">{call.duration}ms</span>
                  <button
                    onClick={() => copyToClipboard(call)}
                    className="ml-auto text- text-zinc-500 hover:text-cyan-400"
                  >
                    Copy
                  </button>
                </div>
                <div className="text-zinc-300 truncate mb-1 text-">{call.url}</div>
                <div className="text- text-zinc-600">{new Date(call.timestamp).toLocaleTimeString()}</div>
                {call.requestBody && (
                  <details className="text- mt-1">
                    <summary className="text-zinc-500 cursor-pointer hover:text-zinc-300">Request Body</summary>
                    <pre className="mt-1 p-1.5 bg-zinc-950 rounded overflow-x-auto text-zinc-400 border border-zinc-800">
                      {JSON.stringify(call.requestBody, null, 2)}
                    </pre>
                  </details>
                )}
                {call.responseBody && (
                  <details className="text- mt-1">
                    <summary className="text-zinc-500 cursor-pointer hover:text-zinc-300">Response Body</summary>
                    <pre className="mt-1 p-1.5 bg-zinc-950 rounded overflow-x-auto text-zinc-400 border border-zinc-800 max-h-40">
                      {typeof call.responseBody === 'string'? call.responseBody : JSON.stringify(call.responseBody, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </>
        )}

        {tab === 'chat' && (
          <>
            {filteredChatLogs.length === 0 && <div className="text-zinc-500 text-center py-8">No chat logs</div>}
            {filteredChatLogs.map(log => (
              <div key={log.id} className="p-2 bg-zinc-800 rounded border border-zinc-700 space-y-1.5">
                <div className="flex justify-between items-center text- text-zinc-600">
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                  <div className="flex gap-2 items-center">
                    {log.model && <span className="text-cyan-500">{log.model}</span>}
                    {log.duration && <span>{log.duration}ms</span>}
                    <button
                      onClick={() => copyToClipboard(log)}
                      className="text-zinc-500 hover:text-cyan-400"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-cyan-400 font-bold">USER:</span>
                  <div className="text-zinc-300 mt-0.5 whitespace-pre-wrap text- leading-relaxed">{log.input}</div>
                </div>
                <div>
                  <span className="text-emerald-400 font-bold">AI:</span>
                  <div className="text-zinc-300 mt-0.5 whitespace-pre-wrap text- leading-relaxed">{log.reply}</div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
