"use client";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function TaskModal({ task, open, onClose, onSave }: any) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
    }
  }, [task]);

  if (!open) return null;

  const handleSave = () => {
    onSave(task._id, title, description);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end p-4">
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="px-8 pb-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full bg-transparent text-4xl font-bold outline-none mb-6 placeholder:text-zinc-600"
            autoFocus
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description..."
            className="w-full bg-transparent text-lg outline-none resize-none min-h- placeholder:text-zinc-600"
          />
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="px-4 py-2 text-zinc-400 hover:text-white">Cancel</button>
            <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
