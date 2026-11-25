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

import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import { useMobileGpsMonitorLayoutStore } from "@/lib/commandCenter/mobileGpsMonitorLayoutStore";
import {
  resolveWorkDrawerMaxHeightCss,
  resolveWorkDrawerMinHeightPx,
} from "@/lib/monitors/workCompactPreviewSize";
import { presentCanonicalWorkspace } from "@/lib/workspace/universal/openCanonicalPresentation";
import type { UniversalWorkspaceId } from "@/lib/workspace/universal/types";
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

function prefetchYoPhoStudios() {
  void import("@/components/yopho/living/YoPhoConnectedDrawer");
  void import("@/components/yopho/living/YoPhoCreatorWorkspace");
  void import("@/components/yopho/living/YoPhoLivingStudio");
}

function YoPhoOpeningShell({ label }: { label: string }) {
  return (
    <div
      data-yopho-opening-shell="1"
      style={{
        minHeight: 220,
        padding: 16,
        borderRadius: 12,
        border: "1px solid rgba(0,255,255,0.35)",
        background: "rgba(5,5,16,0.96)",
        display: "grid",
        gap: 12,
      }}
    >
      <div style={{ color: "#00FFFF", fontWeight: 900, letterSpacing: "0.12em", fontSize: 12 }}>YOPHO</div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["TRADING CARD", "ALBUM COVER"].map((name) => (
          <span
            key={name}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.72)",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            {name}
          </span>
        ))}
      </div>
      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{label}</div>
    </div>
  );
}

const YoPhoConnectedDrawer = dynamic(() => import("@/components/yopho/living/YoPhoConnectedDrawer"), {
  ssr: false,
  loading: () => <YoPhoOpeningShell label="Opening creator…" />,
});
const YoPhoLivingStudio = dynamic(() => import("@/components/yopho/living/YoPhoLivingStudio"), {
  ssr: false,
  loading: () => <YoPhoOpeningShell label="Opening Living Card Studio…" />,
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
  { id: "notes", label: "NOTES", icon: "📝" },
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
  opts?: { accent?: string; title?: string; testId?: string; pressed?: boolean; disabled?: boolean },
) {
  const accent = opts?.accent ?? "#00FFFF";
  return (
    <button
      type="button"
      data-testid={opts?.testId}
      aria-pressed={opts?.pressed}
      disabled={opts?.disabled}
      onClick={onClick}
      title={opts?.title}
      style={{
        flexShrink: 0,
        background: "linear-gradient(180deg, #3a4254 0%, #1a1f2c 100%)",
        border: `1px solid ${accent}88`,
        borderRadius: 6,
        color: accent,
        fontSize: 9,
        fontWeight: 900,
        padding: "6px 10px",
        minHeight: 44,
        minWidth: 44,
        cursor: opts?.disabled ? "default" : "pointer",
        opacity: opts?.disabled ? 0.45 : 1,
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
  onOpenYourPage,
}: {
  userId?: string;
  displayName?: string;
  role: "fan" | "performer";
  /** @deprecated Ignored — drawer never steals monitor stage. */
  stageDeck?: boolean;
  /** §20995-M — Your Page opens in the same WORK path under MP1. */
  onOpenYourPage?: () => void;
}) {
  const { drawerWorkspace, isDrawerExpanded, mediaConsoleMode, closeSurface, drawerMotionKind } =
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
  const drawerFullscreen = useMobileGpsMonitorLayoutStore((s) => s.drawerFullscreen);
  const drawerPresentation = useMobileGpsMonitorLayoutStore((s) => s.drawerPresentation);
  const applyDrawerPresentation = useMobileGpsMonitorLayoutStore((s) => s.applyDrawerPresentation);
  const drawerOverlay = drawerPresentation !== "compact";
  const resizeRef = useRef<{ y: number; height: number } | null>(null);
  const workHostRef = useRef<HTMLDivElement | null>(null);
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
  const workMinHeight = resolveWorkDrawerMinHeightPx(drawerWorkspace);
  const workMaxHeightCss = resolveWorkDrawerMaxHeightCss(drawerWorkspace);

  const [showYoPhoLiving, setShowYoPhoLiving] = useState(false);

  useEffect(() => {
    prefetchYoPhoStudios();
  }, []);

  useEffect(() => {
    if (drawerWorkspace !== "yopho") return;
    const timer = window.setTimeout(() => setShowYoPhoLiving(true), 400);
    return () => window.clearTimeout(timer);
  }, [drawerWorkspace]);

  /** §20995-E: opening WORK must reveal content without hunting below two monitors. */
  useEffect(() => {
    if (!contentOpen || drawerOverlay || typeof window === "undefined") return;
    const node = workHostRef.current;
    if (!node) return;
    const reduce =
      prefersReducedMotion ||
      (typeof window.matchMedia === "function" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    requestAnimationFrame(() => {
      /* §20995-F: after monitor compact, bring WORK into the visible workspace */
      node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
    });
  }, [contentOpen, drawerWorkspace, prefersReducedMotion, drawerOverlay]);

  useEffect(() => {
    if (!contentOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (drawerPresentation === "compact") {
        if (typing) return;
        closeDrawer();
        return;
      }
      event.preventDefault();
      applyDrawerPresentation("escape");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [contentOpen, drawerPresentation, applyDrawerPresentation]);

  useEffect(() => {
    if (!contentOpen || drawerPresentation !== "fullscreen") return;
    window.history.pushState({ tmiDrawerFullscreen: 1 }, "");
    let pushed = true;
    const onPop = () => {
      pushed = false;
      applyDrawerPresentation("restore");
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (pushed) {
        pushed = false;
        window.history.back();
      }
    };
  }, [contentOpen, drawerPresentation, applyDrawerPresentation]);

  if (mobileMode === "CONTROL") {
    return <ExperienceControlDeck mode={activeControlMode} userId={userId} role={role} />;
  }

  const uid = userId ?? "session";
  const name = displayName ?? "Member";
  const closeDrawer = () => {
    applyDrawerPresentation("close");
    closeSurface("DRAWER");
  };
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
      ref={workHostRef}
      data-canonical-bottom-drawer
      data-media-console-drawer
      data-stage-deck="dock"
      data-drawer-below-monitors="1"
      data-active-drawer={drawerWorkspace ?? "none"}
      data-media-console-mode={mediaConsoleMode}
      style={{
        width: "100%",
        /* §20995 P0/E: WORK host must NOT flex-grow against the monitor column.
           Closed = launcher height only. Open = explicit frame height in normal flow. */
        flex: drawerOverlay && contentOpen ? "1 1 auto" : "0 0 auto",
        flexShrink: 0,
        marginTop: 0,
        background: "linear-gradient(180deg, #1c2230 0%, #0a0e16 100%)",
        border: "1px solid rgba(190, 210, 235, 0.28)",
        borderRadius: drawerFullscreen ? 0 : 10,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), 0 -8px 28px rgba(0,0,0,0.55)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: drawerOverlay && contentOpen ? 0 : contentOpen ? Math.max(drawerFrameHeight, workMinHeight) : undefined,
        height: drawerOverlay && contentOpen ? "100%" : contentOpen ? Math.max(drawerFrameHeight, workMinHeight) : "auto",
        maxHeight: drawerOverlay ? "none" : contentOpen ? workMaxHeightCss : undefined,
      }}
      data-work-drawer-size={drawerWorkspace ?? "closed"}
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
              onPointerEnter={tool.id === "yopho" ? prefetchYoPhoStudios : undefined}
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
        {onOpenYourPage ? (
          <button
            type="button"
            data-testid="tmi-drawer-launch-your-page"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onOpenYourPage();
            }}
            style={hardwareLauncherStyle(false, "#FF2DAA")}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden>
              📄
            </span>
            <span>YOUR PAGE</span>
          </button>
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
              {chromeBtn("EXPAND", () => applyDrawerPresentation("expand"), {
                testId: "tmi-drawer-size-expand",
                title: "Larger editing area",
                pressed: drawerPresentation === "expanded",
              })}
              {chromeBtn("FULL SCREEN", () => applyDrawerPresentation("fullscreen"), {
                testId: "tmi-drawer-size-fullscreen",
                title: "Use the full screen",
                pressed: drawerFullscreen,
              })}
              {chromeBtn("RESTORE", () => applyDrawerPresentation("restore"), {
                testId: "tmi-drawer-size-restore",
                title: "Return to the previous drawer size",
                disabled: drawerPresentation === "compact",
              })}
              {chromeBtn("×", closeDrawer, { testId: "tmi-drawer-size-close", accent: "#FF2DAA", title: "Close workspace" })}
            </div>

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
                      {showYoPhoLiving ? <YoPhoLivingStudio ownerId={uid} /> : null}
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
                    <div data-avatar-drawer-mount="creation-center" style={{ width: "100%", minWidth: 0 }}>
                      <FanAvatarCanister userId={uid} displayName={name} role="FAN" />
                    </div>
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
