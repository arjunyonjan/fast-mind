"use client";

import BrainPanel from "@/components/BrainPanel/index";
import DebugPanelWrapper from "@/components/DebugPanelWrapper";

export function ClientProviders() {
  return (
    <>
      <BrainPanel />
      <DebugPanelWrapper />
    </>
  );
}