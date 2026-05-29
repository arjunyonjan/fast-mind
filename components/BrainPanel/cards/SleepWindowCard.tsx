"use client";

interface SleepWindowCardProps {
  circadian: string;
  hour: number;
}

export function SleepWindowCard({ circadian, hour }: SleepWindowCardProps) {
  return (
    <div className="bg-zinc-800 rounded-xl p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-zinc-500 text-[13px] uppercase">Sleep Window</div>
          <div className="text-sm font-semibold text-zinc-200">{circadian === "NIGHT" ? "Optimal: Now" : "In ~" + (22 - hour) + " hours"}</div>
        </div>
      </div>
    </div>
  );
}