"use client";
import dynamic from "next/dynamic";
import { ReactNode } from "react";

const BrainPanel = dynamic(() => import("@/components/BrainPanel"), { ssr: false });
const DebugPanelWrapper = dynamic(() => import("@/components/DebugPanelWrapper"), { ssr: false });

export function ClientProviders() {
  return (
    <>

      <BrainPanel />
      <DebugPanelWrapper />
    </>
  );
}

