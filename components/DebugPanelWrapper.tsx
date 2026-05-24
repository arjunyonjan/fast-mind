"use client";
import dynamic from "next/dynamic";
const DebugPanel = dynamic(() => import("@/components/DebugPanel"), { ssr: false });
export default function DebugPanelWrapper() {
  return <DebugPanel />;
}
