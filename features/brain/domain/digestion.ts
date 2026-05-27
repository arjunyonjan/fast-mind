// Pure functions for digestion/energy calculations
export function calcDigestionPhase(hoursSinceLastMeal: number): number {
  if (hoursSinceLastMeal <= 0.5) return 10;     // just ate
  if (hoursSinceLastMeal <= 1) return 30;        // digesting
  if (hoursSinceLastMeal <= 3) return 60;        // peak digestion
  if (hoursSinceLastMeal <= 5) return 80;        // mostly done
  if (hoursSinceLastMeal <= 8) return 90;        // fasted
  return 100;                                    // deep fasted
}

export function calcEnergyLevel(hour: number, isAwake: boolean, hoursSinceMeal: number): number {
  if (!isAwake) return 5;
  const circadian = hour >= 6 && hour < 12 ? 'MORNING' : hour >= 12 && hour < 18 ? 'AFTERNOON' : hour >= 18 && hour < 22 ? 'EVENING' : 'NIGHT';
  let base = circadian === 'MORNING' ? 80 : circadian === 'AFTERNOON' ? 70 : circadian === 'EVENING' ? 50 : 20;
  // Post-meal energy dip
  if (hoursSinceMeal < 2) base -= 20;
  // Fasted energy boost
  if (hoursSinceMeal > 6) base += 10;
  return Math.max(0, Math.min(100, base));
}
