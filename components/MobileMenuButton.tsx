"use client";
import { Menu } from "lucide-react";

export default function MobileMenuButton() {
  return (
    <button
      onClick={() => { const e = new CustomEvent("toggle-sidebar"); window.dispatchEvent(e); }}
      className="fixed top-3 left-3 z-[60] p-2 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm sm:hidden"
    >
      <Menu size={18} className="text-zinc-600 dark:text-zinc-400" />
    </button>
  );
}
