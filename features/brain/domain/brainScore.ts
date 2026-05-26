// Pure function for calculating brain health score
// All penalties and bonuses in one place — testable, tweakable

export interface BrainScoreInputs {
  accumulationPercent: number;
  glymphaticPercent: number;
  lifestyle: string[];
  mood: string | null;
  circadian: string;
  isAwake: boolean;
  sunlight: boolean;
  social: boolean;
  learning: boolean;
  breathwork: boolean;
  eyeStrain: number;
}

export function calcBrainHealth(inputs: BrainScoreInputs): number {
  let health = 100;
  const { accumulationPercent, glymphaticPercent, lifestyle, mood, circadian, isAwake, sunlight, social, learning, breathwork, eyeStrain } = inputs;

  // Accumulation penalties
  if (accumulationPercent > 60) health -= 25;
  else if (accumulationPercent > 30) health -= 10;

  // Glymphatic penalties
  if (glymphaticPercent < 30) health -= 20;
  else if (glymphaticPercent < 60) health -= 10;

  // Lifestyle penalties
  if (lifestyle.includes("less sleep")) health -= 15;
  if (lifestyle.includes("junk food")) health -= 10;
  if (lifestyle.includes("alcohol")) health -= 15;
  if (lifestyle.includes("no exercise")) health -= 10;

  // Mood penalties
  if (mood === "depressed") health -= 20;
  if (mood === "angry") health -= 15;
  if (mood === "anxious") health -= 10;
  if (mood === "lonely") health -= 25;

  // Circadian
  if (circadian === "NIGHT" && isAwake) health -= 35;
  if (circadian === "NIGHT" && !isAwake) health += 10;
  if (circadian !== "NIGHT" && !isAwake) health -= 5;

  // Boosters
  if (sunlight) health += 8;
  if (social) health += 10;
  if (learning) health += 7;
  if (breathwork) health += 6;

  // Eye strain
  health -= eyeStrain * 3;
  if (circadian === "NIGHT" && !isAwake && eyeStrain >= 5) health += 5;

  return Math.max(0, Math.min(100, health));
}