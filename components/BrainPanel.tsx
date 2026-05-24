"use client";
import { useState, useEffect } from "react";
import { Brain, Droplets, Moon, Sun, Activity, Timer } from "lucide-react";

interface SipLog { time: string; }

export default function BrainPanel() {
  const [open, setOpen] = useState(false);
  const [sips, setSips] = useState<SipLog[]>([]);
  const [lastSip, setLastSip] = useState<string | null>(null);
  const [minutesSince, setMinutesSince] = useState(0);
  const [glymphaticPercent, setGlymphaticPercent] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("brain-sips");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSips(parsed);
      if (parsed.length > 0) setLastSip(parsed[parsed.length - 1].time);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lastSip) {
        const diff = Math.floor((Date.now() - new Date(lastSip).getTime()) / 60000);
        setMinutesSince(diff);
        setGlymphaticPercent(Math.min(100, Math.max(0, 100 - diff * 2)));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lastSip]);

  const logSip = () => {
    const now = new Date().toISOString();
    const updated = [...sips, { time: now }];
    setSips(updated);
    setLastSip(now);
    localStorage.setItem("brain-sips", JSON.stringify(updated));
  };

  const hour = new Date().getHours();
  const circadian = hour >= 6 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : hour >= 18 && hour < 22 ? "evening" : "night";

  return (
    <>
      <button onClick={() => setOpen(true)} className="fixed bottom-4 left-4 z-[9998] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 p-2 rounded-full shadow-lg transition" title="Brain State">
        <Brain size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-start justify-end pointer-events-none">
          <div className="pointer-events-auto w-72 h-full bg-zinc-900/95 backdrop-blur border-l border-zinc-800 shadow-2xl p-5 overflow-y-auto text-xs font-mono text-zinc-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2"><Brain size={16} className="text-purple-400" /> Brain State</h2>
              <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="text-zinc-500 text-[10px] uppercase mb-1">Circadian Phase</div>
                <div className="text-sm capitalize">{circadian} {hour < 12 ? "🌅" : hour < 18 ? "☀️" : "🌙"}</div>
              </div>

              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="text-zinc-500 text-[10px] uppercase mb-1">Last Warm Water</div>
                <div className="text-sm">{lastSip ? new Date(lastSip).toLocaleTimeString() : "Not logged yet"}</div>
                <div className="text-zinc-500 text-[10px] mt-1">{minutesSince} min ago</div>
              </div>

              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="text-zinc-500 text-[10px] uppercase mb-1">Glymphatic Clearance</div>
                <div className="w-full h-2 bg-zinc-700 rounded-full mt-1">
                  <div className={`h-full rounded-full transition-all ${glymphaticPercent > 60 ? "bg-green-400" : glymphaticPercent > 30 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: glymphaticPercent + "%" }} />
                </div>
                <div className="text-zinc-500 text-[10px] mt-1">{glymphaticPercent}% efficient</div>
              </div>

              <div className="bg-zinc-800 rounded-xl p-3">
                <div className="text-zinc-500 text-[10px] uppercase mb-1">Sleep Window</div>
                <div className="text-sm">{circadian === "night" ? "Optimal: Now 🌙" : "In ~" + (22 - hour) + " hours"}</div>
              </div>

              <button onClick={logSip} className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm transition flex items-center justify-center gap-2">
                <Droplets size={14} /> Log Warm Water Sip
              </button>

              <div className="text-zinc-600 text-[10px] text-center mt-4">
                {sips.length} sips logged today
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}