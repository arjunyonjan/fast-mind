"use client";
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import Link from 'next/link';
import { Sparkles, Send, FileText, LayoutGrid, User, Bot, Plus, Sun, Moon } from 'lucide-react';

interface Document { _id: string; title: string; content: string; updatedAt: string; }

export default function Home() {
  const { theme, toggle } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<{id:string; role:'user'|'assistant'; content:string}[]>([]);
  const [input, setInput] = useState('');
  const [taskCount, setTaskCount] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/tasks').then(r=>r.json()).then(d=>{if(d.success)setTaskCount(d.tasks.filter((t:any)=>t.status!=="completed").length)});
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
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: userMsg.content }) });
      const data = await res.json();
      const assistantMsg = { id: (Date.now()+1).toString(), role: "assistant" as const, content: data.reply || "Done." };
      setMessages(prev => [...prev, assistantMsg]);
    } catch(e) { console.error("[Chat]", e); }
    finally { setAiLoading(false); }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
      {loading && <div className="fixed top-0 left-0 right-0 h-0.5 z-50"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-loading-bar" /></div>}
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 border-r border-gray-100 bg-white/80 backdrop-blur-sm flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-4 py-4 mb-6">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight uppercase text-gray-800">FastMind</span>
        </div>

        <div className="px-3 mb-4">
          <Link href="/documents/new" className="flex items-center gap-2 w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition">
            <Plus size={16} /> New Document
          </Link>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 overflow-y-auto">
          <Link href="/documents" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition">
            <FileText size={15} /> Documents
          </Link>
          <Link href="/tasks" className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition">
            <span className="flex items-center gap-2"><LayoutGrid size={15} /> Tasks</span>
            {taskCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{taskCount}</span>}
          </Link>
        </nav>

        <div className="px-3 py-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 px-3">{documents.length} docs · {taskCount} active tasks</p>            <button onClick={toggle} className="flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition w-full mt-1">{theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}{theme === "dark" ? "Light mode" : "Dark mode"}</button>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          /* ----- EMPTY STATE ----- */
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">FastMind</h1>
              <p className="text-gray-400 mt-1 text-sm">Notion-grade editor with rich formatting</p>
            </div>

            {/* Chat Input */}
            <div className="w-full max-w-2xl">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask AI to create tasks, notes, or run commands..."
                  className="w-full p-5 text-gray-700 resize-none border-none outline-none text-base"
                  rows={3}
                />
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50">
                  <div className="text-xs text-gray-400">Press Enter to send, Shift+Enter for new line</div>
                  <button onClick={handleSend} disabled={aiLoading || !input.trim()} className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-md disabled:opacity-50 transition">
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Documents */}
            {documents.length > 0 && (
              <div className="w-full max-w-2xl mt-12">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Recent Documents</h2>
                  <Link href="/documents" className="text-xs text-cyan-500 hover:text-cyan-600 font-medium">View all →</Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {documents.slice(0, 4).map((doc) => (
                    <Link key={doc._id} href={`/documents/${doc._id}`} className="group bg-white border border-gray-100 rounded-xl p-4 hover:border-cyan-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:from-cyan-100 group-hover:to-blue-100 transition-colors">
                          <FileText size={14} className="text-cyan-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-800 truncate group-hover:text-cyan-600 transition-colors">{doc.title}</h3>
                          {doc.content && <p className="text-xs text-gray-400 mt-1 line-clamp-1">{doc.content.replace(/<[^>]*>/g, '').substring(0, 100)}</p>}
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
          /* ----- CHAT HISTORY VIEW ----- */
          <>
            <div className="border-b bg-white/70 backdrop-blur-sm px-4 py-3 flex items-center justify-between shrink-0">
              <button onClick={() => setMessages([])} className="text-sm text-gray-500 hover:text-gray-700">← New chat</button>
              <span className="text-xs text-gray-400">{messages.length} messages</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="border-t bg-white/80 backdrop-blur-sm p-4 shrink-0">
              <div className="max-w-3xl mx-auto flex gap-3">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Send a message..."
                  className="flex-1 p-3 rounded-xl resize-none border-none outline-none bg-gray-50"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <button onClick={handleSend} disabled={aiLoading || !input.trim()} className="px-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium disabled:opacity-50">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}