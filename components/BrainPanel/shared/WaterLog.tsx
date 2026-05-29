"use client";
import { Droplets } from "lucide-react";

interface WaterLogProps {
  lastSip: string | null;
  minutesSince: number;
  logSip: () => void;
}

export function WaterLog({ lastSip, minutesSince, logSip }: WaterLogProps) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lastSip ? "bg-cyan-500/20" : "bg-zinc-700"}`}>
          <Droplets size={18} className={lastSip ? "text-cyan-400" : "text-zinc-500"} />
        </div>
        <div className="flex-1">
          <div className="text-zinc-500 text-[13px] uppercase">Last Warm Water</div>
          <div className="text-sm font-semibold text-white">{lastSip ? new Date(lastSip).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "Not logged"}</div>
          <div className="flex items-center gap-1 text-[13px]">
            <span className={`w-1.5 h-1.5 rounded-full ${minutesSince < 20 ? "bg-green-400" : minutesSince < 45 ? "bg-yellow-400" : "bg-red-400"}`} />
            {minutesSince} min ago
          </div>
        </div>
        <button onClick={logSip} className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-400 text-sm transition">Log</button>
      </div>
    </div>
  );
}