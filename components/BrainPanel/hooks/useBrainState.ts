"use client";
import { useState, useEffect } from "react";
import { BrainState } from "../types";

export function useBrainState(): BrainState & {
  setOpen: (v: boolean) => void;
  setSips: React.Dispatch<React.SetStateAction<{ time: string }[]>>;
  setLastSip: React.Dispatch<React.SetStateAction<string | null>>;
  setLastMeal: React.Dispatch<React.SetStateAction<string | null>>;
  setMinutesSince: React.Dispatch<React.SetStateAction<number>>;
  setCurrentTime: React.Dispatch<React.SetStateAction<string>>;
  setVasodilationPercent: React.Dispatch<React.SetStateAction<number>>;
  setGlymphaticPercent: React.Dispatch<React.SetStateAction<number>>;
  setAccumulationPercent: React.Dispatch<React.SetStateAction<number>>;
  setEyeStrain: React.Dispatch<React.SetStateAction<number>>;
  setBrainHealth: React.Dispatch<React.SetStateAction<number>>;
  setMood: React.Dispatch<React.SetStateAction<string | null>>;
  setLifestyle: React.Dispatch<React.SetStateAction<string[]>>;
  setExerciseLog: React.Dispatch<React.SetStateAction<{ exercise: string; time: string }[]>>;
  setIsAwake: React.Dispatch<React.SetStateAction<boolean>>;
  setSunlight: React.Dispatch<React.SetStateAction<boolean>>;
  setSocial: React.Dispatch<React.SetStateAction<boolean>>;
  setLearning: React.Dispatch<React.SetStateAction<boolean>>;
  setBreathwork: React.Dispatch<React.SetStateAction<boolean>>;
  setSimHour: React.Dispatch<React.SetStateAction<number | null>>;
  setIsLive: React.Dispatch<React.SetStateAction<boolean>>;
  setPanelWidth: React.Dispatch<React.SetStateAction<number>>;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  setInitialized: React.Dispatch<React.SetStateAction<boolean>>;
  setCollapsedCards: React.Dispatch<React.SetStateAction<string[]>>;
} {
  const [open, setOpen] = useState(false);
  const [sips, setSips] = useState<{ time: string }[]>([]);
  const [lastSip, setLastSip] = useState<string | null>(null);
  const [lastMeal, setLastMeal] = useState<string | null>(null);
  const [minutesSince, setMinutesSince] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const [vasodilationPercent, setVasodilationPercent] = useState(100);
  const [glymphaticPercent, setGlymphaticPercent] = useState(0);
  const [accumulationPercent, setAccumulationPercent] = useState(0);
  const [eyeStrain, setEyeStrain] = useState(0);
  const [brainHealth, setBrainHealth] = useState(100);
  const [mood, setMood] = useState<string | null>(null);
  const [lifestyle, setLifestyle] = useState<string[]>([]);
  const [exerciseLog, setExerciseLog] = useState<{ exercise: string; time: string }[]>([]);
  const [isAwake, setIsAwake] = useState(true);
  const [sunlight, setSunlight] = useState(false);
  const [social, setSocial] = useState(false);
  const [learning, setLearning] = useState(false);
  const [breathwork, setBreathwork] = useState(false);
  const [simHour, setSimHour] = useState<number | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [panelWidth, setPanelWidth] = useState(360);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [collapsedCards, setCollapsedCards] = useState<string[]>(() => {
    try { const s = localStorage.getItem("brain-collapsed"); return s ? JSON.parse(s) : []; } catch { return []; }
  });

  return {
    open, setOpen, sips, setSips, lastSip, setLastSip, lastMeal, setLastMeal,
    minutesSince, setMinutesSince, currentTime, setCurrentTime,
    vasodilationPercent, setVasodilationPercent, glymphaticPercent, setGlymphaticPercent,
    accumulationPercent, setAccumulationPercent, eyeStrain, setEyeStrain,
    brainHealth, setBrainHealth, mood, setMood, lifestyle, setLifestyle,
    exerciseLog, setExerciseLog, isAwake, setIsAwake, sunlight, setSunlight,
    social, setSocial, learning, setLearning, breathwork, setBreathwork,
    simHour, setSimHour, isLive, setIsLive, panelWidth, setPanelWidth,
    isFullscreen, setIsFullscreen, initialized, setInitialized,
    collapsedCards, setCollapsedCards,
  };
}