"use client";

/**
 * Shared mobile QUICK-PANEL BAR — same geometry for Fan + Performer;
 * buttons resolved via mobileCommandCenterCapabilities (role only).
 */

import React, { useState } from "react";
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

export interface MobileQuickPanelBarProps {
  role: MobileCommandCenterRole;
  onShareScreen?: () => void;
  onRecord?: () => void;
  onShare?: () => void;
  onMemory?: () => void;
  screenShareActive?: boolean;
}

export default function MobileQuickPanelBar({
  role,
  onShareScreen,
  onRecord,
  onShare,
  onMemory,
  screenShareActive = false,
}: MobileQuickPanelBarProps) {
  const router = useRouter();
  const hubRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const { primary, more } = getMobileQuickPanelCapabilities(role, {
    isLive: isLivePublished,
    isGoLiveContext: Boolean(hubRoomId),
  });
  const [moreOpen, setMoreOpen] = useState(false);
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
        data-testid={`tmi-mobile-qp-${id}`}
        onClick={() => runQuickToolAction(id, actionCtx)}
        style={barBtnStyle(active)}
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
      data-mobile-quick-panel-bar
      style={{
        flexShrink: 0,
        borderTop: "1px solid rgba(0,255,255,0.12)",
        background: "rgba(3,3,14,0.92)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          padding: "8px 12px",
          scrollbarWidth: "none" as const,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {primary.map((item) => renderBtn(item.id, item.label))}
        <button
          type="button"
          data-testid="tmi-mobile-qp-more"
          onClick={() => setMoreOpen((v) => !v)}
          style={barBtnStyle(moreOpen, "#FFD700")}
          aria-expanded={moreOpen}
        >
          MORE {moreOpen ? "▾" : "▴"}
        </button>
      </div>
      {moreOpen ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: "0 12px 10px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 8,
          }}
        >
          {more.map((item) => renderBtn(item.id, item.label))}
          <span
            style={{
              fontSize: 8,
              fontWeight: 900,
              color: "#FFD700",
              border: "1px solid rgba(255,215,0,0.45)",
              borderRadius: 4,
              padding: "4px 8px",
              alignSelf: "center",
            }}
            title="Stream quality follows connection (auto)"
          >
            AUTO
          </span>
        </div>
      ) : null}
    </div>
  );
}

function barBtnStyle(active: boolean, accent = "#00FFFF"): React.CSSProperties {
  return {
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
  };
}
