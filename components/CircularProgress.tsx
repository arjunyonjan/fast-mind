"use client"; import { ReactNode, useEffect, useState } from "react";
export default function CircularProgress({ value, size = 96, strokeWidth = 6, label, color = "cyan", icon }: any) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(100, Math.max(0, value));
  useEffect(() => { setOffset(circumference - (percent / 100) * circumference); }, [percent, circumference]);
  const getColor = () => { if (color === "green") return "stroke-green-500"; if (color === "yellow") return "stroke-yellow-500"; if (color === "red") return "stroke-red-500"; return "stroke-cyan-500"; };
  return (<div className="flex flex-col items-center" style={{ width: size, height: size + 40 }}><div className="relative" style={{ width: size, height: size }}><svg className="transform -rotate-90 w-full h-full"><circle cx={size/2} cy={size/2} r={radius} className="stroke-zinc-800" strokeWidth={strokeWidth} fill="transparent" /><circle cx={size/2} cy={size/2} r={radius} className={`${getColor()} transition-all duration-700`} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" /></svg><div className="absolute inset-0 flex items-center justify-center">{icon ? icon : <span className="text-white text-sm font-bold">{Math.round(percent)}%</span>}</div></div>{label && <div className="text-zinc-500 text-[10px] mt-2">{label}</div>}</div>);
}