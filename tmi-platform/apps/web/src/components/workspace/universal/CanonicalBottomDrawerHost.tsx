"use client";

/**
 * CanonicalBottomDrawerHost — drawer BELOW primary dual-monitor fabric.
 *
 * Class A (flat): Achievements, Shop, Memory, YoPho, Lobby, Stats, … open under monitors.
 * Class B (Playlist): Mini Player expands into full Playlist workspace (mediaConsoleMode expanded).
 *
 * Monitors NEVER unmount for drawer open/switch/close.
 * MediaStream / WebRTC / feeds / audio / Cast / Power Mix must survive.
 */

import React, { useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import {
  GPS_OVERLAY_CLEARANCE,
  isGpsDrawerVisible,
  useMobileGpsMonitorLayoutStore,
} from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";
import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
import { useHubDrawerBackContract } from "@/lib/workspace/universal/hubDrawerBackStack";
import { hubDrawerGuide } from "@/lib/workspace/universal/hubDrawerGuides";
import {
  DRAWER_SHELL_VARIANTS,
  DRAWER_TRANSITION,
  EXPAND_FOCUS_TRANSITION,
  REDUCED_MOTION_TRANSITION,
  resolveDrawerContentVariants,
} from "@/lib/workspace/universal/drawerMotionGrammar";
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
import { LiveLobbyWallContent } from "@/components/lobby/LiveLobbyDrawer";
import CastWorkspaceContent from "./CastWorkspaceContent";
import ShopDrawerPanel from "@/components/drawers/ShopDrawerPanel";
import CreatorCommerceCenterDrawer from "@/components/drawers/CreatorCommerceCenterDrawer";
const PerformerBioMagazineDrawer = dynamic(() => import("@/components/drawers/PerformerBioMagazineDrawer"), {
  ssr: false,
  loading: () => <div style={{ padding: 24, color: "rgba(255,255,255,0.35)" }}>Loading…</div>,
});

const YoPhoConnectedDrawer = dynamic(() => import("@/components/yopho/living/YoPhoConnectedDrawer"), {
  ssr: false,
  loading: () => <div style={{ padding: 16, color: "#00FFFF" }}>Loading YoPho drawer…</div>,
});
const YoPhoLivingStudio = dynamic(() => import("@/components/yopho/living/YoPhoLivingStudio"), {
  ssr: false,
  loading: () => <div style={{ padding: 16, color: "#FF2DAA" }}>Loading Living Studio…</div>,
});
const YoPhoStudio = dynamic(() => import("@/components/yopho/YoPhoStudio"), {
  ssr: false,
  loading: () => <div style={{ padding: 24, color: "#00FFFF" }}>Loading YoPho Studio…</div>,
});

const ROLODEX_TOOLS: { id: UniversalWorkspaceId; label: string; icon: string }[] = [
  { id: "lobby", label: "LOBBY", icon: "🏢" },
  { id: "avatar-quick", label: "AVATAR", icon: "👤" },
  { id: "store", label: "SHOP", icon: "🛒" },
  { id: "memory-wall", label: "MEMORY", icon: "🧠" },
  { id: "playlist-studio", label: "PLAYLIST", icon: "🎵" },
  { id: "room-controls", label: "VENUE", icon: "🎛️" },
  { id: "inventory", label: "INVENTORY", icon: "🎒" },
  { id: "yopho", label: "YOPHO", icon: "📷" },
  { id: "prize-vault", label: "REWARDS", icon: "🏆" },
  { id: "achievement-center", label: "ACHIEVEMENTS", icon: "🌟" },
  { id: "championship-center", label: "CHAMPIONSHIP", icon: "⚔️" },
  { id: "analytics", label: "STATS", icon: "📊" },
  { id: "sponsors", label: "SPONSORS", icon: "⭐" },
  { id: "messaging", label: "MESSAGES", icon: "💬" },
  { id: "live-destinations", label: "CAST", icon: "📡" },
  { id: "settings", label: "SETTINGS", icon: "⚙️" },
];

function hardwareLauncherStyle(active: boolean, accent = "#00FFFF"): React.CSSProperties {
  return {
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 72,
    minHeight: 56,
    padding: "8px 10px",
    borderRadius: 8,
    border: active ? `1px solid ${accent}` : "1px solid rgba(190,210,235,0.28)",
    background: active
      ? `linear-gradient(180deg, ${accent}44 0%, ${accent}18 55%, #0a0e16 100%)`
      : "linear-gradient(180deg, #3a4254 0%, #1a1f2c 55%, #0e1218 100%)",
    color: active ? "#fff" : "rgba(255,255,255,0.82)",
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: "0.08em",
    cursor: "pointer",
    fontFamily: "inherit",
    whiteSpace: "nowrap",
    boxShadow: active
      ? `0 0 14px ${accent}44, inset 0 1px 0 rgba(255,255,255,0.28)`
      : "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.45)",
    textTransform: "uppercase",
  };
}

function chromeBtn(
  label: string,
  onClick: () => void,
  opts?: { accent?: string; title?: string; testId?: string; touchSize?: boolean },
) {
  const accent = opts?.accent ?? "#00FFFF";
  return (
    <button
      type="button"
      onClick={onClick}
      title={opts?.title}
      aria-label={opts?.title}
      data-testid={opts?.testId}
      style={{
        flexShrink: 0,
        minWidth: opts?.touchSize ? 44 : undefined,
        minHeight: opts?.touchSize ? 44 : undefined,
        background: "linear-gradient(180deg, #3a4254 0%, #1a1f2c 100%)",
        border: `1px solid ${accent}88`,
        borderRadius: 6,
        color: accent,
        fontSize: 9,
        fontWeight: 900,
        padding: "6px 10px",
        cursor: "pointer",
        fontFamily: "inherit",
        whiteSpace: "nowrap",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.22), 0 2px 4px rgba(0,0,0,0.4)",
        letterSpacing: "0.06em",
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
}: {
  userId?: string;
  displayName?: string;
  role: "fan" | "performer";
  /** @deprecated Ignored — drawer never steals monitor stage. */
  stageDeck?: boolean;
}) {
  const { drawerWorkspace, isDrawerExpanded, mediaConsoleMode, closeSurface, toggleDrawerExpand, drawerMotionKind } =
    useWorkspacePresentationStore();
  const mobileMode = useWorkspacePresentationStore((s) => s.mobileMode);
  const activeControlMode = useWorkspacePresentationStore((s) => s.activeControlMode);
  const activeQuickPanel = useCompactQuickPanelStore((s) => s.activePanel);
  const setVenueContext = useCompactQuickPanelStore((s) => s.setVenueContext);
  const hubRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const prefersReducedMotion = useReducedMotion();
  const drawerFrameHeight = useMobileGpsMonitorLayoutStore((s) => s.drawerFrameHeight);
  const setDrawerFrameHeight = useMobileGpsMonitorLayoutStore((s) => s.setDrawerFrameHeight);
  const gpsOverlayOpen = useMobileGpsMonitorLayoutStore((s) => isGpsDrawerVisible(s.layout));
  const drawerFullscreen = useMobileGpsMonitorLayoutStore((s) => s.drawerFullscreen);
  const setDrawerFullscreen = useMobileGpsMonitorLayoutStore((s) => s.setDrawerFullscreen);
  const resizeRef = useRef<{ y: number; height: number } | null>(null);
  const venueToolsPolicy = resolveVenueToolsPolicy({
    role,
    isLive: isLivePublished,
    isGoLiveContext: Boolean(hubRoomId),
  });
  const venueToolsAllowed = isVenueToolsEnabled(venueToolsPolicy);

  const visibleTools = useMemo(() => {
    const base =
      role === "performer"
        ? ROLODEX_TOOLS.filter((t) => t.id !== "avatar-quick" && t.id !== "inventory")
        : ROLODEX_TOOLS;
    if (venueToolsAllowed) return base;
    return base.filter((t) => t.id !== "room-controls");
  }, [role, venueToolsAllowed]);

  const rolodexIndex = useMemo(() => {
    if (!drawerWorkspace) return -1;
    return visibleTools.findIndex((t) => t.id === drawerWorkspace);
  }, [drawerWorkspace, visibleTools]);

  const isLobbyWall = drawerWorkspace === "lobby";
  const isCastWorkspace = drawerWorkspace === "live-destinations";
  const isContextualShop = drawerWorkspace === "shop" || drawerWorkspace === "merch";
  const isOwnerCommerce = drawerWorkspace === "store" && role === "performer";
  const contentOpen = Boolean(drawerWorkspace && isDrawerExpanded);
  const drawerGuide = hubDrawerGuide(drawerWorkspace);
  useHubDrawerBackContract(mobileMode !== "CONTROL" && contentOpen, () => {
    closeSurface("DRAWER");
    return true;
  });

  if (mobileMode === "CONTROL") {
    return <ExperienceControlDeck mode={activeControlMode} userId={userId} role={role} />;
  }

  const uid = userId ?? "session";
  const name = displayName ?? "Member";
  const closeDrawer = () => closeSurface("DRAWER");
  const shellTransition = prefersReducedMotion ? REDUCED_MOTION_TRANSITION : DRAWER_TRANSITION;
  const contentVariants = resolveDrawerContentVariants(
    drawerMotionKind === "CHILD_PUSH"
      ? "CHILD_PUSH"
      : drawerMotionKind === "RETURN_RESTORE" || drawerMotionKind === "CHILD_POP"
        ? "RETURN_RESTORE"
        : "PANEL_SCALE_FADE",
  );

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

  const onResizeDown = (event: React.PointerEvent<HTMLDivElement>) => {
    resizeRef.current = { y: event.clientY, height: drawerFrameHeight };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onResizeMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeRef.current || drawerFullscreen) return;
    setDrawerFrameHeight(resizeRef.current.height + (event.clientY - resizeRef.current.y));
  };
  const onResizeUp = () => {
    resizeRef.current = null;
  };

  return (
    <div
      data-canonical-bottom-drawer
      data-media-console-drawer
      data-stage-deck="dock"
      data-drawer-below-monitors="1"
      data-active-drawer={drawerWorkspace ?? "none"}
      data-media-console-mode={mediaConsoleMode}
      style={{
        width: "100%",
        flexShrink: 0,
        marginTop: 0,
        background: "linear-gradient(180deg, #1c2230 0%, #0a0e16 100%)",
        border: "1px solid rgba(190, 210, 235, 0.28)",
        borderRadius: 10,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 -8px 28px rgba(0,0,0,0.55)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Persistent launcher row — always visible; never replaces monitors */}
      <div
        data-drawer-launcher-row="1"
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          padding: "8px 10px",
          background: "linear-gradient(180deg, #2a3140 0%, #12161f 100%)",
          borderBottom: contentOpen ? "1px solid rgba(0,229,255,0.2)" : "none",
          scrollbarWidth: "none" as const,
          flexShrink: 0,
          scrollPaddingRight: gpsOverlayOpen ? GPS_OVERLAY_CLEARANCE : undefined,
        }}
      >
        {visibleTools.map((tool) => {
          const isVenueRolodex = tool.id === "room-controls";
          const isActive = isVenueRolodex
            ? activeQuickPanel === "venue"
            : contentOpen && drawerWorkspace === tool.id;
          const accent =
            tool.id === "store"
              ? "#FFD700"
              : tool.id === "achievement-center"
                ? "#FFD700"
                : tool.id === "playlist-studio"
                  ? "#AA2DFF"
                  : "#00FFFF";
          return (
            <button
              key={tool.id}
              type="button"
              data-testid={`tmi-drawer-launch-${tool.id}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                openRolodexTool(tool);
              }}
              style={hardwareLauncherStyle(isActive, accent)}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>
                {tool.icon}
              </span>
              <span>{tool.label}</span>
            </button>
          );
        })}
        {gpsOverlayOpen ? (
          <span aria-hidden data-gps-overlay-clearance="1" style={{ flex: `0 0 ${GPS_OVERLAY_CLEARANCE}` }} />
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {contentOpen ? (
          <motion.div
            key="drawer-panel"
            data-drawer-content-panel="1"
            data-drawer-motion={drawerMotionKind ?? "DRAWER_IN"}
            variants={DRAWER_SHELL_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={shellTransition}
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
            }}
          >
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
              {chromeBtn("‹ CLOSE", closeDrawer, {
                accent: "#00FFFF",
                title: "Close drawer — monitors stay live",
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
                  maxWidth: 140,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {(drawerWorkspace ?? "").replace(/-/g, " ")}
              </span>
              <div style={{ flex: 1 }} />
              {chromeBtn("◀ PREV", goPrev, { title: "Previous workspace" })}
              {chromeBtn("NEXT ▶", goNext, { title: "Next workspace" })}
              {chromeBtn(drawerFullscreen ? "WINDOW" : "FULL", () => setDrawerFullscreen(!drawerFullscreen), {
                title: drawerFullscreen ? "Return drawer to the shared slot" : "Open this drawer full screen",
              })}
              {chromeBtn(isDrawerExpanded ? "MINIMIZE" : "EXPAND", toggleDrawerExpand, {
                title: "Toggle drawer height",
              })}
              {chromeBtn("×", closeDrawer, { accent: "#FF2DAA", title: "Close workspace", testId: "hub-drawer-close", touchSize: true })}
            </div>
            {drawerGuide ? (
              <p
                data-testid="hub-drawer-purpose"
                style={{ margin: 0, padding: "6px 10px", fontSize: 11, lineHeight: 1.4, color: "rgba(255,255,255,0.75)" }}
              >
                {drawerGuide.purpose}
              </p>
            ) : null}

            <motion.div
              data-lobby-drawer-scroll={isLobbyWall ? "1" : undefined}
              data-cast-drawer={isCastWorkspace ? "1" : undefined}
              layout={!prefersReducedMotion}
              transition={prefersReducedMotion ? REDUCED_MOTION_TRANSITION : EXPAND_FOCUS_TRANSITION}
              style={{
                padding: 14,
                flex: 1,
                minHeight: 0,
                overflowY: "auto",
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={drawerWorkspace}
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={shellTransition}
                  style={{ width: "100%" }}
                >
                  {isLobbyWall ? (
                    <LiveLobbyWallContent role={role} />
                  ) : isCastWorkspace ? (
                    <CastWorkspaceContent role={role} userId={uid} />
                  ) : drawerWorkspace === "playlist-studio" ? (
                    <div data-canonical-bottom-drawer-playlist-host="1" style={{ width: "100%" }}>
                      <PlaylistCanister
                        entityId={uid}
                        entityName={name}
                        isOwner
                        role={role}
                        layout="full"
                      />
                    </div>
                  ) : drawerWorkspace === "yopho" ? (
                    <div data-canonical-bottom-drawer-yopho-host="1" style={{ width: "100%", display: "grid", gap: 10 }}>
                      <YoPhoConnectedDrawer ownerId={uid} />
                      <YoPhoLivingStudio ownerId={uid} />
                    </div>
                  ) : isOwnerCommerce ? (
                    <div data-testid="performer-shop-management" style={{ width: "100%" }}>
                      <CreatorCommerceCenterDrawer
                        performerId={uid}
                        displayName={name}
                        onOpenYoPho={() => presentCanonicalWorkspace("yopho", "DRAWER")}
                        onOpenShop={() => presentCanonicalWorkspace("shop", "DRAWER")}
                      />
                    </div>
                  ) : isContextualShop ? (
                    <div data-canonical-bottom-drawer-shop-host="1" data-active-performer-shop="1" style={{ width: "100%" }}>
                      <ShopDrawerPanel
                        role={role}
                        inventoryMode="contextual"
                        accentColor="#AA2DFF"
                      />
                    </div>
                  ) : drawerWorkspace === "share-studio" ? (
                    <ShareStudioContent
                      context={{ sharePath: typeof window !== "undefined" ? window.location.pathname : "/" }}
                    />
                  ) : drawerWorkspace === "settings" ? (
                    <SettingsWorkspaceContent userId={uid} displayName={name} />
                  ) : drawerWorkspace === "avatar-quick" && role === "fan" ? (
                    <FanAvatarCanister userId={uid} displayName={name} role="FAN" />
                  ) : drawerWorkspace === "bio-magazine" && role === "performer" ? (
                    <PerformerBioMagazineDrawer userId={uid} displayName={name} />
                  ) : drawerWorkspace === "room-controls" ? (
                    <VenueControlPanel role={role} userId={uid} venueId={uid} accentColor="#00FF88" />
                  ) : (
                    <UniversalWorkspaceStubContent
                      workspaceId={drawerWorkspace!}
                      role={role}
                      userId={uid}
                      displayName={name}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <div
        data-testid="hub-drawer-resize"
        onPointerDown={onResizeDown}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeUp}
        style={{
          height: 14,
          flexShrink: 0,
          cursor: drawerFullscreen ? "default" : "ns-resize",
          background: "linear-gradient(180deg, transparent, rgba(0,255,255,0.35))",
        }}
      />
    </div>
  );
}
