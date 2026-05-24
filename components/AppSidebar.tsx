"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutGrid, Home, PanelLeftClose, PanelLeft, Plus } from "lucide-react";

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const link = (href: string) => `flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition whitespace-nowrap ${pathname===href?"bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-medium":"text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"}`;

  return (
    <aside className={`border-r border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 flex flex-col shrink-0 transition-all duration-300 ${collapsed?"w-16":"w-56"}`}>
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        {!collapsed && <><div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0"><span className="text-white text-xs font-bold">FM</span></div><span className="font-bold text-sm uppercase text-zinc-700 dark:text-zinc-300">FastMind</span></>}
        <button onClick={()=>setCollapsed(!collapsed)} className="ml-auto p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 text-zinc-400 shrink-0">{collapsed?<PanelLeft size={16}/>:<PanelLeftClose size={16}/>}</button>
      </div>
      {!collapsed && <div className="px-3 mb-4"><Link href="/documents/new" className="flex items-center gap-2 w-full px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm transition"><Plus size={16}/>New</Link></div>}
      <nav className="flex-1 space-y-0.5 px-3">
        <Link href="/" className={link("/")}>{collapsed?<Home size={18}/>:<><Home size={16}/>Home</>}</Link>
        <Link href="/documents" className={link("/documents")}>{collapsed?<FileText size={18}/>:<><FileText size={16}/>Documents</>}</Link>
        <Link href="/tasks" className={link("/tasks")}>{collapsed?<LayoutGrid size={18}/>:<><LayoutGrid size={16}/>Tasks</>}</Link>
      </nav>
    </aside>
  );
}
