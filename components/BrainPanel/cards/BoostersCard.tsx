"use client";
import { Sun, Users, BookOpen, Wind, Check } from "lucide-react";
import CollapsibleCard from "./CollapsibleCard";

interface BoostersCardProps {
  sunlight: boolean;
  social: boolean;
  learning: boolean;
  breathwork: boolean;
  collapsedCards: string[];
  toggleCard: (id: string) => void;
  toggleSunlight: () => void;
  toggleSocial: () => void;
  toggleLearning: () => void;
  toggleBreathwork: () => void;
}

export function BoostersCard({ sunlight, social, learning, breathwork, collapsedCards, toggleCard, toggleSunlight, toggleSocial, toggleLearning, toggleBreathwork }: BoostersCardProps) {
  const boosters = [
    { id: "sunlight", icon: <Sun size={16} />, label: "Sunlight", active: sunlight, action: toggleSunlight, bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30", iconBg: "bg-amber-500/20" },
    { id: "social", icon: <Users size={16} />, label: "Social", active: social, action: toggleSocial, bg: "bg-sky-500/15", text: "text-sky-400", border: "border-sky-500/30", iconBg: "bg-sky-500/20" },
    { id: "learning", icon: <BookOpen size={16} />, label: "Learning", active: learning, action: toggleLearning, bg: "bg-violet-500/15", text: "text-violet-400", border: "border-violet-500/30", iconBg: "bg-violet-500/20" },
    { id: "breathwork", icon: <Wind size={16} />, label: "Breathwork", active: breathwork, action: toggleBreathwork, bg: "bg-teal-500/15", text: "text-teal-400", border: "border-teal-500/30", iconBg: "bg-teal-500/20" },
  ];

  return (
    <CollapsibleCard id="boosters" title="Daily Boosters" icon={null} iconBg="" collapsed={collapsedCards.includes("boosters")} onToggle={() => toggleCard("boosters")}>
      <div className="grid grid-cols-2 gap-1.5">
        {boosters.map(item => (
          <button key={item.id} onClick={item.action} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium transition border ${item.active ? `${item.bg} ${item.border} ${item.text}` : "bg-zinc-700/30 border-zinc-700/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${item.active ? item.iconBg : "bg-zinc-700/50"}`}>{item.icon}</div>
            <div className="flex items-center gap-1.5">{item.label}{item.active && <Check size={12} strokeWidth={3} />}</div>
          </button>
        ))}
      </div>
    </CollapsibleCard>
  );
}