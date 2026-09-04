"use client";

/**
 * CompactQuickPanelHost — mounts active floating quick panels (LOBBIES, STREAM & WIN lounge, AVATAR, etc.).
 * LOBBIES → LiveLobbyWallHost mosaic; stream-win → radio lounge panel (not lobby wall).
 * One panel at a time; preserves roomId / player / WebRTC (no router.push).
 */

import React from "react";
import RoleGate from "@/components/auth/RoleGate";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import CompactFloatingQuickPanel from "@/components/hud/CompactFloatingQuickPanel";
import ArtistIdShareStrip from "@/components/identity/ArtistIdShareStrip";
import RemoteQuickPanel from "@/components/hud/panels/RemoteQuickPanel";
import CanonicalQuickPanelContent from "@/components/workspace/universal/CanonicalQuickPanelContent";
import { openCanonicalDeepStudio } from "@/lib/workspace/universal/openCanonicalPresentation";
import SnipsSwipeOverlay from "@/components/hud/panels/SnipsSwipeOverlay";
import ExploreMatrixDiscoveryHost from "@/components/explore/ExploreMatrixDiscoveryHost";
import MiniLiveLobbyWallRuntime from "@/components/lobby/MiniLiveLobbyWallRuntime";
import StreamWinMosaicPanel from "@/components/commandCenter/StreamWinMosaicPanel";
import VenueToolsPanelHost from "@/components/hud/VenueToolsPanelHost";

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
  const storeActivePanel = useCompactQuickPanelStore((s) => s.activePanel);
  const [localActivePanel, setLocalActivePanel] = React.useState<string | null>(null);
  const activePanel = localActivePanel ?? storeActivePanel;
  const corner = useCompactQuickPanelStore((s) => s.corner);
  const storeClosePanel = useCompactQuickPanelStore((s) => s.closePanel);

  const closePanel = React.useCallback(() => {
    setLocalActivePanel(null);
    storeClosePanel();
  }, [storeClosePanel]);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__TMI_COMPACT_QUICK_STORE__ = useCompactQuickPanelStore;
    }
    const onOpenYopho = () => {
      setLocalActivePanel("yopho");
      useCompactQuickPanelStore.getState().openPanel("yopho");
    };
    const onClose = () => {
      setLocalActivePanel(null);
      useCompactQuickPanelStore.getState().closePanel();
    };
    window.addEventListener("tmi:open-yopho-quick", onOpenYopho);
    window.addEventListener("tmi:quick-panel-close", onClose);
    return () => {
      window.removeEventListener("tmi:open-yopho-quick", onOpenYopho);
      window.removeEventListener("tmi:quick-panel-close", onClose);
    };
  }, [storeClosePanel]);

  if (!activePanel) return null;

  if (activePanel === "avatar" && role === "performer") {
    return null;
  }

  if (activePanel === "user-id") {
    return (
      <CompactFloatingQuickPanel
        title={role === "performer" ? "ARTIST ID" : "FAN ID"}
        accentColor="#FFD700"
        corner={corner}
        onClose={closePanel}
      >
        <ArtistIdShareStrip
          userId={userId}
          displayName={displayName}
          role={role}
        />
      </CompactFloatingQuickPanel>
    );
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

  if (activePanel === "venue") {
    return (
      <VenueToolsPanelHost userId={userId} role={role} />
    );
  }

  if (activePanel === "lobbies") {
    return (
      <MiniLiveLobbyWallRuntime
        role={role === "performer" ? "performer" : "fan"}
        isOpen={true}
        onClose={closePanel}
      />
    );
  }

  const workspaceMap = {
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

/** Explore / Snips / Video Shuffle visual matrix discovery host. */
export function SnipsOverlayHost() {
  const activePanel = useCompactQuickPanelStore((s) => s.activePanel);
  const closePanel = useCompactQuickPanelStore((s) => s.closePanel);

  if (activePanel === "snips") {
    return <ExploreMatrixDiscoveryHost initialColumn="SNIPS" onClose={closePanel} />;
  }
  if (activePanel === "video-shuffle") {
    return <ExploreMatrixDiscoveryHost initialColumn="VIDEO_SHUFFLE" onClose={closePanel} />;
  }
  if (activePanel === "explore") {
    return <ExploreMatrixDiscoveryHost initialColumn="PUBLIC_PROFILES" onClose={closePanel} />;
  }
  return null;
}
