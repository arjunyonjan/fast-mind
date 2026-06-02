"use client";

const priorityStyles = {
  high: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200/50 dark:border-red-800/50",
  medium: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/50",
  low: "bg-slate-50 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 border-slate-200/50 dark:border-slate-800/50"
};

export default function PriorityChip({ priority }: { priority?: string }) {
  const p = priority || "low";
  return (
    <div className={`px-1.5 py-0.5 rounded text- font-medium text-center border ${priorityStyles[p as "high" | "medium" | "low"] || priorityStyles.low}`}>
      {p}
    </div>
  );
}
