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
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed";
  const isFailed = task.status === "failed" || isOverdue;
  
  return (
    <div className={`${isGrid? "rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-md transition-all" : ""} ${
      isFailed && !isGrid
       ? "mx-2 my-1 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border border-red-200/60 dark:border-red-900/40 shadow-sm shadow-red-100/50 dark:shadow-red-950/20"
       : isFailed && isGrid
       ? "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20 border-red-200/60 dark:border-red-900/40 shadow-sm shadow-red-100/50"
       : !isGrid
       ? "border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
       : ""
    } ${isGrid? "" : "px-3 py-2.5"} ${isFailed && !isGrid? "px-4 py-3" : ""} group transition-all duration-200`}>
      <div className="flex items-center gap-3">
        <button onClick={onComplete} className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${
          task.status === "completed"
           ? "bg-green-500 border-green-500" 
           : isFailed
           ? "border-red-300 dark:border-red-700"
           : "border-zinc-300 dark:border-zinc-600"
        }`}>
          {task.status === "completed" && <Check size={10} className="text-white" strokeWidth={3} />}
        </button>
        
        <div className="flex-1 min-w-0 flex items-center gap-2.5">
          {isFailed && (
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/40 shrink-0">
              <AlertTriangle size={13} className="text-red-600 dark:text-red-400" strokeWidth={2.5} />
            </div>
          )}
          <span className={`text-sm ${
            task.status === "completed"
             ? "line-through text-zinc-400" 
             : isFailed
             ? "font-semibold text-red-700 dark:text-red-400" 
             : "text-zinc-800 dark:text-zinc-200"
          }`}>
            {task.title}
          </span>
        </div>

        {task.dueDate && !isGrid && (
          <span className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded-md ${
            isOverdue
             ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-medium" 
             : "text-zinc-400"
          }`}>
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        )}

        <div className={`${isFailed || isGrid? "opacity-100" : "opacity-0 group-hover:opacity-100"} flex gap-0.5 transition-opacity`}>
          <button onClick={onFail} title="Mark as Failed" className={`p-1.5 rounded-lg transition ${
            isFailed
             ? "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" 
             : "hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500"
          }`}>
            <AlertTriangle size={14} />
          </button>
          <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400">
            <Edit3 size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-red-500">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      
      {isGrid && task.dueDate && (
        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <span className={`text-xs flex items-center gap-1.5 ${
            isOverdue
             ? "text-red-600 dark:text-red-400 font-medium" 
             : "text-zinc-400"
          }`}>
            <Calendar size={12} />
            {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      )}
    </div>
  );
}
