"use client";

/**
 * HubMobileQuickActionBar — primary mobile grammar (reference: Lobbies phone veiw.mp4).
 * Messages · Room · People · Community · Cast/Media.
 * The 44px GPS trigger lives on the Command Bed header so it stays above the monitors.
 */

import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import {
  isGpsDrawerVisible,
  useMobileGpsMonitorLayoutStore,
} from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";
import type { HubCommunicationsTab } from "./HubCommunicationsRail";

export type HubMobileQuickActionId =
  | "gps"
  | "messages"
  | "room"
  | "people"
  | "community"
  | "lobbies"
  | "cast"
  | "promote"
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
  { id: "promote", label: "PROMOTE" },
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
  const gpsLayout = useMobileGpsMonitorLayoutStore((s) => s.layout);
  const toggleGpsDrawer = useMobileGpsMonitorLayoutStore((s) => s.toggleGpsDrawer);
  const gpsOpen = isGpsDrawerVisible(gpsLayout);

  const handleAction = (id: HubMobileQuickActionId, commsTab?: HubCommunicationsTab) => {
    if (id === "gps") {
      toggleGpsDrawer();
      return;
    }
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
    if (id === "promote") {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("tmi:hub-promote-toggle"));
      }
      return;
    }
    if (id === "media") {
      if (typeof window !== "undefined") {
        window.location.href = "/media-locker";
      }
      return;
    }
  };

  return (
    <div
      data-hub-mobile-quick-action-bar="1"
      data-shell-role={role}
      data-gps-open={gpsOpen ? "1" : "0"}
      style={{
        flexShrink: 0,
        borderTop: `1px solid ${accent}33`,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(4,6,14,0.96)",
        padding: "6px 10px",
        paddingBottom: "max(6px, env(safe-area-inset-bottom))",
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
          if (action.id === "lobbies") return null;
          if (action.id === "cast" && !hasLiveFeed) return null;
          const active =
            action.id === "gps"
              ? gpsOpen
              : action.commsTab != null && activeCommsTab === action.commsTab;
          const isGps = action.id === "gps";
          return (
            <button
              key={action.id}
              type="button"
              data-testid={`hub-mobile-action-${action.id}`}
              aria-label={isGps ? "Open GPS navigation" : undefined}
              aria-pressed={isGps ? gpsOpen : undefined}
              onClick={() => handleAction(action.id, action.commsTab)}
              style={{
                ...btnStyle(active, isGps ? "#00E5FF" : accent),
                ...(isGps
                  ? {
                      flex: "0 0 44px",
                      width: 44,
                      height: 44,
                      minWidth: 44,
                      minHeight: 44,
                      padding: 0,
                      fontSize: 9,
                      letterSpacing: "0.04em",
                      border: active
                        ? "1px solid #00E5FF"
                        : "1px solid rgba(0,229,255,0.45)",
                      boxShadow: active ? "0 0 12px rgba(0,229,255,0.35)" : undefined,
                    }
                  : {}),
              }}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
