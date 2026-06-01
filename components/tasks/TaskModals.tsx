"use client";
import { X, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

const PRIORITY_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  high: { bg: "bg-red-50 dark:bg-red-900/20", color: "text-red-500", label: "Urgent" },
  medium: { bg: "bg-amber-50 dark:bg-amber-900/20", color: "text-amber-500", label: "Medium" },
  low: { bg: "bg-blue-50 dark:bg-blue-900/20", color: "text-blue-500", label: "Low" },
};

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, desc: string, priority: string) => Promise<void>;
}

export function CreateTaskModal({ isOpen, onClose, onCreate }: CreateModalProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onCreate(title, desc, priority);
    setSaving(false);
    setTitle("");
    setDesc("");
    setPriority("medium");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">New Task</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition">
            <X size={16} />
          </button>
        </div>
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none mb-3 border border-zinc-200 dark:border-zinc-700 focus:border-violet-400 transition"
          placeholder="Task title..."
        />
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 outline-none resize-none mb-3 border border-zinc-200 dark:border-zinc-700 focus:border-violet-400 transition"
          rows={3}
          placeholder="Description (optional)..."
        />
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-zinc-400">Priority:</span>
          {(["low", "medium", "high"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${priority === p ? PRIORITY_CONFIG[p].bg + " " + PRIORITY_CONFIG[p].color : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            >
              {PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition font-medium flex items-center gap-1.5"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface EditModalProps {
  task: { _id: string; title: string; description?: string; priority: "high" | "medium" | "low" } | null;
  onClose: () => void;
  onSave: (id: string, title: string, desc: string, priority: string) => Promise<void>;
}

export function EditTaskModal({ task, onClose, onSave }: EditModalProps) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDesc(task.description || "");
      setPriority(task.priority);
    }
  }, [task]);

  if (!task) return null;

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    await onSave(task._id, title, desc, priority);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Edit Task</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition">
            <X size={16} />
          </button>
        </div>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 outline-none mb-3 border border-zinc-200 dark:border-zinc-700 focus:border-violet-400 transition"
          placeholder="Title"
        />
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          className="w-full bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-400 outline-none resize-none mb-3 border border-zinc-200 dark:border-zinc-700 focus:border-violet-400 transition"
          rows={3}
          placeholder="Description..."
        />
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-zinc-400">Priority:</span>
          {(["low", "medium", "high"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`px-2.5 py-1 text-xs rounded-lg font-medium transition ${priority === p ? PRIORITY_CONFIG[p].bg + " " + PRIORITY_CONFIG[p].color : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}
            >
              {PRIORITY_CONFIG[p].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || saving}
            className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 transition font-medium flex items-center gap-1.5"
          >
            {saving && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface DeleteModalProps {
  taskId: string | null;
  taskTitle: string;
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
}

export function DeleteTaskModal({ taskId, taskTitle, onClose, onDelete }: DeleteModalProps) {
  const [deleting, setDeleting] = useState(false);

  if (!taskId) return null;

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(taskId);
    setDeleting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-80 text-center mx-4" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={20} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-1">Delete task?</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">"{taskTitle}" will be permanently removed.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition flex items-center gap-1.5"
          >
            {deleting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}