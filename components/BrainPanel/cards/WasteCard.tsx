"use client";
import { Info } from "lucide-react";

interface WasteCardProps {
  accumulationPercent: number;
  setInfoPopup: (popup: string | null) => void;
}

export function WasteCard({ accumulationPercent, setInfoPopup }: WasteCardProps) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accumulationPercent > 60 ? "bg-red-500/20" : accumulationPercent > 30 ? "bg-yellow-500/20" : "bg-green-500/20"}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <div className="text-zinc-500 text-[13px] uppercase">Waste Accumulation</div>
            <button onClick={() => setInfoPopup("accumulation")} className="text-cyan-400"><Info size={10} /></button>
          </div>
          <div className="w-full h-2 bg-zinc-700 rounded-full mt-1">
            <div className={`h-full rounded-full ${accumulationPercent > 60 ? "bg-red-400" : accumulationPercent > 30 ? "bg-yellow-400" : "bg-green-400"}`} style={{ width: accumulationPercent + "%" }} />
          </div>
          <div className="text-zinc-500 text-[13px] mt-1"><span className="text-zinc-200 font-semibold">{accumulationPercent}%</span> accumulated</div>
          <div className="text-zinc-500 text-[12px] mt-0.5">tau · amyloid-beta · ROS</div>
        </div>
      </div>
    </div>
  );
}