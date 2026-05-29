// clearance.ts
export function calcGlymphatic(minutesSinceSip: number): number { return Math.min(100, Math.max(0, 100 - minutesSinceSip * 2)); }
export function calcVasodilation(minutesSinceSip: number): number { return Math.min(100, Math.max(0, 100 - minutesSinceSip * 1.5)); }
export function calcTotalClearance(hoursSlept: number, glymphaticPercent: number): number { return (hoursSlept > 0 ? hoursSlept * 0.06 : 0) + (glymphaticPercent / 100) * 0.05; }