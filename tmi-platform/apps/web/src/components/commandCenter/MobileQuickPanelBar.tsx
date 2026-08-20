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
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import {
  openCanonicalWorkspaceQuick,
  presentCanonicalWorkspace,
} from "@/lib/workspace/universal/openCanonicalPresentation";

export interface MobileQuickPanelBarProps {
  role: MobileCommandCenterRole;
  onShareScreen?: () => void;
  onRecord?: () => void;
  onShare?: () => void;
  onMemory?: () => void;
  onEmotes?: () => void;
  screenShareActive?: boolean;
}

export default function MobileQuickPanelBar({
  role,
  onShareScreen,
  onRecord,
  onShare,
  onMemory,
  onEmotes,
  screenShareActive = false,
}: MobileQuickPanelBarProps) {
  const router = useRouter();
  const { primary, more } = getMobileQuickPanelCapabilities(role);
  const [moreOpen, setMoreOpen] = useState(false);
  const { activePanel, togglePanel } = useCompactQuickPanelStore();

  const runAction = (id: MobileQuickPanelActionId) => {
    switch (id) {
      case "magazine":
        if (typeof window !== "undefined") {
          sessionStorage.setItem("tmi_magazine_origin", window.location.pathname + window.location.search);
        }
        router.push("/magazine/issue/current");
        break;
      case "playlist":
        openCanonicalWorkspaceQuick("playlist", "DRAWER");
        break;
      case "avatar":
        togglePanel("avatar", "bottom-left");
        break;
      case "inventory":
        presentCanonicalWorkspace("inventory", "DRAWER");
        break;
      case "lobbies":
        togglePanel("lobbies", "bottom-left");
        break;
      case "remote":
        togglePanel("remote", "bottom-right");
        break;
      case "yopho":
        togglePanel("yopho", "bottom-left");
        break;
      case "share-screen":
        onShareScreen?.();
        break;
      case "record":
        onRecord?.();
        break;
      case "share":
        onShare?.();
        break;
      case "memory":
        onMemory?.();
        break;
      case "emotes":
        onEmotes?.();
        break;
      default:
        break;
    }
  };

  const isActive = (id: MobileQuickPanelActionId): boolean => {
    if (id === "lobbies") return activePanel === "lobbies";
    if (id === "remote") return activePanel === "remote";
    if (id === "yopho") return activePanel === "yopho";
    if (id === "avatar") return activePanel === "avatar";
    if (id === "share-screen") return screenShareActive;
    return false;
  };

  const renderBtn = (id: MobileQuickPanelActionId, label: string) => {
    const active = isActive(id);
    const btn = (
      <button
        key={id}
        type="button"
        data-testid={`tmi-mobile-qp-${id}`}
        onClick={() => runAction(id)}
        style={barBtnStyle(active)}
      >
        {label}
      </button>
    );
    if (id === "avatar") {
      return (
        <RoleGate key={id} allow={["FAN", "ADMIN", "STAFF"]}>
          {btn}
        </RoleGate>
      );
    }
    if (id === "inventory") {
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
