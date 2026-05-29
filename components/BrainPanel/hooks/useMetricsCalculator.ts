"use client";
import { useEffect, useRef } from "react";
import { calcTotalClearance } from "@/features/brain/domain/clearance";

export function useMetricsCalculator(
  lastSip: string | null,
  isLive: boolean,
  simHour: number | null,
  mood: string | null,
  lifestyle: string[],
  isAwake: boolean,
  sunlight: boolean,
  social: boolean,
  learning: boolean,
  breathwork: boolean,
  accumulationPercent: number,
  setMinutesSince: (n: number) => void,
  setGlymphaticPercent: (n: number) => void,
  setVasodilationPercent: (n: number) => void,
  setAccumulationPercent: (n: number) => void,
  setEyeStrain: (n: number) => void,
  setBrainHealth: (n: number) => void,
  setNotified: (n: boolean) => void,
  notified: boolean
) {
  const simHourRef = useRef(simHour);
  useEffect(() => { simHourRef.current = simHour; }, [simHour]);

  useEffect(() => {
    if (!lastSip) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - new Date(lastSip).getTime()) / 60000);
      setMinutesSince(diff);
      const g = Math.min(100, Math.max(0, 100 - diff * 2));
      setGlymphaticPercent(g);
      setVasodilationPercent(Math.min(100, Math.max(0, 100 - diff * 1.5)));
      const hour = isLive ? new Date().getHours() : (simHourRef.current ?? new Date().getHours());
      const circadian = hour >= 6 && hour < 12 ? "MORNING" : hour >= 12 && hour < 18 ? "AFTERNOON" : hour >= 18 && hour < 22 ? "EVENING" : "NIGHT";
      const h6 = (hour >= 6 ? hour - 6 : hour + 18) + new Date().getMinutes()/60;
      let mm = 1;
      if (mood === "sad" || mood === "depressed") mm = 1.3;
      if (mood === "anxious") mm = 1.2;
      if (mood === "angry") mm = 1.4;
      if (mood === "lonely") mm = 1.5;
      if (mood === "happy") mm = 0.8;
      const lm = 1 + lifestyle.length * 0.15;
      const nat = Math.min(100, h6 * 5.5 * mm * lm);
      const hoursSlept = (circadian === "NIGHT" && !isAwake) ? Math.min(8, (hour >= 22 ? hour - 22 : hour + 2)) : 0;
      const tc = calcTotalClearance(hoursSlept, g);
      setAccumulationPercent(Math.round(nat * (1 - tc)));
      const isSleeping = (circadian === "NIGHT" && !isAwake);
      const hoursAwake = isSleeping ? 0 : (hour < 6 ? hour + 18 : hour - 6);
      const be = Math.min(10, Math.floor(hoursAwake * 0.8));
      const sr = (circadian === "NIGHT" && !isAwake) ? Math.min(10, hoursSlept * 1.5) : 0;
      const currentEyeStrain = Math.max(0, be - sr);
      setEyeStrain(currentEyeStrain);
      let health = 100;
      if (accumulationPercent > 60) health -= 25; else if (accumulationPercent > 30) health -= 10;
      if (g < 30) health -= 20; else if (g < 60) health -= 10;
      if (lifestyle.includes("Less Sleep")) health -= 15;
      if (lifestyle.includes("Processed / Junk Food")) health -= 12;
      if (lifestyle.includes("High Sugar")) health -= 8;
      if (lifestyle.includes("Caffeine")) health -= 5;
      if (lifestyle.includes("Alcohol")) health -= 15;
      if (lifestyle.includes("Smoking")) health -= 20;
      if (lifestyle.includes("No Exercise")) health -= 10;
      if (lifestyle.includes("Sitting Too Long")) health -= 8;
      if (lifestyle.includes("Poor Posture")) health -= 5;
      if (lifestyle.includes("Overworking")) health -= 12;
      if (lifestyle.includes("Endless Social Media")) health -= 10;
      if (lifestyle.includes("High Stress")) health -= 12;
      if (mood === "depressed") health -= 20;
      if (mood === "angry") health -= 15;
      if (mood === "anxious") health -= 10;
      if (mood === "lonely") health -= 25;
      if (circadian === "NIGHT" && isAwake) health -= 35;
      if (circadian === "NIGHT" && !isAwake) health += 10;
      if (circadian !== "NIGHT" && !isAwake) health -= 5;
      if (sunlight) health += 8;
      if (social) health += 10;
      if (learning) health += 7;
      if (breathwork) health += 6;
      health -= currentEyeStrain * 3;
      if (circadian === "NIGHT" && !isAwake && currentEyeStrain >= 5) health += 5;
      setBrainHealth(Math.max(0, Math.min(100, health)));
      if (diff >= 45 && !notified && Notification.permission === "granted") {
        new Notification("Warm Water Reminder", { body: "45 min since your last sip." });
        setNotified(true);
      }
      if (diff < 45) setNotified(false);
    }, 1000);
    return () => clearInterval(interval);
  }, [lastSip, mood, lifestyle, isAwake, sunlight, social, learning, breathwork, accumulationPercent, isLive, simHour, notified, setMinutesSince, setGlymphaticPercent, setVasodilationPercent, setAccumulationPercent, setEyeStrain, setBrainHealth, setNotified]);
}