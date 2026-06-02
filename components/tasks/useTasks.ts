"use client";
import { useState, useEffect } from "react";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  dueDate?: string;
  createdAt: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    setLoading(true);
    fetch("/api/tasks").then(r => r.json()).then(d => { 
      if (d.success) setTasks(d.tasks); 
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTasks(); }, []);

  const updateTask = async (id: string, data: Partial<Task>) => {
    await fetch("/api/tasks/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    fetchTasks();
  };

  const addTask = async (data: Omit<Task, "_id" | "createdAt">) => {
    await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    fetchTasks();
  };

  const deleteTask = async (id: string) => {
    await fetch("/api/tasks/" + id, { method: "DELETE" });
    fetchTasks();
  };

  return { tasks, loading, addTask, updateTask, deleteTask, fetchTasks };
}



