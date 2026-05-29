"use client";
import CircularProgress from "@/components/CircularProgress";

interface MetricsGridProps {
  brainHealth: number;
  hc: string;
  eyeStrain: number;
  ec: string;
  digestionPhase: number;
  energyLevel: number;
  energyColor: string;
  glymphaticPercent: number;
  vasodilationPercent: number;
}

export function MetricsGrid({
  brainHealth, hc, eyeStrain, ec, digestionPhase, energyLevel, energyColor, glymphaticPercent, vasodilationPercent
}: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-4">
      <CircularProgress value={brainHealth} size={80} strokeWidth={5} color={hc} label="Brain" />
      <CircularProgress value={Math.max(0, 100 - eyeStrain * 10)} size={80} strokeWidth={5} color={ec} label="Eyes" />
      <CircularProgress value={digestionPhase} size={80} strokeWidth={5} color="orange" label="Digestion" />
      <CircularProgress value={energyLevel} size={80} strokeWidth={5} color={energyColor} label="Energy" />
      <CircularProgress value={glymphaticPercent} size={80} strokeWidth={5} color="cyan" label="Glymph" />
      <CircularProgress value={vasodilationPercent} size={80} strokeWidth={5} color="blue" label="Vaso" />
    </div>
  );
}