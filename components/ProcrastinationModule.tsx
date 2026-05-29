"use client";

import { useState, useEffect } from "react";
import { Clock, Zap, Check, AlertCircle } from "lucide-react";

export default function ProcrastinationModule() {
  const [activeTask, setActiveTask] = useState("");
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    } else if (timer === 0 && isRunning) {
      setIsRunning(false);
      setSessions(s => s + 1);
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const startFocus = () => {
    if (activeTask.trim()) {
      setTimer(25 * 60);
      setIsRunning(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-4 border border-amber-500/20 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={16} className="text-amber-400" />
        <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Procrastination Killer</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{sessions} focus sessions</span>
      </div>

      <div className="space-y-2">
        <input
          type="text"
          value={activeTask}
          onChange={(e) => setActiveTask(e.target.value)}
          placeholder="What are you avoiding right now?"
          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500 transition"
        />

        <div className="flex items-center gap-3">
          <div className="flex-1 text-center">
            <div className="text-2xl font-mono font-bold text-amber-400">{formatTime(timer)}</div>
            <div className="text-[10px] text-zinc-500">25 min focus</div>
          </div>

          {!isRunning && timer === 0 ? (
            <button
              onClick={startFocus}
              disabled={!activeTask.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white flex items-center gap-2 transition"
            >
              <Zap size={14} /> Start
            </button>
          ) : isRunning ? (
            <button
              onClick={() => setIsRunning(false)}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400 hover:bg-red-500/30 transition"
            >
              Stop
            </button>
          ) : (
            <button
              onClick={() => { setTimer(25 * 60); setActiveTask(""); }}
              className="px-4 py-2 bg-zinc-700 rounded-lg text-sm text-zinc-300 hover:bg-zinc-600 transition"
            >
              Reset
            </button>
          )}
        </div>

        <div className="flex gap-2 text-[10px] text-zinc-500 justify-center pt-1">
          <span className="flex items-center gap-1"><Check size={10} /> 2-min rule</span>
          <span className="flex items-center gap-1"><AlertCircle size={10} /> Eat the frog</span>
        </div>
      </div>
    </div>
  );
}