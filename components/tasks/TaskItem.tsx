"use client";
import { Check, AlertTriangle, Calendar, Edit3, Trash2 } from "lucide-react";
import { Task } from "./useTasks";

type TaskItemProps = {
  task: Task;
  onEdit: () => void;
  onComplete: () => void;
  onFail: () => void;
  onDelete: () => void;
  isGrid?: boolean;
};

export default function TaskItem({
  task,
  onEdit,
  onComplete,
  onFail,
  onDelete,
  isGrid = false
}: TaskItemProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status!== "completed";
  const isFailed = task.status === "failed" || isOverdue;

  // Clean priority dot + text instead of bulky pill
  const priorityDot = {
    high: "bg-red-500",
    medium: "bg-amber-500",
    low: "bg-slate-400"
  };

  if (isGrid) {
    return (
      <div className={`group relative rounded-xl border transition-all duration-200 hover:shadow-lg ${
        isFailed
        ? "bg-gradient-to-br from-red-50 to-rose-50/50 dark:from-red-950/40 dark:to-rose-950/20 border-red-200/60 dark:border-red-800/40"
         : "bg-white dark:bg-zinc-900 border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300"
      }`}>
        <div className="p-4">
          <div className="flex items-start gap-2.5 mb-3">
            <button onClick={onComplete} className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
              task.status === "completed"
              ? "bg-emerald-500 border-emerald-500"
               : isFailed
              ? "border-red-400 dark:border-red-600"
               : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400"
            }`}>
              {task.status === "completed" && <Check size={10} className="text-white" strokeWidth={3} />}
            </button>

            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-medium leading-snug ${
                task.status === "completed"
                ? "line-through text-zinc-400"
                 : isFailed
                ? "text-red-900 dark:text-red-200"
                 : "text-zinc-900 dark:text-zinc-100"
              }`}>
                {task.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority] || priorityDot.low}`} />
              <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">{task.priority || "low"}</span>
            </div>
            {task.dueDate && (
              <div className={`flex items-center gap-1 text-xs ${
                isOverdue
                ? "text-red-600 dark:text-red-400 font-medium"
                 : "text-zinc-500 dark:text-zinc-400"
              }`}>
                <Calendar size={12} />
                {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </div>
            )}
          </div>
        </div>

        <div className="absolute top-2 right-2 opacity-100 transition-opacity flex gap-1">
          <button onClick={onFail} className={`p-1.5 rounded-lg transition ${
            isFailed
            ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
             : "bg-white dark:bg-zinc-800 text-zinc-500 hover:text-red-500 shadow-sm border border-zinc-200/60"
          }`}>
            <AlertTriangle size={13} />
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm border border-zinc-200/60 transition">
            <Edit3 size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 text-zinc-500 hover:text-red-500 shadow-sm border border-zinc-200/60 transition">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group px-4 py-2.5 transition-all duration-200 ${
      isFailed
      ? "bg-gradient-to-r from-red-50/60 via-rose-50/30 to-transparent dark:from-red-950/25 dark:via-rose-950/10 dark:to-transparent"
       : "hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40"
    }`}>
      <div className="grid grid-cols-[auto_1fr_80px_90px_80px] gap-3 items-center">
        <button onClick={onComplete} className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
          task.status === "completed"
          ? "bg-emerald-500 border-emerald-500"
           : isFailed
          ? "border-red-400 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
           : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-400"
        }`}>
          {task.status === "completed" && <Check size={10} className="text-white" strokeWidth={3} />}
        </button>

        <div className="flex items-center gap-2 min-w-0">
          {isFailed && (
            <AlertTriangle size={14} className="text-red-500 dark:text-red-400 shrink-0" strokeWidth={2.5} />
          )}
          <span className={`text-sm truncate ${
            task.status === "completed"
            ? "line-through text-zinc-400"
             : isFailed
            ? "font-medium text-red-900 dark:text-red-200"
             : "text-zinc-900 dark:text-zinc-100"
          }`}>
            {task.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${priorityDot[task.priority] || priorityDot.low}`} />
          <span className="text-xs text-zinc-600 dark:text-zinc-400 capitalize">{task.priority || "low"}</span>
        </div>

        <div className={`flex items-center gap-1 text-xs ${
          isOverdue
          ? "text-red-600 dark:text-red-400 font-medium"
           : "text-zinc-500 dark:text-zinc-400"
        }`}>
          {task.dueDate && (
            <>
              <Calendar size={12} />
              {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </>
          )}
        </div>

        <div className="flex gap-1 justify-end opacity-100 transition-opacity">
          <button onClick={onFail} className={`p-1.5 rounded-lg transition ${
            isFailed
            ? "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400"
             : "text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
          }`}>
            <AlertTriangle size={13} />
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <Edit3 size={13} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition">
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

