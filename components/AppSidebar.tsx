"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutGrid, Home, PanelLeftClose, PanelLeft, Zap, Sun, Moon, Plus, Activity, RefreshCw, Bug, FileImage } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import DeepSeekIcon from "@/components/DeepSeekIcon";

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [newSpace, setNewSpace] = useState(false);
  const [spaceName, setSpaceName] = useState("");
  const [spaces, setSpaces] = useState<{_id:string,name:string}[]>([]);
  const [dsOnline, setDsOnline] = useState<boolean | null>(null);
  const [dsChecking, setDsChecking] = useState(false);
  const [devMode, setDevMode] = useState(false);

  const checkDS = useCallback(async () => {
    setDsChecking(true);
    try { const r = await fetch("/api/deepseek-status"); const j = await r.json(); setDsOnline(j.online); }
    catch { setDsOnline(false); }
    setDsChecking(false);
  }, []);

  useEffect(() => {
    const handler = () => setMobileOpen(prev => !prev);
    window.addEventListener("toggle-sidebar", handler);
    return () => window.removeEventListener("toggle-sidebar", handler);
  }, []);

  useEffect(() => {
    fetch("/api/spaces").then(r => r.json()).then(d => { if (d.success) setSpaces(d.spaces); });
    checkDS();
    const i = setInterval(checkDS, 30000);
    return () => clearInterval(i);
  }, []);

  const link = (href: string) =>
    `flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition whitespace-nowrap ${
      pathname === href ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-medium" : "text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
    }`;

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`border-r border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 flex flex-col shrink-0 transition-all duration-300 select-text max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:h-full max-sm:z-50 ${mobileOpen ? "max-sm:w-56" : "max-sm:w-0 max-sm:overflow-hidden"} ${collapsed ? "w-16" : "w-56"}`}>
        <div className="flex items-center gap-2 px-3 py-4 mb-4">
          <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shrink-0"><Zap size={14} className="text-white" /></div>
          {!collapsed && <span className="font-bold text-sm uppercase text-zinc-700 dark:text-zinc-300 truncate">FastMind</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 text-zinc-400 shrink-0">{collapsed ? <PanelLeft size={16} /> : <PanelLeftClose size={16} />}</button>
        </div>

        {!collapsed && dsOnline !== null && (
          <div className={`px-3 pb-2 text-xs flex items-center gap-1.5 ${dsOnline ? "text-green-400" : "text-red-400"}`}>
            <DeepSeekIcon size={12} className={dsOnline ? "text-green-400" : "text-red-400"} />
            {dsOnline ? "DeepSeek online" : "DeepSeek offline"}
            <button onClick={checkDS} className="ml-1 p-0.5 rounded hover:bg-zinc-700 text-zinc-400 hover:text-white transition">
              {dsChecking ? <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin inline-block" /> : <RefreshCw size={10} />}
            </button>
          </div>
        )}

        {!collapsed && (
          <div className="px-3 mb-4">
            <Link href="/documents/new" className="flex items-center gap-2 w-full px-3 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-sm transition"><Plus size={16} /> New</Link>
          </div>
        )}

        {!collapsed && (
          <>
            <div className="px-3 mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Spaces</span>
              <button onClick={() => setNewSpace(!newSpace)} className="text-zinc-400 hover:text-white text-xs">+</button>
            </div>
            {newSpace && (
              <div className="px-3 mb-2">
                <input value={spaceName} onChange={e => setSpaceName(e.target.value)} onKeyDown={async e => { if (e.key === "Enter" && spaceName.trim()) { await fetch("/api/spaces", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: spaceName }) }); setSpaceName(""); setNewSpace(false); fetch("/api/spaces").then(r => r.json()).then(d => { if (d.success) setSpaces(d.spaces); }); } }} placeholder="Space name..." className="w-full px-2 py-1 text-xs bg-gray-100 dark:bg-zinc-800 rounded border-none outline-none" autoFocus />
              </div>
            )}
            {spaces.map(s => (
              <Link key={s._id} href={`/?space=${s._id}`} className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />{s.name}
              </Link>
            ))}
          </>
        )}

        <nav className="flex-1 space-y-0.5 px-3 mt-3">
          <Link href="/" className={link("/")} title="Home"><Home size={18} />{!collapsed && <span>Home</span>}</Link>
          <Link href="/documents" className={link("/documents")} title="Documents"><FileText size={18} />{!collapsed && <span>Documents</span>}</Link>
          <Link href="/tasks" className={link("/tasks")} title="Tasks"><LayoutGrid size={18} />{!collapsed && <span>Tasks</span>}</Link>
          {!collapsed && <a href="/diagrams" className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition"><FileImage size={18} />Diagrams Ã¢â€ â€™</a>}
        </nav>

        {!collapsed && (
          <a href="https://platform.deepseek.com/usage" target="_blank" className="px-3 py-2 text-xs text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition border-t border-gray-200 dark:border-zinc-800">
            <span className="flex items-center gap-1.5"><DeepSeekIcon size={14} className="text-[#4D6BFE]" /> DeepSeek Usage Ã¢â€ â€™</span>
          </a>
        )}

        {!collapsed && (
          <button onClick={() => { setDevMode(!devMode); const e = new CustomEvent("toggle-debug", { detail: !devMode }); window.dispatchEvent(e); }} className={`flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg transition mx-3 mb-1 ${devMode ? "bg-purple-500/10 text-purple-400" : "text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800"}`}>
            <Bug size={16} />
            {devMode ? "Dev Mode: ON" : "Dev Mode"}
          </button>
        )}

        <div className="px-3 py-4 border-t border-gray-200 dark:border-zinc-800">
          <button onClick={toggle} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {!collapsed && (theme === "dark" ? "Light mode" : "Dark mode")}
          </button>
        </div>
      </aside>
    </>
  );
}