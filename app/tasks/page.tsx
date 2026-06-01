"use client";
import { useEffect, useState, useRef } from "react";
import { LayoutGrid, AlertTriangle, List, Grid3X3, Trash2, Plus, Edit3, Check, ChevronDown, Calendar, Flag, MoreHorizontal, X } from "lucide-react";

interface Task {
  dueDate?: string;
  spaceId?: string;
  _id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  source: string;
  createdAt: string;
}

const PRIORITY_CONFIG = {
  high: { color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20", label: "Urgent" },
  medium: { color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20", label: "Medium" },
  low: { color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", label: "Low" },
};

const STATUS_CONFIG = {
  pending: { color: "text-zinc-600 dark:text-zinc-300", bg: "bg-zinc-100 dark:bg-zinc-800", label: "To Do" },
  "in-progress": { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", label: "In Progress" },
  completed: { color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-900/20", label: "Done" },
  failed: { color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", label: "Failed" },
};

export default function TasksPage() { 
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState<"grid" | "list">("list");
const [filter, setFilter] = useState<"all" | "pending" | "completed" | "failed">("all");

useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlFilter = urlParams.get("filter");
  if (urlFilter === "pending" || urlFilter === "completed" || urlFilter === "failed") {
    setFilter(urlFilter);
  }
}, []);

useEffect(() => {
  const url = new URL(window.location.href);
  if (filter === "all") {
    url.searchParams.delete("filter");
  } else {
    url.searchParams.set("filter", filter);
  }
  window.history.replaceState({}, "", url.toString());
}, [filter]);



useEffect(() => {
  const url = new URL(window.location.href);
  if (filter === "all") {
    url.searchParams.delete("filter");
  } else {
    url.searchParams.set("filter", filter);
  }
  window.history.replaceState({}, "", url.toString());
}, [filter]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFilter = urlParams.get("filter");
    if (urlFilter === "pending" || urlFilter === "completed" || urlFilter === "failed") {
      setFilter(urlFilter);
    }
  }, []);
  useEffect(() => {
    const url = new URL(window.location.href);
    if (filter === "all") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", filter);
    }
    window.history.replaceState({}, "", url.toString());
  }, [filter]);
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlFilter = urlParams.get("filter");
    if (urlFilter === "pending" || urlFilter === "completed" || urlFilter === "failed") {
      setFilter(urlFilter);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (filter === "all") {
      url.searchParams.delete("filter");
    } else {
      url.searchParams.set("filter", filter);
    }
    window.history.replaceState({}, "", url.toString());
  }, [filter]);
    

  const [marking, setMarking] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<{ _id: string; name: string }[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editPriority, setEditPriority] = useState("medium");
  const [editSaving, setEditSaving] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const newTitleRef = useRef<HTMLInputElement>(null);

  const fetchTasks = () => {
    setLoading(true);
    fetch("/api/tasks").then(r => r.json()).then(d => { if (d.success) setTasks(d.tasks); }).catch(e => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
    fetch('/api/spaces').then(r => r.json()).then(d => { if (d.success) setSpaces(d.spaces) });
  }, []);

  useEffect(() => {
    if (showCreate && newTitleRef.current) newTitleRef.current.focus();
  }, [showCreate]);

  const markDone = async (id: string) => {
    setMarking(id);
    await fetch("/api/tasks/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "completed" }) });
    setTasks(p => p.map(t => t._id === id ? { ...t, status: "completed" } : t));
    setMarking(null);
  };

  const markUndone = async (id: string) => {
    setMarking(id);
    await fetch("/api/tasks/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "pending" }) });
    setTasks(p => p.map(t => t._id === id ? { ...t, status: "pending" } : t));
    setMarking(null);
  };

  const markFailed = async (id: string) => {
    setMarking(id);
    await fetch("/api/tasks/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "failed" }) });
    setTasks(p => p.map(t => t._id === id ? { ...t, status: "failed" } : t));
    setMarking(null);
  };

  const createTask = async () => {
    if (!newTitle.trim()) return;
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, description: newDesc, priority: newPriority, status: "pending", source: "manual" })
    });
    setNewTitle(""); setNewDesc(""); setNewPriority("medium"); setShowCreate(false);
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch("/api/tasks/" + id, { method: "DELETE" });
    setTasks(p => p.filter(t => t._id !== id));
  };

  const getSpaceName = (spaceId?: string) => spaces.find(s => s._id === spaceId)?.name;

  if (error) return <div className="flex flex-col items-center justify-center h-full gap-4"><AlertTriangle size={40} className="text-yellow-500" /><p className="text-zinc-500 text-sm">{error}</p></div>;

  const filtered = filter === "all" ? tasks : filter === "pending" ? tasks.filter(t => t.status !== "completed" && t.status !== "failed") : filter === "failed" ? tasks.filter(t => t.status === "failed") : tasks.filter(t => t.status === "completed");

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950">
      {loading && <div className="fixed top-0 left-0 right-0 h-0.5 z-50"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-loading-bar" /></div>}
      <div className="border-b border-zinc-100 dark:border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><LayoutGrid size={16} className="text-white" /></div>
            <div><h1 className="text-lg font-semibold text-zinc-900 dark:text-white">Tasks</h1><p className="text-xs text-zinc-400 dark:text-zinc-500">{tasks.length} total · {tasks.filter(t => t.status !== "completed").length} active</p></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
              <button onClick={() => setView("list")} className={`p-1.5 rounded-md text-xs transition ${view === "list" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-white" : "text-zinc-500"}`}><List size={14} /></button>
              <button onClick={() => setView("grid")} className={`p-1.5 rounded-md text-xs transition ${view === "grid" ? "bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-white" : "text-zinc-500"}`}><Grid3X3 size={14} /></button>
            </div>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition"><Plus size={14} /> New Task</button>
          </div>
        </div>
        <div className="flex gap-1 mt-3">
          {(["all", "pending", "completed", "failed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${filter === f ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200" : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"}`}>
              {f === "all" ? "All" : f === "pending" ? "Active" : f === "failed" ? "Failed" : "Completed"}
              <span className="ml-1.5 text-zinc-400">{f === "all" ? tasks.length : f === "pending" ? tasks.filter(t => t.status !== "completed" && t.status !== "failed").length : f === "failed" ? tasks.filter(t => t.status === "failed").length : tasks.filter(t => t.status === "completed").length}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center"><div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3"><Check size={20} className="text-zinc-400" /></div><p className="text-zinc-500 dark:text-zinc-400 text-sm">No tasks here yet</p><button onClick={() => setShowCreate(true)} className="mt-2 text-violet-500 hover:text-violet-400 text-sm font-medium">Create one →</button></div>
        ) : view === "list" ? (
          <div className="max-w-5xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4 px-3 py-2 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
              <div className="w-6" /><div className="flex-1">Task</div><div className="w-20">Status</div><div className="w-20">Priority</div><div className="w-24">Due</div><div className="w-20">Source</div><div className="w-16">Actions</div>
            </div>
            {filtered.map(task => {
              const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
              return (
                <div key={task._id} className="border-b border-zinc-50 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                  <div className="flex items-center gap-4 px-3 py-2.5">
                    <div className="w-6 flex-shrink-0">
                      {marking === task._id ? <span className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin block" /> : task.status === "completed" ? (
                        <button onClick={() => markUndone(task._id)} className="w-4 h-4 rounded border border-green-400 bg-green-500 flex items-center justify-center hover:bg-green-600 transition"><Check size={10} className="text-white" strokeWidth={3} /></button>
                      ) : (
                        <button onClick={() => markDone(task._id)} className="w-4 h-4 rounded border border-zinc-300 dark:border-zinc-600 hover:border-violet-400 transition" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {task.status === "failed" && <span className="text-red-500 mr-1">⚠️</span>}
                      <span className={`text-sm ${task.status === "completed" ? "line-through text-zinc-400 dark:text-zinc-500" : task.status === "failed" ? "text-red-500 font-semibold" : "text-zinc-800 dark:text-zinc-200"}`}>{task.title}</span>
                    </div>
                    <div className="w-20"><span className={`text-xs px-2 py-0.5 rounded-md font-medium ${STATUS_CONFIG[task.status]?.bg} ${STATUS_CONFIG[task.status]?.color}`}>{STATUS_CONFIG[task.status]?.label || task.status}</span></div>
                    <div className="w-20"><span className={`text-xs px-2 py-0.5 rounded-md font-medium ${pConfig.bg} ${pConfig.color}`}>{pConfig.label}</span></div>
                    <div className="w-24">{task.dueDate ? <span className="text-xs text-zinc-400 dark:text-zinc-500">{new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span> : <span className="text-xs text-zinc-300 dark:text-zinc-600">—</span>}</div>
                    <div className="w-20"><span className="text-xs text-zinc-400 dark:text-zinc-500 capitalize">{task.source === "deepseek" ? "AI" : task.source}</span></div>
                    <div className="w-16 flex-shrink-0 flex gap-1">
                      <button onClick={() => markFailed(task._id)} className="p-1 rounded hover:bg-orange-200 dark:hover:bg-orange-900/30 text-orange-500 hover:text-orange-600 transition" title="Mark Failed"><Flag size={12} /></button>
                      <button onClick={() => { setEditTask(task); setEditTitle(task.title); setEditDesc(task.description || ""); setEditDueDate(task.dueDate || ""); setEditPriority(task.priority); }} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"><Edit3 size={12} /></button>
                      <button onClick={() => setDeleteId(task._id)} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-zinc-400 hover:text-red-500 transition"><Trash2 size={12} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map(task => {
                const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
                return (
                  <div key={task._id} className="bg-white dark:bg-zinc-900 border rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-medium text-sm text-zinc-800 dark:text-zinc-200 truncate">{task.title}</h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${pConfig.bg} ${pConfig.color}`}>{pConfig.label}</span>
                    </div>
                    {task.description && <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${STATUS_CONFIG[task.status]?.bg} ${STATUS_CONFIG[task.status]?.color}`}>{STATUS_CONFIG[task.status]?.label || task.status}</span>
                      <div className="flex gap-1">
                        <button onClick={() => markFailed(task._id)} className="text-orange-500 hover:text-orange-600 transition" title="Mark Failed"><Flag size={12} /></button>
                        <button onClick={() => markDone(task._id)} className="text-green-500 hover:text-green-600 transition"><Check size={14} /></button>
                        <button onClick={() => setDeleteId(task._id)} className="text-zinc-400 hover:text-red-500 transition"><X size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">New Task</h3><button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"><X size={16} /></button></div>
            <input ref={newTitleRef} value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && createTask()} className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none mb-3 border focus:border-violet-400" placeholder="Task title..." autoFocus />
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none resize-none mb-3 border focus:border-violet-400" rows={3} placeholder="Description..." />
            <div className="flex gap-2 mb-4">{(["low", "medium", "high"] as const).map(p => (<button key={p} onClick={() => setNewPriority(p)} className={`px-2.5 py-1 text-xs rounded-lg ${newPriority === p ? PRIORITY_CONFIG[p].bg + " " + PRIORITY_CONFIG[p].color : "text-zinc-400"}`}>{PRIORITY_CONFIG[p].label}</button>))}</div>
            <div className="flex gap-2 justify-end"><button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800">Cancel</button><button onClick={createTask} disabled={!newTitle.trim()} className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white">Create</button></div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setEditTask(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Edit Task</h3><button onClick={() => setEditTask(null)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={16} /></button></div>
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none mb-3 border focus:border-violet-400" />
            <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm outline-none resize-none mb-3 border focus:border-violet-400" rows={3} />
            <div className="flex gap-2 mb-4">{(["low", "medium", "high"] as const).map(p => (<button key={p} onClick={() => setEditPriority(p)} className={`px-2.5 py-1 text-xs rounded-lg ${editPriority === p ? PRIORITY_CONFIG[p].bg + " " + PRIORITY_CONFIG[p].color : "text-zinc-400"}`}>{PRIORITY_CONFIG[p].label}</button>))}</div>
            <div className="flex gap-2 justify-end"><button onClick={() => setEditTask(null)} className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800">Cancel</button><button onClick={async () => { setEditSaving(true); await fetch("/api/tasks/" + editTask._id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editTitle, description: editDesc, priority: editPriority }) }); setEditTask(null); setEditSaving(false); fetchTasks(); }} disabled={editSaving} className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white">Save</button></div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-80 text-center mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-2">Delete task?</h3>
            <p className="text-sm text-zinc-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3 justify-center"><button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800">Cancel</button><button onClick={() => { deleteTask(deleteId); setDeleteId(null); }} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white">Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}