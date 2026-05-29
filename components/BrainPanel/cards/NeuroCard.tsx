"use client";
import { Droplets } from "lucide-react";
import CollapsibleCard from "./CollapsibleCard";

interface NeuroCardProps {
  sips: { time: string }[];
  exerciseLog: { exercise: string; time: string }[];
  exerciseLoading: string | null;
  collapsedCards: string[];
  toggleCard: (id: string) => void;
  logSip: () => void;
  logMeal: () => void;
  logExercise: (ex: string) => void;
}

export function NeuroCard({ sips, exerciseLog, exerciseLoading, collapsedCards, toggleCard, logSip, logMeal, logExercise }: NeuroCardProps) {
  return (
    <>
      <CollapsibleCard id="neuro" title="Neuro Protection" icon={null} iconBg="" collapsed={collapsedCards.includes("neuro")} onToggle={() => toggleCard("neuro")}>
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-w-sm mx-auto">
          <button onClick={logSip} className={`w-full aspect-square rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 flex flex-col items-center justify-center transition gap-1`}>
            {exerciseLoading === "sip" ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span className="text-lg">💧</span>}
            <span className="text-[10px] text-zinc-400">{exerciseLoading === "sip" ? "Done!" : "Water"}</span>
          </button>
          <button onClick={logMeal} className={`w-full aspect-square rounded-2xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 flex flex-col items-center justify-center transition gap-1`}>
            {exerciseLoading === "meal" ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span className="text-lg">🍽️</span>}
            <span className="text-[10px] text-zinc-400">{exerciseLoading === "meal" ? "Done!" : "Meal"}</span>
          </button>
          <button onClick={() => logExercise("pushups")} className={`w-full aspect-square rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center transition gap-1`}>
            {exerciseLoading === "pushups" ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span className="text-lg">💪</span>}
            <span className="text-[10px] text-zinc-400">{exerciseLoading === "pushups" ? "Done!" : "Pushups"}</span>
          </button>
          <button onClick={() => logExercise("deadhang")} className={`w-full aspect-square rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center transition gap-1`}>
            {exerciseLoading === "deadhang" ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span className="text-lg">🧘</span>}
            <span className="text-[10px] text-zinc-400">{exerciseLoading === "deadhang" ? "Done!" : "Hang"}</span>
          </button>
          <button onClick={() => logExercise("forwardbend")} className={`w-full aspect-square rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center transition gap-1`}>
            {exerciseLoading === "forwardbend" ? <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <span className="text-lg">🙏</span>}
            <span className="text-[10px] text-zinc-400">{exerciseLoading === "forwardbend" ? "Done!" : "Bend"}</span>
          </button>
        </div>
      </CollapsibleCard>
      <div className="text-zinc-600 text-[12px] text-center">{sips.length} sips · {exerciseLog.filter(e => new Date(e.time).toDateString() === new Date().toDateString()).length} exercises today</div>
    </>
  );
}