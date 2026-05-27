"use client";
import { useEffect, useState } from "react";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export default function CircularProgress({
  value,
  size = 96,
  strokeWidth = 6,
  label,
  color = "cyan"
}: CircularProgressProps) {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    const percent = Math.min(100, Math.max(0, value));
    setOffset(circumference - (percent / 100) * circumference);
  }, [value, circumference]);

  return (
    <div className="flex flex-col items-center justify-center" style={{ width: size, height: size + 40 }}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-zinc-700"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className={`stroke-${color}-400 transition-all duration-700 ease-out`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute text-sm font-semibold text-zinc-200">{Math.round(value)}%</span>
      </div>
      {label && <div className="text-[9px] text-zinc-500 mt-1">{label}</div>}
    </div>
  );
}