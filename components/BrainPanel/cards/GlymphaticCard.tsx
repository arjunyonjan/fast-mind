"use client";
import { Info } from "lucide-react";

interface GlymphaticCardProps {
  glymphaticPercent: number;
  setInfoPopup: (popup: string | null) => void;
}

export function GlymphaticCard({ glymphaticPercent, setInfoPopup }: GlymphaticCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <div className="text-gray-500 dark:text-zinc-500 text-[13px] uppercase">Glymphatic</div>
            <button onClick={() => setInfoPopup("glymphatic")} className="text-cyan-400"><Info size={10} /></button>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full mt-1">
            <div className={`h-full rounded-full ${glymphaticPercent > 60 ? "bg-green-400" : glymphaticPercent > 30 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: glymphaticPercent + "%" }} />
          </div>
          <div className="text-gray-500 dark:text-zinc-500 text-[13px] mt-1"><span className="text-gray-800 dark:text-zinc-200 font-semibold">{glymphaticPercent}%</span> efficient</div>
          <div className="mt-1"><span className="text-[12px] px-1.5 py-0.5 rounded-md bg-green-500/10 text-green-400">Brain waste clearance</span></div>
        </div>
      </div>
    </div>
  );
}