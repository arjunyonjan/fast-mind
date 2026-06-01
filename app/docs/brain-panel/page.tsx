'use client'

import { useTheme } from "@/components/ThemeProvider"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Brain } from "lucide-react"

export default function BrainPanelDocs() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => { 
    setMounted(true) 
  }, [])
  
  if (!mounted) return null
  
  const isDark = theme === "dark"

  return (
    <div className={`h-full overflow-y-auto ${isDark? 'bg-zinc-950' : 'bg-white'}`}>
      <div className="max-w-4xl mx-auto px-6 py-10 pb-20">
        <Link 
          href="/docs" 
          className={`text-sm flex items-center gap-1 mb-6 ${
            isDark? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-600 hover:text-cyan-700'
          }`}
        >
          <ArrowLeft size={14} /> Back to Docs
        </Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500">
            <Brain size={24} className="text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${isDark? 'text-white' : 'text-zinc-900'}`}>
            Brain Panel Architecture
          </h1>
        </div>

        <div className={`prose ${isDark? 'prose-invert' : ''} max-w-none`}>
          <p className={isDark? 'text-zinc-400' : 'text-zinc-600'}>
            Modular React component system for real-time brain health tracking.
          </p>

          <h2 className={isDark? 'text-white' : 'text-zinc-900'}>📁 Folder Structure</h2>
          <pre className={`p-4 rounded-lg text-sm overflow-x-auto ${
            isDark? 'bg-black text-zinc-300' : 'bg-zinc-100 text-zinc-800'
          }`}>{`components/BrainPanel/
├── index.tsx (Orchestrator)
├── types.ts
├── hooks/
│   ├── useBrainState.ts
│   ├── useCircadianTimer.ts
│   ├── useMetricsCalculator.ts
│   └── useLocalStorageLoader.ts
├── cards/
│   ├── MetricsGrid.tsx
│   ├── CircadianCard.tsx
│   ├── MoodCard.tsx
│   ├── LifestyleCard.tsx
│   ├── BoostersCard.tsx
│   ├── WasteCard.tsx
│   ├── GlymphaticCard.tsx
│   ├── VasodilationCard.tsx
│   ├── SleepWindowCard.tsx
│   ├── NeuroCard.tsx
│   └── CollapsibleCard.tsx
└── shared/
    ├── WaterLog.tsx
    ├── TimeSimulator.tsx
    ├── InfoPopup.tsx
    ├── FullscreenButton.tsx
    └── ResizeHandle.tsx`}</pre>

          <h2 className={isDark? 'text-white' : 'text-zinc-900'}>🧠 Core Metrics</h2>
          <ul className={isDark? 'text-zinc-300' : 'text-zinc-700'}>
            <li><strong>Brain Health</strong> — 100 baseline minus penalties plus bonuses</li>
            <li><strong>Glymphatic</strong> — Brain waste clearance efficiency</li>
            <li><strong>Vasodilation</strong> — Blood vessel expansion</li>
            <li><strong>Waste Accumulation</strong> — Tau, amyloid-beta, ROS buildup</li>
            <li><strong>Eye Strain</strong> — Based on awake hours minus sleep recovery</li>
            <li><strong>Digestion</strong> — Phase based on last meal time</li>
            <li><strong>Energy</strong> — Circadian rhythm + sleep state</li>
          </ul>

          <h2 className={isDark? 'text-white' : 'text-zinc-900'}>🔄 Data Flow</h2>
          <ol className={isDark? 'text-zinc-300' : 'text-zinc-700'}>
            <li><code>useLocalStorageLoader</code> restores saved state</li>
            <li><code>useCircadianTimer</code> updates clock every second</li>
            <li><code>useMetricsCalculator</code> recalculates all metrics every second</li>
            <li>UI cards render reactive values</li>
            <li>User actions → update state → localStorage → re-render</li>
          </ol>

          <h2 className={isDark? 'text-white' : 'text-zinc-900'}>🎯 Procrastination Module</h2>
          <p className={isDark? 'text-zinc-300' : 'text-zinc-700'}>
            10 traps: Social Media, Video Binge, Doom Scrolling, Mobile Games, Online Shopping, Overthinking, Perfectionism, Task-Switching, Social Chatting, Tomorrow Syndrome + 25-min Pomodoro timer.
          </p>

          <h2 className={isDark? 'text-white' : 'text-zinc-900'}>🔧 Commands</h2>
          <pre className={`p-4 rounded-lg text-sm ${
            isDark? 'bg-black text-zinc-300' : 'bg-zinc-100 text-zinc-800'
          }`}>{`npm run dev     # Start dev server
npm run build   # Production build
dump            # Project snapshot`}</pre>
        </div>
      </div>
    </div>
  )
}
