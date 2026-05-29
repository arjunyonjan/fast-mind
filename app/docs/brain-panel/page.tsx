"use client";
import Link from "next/link";
import { ArrowLeft, Brain, Layers, Box, Grid, Zap, Clock, Heart, Activity, Droplets, Eye, Moon } from "lucide-react";

export default function BrainPanelDocs() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <Link href="/docs" className="text-sm text-cyan-500 hover:text-cyan-400 flex items-center gap-1 mb-6"><ArrowLeft size={14} /> Back to Docs</Link>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500"><Brain size={24} className="text-white" /></div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Brain Panel Architecture</h1>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <p className="text-zinc-500 dark:text-zinc-400">Modular React component system for real-time brain health tracking.</p>

          <h2>📁 Folder Structure</h2>
          <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-lg text-sm">components/BrainPanel/
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
    └── ResizeHandle.tsx</pre>

          <h2>🧠 Core Metrics</h2>
          <ul>
            <li><strong>Brain Health</strong> — 100 baseline minus penalties (accumulation, lifestyle, mood) plus bonuses (sunlight, social, learning, breathwork)</li>
            <li><strong>Glymphatic</strong> — Brain waste clearance efficiency (drops 2% per minute without water)</li>
            <li><strong>Vasodilation</strong> — Blood vessel expansion (drops 1.5% per minute without water)</li>
            <li><strong>Waste Accumulation</strong> — Tau, amyloid-beta, ROS buildup over time</li>
            <li><strong>Eye Strain</strong> — Based on awake hours minus sleep recovery</li>
            <li><strong>Digestion</strong> — Phase based on last meal time</li>
            <li><strong>Energy</strong> — Circadian rhythm + sleep state</li>
          </ul>

          <h2>🔄 Data Flow</h2>
          <ol>
            <li><code>useLocalStorageLoader</code> restores saved mood, lifestyle, sips, awake state</li>
            <li><code>useCircadianTimer</code> updates clock every second</li>
            <li><code>useMetricsCalculator</code> recalculates all metrics every second</li>
            <li>UI cards render reactive values</li>
            <li>User actions → update state → localStorage save → re-render</li>
          </ol>

          <h2>🎯 Procrastination Module</h2>
          <p>10 traps (digital + human): Social Media, Video Binge, Doom Scrolling, Mobile Games, Online Shopping, Overthinking, Perfectionism, Task-Switching, Social Chatting, Tomorrow Syndrome + 25-min Pomodoro timer.</p>

          <h2>🔧 Commands</h2>
          <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-lg text-sm">npm run dev     # Start dev server
npm run build   # Production build
dump            # Project snapshot</pre>
        </div>
      </div>
    </div>
  );
}