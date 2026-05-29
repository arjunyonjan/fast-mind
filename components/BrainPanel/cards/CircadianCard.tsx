"use client";

interface CircadianCardProps {
  currentTime: string;
  circadian: string;
  isAwake: boolean;
  toggleAwake: () => void;
}

export function CircadianCard({ currentTime, circadian, isAwake, toggleAwake }: CircadianCardProps) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-zinc-500 text-[13px] uppercase">Circadian</div>
          <div className="text-lg font-semibold text-cyan-400">{currentTime}</div>
          <div className="text-[13px] text-zinc-500">{circadian}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[13px] text-zinc-500">Sleep</span>
            <div onClick={toggleAwake} className={`w-10 h-5 rounded-full relative cursor-pointer transition ${isAwake ? "bg-yellow-500" : "bg-indigo-500"}`}>
              <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition ${isAwake ? "left-5" : "left-0.5"}`} />
            </div>
            <span className="text-[13px] text-zinc-500">Awake</span>
          </div>
        </div>
      </div>
    </div>
  );
}