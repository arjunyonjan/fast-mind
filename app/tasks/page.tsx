"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutGrid, ArrowLeft, AlertTriangle, Copy, Check, Trash2, CheckCircle } from "lucide-react";
import RingLoader from "@/components/RingLoader";

interface Task {
  description?: string;
  description?: string;
  _id: string;
  title: string;
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

  const copyError = () => {
    navigator.clipboard.writeText(error);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetch("/api/tasks")
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.success) {
          setTasks(data.tasks);
        } else {
          throw new Error(data.error || "Unknown API error");
        }
      })
      .catch((err) => {
        const msg = `[TasksPage] ${err.message}`;
        console.error(msg);
        setError(msg);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <RingLoader />;

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <AlertTriangle size={40} className="text-yellow-500" />
          <p className="text-zinc-400 text-sm font-mono bg-zinc-900 p-3 rounded-lg border border-zinc-800 break-all">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={copyError}
              className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition"
            >
              {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy error"}
            </button>
            <Link href="/" className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg transition">
              Go home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-zinc-400 hover:text-white transition">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <LayoutGrid size={20} /> All Tasks
          </h1>
        </div>
        {tasks.length === 0 ? (
          <p className="text-zinc-500 italic">No tasks created yet. Start a chat on the home page.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-medium text-zinc-200 truncate pr-2">{task.title}</h2>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      task.priority === "high"
                        ? "bg-red-900/40 text-red-300"
                        : task.priority === "medium"
                        ? "bg-yellow-900/40 text-yellow-300"
                        : "bg-green-900/40 text-green-300"
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span className="capitalize">{task.status}</span>`n                {task.description && <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{task.description}</p>}
                  <span>{task.source}</span>
                </div>
                <p className="text-xs text-zinc-600 mt-2">
                  {new Date(task.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
