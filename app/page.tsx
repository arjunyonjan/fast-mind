"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Send, FileText, LayoutGrid, User, Bot } from 'lucide-react';
import RingLoader from '@/components/RingLoader';

interface Document { _id: string; title: string; content: string; updatedAt: string; }

export default function Home() {
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

  if (loading) return <RingLoader />;

  // ----- EMPTY STATE (no messages) -----
  if (messages.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
        {/* Header */}
        <div className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-500" />
              <span className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">FastMind</span>
            </div>
            <div className="flex gap-4 text-sm items-center">
              <Link href="/documents" className="flex items-center gap-1 text-gray-600 hover:text-cyan-600"><FileText className="w-4 h-4" /> Docs</Link>
              <Link href="/tasks" className="flex items-center gap-1 text-gray-600 hover:text-cyan-600"><LayoutGrid className="w-4 h-4" /> Tasks
                {taskCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{taskCount}</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg mb-4">
              <span className="text-4xl">⚡</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">FastMind</h1>
            <p className="text-gray-500 mt-2">Notion-grade editor with rich formatting</p>
            <Link href="/documents/new" className="inline-block mt-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition">+ New Document</Link>
          </div>

          {/* Centered AI Chat Input */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask AI to create tasks, notes, or run commands..."
                className="w-full p-5 text-gray-700 resize-none border-none outline-none focus:outline-none text-base"
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

          {/* Recent Documents List */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Documents</h2>
            {documents.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl"><p className="text-gray-400">No documents yet. Create your first one!</p></div>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Link key={doc._id} href={`/documents/${doc._id}`} className="block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 transition group">
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-cyan-600 transition">{doc.title}</h3>
                    <p className="text-xs text-cyan-400/70 mt-1 font-medium">Updated {new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    {doc.content && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{doc.content.replace(/<[^>]*>/g, '').substring(0, 150)}...</p>}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----- CHAT HISTORY VIEW (messages exist) -----
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 flex flex-col">
      {/* Header */}
      <div className="border-b bg-white/70 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-500" />
            <span className="font-bold text-xl bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">FastMind</span>
          </div>
          <div className="flex gap-4 text-sm items-center">
            <button onClick={() => setMessages([])} className="text-gray-500 hover:text-gray-700">New chat</button>
            <Link href="/documents" className="flex items-center gap-1 text-gray-600 hover:text-cyan-600"><FileText className="w-4 h-4" /> Docs</Link>
            <Link href="/tasks" className="flex items-center gap-1 text-gray-600 hover:text-cyan-600"><LayoutGrid className="w-4 h-4" /> Tasks
              {taskCount > 0 && <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{taskCount}</span>}
            </Link>
          </div>
        </div>
      </div>

      {/* Scrollable messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
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

      {/* Fixed input at bottom */}
      <div className="border-t bg-white/80 backdrop-blur-sm p-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Send a message..."
            className="flex-1 p-3 border-none rounded-xl bg-gray-50 resize-none focus:outline-none focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] focus:border-cyan-300"
            rows={1}
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={aiLoading || !input.trim()}
            className="px-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}