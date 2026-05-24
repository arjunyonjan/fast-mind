"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, ArrowLeft, AlertTriangle, Copy, Check, List, Grid3X3 } from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  source: string;
  createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"grid"|"list">("grid");
  const [marking, setMarking] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all"|"active"|"completed">("all");

  const fetchTasks = () => {
    setLoading(true);
    fetch("/api/tasks")
      .then((res) => { if (!res.ok) throw new Error("Server " + res.status); return res.json(); })
      .then((data) => { if (data.success) setTasks(data.tasks); else throw new Error(data.error); })
      .catch((err) => { console.error("[Tasks]", err.message); setError(err.message); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const markDone = async (id: string) => {
    setMarking(id);
    await fetch("/api/tasks/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) });
    setTasks(prev => prev.map(t => t._id === id ? { ...t, status: "completed" } : t));
    setMarking(null);
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    await fetch("/api/tasks/" + id, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <AlertTriangle size={40} className="text-yellow-500" />
          <p className="text-zinc-400 text-sm font-mono bg-zinc-900 p-3 rounded-lg border border-zinc-800 break-all">{error}</p>
          <button onClick={() => { navigator.clipboard.writeText(error); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg">{copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}{copied ? "Copied" : "Copy"}</button>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? tasks : filter === "active" ? tasks.filter(t => t.status !== "completed") : tasks.filter(t => t.status === "completed");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      {loading && <div className="fixed top-0 left-0 right-0 h-0.5 z-50"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-loading-bar" /></div>}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/" className="text-zinc-400 hover:text-white"><ArrowLeft size={20} /></Link>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><LayoutGrid size={20} /> Tasks</h1>
          <div className="flex items-center gap-1 ml-auto bg-zinc-900 rounded-lg p-0.5">
            <button onClick={() => setView("grid")} className={`p-1.5 rounded-md transition ${view === "grid" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}><Grid3X3 size={15} /></button>
            <button onClick={() => setView("list")} className={`p-1.5 rounded-md transition ${view === "list" ? "bg-zinc-700 text-white" : "text-zinc-500 hover:text-zinc-300"}`}><List size={15} /></button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "active", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs rounded-full capitalize transition ${
                filter === f ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f}
              <span className="ml-1 text-zinc-600">
                ({f === "all" ? tasks.length : f === "active" ? tasks.filter(t => t.status !== "completed").length : tasks.filter(t => t.status === "completed").length})
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 && !loading ? (
          <p className="text-zinc-500 italic text-center py-16">No {filter} tasks.</p>
        ) : (
          <div className={view === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-2"}>
            {filtered.map((task) => (
              <div key={task._id} className={`bg-zinc-900 border rounded-xl p-4 flex transition ${task.status === "completed" ? "border-zinc-800 opacity-60" : "border-zinc-700 hover:border-zinc-600"} ${view === "list" ? "flex-row items-center gap-4" : "flex-col"}`}>
                <div className={`flex items-start justify-between gap-2 ${view === "list" ? "flex-1 min-w-0" : "mb-2"}`}>
                  <h2 className={`font-medium text-zinc-200 truncate ${task.status === "completed" ? "line-through text-zinc-500" : ""} ${view === "list" ? "flex-1" : ""}`}>{task.title}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${task.priority === "high" ? "bg-red-900/40 text-red-300" : task.priority === "medium" ? "bg-yellow-900/40 text-yellow-300" : "bg-green-900/40 text-green-300"}`}>{task.priority}</span>
                </div>
                {view === "grid" && task.description && <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{task.description}</p>}
                {view === "grid" && (
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-800 text-xs text-zinc-500">
                    <div className="flex items-center gap-2">
                      <span className="capitalize">{task.status}</span><span className="text-zinc-700">·</span>
                      <span>{task.source}</span><span className="text-zinc-700">·</span>
                      <span>{new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.status !== "completed" && <button onClick={() => markDone(task._id)} className="text-green-400 hover:text-green-300 cursor-pointer">✓</button>}
                      <button onClick={() => deleteTask(task._id)} className="text-red-400 hover:text-red-300 cursor-pointer">✕</button>
                    </div>
                  </div>
                )}
                {view === "list" && (
                  <div className="flex items-center gap-3 text-xs text-zinc-500 shrink-0 ml-auto">
                    <span className="capitalize">{task.status}</span><span className="text-zinc-700">·</span>
                    <span>{task.source}</span><span className="text-zinc-700">·</span>
                    <span>{new Date(task.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {task.status !== "completed" && <button onClick={() => markDone(task._id)} className="text-green-400 hover:text-green-300 cursor-pointer">✓</button>}
                    <button onClick={() => deleteTask(task._id)} className="text-red-400 hover:text-red-300 cursor-pointer">✕</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}