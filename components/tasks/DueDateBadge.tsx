"use client";
import { Calendar } from "lucide-react";

export default function DueDateBadge({ dueDate, isOverdue }: { dueDate?: string; isOverdue: boolean }) {
  if (!dueDate) return null;

  return (
    <div className={`flex items-center gap-0.5 text- font-medium ${
      isOverdue
      ? "text-red-600 dark:text-red-400"
       : "text-zinc-500 dark:text-zinc-400"
    }`}>
      <Calendar size={10} />
      {new Date(dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
    </div>
  );
}
