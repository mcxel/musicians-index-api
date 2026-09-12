"use client";

/**
 * CanonicalBottomDrawerHost — Stage Deck WORK surface (mobile) / Media Console dock.
 *
 * On mobile Command Center, this mounts into the same Stage Deck region as the
 * monitors (mutually exclusive presentation). Monitors stay mounted-but-hidden
 * so MediaStream / WebRTC state survives. Do not navigate for these tools.
 */

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
import LiveLobbyWallHost from "@/components/live/LiveLobbyWallHost";
import { PlaylistCanister } from "@/components/canisters/PlaylistCanister";
import SettingsWorkspaceContent from "./SettingsWorkspaceContent";
import ShareStudioContent from "./ShareStudioContent";
import UniversalWorkspaceStubContent from "./UniversalWorkspaceStubContent";
import ExperienceControlDeck from "./ExperienceControlDeck";
import VenueControlPanel from "@/components/hud/panels/VenueControlPanel";
import { toggleVenueToolsPanel } from "@/components/hud/VenueToolsToggleButton";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import { isVenueToolsReadOnly, isVenueToolsEnabled, resolveVenueToolsPolicy } from "@/lib/venue/VenueToolsRegistry";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import FanAvatarCanister from "@/components/avatar/FanAvatarCanister";

const PerformerBioMagazineDrawer = dynamic(() => import("@/components/drawers/PerformerBioMagazineDrawer"), {
  ssr: false,
  loading: () => <div style={{ padding: 24, color: "rgba(255,255,255,0.35)" }}>Loading…</div>,
});

const ROLODEX_TOOLS: { id: UniversalWorkspaceId; label: string }[] = [
  { id: "avatar-quick", label: "👤 AVATAR" },
  { id: "memory-wall", label: "🧠 MEMORY" },
  { id: "playlist-studio", label: "🎵 PLAYLIST" },
  { id: "room-controls", label: "VENUE TOOLS" },
  { id: "inventory", label: "🎒 INVENTORY" },
  { id: "yopho", label: "📷 YOPHO" },
  { id: "prize-vault", label: "🏆 REWARDS" },
  { id: "achievement-center", label: "🌟 ACHIEVEMENTS" },
  { id: "championship-center", label: "⚔️ CHAMPIONSHIP" },
  { id: "store", label: "🛒 STORE" },
  { id: "live-destinations", label: "📹 LIVE" },
  { id: "settings", label: "⚙️ SETTINGS" },
];

function chromeBtn(label: string, onClick: () => void, opts?: { accent?: string; title?: string }) {
  const accent = opts?.accent ?? "#fff";
  return (
    <button
      type="button"
      onClick={onClick}
      title={opts?.title}
      style={{
        flexShrink: 0,
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${accent}55`,
        borderRadius: 6,
        color: accent,
        fontSize: 9,
        fontWeight: 800,
        padding: "4px 8px",
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

export default function CanonicalBottomDrawerHost({
  userId,
  displayName,
  role,
  /** Mobile Stage Deck: own the monitor region at full useful height. */
  stageDeck = false,
}: {
  userId?: string;
  displayName?: string;
  role: "fan" | "performer";
  stageDeck?: boolean;
}) {
  const { drawerWorkspace, isDrawerExpanded, mediaConsoleMode, closeSurface, toggleDrawerExpand } =
    useWorkspacePresentationStore();
  const mobileMode = useWorkspacePresentationStore((s) => s.mobileMode);
  const activeControlMode = useWorkspacePresentationStore((s) => s.activeControlMode);
  const activeQuickPanel = useCompactQuickPanelStore((s) => s.activePanel);
  const setVenueContext = useCompactQuickPanelStore((s) => s.setVenueContext);
  const hubRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const venueToolsPolicy = resolveVenueToolsPolicy({
    role,
    isLive: isLivePublished,
    isGoLiveContext: Boolean(hubRoomId),
  });
  const venueToolsAllowed = isVenueToolsEnabled(venueToolsPolicy);

  const visibleTools = useMemo(() => {
    const base =
      role === "performer"
        ? ROLODEX_TOOLS.filter(
            (t) => t.id !== "avatar-quick" && t.id !== "inventory" && t.id !== "lobby",
          )
        : ROLODEX_TOOLS;
    if (venueToolsAllowed) return base;
    return base.filter((t) => t.id !== "room-controls");
  }, [role, venueToolsAllowed]);

  const rolodexIndex = useMemo(() => {
    if (!drawerWorkspace) return -1;
    return visibleTools.findIndex((t) => t.id === drawerWorkspace);
  }, [drawerWorkspace, visibleTools]);

  if (mobileMode === "CONTROL") {
    return <ExperienceControlDeck mode={activeControlMode} userId={userId} role={role} />;
  }

  if (!drawerWorkspace || !isDrawerExpanded) return null;

  const uid = userId ?? "session";
  const name = displayName ?? "Member";
  const isLobbyWall = drawerWorkspace === "lobby" || drawerWorkspace === "live-destinations";
  const restoreMonitors = () => closeSurface("DRAWER");

  const openRolodexTool = (tool: (typeof visibleTools)[number]) => {
    if (tool.id === "room-controls") {
      setVenueContext({
        roomId: hubRoomId ?? undefined,
        isLoungeHost: role === "performer",
        readOnly: isVenueToolsReadOnly(venueToolsPolicy),
      });
      toggleVenueToolsPanel("bottom-right");
      return;
    }
    presentCanonicalWorkspace(tool.id, "DRAWER");
  };

  const goPrev = () => {
    if (visibleTools.length === 0) return;
    const i = rolodexIndex < 0 ? 0 : (rolodexIndex - 1 + visibleTools.length) % visibleTools.length;
    openRolodexTool(visibleTools[i]!);
  };
  const goNext = () => {
    if (visibleTools.length === 0) return;
    const i = rolodexIndex < 0 ? 0 : (rolodexIndex + 1) % visibleTools.length;
    openRolodexTool(visibleTools[i]!);
  };

  const contentMinHeight = isLobbyWall ? 480 : 380;
  const contentMaxHeight = isLobbyWall ? "min(72vh, 700px)" : "min(60vh, 620px)";

  return (
    <div
      data-canonical-bottom-drawer
      data-media-console-drawer
      data-stage-deck={stageDeck ? "work" : "dock"}
      data-active-drawer={drawerWorkspace}
      data-media-console-mode={mediaConsoleMode}
      style={{
        width: "100%",
        flex: stageDeck ? 1 : undefined,
        flexShrink: stageDeck ? 1 : 0,
        minHeight: stageDeck ? 0 : undefined,
        maxHeight: stageDeck ? "none" : undefined,
        height: stageDeck ? "100%" : undefined,
        marginTop: 0,
        background: "rgba(6, 9, 24, 0.98)",
        border: "1px solid rgba(0, 229, 255, 0.3)",
        borderTop: stageDeck ? "1px solid rgba(0,229,255,0.35)" : "none",
        borderRadius: stageDeck ? 12 : 0,
        boxShadow: stageDeck
          ? "0 12px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(0,229,255,0.2)"
          : "0 -10px 40px rgba(0,0,0,0.85), inset 0 1px 0 rgba(0,229,255,0.2)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Stage Deck chrome: ‹ BACK | NAME | ◀ PREV | NEXT ▶ | 📺 MONITORS | × */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 10px",
          background: "rgba(10, 16, 38, 0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          overflowX: "auto",
          scrollbarWidth: "none" as const,
        }}
      >
        {chromeBtn("‹ BACK", restoreMonitors, {
          accent: "#00FFFF",
          title: "Return Stage Deck to monitors",
        })}
        <span
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 10,
            fontWeight: 900,
            color: "#FFD700",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            flexShrink: 0,
            maxWidth: 120,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {drawerWorkspace.replace(/-/g, " ")}
        </span>
        <div style={{ flex: 1 }} />
        {chromeBtn("◀ PREV", goPrev, { title: "Previous workspace" })}
        {chromeBtn("NEXT ▶", goNext, { title: "Next workspace" })}
        {chromeBtn("📺 MONITORS", restoreMonitors, {
          accent: "#00E5FF",
          title: "Restore monitors — media session preserved",
        })}
        {!stageDeck &&
          chromeBtn(isDrawerExpanded ? "MINIMIZE" : "EXPAND", toggleDrawerExpand, {
            title: "Toggle dock height",
          })}
        {chromeBtn("×", restoreMonitors, { accent: "#FF2DAA", title: "Close workspace" })}
      </div>

      {/* Lateral Rolodex — switch WORKSPACE(A)→WORKSPACE(B) without legacy panel labels */}
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          padding: "6px 12px",
          background: "rgba(4, 6, 16, 0.9)",
          borderBottom: "1px solid rgba(0,229,255,0.15)",
          scrollbarWidth: "none" as const,
          flexShrink: 0,
        }}
      >
        {visibleTools.map((tool) => {
          const isVenueRolodex = tool.id === "room-controls";
          const isActive = isVenueRolodex
            ? activeQuickPanel === "venue"
            : drawerWorkspace === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (isVenueRolodex) {
                  openRolodexTool(tool);
                  return;
                }
                presentCanonicalWorkspace(tool.id, "DRAWER");
              }}
              style={{
                flexShrink: 0,
                background: isActive ? "rgba(0,229,255,0.22)" : "rgba(255,255,255,0.04)",
                border: isActive ? "1px solid #00FFFF" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                padding: "4px 9px",
                color: isActive ? "#00FFFF" : "rgba(255,255,255,0.7)",
                fontSize: 9,
                fontWeight: isActive ? 900 : 700,
                letterSpacing: "0.05em",
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
              }}
            >
              {tool.label}
            </button>
          );
        })}
      </div>

      <div
        style={{
          padding: stageDeck ? 12 : 16,
          minHeight: stageDeck ? 0 : contentMinHeight,
          maxHeight: stageDeck ? "none" : contentMaxHeight,
          overflowY: "auto",
          flex: stageDeck ? 1 : undefined,
        }}
      >
        {drawerWorkspace === "playlist-studio" ? (
          <PlaylistCanister
            entityId={uid}
            entityName={name}
            isOwner
            role={role}
            layout="full"
          />
        ) : drawerWorkspace === "share-studio" ? (
          <ShareStudioContent context={{ sharePath: typeof window !== "undefined" ? window.location.pathname : "/" }} />
        ) : drawerWorkspace === "settings" ? (
          <SettingsWorkspaceContent userId={uid} displayName={name} />
        ) : drawerWorkspace === "avatar-quick" && role === "fan" ? (
          <FanAvatarCanister userId={uid} displayName={name} role="FAN" />
        ) : drawerWorkspace === "bio-magazine" && role === "performer" ? (
          <PerformerBioMagazineDrawer userId={uid} displayName={name} />
        ) : drawerWorkspace === "room-controls" ? (
          <VenueControlPanel
            role={role}
            userId={uid}
            venueId={uid}
            accentColor="#00FF88"
          />
        ) : isLobbyWall ? (
          <LiveLobbyWallHost
            variant="embedded"
            title="Live Lobby Wall"
            defaultCategory="lives"
            showFanLobbySearch={role === "fan"}
            viewerUserId={uid}
            viewerRole={role}
          />
        ) : (
          <UniversalWorkspaceStubContent
            workspaceId={drawerWorkspace}
            role={role}
            userId={uid}
            displayName={name}
          />
        )}
      </div>
    </div>
  );
}
