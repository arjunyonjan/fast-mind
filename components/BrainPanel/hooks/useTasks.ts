// hooks/useTasks.ts
import { useState, useEffect, useCallback } from "react";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  source: string;
  spaceId?: string;
  dueDate?: string;
  createdAt: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.success) setTasks(data.tasks);
      else setError(data.error);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (task: { title: string; description?: string; priority: string }) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...task, status: "pending", source: "manual" }),
    });
    if (res.ok) await fetchTasks();
    return res.ok;
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) await fetchTasks();
    return res.ok;
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    if (res.ok) await fetchTasks();
    return res.ok;
  }, [fetchTasks]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
}