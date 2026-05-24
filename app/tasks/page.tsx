"use client";
import { useEffect, useState } from "react";
import { LayoutGrid, AlertTriangle, Copy, Check, List, Grid3X3, Trash2 } from "lucide-react";

interface Task {
  spaceId?: string;
  _id: string; title: string; description?: string; priority: string; status: string; source: string; createdAt: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [view, setView] = useState<"grid"|"list">("grid");
  const [filter, setFilter] = useState<"all"|"active"|"completed">("all");
  const [marking, setMarking] = useState<string | null>(null);
  const [spaces, setSpaces] = useState<{_id:string,name:string}[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchTasks = () => {
    setLoading(true);
    fetch("/api/tasks").then(r => r.json()).then(d => { if (d.success) setTasks(d.tasks); }).catch(e => setError(e.message)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchTasks(); fetch('/api/spaces').then(r=>r.json()).then(d=>{if(d.success)setSpaces(d.spaces)}); }, []);

  const markDone = async (id: string) => { setMarking(id); await fetch("/api/tasks/"+id, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status:"completed"}) }); setTasks(p => p.map(t => t._id===id ? {...t, status:"completed"} : t)); setMarking(null); };
  const markUndone = async (id: string) => { setMarking(id); await fetch("/api/tasks/"+id, { method:"PATCH", headers:{"Content-Type":"application/json"}, body:JSON.stringify({status:"pending"}) }); setTasks(p => p.map(t => t._id===id ? {...t, status:"pending"} : t)); setMarking(null); };
  const deleteTask = async (id: string) => { await fetch("/api/tasks/"+id, { method:"DELETE" }); setTasks(p => p.filter(t => t._id !== id)); };

  if (error) return <div className="flex flex-col items-center justify-center h-full gap-4"><AlertTriangle size={40} className="text-yellow-500" /><p className="text-zinc-500 text-sm">{error}</p></div>;

  const filtered = filter==="all" ? tasks : filter==="active" ? tasks.filter(t=>t.status!=="completed") : tasks.filter(t=>t.status==="completed");

  return (
    <div className="flex flex-col h-full">
      {loading && <div className="fixed top-0 left-0 right-0 h-0.5 z-50"><div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-loading-bar" /></div>}
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold flex items-center gap-2"><LayoutGrid size={20} /> Tasks</h1>
        <div className="flex items-center gap-1 ml-auto bg-gray-100 dark:bg-zinc-900 rounded-lg p-0.5">
          <button onClick={()=>setView("grid")} className={`p-1.5 rounded-md ${view==="grid"?"bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-white":"text-zinc-500"}`}><Grid3X3 size={15}/></button>
          <button onClick={()=>setView("list")} className={`p-1.5 rounded-md ${view==="list"?"bg-white dark:bg-zinc-700 shadow-sm text-zinc-800 dark:text-white":"text-zinc-500"}`}><List size={15}/></button>
        </div>
      </div>
      <div className="flex gap-2 mb-6">
        {(["all","active","completed"] as const).map(f=>(<button key={f} onClick={()=>setFilter(f)} className={`px-3 py-1 text-xs rounded-full capitalize ${filter===f?"bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-white":"bg-gray-100 dark:bg-zinc-900 text-zinc-500"}`}>{f} <span className="ml-1 text-zinc-400">({f==="all"?tasks.length:f==="active"?tasks.filter(t=>t.status!=="completed").length:tasks.filter(t=>t.status==="completed").length})</span></button>))}
      </div>
      {filtered.length===0 ? <p className="text-zinc-500 text-center py-16">No {filter} tasks.</p> : (
        <div className={view==="grid"?"grid gap-4 sm:grid-cols-2 lg:grid-cols-3":"flex flex-col gap-2"}>
          {filtered.map(task=>(<div key={task._id} className={`bg-gray-50 dark:bg-zinc-900 border rounded-xl p-4 flex transition ${task.status==="completed"?"border-gray-100 dark:border-zinc-800 opacity-60":"border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600"} ${view==="list"?"flex-row items-center gap-4":"flex-col"}`}>
            <div className={`flex items-start justify-between gap-2 ${view==="list"?"flex-1 min-w-0":"mb-2"}`}>
              <h2 className={`font-medium text-zinc-800 dark:text-zinc-200 truncate ${task.status==="completed"?"line-through text-zinc-400":""} ${view==="list"?"flex-1":""}`}>{task.title}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${task.priority==="high"?"bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300":task.priority==="medium"?"bg-yellow-100 dark:bg-yellow-900/40 text-yellow-600 dark:text-yellow-300":"bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300"}`}>{task.priority}</span>              {task.spaceId && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 shrink-0 ml-1">{spaces.find(s=>s._id===task.spaceId)?.name || "Space"}</span>}
            </div>
            {view==="grid" && task.description && <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">{task.description}</p>}
            <div className={`flex items-center justify-between ${view==="grid"?"mt-auto pt-3 border-t border-gray-200 dark:border-zinc-800":""} text-xs text-zinc-400 dark:text-zinc-500`}>
              <div className="flex items-center gap-2"><span className="capitalize">{task.status}</span><span>·</span><span>{task.source}</span><span>·</span><span>{new Date(task.createdAt).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</span></div>
              <div className="flex items-center gap-2">
                {task.status==="completed" ? (marking===task._id ? <span className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"/> : <button onClick={()=>markUndone(task._id)} className="text-yellow-400 hover:text-yellow-300 cursor-pointer">↩</button>) : (marking===task._id ? <span className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"/> : <button onClick={()=>markDone(task._id)} className="text-green-400 hover:text-green-300 cursor-pointer">✓</button>)}
                <button onClick={()=>setDeleteId(task._id)} className="text-red-400 hover:text-red-300 cursor-pointer">✕</button>
              </div>
            </div>
          </div>))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={()=>setDeleteId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-zinc-800 p-6 w-80 text-center" onClick={e=>e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4"><Trash2 size={20} className="text-red-500"/></div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-zinc-200 mb-1">Delete task?</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={()=>setDeleteId(null)} className="px-4 py-2 text-sm rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-800 dark:hover:text-zinc-200 transition cursor-pointer">Cancel</button>
              <button onClick={()=>{const id=deleteId;setDeleteId(null);deleteTask(id);}} className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-700 transition cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}