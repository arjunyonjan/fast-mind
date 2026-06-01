"use client";
import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Trash2 } from "lucide-react";

interface Task { _id: string; title: string; description: string; priority: string; status: string; createdAt: string; }

function TasksContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const statusFilter = searchParams.get("status") || "all";
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    setLoading(true);
    const url = statusFilter === "all" ? "/api/tasks" : `/api/tasks?status=${statusFilter}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.success) setTasks(data.tasks);
    setLoading(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    if (!confirm("Delete?")) return;
    await fetch("/api/tasks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    fetchTasks();
  };

  useEffect(() => { fetchTasks(); }, [statusFilter]);

  const getStatusBadge = (s: string) => {
    if (s === "done") return <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs flex items-center gap-1"><CheckCircle size={12} /> Done</span>;
    if (s === "failed") return <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs flex items-center gap-1"><XCircle size={12} /> Failed</span>;
    return <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs flex items-center gap-1"><AlertCircle size={12} /> Pending</span>;
  };

  if (loading) return <div className="flex justify-center p-8"><RefreshCw className="animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex gap-2 mb-6">
        <button onClick={() => router.push("/tasks")} className={`px-3 py-1 rounded ${statusFilter === "all" ? "bg-cyan-500 text-white" : "bg-gray-100"}`}>All</button>
        <button onClick={() => router.push("/tasks?status=pending")} className={`px-3 py-1 rounded ${statusFilter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-100"}`}>Pending</button>
        <button onClick={() => router.push("/tasks?status=failed")} className={`px-3 py-1 rounded ${statusFilter === "failed" ? "bg-red-500 text-white" : "bg-gray-100"}`}>Failed</button>
        <button onClick={() => router.push("/tasks?status=done")} className={`px-3 py-1 rounded ${statusFilter === "done" ? "bg-green-500 text-white" : "bg-gray-100"}`}>Done</button>
      </div>
      {tasks.length === 0 ? <div className="text-center text-gray-400">No tasks</div> : (
        <div className="space-y-3">
          {tasks.map(t => (
            <div key={t._id} className="border rounded-xl p-4 bg-white">
              <div className="flex justify-between">
                <div>
                  <div className="flex gap-2 mb-1">{getStatusBadge(t.status)}</div>
                  <h3 className="font-semibold">{t.title}</h3>
                  {t.description && <p className="text-sm text-gray-500">{t.description}</p>}
                </div>
                <div className="flex gap-2">
                  {t.status !== "done" && <button onClick={() => updateStatus(t._id, "done")} className="text-green-600"><CheckCircle size={18} /></button>}
                  {t.status !== "failed" && <button onClick={() => updateStatus(t._id, "failed")} className="text-red-600"><XCircle size={18} /></button>}
                  <button onClick={() => deleteTask(t._id)} className="text-gray-400 hover:text-red-600"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
      <TasksContent />
    </Suspense>
  );
}