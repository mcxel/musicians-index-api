"use client";

/**
 * CanonicalQuickToolsStrip — desktop quick tools row (Fan + Performer).
 * Avatar · Inventory · Magazine · YoPho · Playlist · Discovery/Lobbies · …
 * VENUE TOOLS is owned by CommandCenterMediaStack toolbar on desktop (one per surface).
 */

import React from "react";
import { useRouter } from "next/navigation";
import RoleGate from "@/components/auth/RoleGate";
import {
  getMobileQuickPanelCapabilities,
  type MobileCommandCenterRole,
  type MobileQuickPanelActionId,
} from "@/lib/commandCenter/mobileCommandCenterCapabilities";
import {
  isQuickToolActive,
  runQuickToolAction,
} from "@/lib/commandCenter/quickToolsActions";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
export interface CanonicalQuickToolsStripProps {
  role: MobileCommandCenterRole;
  onShareScreen?: () => void;
  onRecord?: () => void;
  onShare?: () => void;
  onMemory?: () => void;
  screenShareActive?: boolean;
}

export default function CanonicalQuickToolsStrip({
  role,
  onShareScreen,
  onRecord,
  onShare,
  onMemory,
  screenShareActive = false,
}: CanonicalQuickToolsStripProps) {
  const router = useRouter();
  const hubRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const { primary } = getMobileQuickPanelCapabilities(role, {
    isLive: isLivePublished,
    isGoLiveContext: Boolean(hubRoomId),
  });
  const { activePanel, togglePanel, openPanel, closePanel } = useCompactQuickPanelStore();

  const actionCtx = {
    role,
    router,
    activePanel,
    togglePanel,
    openPanel,
    closePanel,
    hubRoomId,
    isLive: isLivePublished,
    onShareScreen,
    onRecord,
    onShare,
    onMemory,
  };

  const renderBtn = (id: MobileQuickPanelActionId, label: string) => {
    const active = isQuickToolActive(id, { activePanel, screenShareActive });
    const btn = (
      <button
        key={id}
        type="button"
        data-testid={`tmi-quick-tools-${id}`}
        onClick={() => runQuickToolAction(id, actionCtx)}
        style={btnStyle(active)}
      >
        {label}
      </button>
    );
    if (id === "avatar" || id === "inventory") {
      return (
        <RoleGate key={id} allow={["FAN", "ADMIN", "STAFF"]}>
          {btn}
        </RoleGate>
      );
    }
    return btn;
  };

  return (
    <div
      data-canonical-quick-tools-strip
      data-role={role}
      style={{
        flexShrink: 0,
        borderTop: "1px solid rgba(0,255,255,0.12)",
        background: "rgba(3,3,14,0.92)",
        display: "flex",
        gap: 6,
        overflowX: "auto",
        padding: "8px 12px",
        scrollbarWidth: "none",
      }}
    >
      {primary
        .filter((item) => item.id !== "venue-tools")
        .map((item) => renderBtn(item.id, item.label))}
    </div>
  );
}

const btnStyle = (active: boolean, accent = "#00FFFF"): React.CSSProperties => ({
  flexShrink: 0,
  padding: "6px 10px",
  borderRadius: 8,
  background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
  border: `1px solid ${active ? accent : "rgba(255,255,255,0.12)"}`,
  color: active ? accent : "rgba(255,255,255,0.88)",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: "0.06em",
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap",
});
