"use client";

/**
 * HubMobileQuickActionBar — primary mobile grammar (reference: Lobbies phone veiw.mp4).
 * ONE drawer at a time: Messages · Room · People · Community · Lobbies · Cast/Media.
 * Does not replace canonical authorities — routes into MessagingCanister, HubCommunicationsRail,
 * MiniLiveLobbyWallRuntime, and workspace presenters.
 */

import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";
import type { HubCommunicationsTab } from "./HubCommunicationsRail";

export type HubMobileQuickActionId =
  | "messages"
  | "room"
  | "people"
  | "community"
  | "lobbies"
  | "cast"
  | "media";

export interface HubMobileQuickActionBarProps {
  role: "fan" | "performer";
  /** Whether a live feed / room context exists — gates CAST affordance. */
  hasLiveFeed?: boolean;
  onOpenCommunications: (tab: HubCommunicationsTab) => void;
  activeCommsTab?: HubCommunicationsTab | null;
}

const ACTIONS: { id: HubMobileQuickActionId; label: string; commsTab?: HubCommunicationsTab }[] = [
  { id: "messages", label: "MESSAGES", commsTab: "messages" },
  { id: "room", label: "ROOM", commsTab: "room" },
  { id: "people", label: "PEOPLE", commsTab: "people" },
  { id: "community", label: "COMMUNITY", commsTab: "community" },
  { id: "lobbies", label: "LOBBIES" },
  { id: "cast", label: "CAST" },
  { id: "media", label: "MEDIA" },
];

function btnStyle(active: boolean, accent: string): React.CSSProperties {
  return {
    flexShrink: 0,
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.08em",
    padding: "8px 10px",
    borderRadius: 8,
    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
    background: active ? `${accent}22` : "rgba(255,255,255,0.04)",
    color: active ? accent : "rgba(255,255,255,0.75)",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}

export default function HubMobileQuickActionBar({
  role,
  hasLiveFeed = false,
  onOpenCommunications,
  activeCommsTab = null,
}: HubMobileQuickActionBarProps) {
  const accent = role === "performer" ? "#FFD700" : "#00FF88";
  const lobbiesOpen = useCompactQuickPanelStore((s) => s.activePanel === "lobbies");

  const handleAction = (id: HubMobileQuickActionId, commsTab?: HubCommunicationsTab) => {
    if (commsTab) {
      onOpenCommunications(commsTab);
      return;
    }
    if (id === "lobbies") {
      useCompactQuickPanelStore.getState().openPanel("lobbies", "bottom-left");
      return;
    }
    if (id === "cast") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tmi:cast-panel-toggle"));
      }
      return;
    }
    if (id === "media") {
      presentCanonicalWorkspace("share-studio", "DRAWER");
    }
  };

  return (
    <div
      data-hub-mobile-quick-action-bar="1"
      data-shell-role={role}
      style={{
        flexShrink: 0,
        borderTop: `1px solid ${accent}33`,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(4,6,14,0.96)",
        padding: "6px 10px",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {ACTIONS.map((action) => {
          if (action.id === "cast" && !hasLiveFeed) return null;
          const active =
            action.id === "lobbies"
              ? lobbiesOpen
              : action.commsTab != null && activeCommsTab === action.commsTab;
          return (
            <button
              key={action.id}
              type="button"
              data-testid={`hub-mobile-action-${action.id}`}
              onClick={() => handleAction(action.id, action.commsTab)}
              style={btnStyle(active, accent)}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
