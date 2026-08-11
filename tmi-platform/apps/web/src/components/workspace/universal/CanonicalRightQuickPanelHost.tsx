"use client";

import React from "react";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import CyberneticQuickHudOverlay from "@/components/hud/CyberneticQuickHudOverlay";

export default function CanonicalRightQuickPanelHost() {
  const { rightPanelWorkspace, closeSurface } = useWorkspacePresentationStore();

  if (!rightPanelWorkspace) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 100,
        right: 320,
        width: 320,
        zIndex: 9350,
      }}
    >
      <CyberneticQuickHudOverlay
        type={rightPanelWorkspace as any}
        isOpen={true}
        onClose={() => closeSurface("RIGHT_PANEL")}
        accentColor="#AA2DFF"
      />
    </div>
  );
}
