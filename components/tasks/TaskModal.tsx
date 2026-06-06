"use client";
import { useState, useEffect } from "react";
import { X, Calendar, Flag } from "lucide-react";
import { Task } from "./useTasks";

export default function TaskModal({ task, open, onClose, onSave }: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Task>) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDesc(task.description || "");
      setDueDate(task.dueDate || "");
      setPriority(task.priority);
    }
  }, [task]);

  console.log("TaskModal open prop:", open); if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-900 border-4 border-red-500 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl max-h- overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="text-xs text-zinc-400">Editing task</div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400"><X size={18} /></button>
        </div>
        <div className="p-6 sm:p-8">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent text-4xl font-bold outline-none mb-6 text-zinc-900 dark:text-white placeholder:text-zinc-300 dark:placeholder:text-zinc-600"
            autoFocus
          />
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Description..."
            className="w-full bg-transparent text-base outline-none resize-none min-h- text-zinc-700 dark:text-zinc-300 placeholder:text-zinc-400 mb-6"
          />
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-zinc-400" />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="bg-zinc-100 dark:bg-zinc-800 rounded-lg px-3 py-1.5 text-zinc-700 dark:text-zinc-300 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <Flag size={16} className="text-zinc-400" />
              {(["low", "medium", "high"] as const).map(p => (
                <button key={p} onClick={() => setPriority(p)} className={`px-3 py-1.5 text-xs rounded-lg font-medium ${priority === p? "bg-violet-100 dark:bg-violet-900/30 text-violet-600" : "text-zinc-400 bg-zinc-100 dark:bg-zinc-800"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">Cancel</button>
            <button onClick={() => { onSave({ title, description: desc, dueDate, priority: priority as "high" | "medium" | "low" }); onClose(); }} className="px-4 py-2 text-sm rounded-lg bg-violet-600 text-white font-medium">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}



