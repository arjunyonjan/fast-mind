"use client";
import { X } from "lucide-react";

interface InfoPopupProps {
  infoPopup: string | null;
  setInfoPopup: (popup: string | null) => void;
}

export function InfoPopup({ infoPopup, setInfoPopup }: InfoPopupProps) {
  if (!infoPopup) return null;
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setInfoPopup(null)}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-cyan-400">{infoPopup}</h3>
          <button onClick={() => setInfoPopup(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="w-full h-56 bg-zinc-800 rounded-xl mb-4 flex items-center justify-center text-zinc-600 text-sm">Image placeholder</div>
        <p className="text-zinc-400 leading-relaxed">Detailed science explanation coming soon.</p>
        <button onClick={() => setInfoPopup(null)} className="mt-6 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-base transition">Got it</button>
      </div>
    </div>
  );
}