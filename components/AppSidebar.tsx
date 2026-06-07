"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, LayoutGrid, Home, PanelLeftClose, PanelLeft, Zap, Sun, Moon, RefreshCw, FileImage, Brain, Camera, Rocket } from "lucide-react"
import { useTheme } from "@/components/ThemeProvider"
import DeepSeekIcon from "@/components/DeepSeekIcon"

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { theme, toggle } = useTheme()
  const [dsOnline, setDsOnline] = useState<boolean | null>(null)
  const [dsChecking, setDsChecking] = useState(false)

  const checkDS = async () => {
    setDsChecking(true)
    try { 
      const r = await fetch("/api/deepseek-status")
      const j = await r.json()
      setDsOnline(j.online)
    }
    catch { 
      setDsOnline(false)
    }
    setDsChecking(false)
  }

  useEffect(() => {
    const handler = () => setMobileOpen(prev => !prev)
    window.addEventListener("toggle-sidebar", handler)
    return () => window.removeEventListener("toggle-sidebar", handler)
  }, [])

  useEffect(() => {
    checkDS()
    const i = setInterval(checkDS, 30000)
    return () => clearInterval(i)
  }, [])

  const link = (href: string) => `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition whitespace-nowrap ${pathname === href ? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-medium" : "text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200"}`

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 transition-all duration-300 select-text max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:h-full max-sm:z-50 ${mobileOpen ? "max-sm:w-56" : "max-sm:w-0 max-sm:overflow-hidden"} ${collapsed ? "w-16" : "w-56"}`}>
        <div className="flex items-center gap-2 px-3 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
          </Link>
          {!collapsed && <Link href="/" className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate hover:text-cyan-600 dark:hover:text-cyan-400 transition">FastMind</Link>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 shrink-0">
            {collapsed ? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <div className="px-3 py-1 mt-2 text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">DOCS</div>
          <Link href="/" className={link("/")}><Home size={17} />{!collapsed && <span>Home</span>}</Link>
          <Link href="/documents" className={link("/documents")}><FileText size={17} />{!collapsed && <span>Documents</span>}</Link>
          <Link href="/pending" className={link("/pending")}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 8v4l3 3M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/></svg>{!collapsed && <span>Pending</span>}</Link>
          <Link href="/tasks" className={link("/tasks")}><LayoutGrid size={17} />{!collapsed && <span>Tasks</span>}</Link>
          <Link href="/diagrams" className={link("/diagrams")}><FileImage size={17} />{!collapsed && <span>Diagrams</span>}</Link>
          <Link href="/cloudinary-gallery" className={link("/cloudinary-gallery")}><Camera size={17} />{!collapsed && <span>Gallery</span>}</Link>
          <Link href="/launchers" className={link("/launchers")}><Rocket size={17} />{!collapsed && <span>Launchers</span>}</Link>
          <Link href="/docs" className={link("/docs")}><FileText size={17} />{!collapsed && <span>Technical Documentation</span>}</Link>
          <Link href="/docs/brain-panel" className={link("/docs/brain-panel")}><Brain size={17} />{!collapsed && <span>Brain Panel</span>}</Link>
          <Link href="/energy" className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 font-medium"><Zap size={17} />{!collapsed && <span>⚠️ Energy Doom</span>}</Link>
        </nav>

        <div className="px-2 py-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
          {/* SaaS Links */}
          <div className="space-y-1 pb-2">
            <a href="https://vercel.com/yonjan-ventures/fast-mind/deployments" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              {!collapsed && <span>Vercel Deployments</span>}
            </a>
            <a href="https://github.com/arjunyonjan/fast-mind" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.49.5.09.68-.21.68-.48 0-.24-.01-.88-.01-1.72-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1.01.07 1.54 1.04 1.54 1.04.9 1.54 2.36 1.09 2.93.84.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02.8-.22 1.65-.33 2.5-.33.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.7-4.56 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48C19.13 20.17 22 16.42 22 12c0-5.52-4.48-10-10-10z"/></svg>
              {!collapsed && <span>GitHub</span>}
            </a>
          </div>

          {!collapsed && dsOnline !== null && (
            <div className={`flex items-center gap-2 px-3 py-2 text-xs ${dsOnline ? "text-emerald-500" : "text-red-400"}`}>
              <DeepSeekIcon size={12} className={dsOnline ? "text-emerald-500" : "text-red-400"} />
              <span>{dsOnline ? "AI online" : "AI offline"}</span>
              <button onClick={checkDS} className="ml-auto p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition">
                {dsChecking ? <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin inline-block" /> : <RefreshCw size={10} />}
              </button>
            </div>
          )}
          {!collapsed && (
            <a href="https://platform.deepseek.com/usage" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition">
              <DeepSeekIcon size={12} className="text-[#4D6BFE]" /> DeepSeek Usage →
            </a>
          )}
          <button onClick={toggle} className="flex items-center gap-3 w-full px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition">
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            {!collapsed && (theme === "dark" ? "Light mode" : "Dark mode")}
          </button>
        </div>
      </aside>
    </>
  )
}
