"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";

interface PendingItem {
  _id: string;
  type: string;
  data: { title: string; description?: string; priority?: string };
  createdAt: string;
}

export default function PendingPage() {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const sid = localStorage.getItem("chat-session-id") || crypto.randomUUID();
    localStorage.setItem("chat-session-id", sid);
    setSessionId(sid);
    fetchPending(sid);
  }, []);

  const fetchPending = async (sid: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pending?sessionId=${encodeURIComponent(sid)}`);
      const data = await res.json();
      if (data.success) setItems(data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const confirmItem = async (title: string) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: `confirm "${title}"`, messages: [], spaceId: null, sessionId })
    });
    const data = await res.json();
    alert(data.reply);
    fetchPending(sessionId);
  };

  return (
    <div className="h-screen overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 mb-6">
          <ArrowLeft size={14} /> Back
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">⏳ Pending Items</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">Tasks and documents waiting for confirmation</p>

        {loading && <div className="text-center py-12">Loading...</div>}

        {!loading && items.length === 0 && (
          <div className="text-center py-12 text-zinc-500">No pending items. Create a task or document first!</div>
        )}

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400">{item.type}</span>
                  <span className="text-xs text-zinc-400">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <h3 className="font-semibold text-zinc-900 dark:text-white">{item.data.title}</h3>
                {item.data.description && <p className="text-sm text-zinc-500 mt-1">{item.data.description}</p>}
              </div>
              <button onClick={() => confirmItem(item.data.title)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition">
                Confirm
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
