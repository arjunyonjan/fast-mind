"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutGrid, Home, PanelLeftClose, PanelLeft, Plus, Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();

  const link = (href: string) =>
    `flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition whitespace-nowrap ${
      pathname === href
        ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-medium"
        : "text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
    }`;

  return (
    <aside
      className={`border-r border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex flex-col shrink-0 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0">
          <Zap size={14} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-sm uppercase text-zinc-700 dark:text-zinc-300 truncate">FastMind</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 text-zinc-400 shrink-0"
        >
          {collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* New document button */}
      {!collapsed && (
        <div className="px-3 mb-4">
          <Link
            href="/documents/new"
            className="flex items-center gap-2 w-full px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm transition"
          >
            <Plus size={16} /> New
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3">
        <Link href="/" className={link("/")} title="Home">
          <Home size={18} />
          {!collapsed && <span>Home</span>}
        </Link>
        <Link href="/documents" className={link("/documents")} title="Documents">
          <FileText size={18} />
          {!collapsed && <span>Documents</span>}
        </Link>
        <Link href="/tasks" className={link("/tasks")} title="Tasks">
          <LayoutGrid size={18} />
          {!collapsed && <span>Tasks</span>}
        </Link>
      </nav>

      {/* Theme toggle at the bottom */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-zinc-800">
        <button
          onClick={toggle}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {!collapsed && (theme === "dark" ? "Light mode" : "Dark mode")}
        </button>
      </div>
    </aside>
  );
}