"use client";

import { useState, useEffect } from "react";
import { Plus, Play, Trash2, Edit2, X } from "lucide-react";

interface Launcher {
  _id: string;
  name: string;
  description: string;
  command: string;
  cwd: string | null;
  createdAt: string;
}

export default function LaunchersPage() {
  const [launchers, setLaunchers] = useState<Launcher[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
    const [outputModal, setOutputModal] = useState<{ launcherName: string; output: string } | null>(null);
  const [editingLauncher, setEditingLauncher] = useState<Launcher | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    command: "",
    cwd: ""
  });
  const [saving, setSaving] = useState(false);

  const fetchLaunchers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/launchers");
      const data = await res.json();
      if (data.success) setLaunchers(data.launchers);
    } catch (err) {
      console.error("Failed to fetch launchers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaunchers();
  }, []);

  const handleCreate = async () => {
    if (!formData.name || !formData.command) {
      alert("Name and command are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/launchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          command: formData.command,
          cwd: formData.cwd || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFormData({ name: "", description: "", command: "", cwd: "" });
        fetchLaunchers();
      }
    } catch (err) {
      console.error("Failed to create launcher", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/launchers?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setDeleteId(null);
        fetchLaunchers();
      }
    } catch (err) {
      console.error("Failed to delete launcher", err);
    }
  };

    const handleUpdate = async () => {
    if (!editingLauncher) return;
    if (!formData.name || !formData.command) {
      alert("Name and command are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/launchers?id=${editingLauncher._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          command: formData.command,
          cwd: formData.cwd || null
        })
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        setEditingLauncher(null);
        setFormData({ name: "", description: "", command: "", cwd: "" });
        fetchLaunchers();
      }
    } catch (err) {
      console.error("Failed to update launcher", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (launcher: Launcher) => {
    setEditingLauncher(launcher);
    setFormData({
      name: launcher.name,
      description: launcher.description || "",
      command: launcher.command,
      cwd: launcher.cwd || ""
    });
    setEditModalOpen(true);
  };

  const handleRun = async (id: string, name: string) => {
    setRunningId(id);
    try {
      const res = await fetch("/api/launchers/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      setOutputModal({
        launcherName: name,
        output: data.output || data.error || "No output"
      });
    } catch (err: any) {
      setOutputModal({
        launcherName: name,
        output: err.message || "Execution failed"
      });
    } finally {
      setRunningId(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Launchers</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Execute terminal commands with one click</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition"
          >
            <Plus size={16} /> New Launcher
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && launchers.length === 0 && (
          <div className="text-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400">No launchers yet. Create your first one!</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {launchers.map((launcher) => (
            <div key={launcher._id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 hover:shadow-md transition">
              <h3 className="font-semibold text-zinc-900 dark:text-white">{launcher.name}</h3>
              {launcher.description && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{launcher.description}</p>
              )}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => handleRun(launcher._id, launcher.name)}
                  disabled={runningId === launcher._id}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 disabled:opacity-50 transition"
                >
                  {runningId === launcher._id ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Play size={14} />
                  )}
                  Run
                </button>
                <button className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition">
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => setDeleteId(launcher._id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Create Launcher</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={18} className="text-zinc-500" />
              </button>
            </div>
            <input
              type="text"
              placeholder="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 mb-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 mb-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="Command * (e.g., npm run dev)"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              className="w-full px-3 py-2 mb-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <input
              type="text"
              placeholder="Working directory (optional)"
              value={formData.cwd}
              onChange={(e) => setFormData({ ...formData, cwd: e.target.value })}
              className="w-full px-3 py-2 mb-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 disabled:opacity-50 transition"
              >
                {saving ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2">Delete Launcher?</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {outputModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setOutputModal(null)}>
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-2xl w-full max-h- overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Output: {outputModal.launcherName}</h3>
              <button onClick={() => setOutputModal(null)} className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <X size={18} className="text-zinc-500" />
              </button>
            </div>
            <pre className="p-4 bg-zinc-100 dark:bg-zinc-800 m-4 rounded-lg text-xs font-mono overflow-x-auto max-h-96">
              {outputModal.output}
            </pre>
            <div className="p-4 pt-0">
              <button
                onClick={() => setOutputModal(null)}
                className="w-full px-4 py-2 bg-cyan-500 text-white rounded-lg text-sm hover:bg-cyan-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}