export interface BrainState {
  open: boolean;
  sips: { time: string }[];
  lastSip: string | null;
  lastMeal: string | null;
  minutesSince: number;
  currentTime: string;
  vasodilationPercent: number;
  glymphaticPercent: number;
  accumulationPercent: number;
  eyeStrain: number;
  brainHealth: number;
  mood: string | null;
  lifestyle: string[];
  exerciseLog: { exercise: string; time: string }[];
  isAwake: boolean;
  sunlight: boolean;
  social: boolean;
  learning: boolean;
  breathwork: boolean;
  simHour: number | null;
  isLive: boolean;
  panelWidth: number;
  isFullscreen: boolean;
  initialized: boolean;
  collapsedCards: string[];
}