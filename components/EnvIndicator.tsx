"use client";
import { useState, useEffect } from "react";

export default function EnvIndicator() {
  const [isLocal, setIsLocal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLocal(window.location.hostname === "localhost");
    console.log("EnvIndicator mounted, isLocal:", window.location.hostname === "localhost");
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium shadow-sm bg-black/80 backdrop-blur-sm">
      <div className={`w-1.5 h-1.5 rounded-full ${isLocal ? "bg-orange-400" : "bg-green-400 animate-pulse"}`}></div>
      <span className="text-white">{isLocal ? "LOCAL" : "LIVE"}</span>
    </div>
  );
}