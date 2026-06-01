"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, LayoutGrid, Home, PanelLeftClose, PanelLeft, Zap, Sun, Moon, RefreshCw, FileImage, Brain, Camera } from "lucide-react"
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
    const handler = () => setMobileOpen(prev =>!prev)
    window.addEventListener("toggle-sidebar", handler)
    return () => window.removeEventListener("toggle-sidebar", handler)
  }, [])

  useEffect(() => {
    checkDS()
    const i = setInterval(checkDS, 30000)
    return () => clearInterval(i)
  }, [])

  const link = (href: string) => `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition whitespace-nowrap ${pathname === href? "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-medium" : "text-zinc-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-zinc-700 dark:hover:text-zinc-200"}`

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={() => setMobileOpen(false)} />}
      <aside className={`border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col shrink-0 transition-all duration-300 select-text max-sm:fixed max-sm:left-0 max-sm:top-0 max-sm:h-full max-sm:z-50 ${mobileOpen? "max-sm:w-56" : "max-sm:w-0 max-sm:overflow-hidden"} ${collapsed? "w-16" : "w-56"}`}>
        <div className="flex items-center gap-2 px-3 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
          </Link>
          {!collapsed && <Link href="/" className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate hover:text-cyan-600 dark:hover:text-cyan-400 transition">FastMind</Link>}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 shrink-0">
            {collapsed? <PanelLeft size={15} /> : <PanelLeftClose size={15} />}
          </button>
        </div>
        
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          <div className="px-3 py-1 mt-2 text- font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">DOCS</div>
          <Link href="/" className={link("/")} title="Home">
            <Home size={17} />{!collapsed && <span>Home</span>}
          </Link>
          <Link href="/documents" className={link("/documents")} title="Documents">
            <FileText size={17} />{!collapsed && <span>Documents</span>}
          </Link>
          <Link href="/tasks" className={link("/tasks")} title="Tasks">
            <LayoutGrid size={17} />{!collapsed && <span>Tasks</span>}
          </Link>
          <Link href="/diagrams" className={link("/diagrams")} title="Diagrams">
            <FileImage size={17} />{!collapsed && <span>Diagrams</span>}
          </Link>
          <Link href="/cloudinary-gallery" className={link("/cloudinary-gallery")} title="Gallery">
            <Camera size={17} />{!collapsed && <span>Gallery</span>}
          </Link>
          
          <Link href="/docs" className={link("/docs")} title="Technical Documentation">
            <FileText size={17} />{!collapsed && <span>Technical Documentation</span>}
          </Link>
          <Link href="/docs/brain-panel" className={link("/docs/brain-panel")} title="Brain Panel Docs">
            <Brain size={17} />{!collapsed && <span>Brain Panel</span>}
          </Link>
        </nav>

        <div className="px-2 py-3 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
          {!collapsed && dsOnline !== null && (
            <div className={`flex items-center gap-2 px-3 py-2 text-xs ${dsOnline? "text-emerald-500" : "text-red-400"}`}>
              <DeepSeekIcon size={12} className={dsOnline? "text-emerald-500" : "text-red-400"} />
              <span>{dsOnline? "AI online" : "AI offline"}</span>
              <button onClick={checkDS} className="ml-auto p-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition">
                {dsChecking? <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin inline-block" /> : <RefreshCw size={10} />}
              </button>
            </div>
          )}
          {!collapsed && (
            <a 
              href="https://platform.deepseek.com/usage" 
              target="_blank" 
              rel="noopener" 
              className="flex items-center gap-3 px-3 py-2 text-xs text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            >
              <DeepSeekIcon size={12} className="text-[#4D6BFE]" /> DeepSeek Usage →
            </a>
          )}
          <button 
            onClick={toggle} 
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition" 
            title={theme === "dark"? "Switch to light" : "Switch to dark"}
          >
            {theme === "dark"? <Sun size={17} /> : <Moon size={17} />}
            {!collapsed && (theme === "dark"? "Light mode" : "Dark mode")}
          </button>
        </div>
      </aside>
    </>
  )
}
