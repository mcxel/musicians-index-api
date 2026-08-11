"use client";

import React from "react";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import CanonicalQuickPanelContent from "./CanonicalQuickPanelContent";

export default function CanonicalLeftQuickPanelHost({
  userId,
  displayName,
  role,
}: {
  userId: string;
  displayName: string;
  role: "fan" | "performer";
}) {
  const { leftPanelWorkspace, closeSurface } = useWorkspacePresentationStore();

  if (!leftPanelWorkspace) return null;

  return (
    <div
      data-canonical-left-quick
      style={{
        position: "fixed",
        top: 100,
        left: 248,
        width: 340,
        zIndex: 9350,
        pointerEvents: "auto",
      }}
    >
      <CanonicalQuickPanelContent
        workspaceId={leftPanelWorkspace}
        userId={userId}
        displayName={displayName}
        role={role}
        accentColor="#00E5FF"
        onClose={() => closeSurface("LEFT_PANEL")}
      />
    </div>
  );
}
