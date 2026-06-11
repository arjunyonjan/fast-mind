"use client";
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Send, FileText, Sparkles, Bot, User, ArrowRight, RotateCcw, MessageSquare, Trash2, Copy, Check } from "lucide-react";

interface Message { id: string; role: 'user' | 'assistant'; content: string; timestamp?: number; }
interface Document { _id: string; title: string; content: string; updatedAt: string; }

function MarkdownText({ text }: { text: string }) {
  const [copied, setCopied] = useState<string | null>(null);
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  let i = 0;
  
  while (i < lines.length) {
    const line = lines[i];
    // Check for code block start
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3);
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      const code = codeLines.join('\n');
      const copyCode = () => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
      };
      result.push(
        <div key={`code-${i}`} className="relative my-3 group">
          <pre className="bg-zinc-900 text-zinc-100 rounded-xl p-4 overflow-x-auto text-sm font-mono">
            <code>{code}</code>
          </pre>
          <button
            onClick={copyCode}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 opacity-0 group-hover:opacity-100 transition text-zinc-400 hover:text-white"
          >
            {copied === code ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
          </button>
        </div>
      );
      i++;
      continue;
    }
    
    // Regular text handling
    const isFailed = line.includes('❌') && line.includes('FAILED');
    const parts: React.ReactNode[] = [];
    const regex = /\*\*(.+?)\*\*/g;
    let lastIdx = 0;
    let match;
    let idx = 0;
    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIdx) parts.push(<span key={idx++}>{line.slice(lastIdx, match.index)}</span>);
      parts.push(<strong key={idx++} className={`font-semibold ${isFailed ? 'text-red-500' : ''}`}>{match[1]}</strong>);
      lastIdx = regex.lastIndex;
    }
    if (parts.length === 0) parts.push(<span key={0}>{line || '\u00A0'}</span>);
    else if (lastIdx < line.length) parts.push(<span key={idx}>{line.slice(lastIdx)}</span>);
    result.push(<p key={i} className={`leading-relaxed ${isFailed ? 'text-red-500' : ''}`}>{parts}</p>);
    i++;
  }
  
  return <div className="space-y-0.5">{result}</div>;
}

const SUGGESTIONS = [
  { icon: "📋", label: "List my tasks", prompt: "List my tasks" },
  { icon: "📄", label: "Show my documents", prompt: "List my documents" },
  { icon: "✏️", label: "Create a new task", prompt: "Create a task to learn React hooks" },
  { icon: "💡", label: "Just chat", prompt: "What can you help me with?" },
];

export default function Home() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [taskCount, setTaskCount] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [spaces, setSpaces] = useState<{ _id: string; name: string }[]>([]);
  const [selectedSpace, setSelectedSpace] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetch('/api/tasks').then(r => r.json()).then(d => { if (d.success) setTaskCount(d.tasks.filter((t: any) => t.status !== "completed").length) });
    fetch('/api/spaces').then(r => r.json()).then(d => { if (d.success) setSpaces(d.spaces) });
    fetch('/api/documents').then(res => res.json()).then(data => { if (data.success) setDocuments(data.documents); setLoading(false); });
  }, []);

  useEffect(() => {
    const savedId = localStorage.getItem('chat-session-id');
    const savedMessages = savedId ? localStorage.getItem(`chat-messages-${savedId}`) : null;
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed);
        setSessionId(savedId);
        return;
      } catch { localStorage.removeItem(`chat-messages-${savedId}`); }
    }
    fetch('/api/chat-session').then(r => r.json()).then(data => {
      if (data.success && data.session?.messages?.length > 0) {
        setMessages(data.session.messages);
        setSessionId(data.session.sessionId);
        localStorage.setItem('chat-session-id', data.session.sessionId);
        localStorage.setItem(`chat-messages-${data.session.sessionId}`, JSON.stringify(data.session.messages));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const saveSession = (sid: string, msgs: Message[]) => {
    if (!sid || msgs.length === 0) return;
    const max = 50;
    const trimmed = msgs.length > max ? msgs.slice(-max) : msgs;
    navigator.sendBeacon
      ? navigator.sendBeacon('/api/chat-session', JSON.stringify({ sessionId: sid, messages: trimmed }))
      : fetch('/api/chat-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: sid, messages: trimmed }), keepalive: true });
  };

  const genId = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);

  const startNewChat = () => {
    if (sessionId && messages.length > 0) saveSession(sessionId, messages);
    setMessages([]);
    const newId = genId();
    setSessionId(newId);
    localStorage.setItem('chat-session-id', newId);
    if (sessionId) localStorage.removeItem(`chat-messages-${sessionId}`);
    setInput('');
    inputRef.current?.focus();
  };

  const clearChat = () => {
    if (messages.length === 0) return;
    if (!confirm('Clear the entire conversation?')) return;
    if (sessionId) {
      localStorage.removeItem(`chat-messages-${sessionId}`);
      navigator.sendBeacon
        ? navigator.sendBeacon('/api/chat-session', JSON.stringify({ sessionId, messages: [] }))
        : fetch('/api/chat-session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId, messages: [] }), keepalive: true });
    }
    setMessages([]);
    setInput('');
  };

  const handleSend = async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || aiLoading) return;
    const sid = sessionId || genId();
    if (!sessionId) setSessionId(sid);

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msgText, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setAiLoading(true);
    localStorage.setItem(`chat-messages-${sid}`, JSON.stringify(newMessages));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, messages: newMessages, spaceId: selectedSpace || null })
      });
      const data = await res.json();
      if (data.redirect) { window.location.href = data.redirect; return; }
      const assistantMsg: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply || "Done.", timestamp: Date.now() };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);
      localStorage.setItem(`chat-messages-${sid}`, JSON.stringify(finalMessages));
      saveSession(sid, finalMessages);
    } catch (e) { console.error("[Chat]", e); }
    finally { setAiLoading(false); }
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 160) + 'px';
  };

  const formatTime = (ts?: number) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950">
      {loading && <div className="fixed top-0 left-0 right-0 h-0.5 z-50"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-loading-bar" /></div>}

      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col">
          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-1.5">What can I help with?</h1>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">Create tasks, write documents, or just chat</p>
            </div>

            {/* Suggestions grid */}
            <div className="grid grid-cols-2 gap-2 w-full max-w-lg mb-6">
              {SUGGESTIONS.map(s => (
                <button key={s.label} onClick={() => handleSend(s.prompt)} className="flex items-center gap-2.5 px-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-left text-sm text-zinc-600 dark:text-zinc-400 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-md transition-all group">
                  <span className="text-lg">{s.icon}</span>
                  <span className="group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{s.label}</span>
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="w-full max-w-2xl">
              <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-none border border-zinc-200 dark:border-zinc-800 overflow-hidden focus-within:border-cyan-400 dark:focus-within:border-cyan-500 focus-within:shadow-cyan-100 dark:focus-within:shadow-none transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={autoResize}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Ask me anything..."
                  className="w-full p-4 text-zinc-800 dark:text-zinc-200 resize-none border-none outline-none text-base bg-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                  rows={1}
                  style={{ minHeight: '52px', maxHeight: '160px' }}
                  autoFocus
                />
                <div className="flex items-center justify-between px-4 py-2.5 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    {spaces.length > 0 && (
                      <select value={selectedSpace} onChange={e => setSelectedSpace(e.target.value)} className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-zinc-500 dark:text-zinc-400 outline-none focus:ring-1 focus:ring-cyan-400">
                        <option value="">No space</option>
                        {spaces.map(s => (<option key={s._id} value={s._id}>{s.name}</option>))}
                      </select>
                    )}
                  </div>
                  <button onClick={() => handleSend()} disabled={aiLoading || !input.trim()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl text-sm font-medium hover:shadow-md hover:shadow-cyan-500/20 disabled:opacity-40 disabled:hover:shadow-none transition-all">
                    <Send className="w-4 h-4" /> Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent docs */}
          {documents.length > 0 && (
            <div className="border-t border-zinc-100 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 px-6 py-6">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Recent Documents</h2>
                  <Link href="/documents" className="text-xs text-cyan-500 hover:text-cyan-400 font-medium flex items-center gap-1 transition">View all <ArrowRight size={12} /></Link>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {documents.slice(0, 4).map(doc => (
                    <Link key={doc._id} href={`/documents/${doc._id}`} className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 hover:border-cyan-300 dark:hover:border-cyan-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shrink-0 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/40 transition-colors">
                          <FileText size={13} className="text-cyan-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{doc.title}</h3>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                            {new Date(doc.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ===== CHAT VIEW ===== */
        <div className="flex-1 flex flex-col min-h-0 h-full">
          {/* Chat header */}
          <div className="border-b border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-2.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <button onClick={startNewChat} className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition">
                <RotateCcw size={14} /> New chat
              </button>
              <button onClick={clearChat} className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition" title="Clear conversation">
                <Trash2 size={14} /> Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                <MessageSquare size={11} className="text-zinc-400" />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{messages.length} msgs</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
              {messages.map((msg, i) => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`group max-w-[80%]`}>
                    <div className={`rounded-2xl px-4 py-3 text-[14px] leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-br-md shadow-sm'
                        : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-bl-md shadow-sm'
                    }`}>
                      <MarkdownText text={msg.content} />
                    </div>
                    <div className={`text-[10px] text-zinc-400 dark:text-zinc-600 mt-1 px-1 ${msg.role === 'user' ? 'text-right' : 'text-left'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      {formatTime(msg.timestamp)}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input bar */}
          <div className="border-t border-zinc-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 shrink-0">
            <div className="max-w-3xl mx-auto flex gap-2">
              <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-cyan-400 transition">
                <textarea
                  value={input}
                  onChange={autoResize}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Reply..."
                  className="w-full px-4 py-2.5 resize-none border-none outline-none bg-transparent text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-[14px]"
                  rows={1}
                  style={{ minHeight: '42px', maxHeight: '120px' }}
                />
              </div>
              <button onClick={() => handleSend()} disabled={aiLoading || !input.trim()} className="h-10 w-10 flex items-center justify-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl disabled:opacity-40 hover:shadow-md hover:shadow-cyan-500/20 transition-all shrink-0">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}