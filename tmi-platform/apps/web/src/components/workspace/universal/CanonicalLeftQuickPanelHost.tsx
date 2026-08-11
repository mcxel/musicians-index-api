"use client";

import React from "react";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import CyberneticQuickHudOverlay from "@/components/hud/CyberneticQuickHudOverlay";

export default function CanonicalLeftQuickPanelHost() {
  const { leftPanelWorkspace, closeSurface } = useWorkspacePresentationStore();

  if (!leftPanelWorkspace) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 100,
        left: 80,
        width: 320,
        zIndex: 9350,
      }}
    >
      <CyberneticQuickHudOverlay
        type={leftPanelWorkspace as any}
        isOpen={true}
        onClose={() => closeSurface("LEFT_PANEL")}
        accentColor="#00E5FF"
      />
    </div>
  );
}
