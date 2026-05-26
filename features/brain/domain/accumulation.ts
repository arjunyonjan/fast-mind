// Pure functions for waste accumulation calculations

export function calcMoodModifier(mood: string | null): number {
  if (mood === "sad" || mood === "depressed") return 1.3;
  if (mood === "anxious") return 1.2;
  if (mood === "angry") return 1.4;
  if (mood === "lonely") return 1.5;
  if (mood === "happy") return 0.8;
  return 1.0;
}

export function calcLifestyleModifier(lifestyle: string[]): number {
  return 1 + lifestyle.length * 0.15;
}

export function calcHoursSince6AM(hour: number, minutes: number): number {
  return (hour >= 6 ? hour - 6 : hour + 18) + minutes / 60;
}

export function calcNaturalAccumulation(hour: number, minutes: number, moodModifier: number, lifestyleModifier: number): number {
  const h6 = calcHoursSince6AM(hour, minutes);
  return Math.min(100, h6 * 5.5 * moodModifier * lifestyleModifier);
}

export function calcAccumulation(natural: number, totalClearance: number): number {
  return Math.round(natural * (1 - totalClearance));
}