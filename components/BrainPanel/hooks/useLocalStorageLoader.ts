"use client";
import { useEffect } from "react";

export function useLocalStorageLoader(
  setSips: (sips: { time: string }[]) => void,
  setLastSip: (time: string | null) => void,
  setMood: (mood: string | null) => void,
  setLifestyle: (lifestyle: string[]) => void,
  setIsAwake: (awake: boolean) => void,
  setSunlight: (val: boolean) => void,
  setSocial: (val: boolean) => void,
  setLearning: (val: boolean) => void,
  setBreathwork: (val: boolean) => void,
  setLastMeal: (meal: string | null) => void,
  setPanelWidth: (width: number) => void,
  setOpen: (open: boolean) => void,
  setInitialized: (init: boolean) => void
) {
  useEffect(() => {
    if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission();
    try {
      const s = localStorage.getItem("brain-sips");
      if (s) { const p = JSON.parse(s); setSips(p); if (p.length) setLastSip(p[p.length-1].time); }
      const m = localStorage.getItem("brain-mood"); if (m) setMood(m);
      const l = localStorage.getItem("brain-lifestyle");
      if (l) {
        const oldItems: string[] = JSON.parse(l);
        const map: Record<string, string> = { "overeat":"Overeat","junk food":"Processed / Junk Food","junk":"Processed / Junk Food","processed food":"Processed / Junk Food","processed":"Processed / Junk Food","high sugar":"High Sugar","caffeine":"Caffeine","alcohol":"Alcohol","smoking":"Smoking","less sleep":"Less Sleep","high stress":"High Stress","no exercise":"No Exercise","sitting too long":"Sitting Too Long","poor posture":"Poor Posture","overworking":"Overworking","endless social media":"Endless Social Media" };
        const migrated: string[] = oldItems.map((i: string) => map[i] || i);
        const unique: string[] = Array.from(new Set(migrated));
        setLifestyle(unique);
        localStorage.setItem("brain-lifestyle", JSON.stringify(unique));
      }
      const awake = localStorage.getItem("brain-awake"); if (awake === "false") setIsAwake(false);
      const sl = localStorage.getItem("brain-sunlight"); if (sl === "true") setSunlight(true);
      const soc = localStorage.getItem("brain-social"); if (soc === "true") setSocial(true);
      const learn = localStorage.getItem("brain-learning"); if (learn === "true") setLearning(true);
      const breath = localStorage.getItem("brain-breathwork"); if (breath === "true") setBreathwork(true);
      const lm = localStorage.getItem("brain-last-meal"); if (lm) setLastMeal(lm);
      const pw = localStorage.getItem("brain-panel-width"); if (pw) setPanelWidth(parseInt(pw));
      const op = localStorage.getItem("brain-open"); if (op === "true") setOpen(true);
      if (s || m) setInitialized(true);
    } catch {}
  }, []);
}