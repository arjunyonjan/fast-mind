"use client";
import Link from "next/link";
import { ArrowLeft, Zap, Circle, CheckCircle, AlertCircle, Bug, Flame, RefreshCw, Heart, Activity } from "lucide-react";
import { useEffect, useState } from "react";

export default function EnergyPage() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 0 : prev + 2);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen overflow-y-auto bg-white dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-8">
          <ArrowLeft size={14} /> Back
        </Link>

        {/* Ancient Trap Title */}
        <div className="text-center mb-4">
          <div className="inline-block px-4 py-1.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">⚠️ The Ancient Trap</div>
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white mb-2">Small → Big → Failure</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">Every developer. Every day. This cycle repeats.</p>
        </div>

        {/* Hero SVG - Neural Network Full Width */}
        <div className="w-full flex justify-center mb-6">\n          <iframe src="/deepseek-neural-network.svg" className="w-full border-0 bg-transparent pointer-events-none" style={{ height: "400px", minHeight: "300px" }} title="Neural Network Animation"></iframe>\n        </div>

        {/* Main Title */}
        <h1 className="text-3xl font-bold text-center text-zinc-900 dark:text-white mb-3">⚡ Energy Link: From Chaos to Clarity</h1>

        {/* Philosophy Quote */}
        <div className="bg-amber-950/30 border-l-4 border-amber-500 rounded-r-xl p-4 mb-8">
          <p className="text-amber-300 text-base italic leading-relaxed">
            "You start small. It works. You feel good. So you add more. Then it breaks. Now you're frustrated. 
            You rush. You break more. Now you're in the doom spiral. Again. This happens every day. To everyone. 
            The secret isn't avoiding it — it's catching it early. One small fix. Verify. Stop. Breathe. Repeat. 
            That's the Energy Link. That's how you win."
          </p>
          <p className="text-amber-500/70 text-xs mt-2 text-right">— Flash Arch, after 1000 doom spirals</p>
        </div>

        <p className="text-center text-zinc-500 dark:text-zinc-400 mb-12">You will break things. Then fix them. That's the job. Every single day.</p>

        {/* The Doom Spiral */}
        <div className="bg-gradient-to-r from-red-950/20 to-black rounded-xl p-6 mb-8 border border-red-800/50">
          <h2 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2"><Bug size={18} /> The Doom Spiral</h2>
          <div className="space-y-2 text-sm text-zinc-300">
            <div className="flex items-center gap-3 p-2 rounded bg-red-950/30">🐛 Small bug → 😤 Frustration</div>
            <div className="flex items-center gap-3 p-2 rounded bg-red-950/40 ml-4">🔧 Hacky fix → 💥 More bugs</div>
            <div className="flex items-center gap-3 p-2 rounded bg-red-950/50 ml-8">🔥 Rush → 🔥🔥 Even more bugs</div>
            <div className="flex items-center gap-3 p-2 rounded bg-red-950/60 ml-12">😵 Burnout → 🌀 Start over</div>
          </div>
          <p className="text-xs text-red-400/70 mt-4 italic">"Just one more thing" — the most dangerous words in coding</p>
        </div>

        {/* The Flash Arch Method */}
        <div className="bg-gradient-to-r from-cyan-950/20 to-black rounded-xl p-6 mb-8 border border-cyan-800/50">
          <h2 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center gap-2"><Zap size={18} /> The Flash Arch Method</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 animate-pulse"><div className="w-2 h-2 rounded-full bg-cyan-400"></div><span className="text-zinc-300">5-10 lines max — surgical patch</span></div>
            <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-400"></div><span className="text-zinc-300">Verify immediately — npx tsc --noEmit</span></div>
            <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-emerald-400"></div><span className="text-zinc-300">Commit — small win saved</span></div>
            <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div><span className="text-zinc-300">Breathe — then next patch</span></div>
          </div>
        </div>

        {/* Consciousness Trigger Checklist */}
        <div className="bg-emerald-950/20 border border-emerald-800/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-emerald-400 mb-4">🧠 Consciousness Trigger Checklist</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-zinc-300"><input type="checkbox" className="w-4 h-4" /> ☐ Pause before typing</label>
            <label className="flex items-center gap-2 text-zinc-300"><input type="checkbox" className="w-4 h-4" /> ☐ What's the smallest fix?</label>
            <label className="flex items-center gap-2 text-zinc-300"><input type="checkbox" className="w-4 h-4" /> ☐ Run tsc now, not later</label>
            <label className="flex items-center gap-2 text-zinc-300"><input type="checkbox" className="w-4 h-4" /> ☐ One patch, one verify, one commit</label>
          </div>
        </div>

        {/* Real War Stories + Progress Bar */}
        <div className="bg-zinc-900/50 rounded-xl p-6 mb-8 border border-zinc-800">
          <h2 className="text-lg font-semibold text-cyan-400 mb-3">📖 Real War Story — Today</h2>
          <p className="text-sm text-zinc-400 mb-3">Terminal → cancel button → WebSocket → offline status → 10 surgical patches → fixed. No doom spiral. Just small steps.</p>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all duration-100" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-right text-xs text-zinc-500 mt-1">{Math.floor(progress)}% — Progress not perfection</p>
        </div>

        {/* The Growth Equation */}
        <div className="text-center p-6 bg-gradient-to-r from-cyan-950/30 to-emerald-950/30 rounded-xl mb-8">
          <h2 className="text-xl font-mono font-bold text-cyan-400">Progress = tinyFixes × frequency</h2>
          <p className="text-sm text-zinc-400 mt-2">Not size. Not speed. Just showing up. Small. Often.</p>
        </div>

        {/* Emergency Reset Protocol */}
        <div className="bg-red-950/20 border border-red-800/50 rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2"><Flame size={18} /> Emergency Reset Protocol</h2>
          <ol className="space-y-2 text-sm text-zinc-300 list-decimal list-inside">
            <li>Step away 2 minutes — walk, water, breathe</li>
            <li>Read last working commit — what changed?</li>
            <li>Revert to known good — no shame, git reset is your friend</li>
            <li>Start with 1-line change — rebuild confidence</li>
          </ol>
        </div>

        {/* Community Energy Bar */}
        <div className="bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl p-6 text-center border border-cyan-800/50">
          <h2 className="text-lg font-semibold text-cyan-400 mb-2 flex items-center justify-center gap-2"><Heart size={18} /> Community Energy Bar</h2>
          <div className="flex items-center justify-center gap-6 text-sm">
            <span className="text-emerald-400">✅ Today's wins: 12 fixes</span>
            <span className="text-red-400">🔥 Meltdowns: 0</span>
          </div>
          <div className="h-1 bg-zinc-800 rounded-full mt-3 w-48 mx-auto overflow-hidden">
            <div className="h-full w-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
          </div>
          <p className="text-xs text-zinc-500 mt-3">Small steps. Every day. You've got this.</p>
        </div>

        {/* Footer mantra */}
        <div className="text-center mt-10 pt-6 border-t border-zinc-800">
          <p className="text-sm text-zinc-500">Chaining small = big disaster. Repeating small = big results.</p>
          <p className="text-xs text-zinc-600 mt-2">Energy Link — small action → small win → energy returns → repeat</p>
        </div>
      </div>
    </div>
  );
}