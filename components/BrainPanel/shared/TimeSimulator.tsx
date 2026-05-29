"use client";

interface TimeSimulatorProps {
  isLive: boolean;
  simHour: number | null;
  hour: number;
  toggleLive: () => void;
  setSimHour: (hour: number | null) => void;
}

export function TimeSimulator({ isLive, simHour, hour, toggleLive, setSimHour }: TimeSimulatorProps) {
  return (
    <div className="mt-3 pt-2 border-t border-zinc-800">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] text-zinc-500">Time Sim</span>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-zinc-500">SIM</span>
          <div onClick={toggleLive} className={`w-10 h-5 rounded-full relative cursor-pointer transition ${isLive ? "bg-green-500" : "bg-yellow-500"}`}>
            <div className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition ${isLive ? "left-5" : "left-0.5"}`} />
          </div>
          <span className="text-[9px] text-zinc-500">LIVE</span>
        </div>
      </div>
      {!isLive && (
        <input
          type="range"
          min="6"
          max="29"
          value={simHour ?? (hour < 6 ? hour + 24 : hour)}
          onChange={e => setSimHour(parseInt(e.target.value))}
          className="w-full h-1 accent-cyan-500"
        />
      )}
      <div className="flex justify-between text-[8px] text-zinc-600">
        <span>6a</span><span>12p</span><span>6p</span><span>12a</span><span>6a</span>
      </div>
    </div>
  );
}