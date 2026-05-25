// Pure functions for glymphatic clearance calculations
// No React, no hooks, no localStorage — just math

export function calcGlymphatic(minutesSinceSip: number): number {
  return Math.min(100, Math.max(0, 100 - minutesSinceSip * 2));
}

export function calcVasodilation(minutesSinceSip: number): number {
  return Math.min(100, Math.max(0, 100 - minutesSinceSip * 1.5));
}

export function calcSleepClearance(hoursSlept: number): number {
  return hoursSlept > 0 ? hoursSlept * 0.06 : 0;
}

export function calcSipClearance(glymphaticPercent: number): number {
  return (glymphaticPercent / 100) * 0.05;
}

export function calcTotalClearance(hoursSlept: number, glymphaticPercent: number): number {
  return calcSleepClearance(hoursSlept) + calcSipClearance(glymphaticPercent);
}