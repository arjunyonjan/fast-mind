"use client";
import { Info } from "lucide-react";

interface VasodilationCardProps {
  vasodilationPercent: number;
  setInfoPopup: (popup: string | null) => void;
}

export function VasodilationCard({ vasodilationPercent, setInfoPopup }: VasodilationCardProps) {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-cyan-500/20">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10H12V2z"/><circle cx="12" cy="12" r="3"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex justify-between">
            <div className="text-gray-500 dark:text-zinc-500 text-[13px] uppercase">Vasodilation</div>
            <button onClick={() => setInfoPopup("vasodilation")} className="text-cyan-400"><Info size={10} /></button>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-zinc-700 rounded-full mt-1">
            <div className={`h-full rounded-full ${vasodilationPercent > 60 ? "bg-cyan-400" : vasodilationPercent > 30 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: vasodilationPercent + "%" }} />
          </div>
          <div className="text-gray-500 dark:text-zinc-500 text-[13px] mt-1"><span className="text-gray-800 dark:text-zinc-200 font-semibold">{vasodilationPercent}%</span> dilated</div>
          <div className="mt-1"><span className="text-[12px] px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400">Brain blood vessel expansion</span></div>
        </div>
      </div>
    </div>
  );
}