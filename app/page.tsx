"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Send, FileText, User, Bot } from 'lucide-react';

interface Document { _id: string; title: string; content: string; updatedAt: string; }

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{id:string; role:'user'|'assistant'; content:string}[]>([]);
  const [input, setInput] = useState('');
  const [taskCount, setTaskCount] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [spaces, setSpaces] = useState<{_id:string,name:string}[]>([]);
  const [selectedSpace, setSelectedSpace] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/tasks').then(r=>r.json()).then(d=>{if(d.success)setTaskCount(d.tasks.filter((t:any)=>t.status!=="completed").length)});
    fetch('/api/spaces').then(r=>r.json()).then(d=>{if(d.success)setSpaces(d.spaces)});
    fetch('/api/documents').then(res => res.json()).then(data => { if (data.success) setDocuments(data.documents); setLoading(false); });
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || aiLoading) return;
    const userMsg = { id: Date.now().toString(), role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAiLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg.content, spaceId: selectedSpace || null }) });
      const data = await res.json();
      const assistantMsg = { id: (Date.now()+1).toString(), role: "assistant" as const, content: data.reply || "Done." };
      setMessages(prev => [...prev, assistantMsg]);
    } catch(e) { console.error("[Chat]", e); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      {loading && <div className="fixed top-0 left-0 right-0 h-0.5 z-50"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-loading-bar" /></div>}

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg mb-4"><span className="text-3xl">⚡</span></div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">FastMind</h1>
            <p className="text-gray-400 dark:text-zinc-500 mt-1 text-sm">From thought to action in seconds</p>
          </div>
          <div className="w-full max-w-2xl">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-100 dark:border-zinc-800 overflow-hidden">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask AI to create tasks, notes, or run commands..."
                className="w-full p-5 text-gray-700 dark:text-zinc-300 resize-none border-none outline-none text-base bg-white dark:bg-zinc-900" rows={3} />
              {spaces.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-700">
                  <select value={selectedSpace} onChange={e=>setSelectedSpace(e.target.value)} className="text-xs bg-transparent border border-gray-200 dark:border-zinc-700 rounded px-2 py-1 text-zinc-500 dark:text-zinc-400">
                    <option value="">No space</option>
                    {spaces.map(s=>(<option key={s._id} value={s._id}>{s.name}</option>))}
                  </select>
                </div>
              )}
              <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-zinc-800/50">
                <div className="text-xs text-gray-400 dark:text-zinc-500">Press Enter to send, Shift+Enter for new line</div>
                <button onClick={handleSend} disabled={aiLoading || !input.trim()} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-md disabled:opacity-50 transition">
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </div>
          </div>
          {documents.length > 0 && (
            <div className="w-full max-w-2xl mt-12">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">Recent Documents</h2>
                <Link href="/documents" className="text-xs text-cyan-500 hover:text-cyan-600 font-medium">View all →</Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {documents.slice(0, 4).map((doc) => (
                  <Link key={doc._id} href={`/documents/${doc._id}`} className="group bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl p-4 hover:border-cyan-200 dark:hover:border-cyan-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:from-cyan-100 group-hover:to-blue-100 dark:group-hover:from-cyan-900/40 dark:group-hover:to-blue-900/40 transition-colors">
                        <FileText size={14} className="text-cyan-500" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-zinc-200 truncate group-hover:text-cyan-600 transition-colors">{doc.title}</h3>
                        {doc.content && <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1 line-clamp-1">{doc.content.replace(/<[^>]*>/g, '').substring(0, 100)}</p>}
                        <p className="text-xs text-cyan-400/70 mt-2 font-medium">{new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="border-b bg-white/70 dark:bg-zinc-900/70 backdrop-blur-sm px-4 py-3 flex items-center justify-between shrink-0">
            <button onClick={() => setMessages([])} className="text-sm text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">← New chat</button>
            <span className="text-xs text-gray-400 dark:text-zinc-500">{messages.length} messages</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-white" /></div>}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-800 dark:text-zinc-200'}`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center shrink-0"><User className="w-4 h-4 text-gray-600 dark:text-zinc-300" /></div>}
                </div>
              ))}
              {aiLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center"><Bot className="w-4 h-4 text-white" /></div>
                  <div className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3">
                    <div className="flex gap-1"><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span><span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
          <div className="border-t bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 shrink-0">
            <div className="max-w-3xl mx-auto flex gap-3">
              <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Send a message..." className="flex-1 p-3 rounded-xl resize-none border-none outline-none bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300" rows={1} style={{ minHeight: '44px', maxHeight: '120px' }} />
              <button onClick={handleSend} disabled={aiLoading || !input.trim()} className="px-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium disabled:opacity-50">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}