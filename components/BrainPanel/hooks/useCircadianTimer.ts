"use client";
import { useEffect } from "react";

export function useCircadianTimer(
  isLive: boolean,
  simHour: number | null,
  setCurrentTime: (time: string) => void
) {
  useEffect(() => {
    const clock = setInterval(() => {
      const d = new Date();
      const h = isLive ? d.getHours() : (simHour ?? d.getHours());
      d.setHours(h, isLive ? d.getMinutes() : 0, isLive ? d.getSeconds() : 0);
      setCurrentTime(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }));
    }, 1000);
    return () => clearInterval(clock);
  }, [isLive, simHour, setCurrentTime]);
}