'use client'

import { useState, useEffect } from 'react'
import { X, Save, RefreshCw } from 'lucide-react'
import { useToast } from '@/components/ToastProvider'

type TaskStatus = 'Low' | 'Medium' | 'Urgent' | 'Failed' | 'Completed'
type Task = {
  _id: string
  title: string
  description?: string
  status: TaskStatus
  priority?: string
  dueDate?: string
}

interface Props {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
}

export default function EditTaskModal({ task, isOpen, onClose, onSaved }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('Low')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [deepseekLoading, setDeepseekLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    if (task) {
      setTitle(task.title || '')
      setDescription(task.description || '')
      setStatus(task.status || 'Low')
      setDueDate(task.dueDate? task.dueDate.split('T')[0] : '')
    }
  }, [task])

  if (!isOpen ||!task) return null

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Title is required', 'error')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          status,
          dueDate: dueDate || null
        }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('Task updated', 'success')
        onSaved()
        onClose()
      } else {
        showToast(data.error || 'Failed to update task', 'error')
      }
    } catch {
      showToast('Failed to update task', 'error')
    } finally {
      setSaving(false)
    }
  }

  const runDeepseekAgent = async () => {
    setDeepseekLoading(true)
    try {
      const res = await fetch('/api/deepseek-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve_task',
          title,
          description
        }),
      })
      const data = await res.json()
      if (data.success) {
        setDescription(data.description || description)
        showToast('Deepseek enhanced the description', 'success')
      } else {
        showToast(data.error || 'Deepseek agent failed', 'error')
      }
    } catch {
      showToast('Deepseek request failed - check API key', 'error')
    } finally {
      setDeepseekLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-zinc-900 rounded-xl w-full max-w-2xl max-h- overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Edit Task</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              placeholder="Task title"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </label>
              <button
                onClick={runDeepseekAgent}
                disabled={deepseekLoading}
                className="flex items-center gap-1.5 px-2 py-1 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md hover:opacity-90 disabled:opacity-50"
                title="Enhance with Deepseek Agent"
              >
                <RefreshCw size={12} className={deepseekLoading? 'animate-spin' : ''} />
                Deepseek Agent
              </button>
            </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
              placeholder="Task description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="Urgent">Urgent</option>
                <option value="Failed">Failed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
          >
            <Save size={14} />
            {saving? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
