"use client";
import { Heart } from "lucide-react";
import CollapsibleCard from "./CollapsibleCard";

const MOODS = [
  { id: "happy", emoji: "😊", activeBg: "bg-sky-500/20", activeText: "text-sky-400", dot: "bg-sky-400" },
  { id: "neutral", emoji: "😐", activeBg: "bg-emerald-500/20", activeText: "text-emerald-400", dot: "bg-emerald-400" },
  { id: "sad", emoji: "😢", activeBg: "bg-amber-500/20", activeText: "text-amber-400", dot: "bg-amber-400" },
  { id: "anxious", emoji: "😰", activeBg: "bg-orange-500/20", activeText: "text-orange-400", dot: "bg-orange-400" },
  { id: "angry", emoji: "😠", activeBg: "bg-red-500/20", activeText: "text-red-400", dot: "bg-red-400" },
  { id: "depressed", emoji: "🌑", activeBg: "bg-rose-900/30", activeText: "text-rose-400", dot: "bg-rose-500" },
  { id: "lonely", emoji: "🥺", activeBg: "bg-violet-500/20", activeText: "text-violet-400", dot: "bg-violet-400" },
];

interface MoodCardProps {
  mood: string | null;
  collapsedCards: string[];
  toggleCard: (id: string) => void;
  saveMood: (m: string) => void;
}

export function MoodCard({ mood, collapsedCards, toggleCard, saveMood }: MoodCardProps) {
  return (
    <CollapsibleCard id="mood" title="Mood" icon={<Heart size={18} className="text-pink-400" />} iconBg="bg-pink-500/20" collapsed={collapsedCards.includes("mood")} onToggle={() => toggleCard("mood")}>
      <div className="flex gap-1.5 flex-wrap">
        {MOODS.map(m => (
          <button key={m.id} onClick={() => saveMood(m.id)} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[13px] capitalize transition ${mood === m.id ? `${m.activeBg} ${m.activeText} ring-1 ring-white/10` : "bg-zinc-700/50 text-zinc-400 hover:bg-zinc-700"}`}>
            <span className="text-base">{m.emoji}</span>{m.id}
          </button>
        ))}
      </div>
    </CollapsibleCard>
  );
}