"use client";
import { useState, useEffect } from "react";
import { Clock, Zap, Check, AlertCircle, Coffee } from "lucide-react";

const ALL_TRAPS = [
  { id: 1, name: "Social Media", emoji: "📱", waste: "3-5 hrs", tip: "Delete apps" },
  { id: 2, name: "Video Binge", emoji: "🎬", waste: "2-4 hrs", tip: "1.5x speed" },
  { id: 3, name: "Doom Scrolling", emoji: "📰", waste: "1-3 hrs", tip: "10 min timer" },
  { id: 4, name: "Mobile Games", emoji: "🎮", waste: "2-6 hrs", tip: "Delete 1 game" },
  { id: 5, name: "Online Shopping", emoji: "🛒", waste: "1-2 hrs", tip: "24hr wait" },
  { id: 6, name: "Overthinking", emoji: "🤔", waste: "2-4 hrs", tip: "5 second rule" },
  { id: 7, name: "Perfectionism", emoji: "🎯", waste: "3-5 hrs", tip: "Done > perfect" },
  { id: 8, name: "Task-Switching", emoji: "🔄", waste: "2-3 hrs", tip: "Single task" },
  { id: 9, name: "Social Chatting", emoji: "💬", waste: "2-4 hrs", tip: "DND mode" },
  { id: 10, name: "Tomorrow Syndrome", emoji: "⏰", waste: "∞", tip: "Start 2 min now" }
];

export default function ProcrastinationModule() {
  const [task, setTask] = useState("");
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (running && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && running) {
      setRunning(false);
      setSessions(s => s + 1);
    }
    return () => clearInterval(interval);
  }, [running, timer]);

  const startFocus = () => {
    if (task.trim()) { setTimer(25 * 60); setRunning(true); setSelected(null); }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-amber-400" />
          <span className="text-xs font-semibold text-amber-400 uppercase">Procrastination Killer</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{sessions} focus sessions</span>
        </div>
      </div>

      {/* All 10 traps in 2 rows of 5 */}
      <div className="mb-3 p-2 bg-amber-500/5 rounded-lg border border-amber-500/10">
        <div className="text-[9px] font-semibold text-amber-400 mb-2">⚠️ Top 10 Procrastination Traps (Click any)</div>
        <div className="grid grid-cols-5 gap-1">
          {ALL_TRAPS.map(trap => (
            <button key={trap.id} onClick={() => setSelected(selected === trap.id ? null : trap.id)} className={`text-center p-1.5 rounded-lg transition-all ${selected === trap.id ? "bg-amber-500/40 scale-105 ring-1 ring-amber-400" : "bg-zinc-800/50 hover:bg-zinc-700/50"}`}>
              <span className="text-lg">{trap.emoji}</span>
              <div className="text-[9px] text-amber-300 font-medium mt-0.5">{trap.name}</div>
              <div className="text-[7px] text-zinc-400">~{trap.waste}</div>
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-2 p-2 bg-amber-500/20 rounded-lg text-[11px] text-amber-200 text-center font-medium animate-pulse">
            💡 {ALL_TRAPS.find(t => t.id === selected)?.tip}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input type="text" value={task} onChange={(e) => setTask(e.target.value)} placeholder="What are you avoiding right now?" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition" />
        <div className="flex items-center gap-3">
          <div className="flex-1 text-center">
            <div className="text-2xl font-mono font-bold text-amber-400">{formatTime(timer)}</div>
            <div className="text-[10px] text-zinc-500">25 min focus</div>
          </div>
          {!running && timer === 0 ? (
            <button onClick={startFocus} disabled={!task.trim()} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-lg text-sm font-medium text-white flex items-center gap-2"><Zap size={14} /> Start</button>
          ) : running ? (
            <button onClick={() => setRunning(false)} className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30">Stop</button>
          ) : (
            <button onClick={() => { setTimer(25 * 60); setTask(""); setSelected(null); }} className="px-4 py-2 bg-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-600">Reset</button>
          )}
        </div>
        <div className="flex gap-3 text-[10px] text-zinc-500 justify-center pt-1">
          <span className="flex items-center gap-1"><Check size={10} /> 2-min rule</span>
          <span className="flex items-center gap-1"><AlertCircle size={10} /> Eat the frog</span>
          <span className="flex items-center gap-1"><Coffee size={10} /> Pomodoro</span>
        </div>
      </div>
    </div>
  );
}