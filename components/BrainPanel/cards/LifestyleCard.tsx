"use client";
import { Activity, Check } from "lucide-react";
import CollapsibleCard from "./CollapsibleCard";

const LIFESTYLE_ITEMS = ["Less Sleep", "High Stress", "No Exercise", "Processed / Junk Food", "Alcohol", "Caffeine", "Smoking", "Overworking"];

interface LifestyleCardProps {
  lifestyle: string[];
  collapsedCards: string[];
  toggleCard: (id: string) => void;
  toggleLifestyle: (item: string) => void;
}

export function LifestyleCard({ lifestyle, collapsedCards, toggleCard, toggleLifestyle }: LifestyleCardProps) {
  return (
    <CollapsibleCard id="lifestyle" title="Lifestyle" icon={<Activity size={18} className="text-purple-400" />} iconBg="bg-purple-500/20" collapsed={collapsedCards.includes("lifestyle")} onToggle={() => toggleCard("lifestyle")}>
      <div className="grid grid-cols-2 gap-1.5">
        {LIFESTYLE_ITEMS.map(item => {
          const on = lifestyle.includes(item);
          return (
            <button key={item} onClick={() => toggleLifestyle(item)} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] transition border ${on ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-zinc-700/30 border-zinc-700/50 text-zinc-500"}`}>
              <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${on ? "bg-cyan-500" : "border border-zinc-600"}`}>{on && <Check size={10} className="text-white" />}</div>
              {item}
            </button>
          );
        })}
      </div>
    </CollapsibleCard>
  );
}