"use client";

/**
 * CompactQuickPanelHost — mounts active floating quick panels (LOBBIES, AVATAR, MEMORY, YOPHO, REMOTE).
 * One panel at a time; preserves roomId / player / WebRTC (no router.push).
 */

import React from "react";
import RoleGate from "@/components/auth/RoleGate";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import CompactFloatingQuickPanel from "@/components/hud/CompactFloatingQuickPanel";
import RemoteQuickPanel from "@/components/hud/panels/RemoteQuickPanel";
import CanonicalQuickPanelContent from "@/components/workspace/universal/CanonicalQuickPanelContent";
import { openCanonicalDeepStudio } from "@/lib/workspace/universal/openCanonicalPresentation";
import SnipsSwipeOverlay from "@/components/hud/panels/SnipsSwipeOverlay";
import StreamWinMosaicPanel from "@/components/commandCenter/StreamWinMosaicPanel";

export interface CompactQuickPanelHostProps {
  userId: string;
  displayName: string;
  role: "fan" | "performer";
}

export default function CompactQuickPanelHost({
  userId,
  displayName,
  role,
}: CompactQuickPanelHostProps) {
  const { activePanel, corner, closePanel } = useCompactQuickPanelStore();

  if (!activePanel) return null;

  if (activePanel === "avatar" && role === "performer") {
    return null;
  }

  if (activePanel === "remote") {
    return <RemoteQuickPanel onClose={closePanel} />;
  }

  if (activePanel === "stream-win") {
    return (
      <StreamWinMosaicPanel
        isOpen
        onClose={closePanel}
      />
    );
  }

  const workspaceMap = {
    lobbies: { ws: "lobby" as const, title: "LOBBIES", accent: "#FF2DAA" },
    avatar: { ws: "inventory" as const, title: "AVATAR", accent: "#00E5FF" },
    "memory-wall": { ws: "memory-wall" as const, title: "MEMORY WALL", accent: "#AA2DFF" },
    yopho: { ws: "yopho" as const, title: "YOPHO", accent: "#FF2DAA" },
  };

  const cfg = workspaceMap[activePanel as keyof typeof workspaceMap];
  if (!cfg) return null;

  const panel = (
    <CompactFloatingQuickPanel
      title={cfg.title}
      accentColor={cfg.accent}
      corner={corner}
      onClose={closePanel}
      onOpenDeep={() => openCanonicalDeepStudio(cfg.ws)}
      deepLabel="FULL STUDIO"
    >
      <CanonicalQuickPanelContent
        workspaceId={cfg.ws}
        userId={userId}
        displayName={displayName}
        role={role}
        accentColor={cfg.accent}
        onClose={closePanel}
        embedded
      />
    </CompactFloatingQuickPanel>
  );

  if (activePanel === "avatar") {
    return (
      <RoleGate allow={["FAN", "ADMIN", "STAFF"]}>
        {panel}
      </RoleGate>
    );
  }

  return panel;
}

/** Snips is a full-height swipe overlay — separate from corner panels. */
export function SnipsOverlayHost() {
  const snipsOpen = useCompactQuickPanelStore((s) => s.activePanel === "snips");
  const closePanel = useCompactQuickPanelStore((s) => s.closePanel);
  if (!snipsOpen) return null;
  return <SnipsSwipeOverlay onClose={closePanel} />;
}
