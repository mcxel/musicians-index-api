"use client";

import React from "react";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import CanonicalQuickPanelContent from "./CanonicalQuickPanelContent";

export default function CanonicalRightQuickPanelHost({
  userId,
  displayName,
  role,
}: {
  userId: string;
  displayName: string;
  role: "fan" | "performer";
}) {
  const { rightPanelWorkspace, closeSurface } = useWorkspacePresentationStore();

  if (!rightPanelWorkspace) return null;

  return (
    <div
      data-canonical-right-quick
      style={{
        position: "fixed",
        top: 100,
        right: 316,
        width: 320,
        zIndex: 9350,
        pointerEvents: "auto",
      }}
    >
      <CanonicalQuickPanelContent
        workspaceId={rightPanelWorkspace}
        userId={userId}
        displayName={displayName}
        role={role}
        accentColor="#AA2DFF"
        onClose={() => closeSurface("RIGHT_PANEL")}
      />
    </div>
  );
}
