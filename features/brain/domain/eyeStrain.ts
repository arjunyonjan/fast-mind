// Pure functions for eye strain calculations

export function calcHoursAwake(hour: number, isSleeping: boolean): number {
  if (isSleeping) return 0;
  return Math.min(18, hour < 6 ? hour + 18 : hour - 6);
}

export function calcBaseEyeStrain(hoursAwake: number): number {
  return Math.min(10, Math.floor(hoursAwake * 0.8));
}

export function calcEyeRecovery(hoursSlept: number, isSleeping: boolean): number {
  return isSleeping ? Math.min(10, hoursSlept * 1.5) : 0;
}

export function calcEyeStrain(hour: number, isSleeping: boolean, hoursSlept: number): number {
  const hoursAwake = calcHoursAwake(hour, isSleeping);
  const base = calcBaseEyeStrain(hoursAwake);
  const recovery = calcEyeRecovery(hoursSlept, isSleeping);
  return Math.max(0, base - recovery);
}