"use client";
import { Task } from "./useTasks";
import TaskItem from "./TaskItem";

export default function TaskList({ 
  tasks, 
  view = "list",
  onEdit, 
  onComplete, 
  onFail, 
  onDelete 
}: {
  tasks: Task[];
  view?: "list" | "grid";
  onEdit: (task: Task) => void;
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
        <p className="text-sm">No tasks yet</p>
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tasks.map(task => (
          <TaskItem
            key={task._id}
            task={task}
            onEdit={() => onEdit(task)}
            onComplete={() => onComplete(task._id)}
            onFail={() => onFail(task._id)}
            onDelete={() => onDelete(task._id)}
            isGrid
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="px-3 py-2 text-xs font-semibold text-zinc-400 uppercase border-b border-zinc-100 dark:border-zinc-800">
        Task
      </div>
      {tasks.map(task => (
        <TaskItem
          key={task._id}
          task={task}
          onEdit={() => onEdit(task)}
          onComplete={() => onComplete(task._id)}
          onFail={() => onFail(task._id)}
          onDelete={() => onDelete(task._id)}
        />
      ))}
    </div>
  );
}
