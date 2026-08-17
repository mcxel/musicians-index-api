"use client";

/**
 * Shared Fan + Performer Command Center shell (blueprint chrome).
 * Same layout: L rail | dual→quad→octo media | R rail | bottom drawer | dock.
 * Role-gated drawer payloads (Rule 26). Shell colors via ThemeEngine (device persist).
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import PersistentMediaInteractionDock from "./PersistentMediaInteractionDock";
import CommandCenterPlaylistBand from "./CommandCenterPlaylistBand";
import CommandCenterSessionControlStrip from "./CommandCenterSessionControlStrip";
import CameraCaptureOverlay from "@/components/panels/CameraCaptureOverlay";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import CommandCenterMediaStack, {
  type CommandCenterMediaSlot,
  type CommandCenterPlaylistCast,
} from "./CommandCenterMediaStack";
import CommandCenterDrawer from "./CommandCenterDrawer";
import {
  getUniversalDrawerModule,
  type UniversalDrawerModuleId,
} from "@/lib/drawers/UniversalDrawerRegistry";
import {
  type CommandCenterPanelId,
  type CommandCenterRole,
  isFanOnlyPanel,
} from "./commandCenterRegistry";
import { FAN_AD_ZONE, FAN_DRAWER_LAUNCHERS } from "./FanCommandDrawerRegistry";
import { PERFORMER_DRAWER_LAUNCHERS } from "./PerformerCommandDrawerRegistry";
import { useTheme } from "@/lib/design/ThemeEngine";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import {
  subscribePlaylistCast,
  subscribePlaylistNowPlaying,
  type PlaylistCastPayload,
} from "@/lib/playlists/PlaylistMonitorCast";
import { centersForRole } from "@/lib/drawers/operatingCenterRegistry";
import { drawerStateStore } from "@/lib/drawers/drawerStateStore";
import type { ActionId } from "@/lib/os/universalActionRegistry";
import {
  ActivePerformerProvider,
  useActivePerformer,
} from "@/lib/context/ActivePerformerContext";
import RoleSwitcherWidget from "@/components/navigation/RoleSwitcherWidget";
import OperationsSidebar from "@/components/sidebar/OperationsSidebar";
import CommandCenterTopNav from "./CommandCenterTopNav";
import {
  openCanonicalWorkspaceQuick,
  presentCanonicalWorkspace,
} from "@/lib/workspace/universal/openCanonicalPresentation";
import CommandCenterIdentityCard from "./CommandCenterIdentityCard";
import PointFlightEngine from "@/components/hud/PointFlightEngine";
import FloatingWorkspacePanel from "@/components/workspace/FloatingWorkspacePanel";
import UniversalWorkspaceHost from "@/components/workspace/universal/UniversalWorkspaceHost";
import GlobalErrorBoundary from "@/components/system/GlobalErrorBoundary";
import {
  openHubQuickLaunch,
  isUniversalWorkspaceOpenForModule,
} from "@/lib/commandCenter/hubQuickLaunch";
import CanonicalLeftQuickPanelHost from "@/components/workspace/universal/CanonicalLeftQuickPanelHost";
import CanonicalRightQuickPanelHost from "@/components/workspace/universal/CanonicalRightQuickPanelHost";
import CanonicalBottomDrawerHost from "@/components/workspace/universal/CanonicalBottomDrawerHost";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import AdRail, { type AdRailExperienceMode } from "@/components/monetization/AdRail";
import PerformerCreatorControlCluster from "./PerformerCreatorControlCluster";

interface LiveApiSession {
  userId: string;
  displayName: string;
  roomId: string;
  viewerCount: number;
  avatarUrl: string | null;
}

interface CommandCenterShellProps {
  role: CommandCenterRole;
  userId: string;
  displayName: string;
}

type MonitorLayoutMode = "DUAL" | "PRIMARY_ONLY" | "HIDDEN";
type MonitorStagePhase = "VISIBLE" | "EXITING" | "HIDDEN" | "ENTERING";
const MONITOR_STAGE_TRANSITION_MS = 190;

function isProofDiagnosticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("proof") === "1";
  } catch {
    return false;
  }
}

function traceLaunch(action: string, payload?: unknown): void {
  if (process.env.NODE_ENV !== "development" && !isProofDiagnosticsEnabled()) return;
  if (typeof window !== "undefined") {
    const w = window as Window & { __TMI_LAUNCH_TRACE__?: Array<unknown> };
    const current = w.__TMI_LAUNCH_TRACE__ ?? [];
    current.push({ action, payload, timestamp: performance.now() });
    if (current.length > 200) current.shift();
    w.__TMI_LAUNCH_TRACE__ = current;
  }
  console.debug("[TMI:LAUNCH]", { action, payload });
}

export default function CommandCenterShell({ role, userId, displayName }: CommandCenterShellProps) {
  const defaultPerformer = useMemo(() => {
    if (role !== "performer") return null;
    const p = getPerformerById(userId);
    return p
      ? { id: p.id, slug: p.slug, name: p.name }
      : { id: userId, slug: userId, name: displayName };
  }, [role, userId, displayName]);

  return (
    <ActivePerformerProvider
      defaultPerformer={defaultPerformer}
      role={role}
      userId={userId}
    >
      <CommandCenterShellInner role={role} userId={userId} displayName={displayName} />
    </ActivePerformerProvider>
  );
}

const HUB_DRAWER_DEEPLINK_KEY = "tmi_hub_drawer_deeplink_v1";
const BIO_MAGAZINE_TAB_EVENT = "tmi:performer-bio-magazine-open-tab";
type PerformerBioTab = "profile" | "biography" | "magazine" | "gallery" | "music" | "interviews";

function CommandCenterShellInner({ role, userId, displayName }: CommandCenterShellProps) {
  const isDevBuild = process.env.NODE_ENV === "development";
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const searchParams = useSearchParams();
  const isProofReplay = searchParams?.get("proof") === "1";
  const proofAdsOverride = searchParams?.get("proofAds");
  const diagnosticsEnabled = isDevBuild || isProofReplay;
  // Dev-only isolation switch for /hub/performer?proof=1 crash triage.
  const suppressProofPerformerAd =
    role === "performer" &&
    isProofReplay &&
    proofAdsOverride !== "on";
  const theme = useTheme();
  const [liveDisplayName, setLiveDisplayName] = useState(displayName);
  useEffect(() => {
    setLiveDisplayName(displayName);
  }, [displayName]);
  useEffect(() => {
    const onUpdated = (e: Event) => {
      const name = (e as CustomEvent<{ name?: string }>).detail?.name?.trim();
      if (name) setLiveDisplayName(name);
    };
    window.addEventListener("tmi:display-name-updated", onUpdated);
    return () => window.removeEventListener("tmi:display-name-updated", onUpdated);
  }, []);
  const resolvedDisplayName = liveDisplayName;
  const { activePerformer, setActivePerformer } = useActivePerformer();
  const centers = centersForRole(role);
  const ocPrimaryIds = useMemo(
    () => new Set(centers.map((c) => c.primaryModule)),
    [centers],
  );
  const drawerLaunchers = useMemo(() => {
    const list =
      role === "performer" ? PERFORMER_DRAWER_LAUNCHERS : FAN_DRAWER_LAUNCHERS;
    // Skip modules already opened by an Operating Center primary button (no duplicates).
    return list.filter((id) => !ocPrimaryIds.has(id));
  }, [role, ocPrimaryIds]);

  const [activePanel, setActivePanel] = useState<CommandCenterPanelId | null>(() => {
    const last = drawerStateStore.getLastPanel(role);
    if (last && role === "performer" && isFanOnlyPanel(last)) return null;
    return last;
  });
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const mediaStageRef = useRef<HTMLDivElement>(null);
  const [playlistCast, setPlaylistCast] = useState<CommandCenterPlaylistCast | null>(null);
  const [deepLinkPlaylistId, setDeepLinkPlaylistId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(true); // mobile-first: avoids desktop-grid overflow flash on phones
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    const handleOpenOps = () => setMobileLeftOpen(true);
    window.addEventListener("tmi:open-ops-menu", handleOpenOps);
    return () => window.removeEventListener("tmi:open-ops-menu", handleOpenOps);
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-shell-build", "ccs-2026-08-16-p0shell");
  }, []);
  const [monitorLayoutMode, setMonitorLayoutMode] = useState<MonitorLayoutMode>("DUAL");
  const [monitorStagePhase, setMonitorStagePhase] = useState<MonitorStagePhase>("VISIBLE");
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const monitorPhaseTimerRef = useRef<number | null>(null);
  const monitorLayoutModeRef = useRef<MonitorLayoutMode>("DUAL");
  monitorLayoutModeRef.current = monitorLayoutMode;
  const drawerWorkspace = useWorkspacePresentationStore((s) => s.drawerWorkspace);
  const isDrawerExpanded = useWorkspacePresentationStore((s) => s.isDrawerExpanded);
  const mediaConsoleMode = useWorkspacePresentationStore((s) => s.mediaConsoleMode);
  const mobileMode = useWorkspacePresentationStore((s) => s.mobileMode);
  const activeWorkspace = useWorkspacePresentationStore((s) => s.activeWorkspace);
  const activeControlMode = useWorkspacePresentationStore((s) => s.activeControlMode);
  const previousMonitorCount = useWorkspacePresentationStore((s) => s.previousMonitorCount);
  const storeMonitorCount = useWorkspacePresentationStore((s) => s.monitorCount);
  const focusedViewport = useWorkspacePresentationStore((s) => s.focusedViewport);
  const sourceA = useWorkspacePresentationStore((s) => s.sourceA);
  const sourceB = useWorkspacePresentationStore((s) => s.sourceB);
  const transition = useWorkspacePresentationStore((s) => s.transition);
  const openWorkspace = useWorkspacePresentationStore((s) => s.openWorkspace);
  const closeWorkspace = useWorkspacePresentationStore((s) => s.closeWorkspace);
  const openControl = useWorkspacePresentationStore((s) => s.openControl);
  const closeControl = useWorkspacePresentationStore((s) => s.closeControl);
  const cycleMonitorCount = useWorkspacePresentationStore((s) => s.cycleMonitorCount);
  const setPresentationMonitorCount = useWorkspacePresentationStore((s) => s.setMonitorCount);
  const mobilePresentation = useMemo(
    () => ({
      mode: mobileMode,
      activeWorkspace,
      activeControlMode,
      previousMonitorCount,
      monitorCount: storeMonitorCount,
      focusedViewport,
      sourceA,
      sourceB,
      transition,
      openWorkspace,
      closeWorkspace,
      openControl,
      closeControl,
      cycleMonitorCount,
      setMonitorCount: setPresentationMonitorCount,
    }),
    [
      mobileMode,
      activeWorkspace,
      activeControlMode,
      previousMonitorCount,
      storeMonitorCount,
      focusedViewport,
      sourceA,
      sourceB,
      transition,
      openWorkspace,
      closeWorkspace,
      openControl,
      closeControl,
      cycleMonitorCount,
      setPresentationMonitorCount,
    ],
  );
  /** Mobile Stage Deck: MONITORS ⇄ WORKSPACE — mutually exclusive presentation of one region. */
  const stageDeckWork = isMobile && mobilePresentation.mode === "WORK";
  const stageDeckShowMonitors = isMobile && !stageDeckWork && monitorLayoutMode !== "HIDDEN";
  const [featured, setFeatured] = useState<{
    name: string;
    route: string;
    videoUrl?: string;
    imageUrl?: string;
    viewers?: number;
    performerId?: string;
    performerSlug?: string;
  } | null>(null);

  const hubDrawerDeepLinkDone = useRef(false);
  const proofDrawerDeepLinkDone = useRef(false);
  /** True only when a control surface collapsed the Stage — not when Marcel hid it manually. */
  const stageCollapsedByControlRef = useRef(false);
  const stageCollapseRestoreModeRef = useRef<MonitorLayoutMode>("DUAL");

  const monitorCount = monitorLayoutMode === "DUAL" ? 2 : monitorLayoutMode === "PRIMARY_ONLY" ? 1 : 0;
  const monitorTransitionLocked = monitorStagePhase === "EXITING" || monitorStagePhase === "ENTERING";
  const isWatchMode = mobilePresentation.mode === "WATCH";
  const isWorkMode = mobilePresentation.mode === "WORK";
  const isControlMode = mobilePresentation.mode === "CONTROL";
  const effectiveMonitorCount = isWorkMode ? 0 : isControlMode ? 1 : monitorCount;
  const monitorLayoutForStack = isControlMode || monitorLayoutMode === "PRIMARY_ONLY" ? "primary" : "dual";
  const shouldCollapseMonitorRegion =
    isWorkMode ||
    (isWatchMode && effectiveMonitorCount === 0);
  const monitorZeroGeometry: CSSProperties = {
    display: "none",
    height: 0,
    minHeight: 0,
    maxHeight: 0,
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 0,
    aspectRatio: "unset",
    margin: 0,
    padding: 0,
    gap: 0,
    border: 0,
    overflow: "hidden",
    pointerEvents: "none",
    visibility: "hidden",
    opacity: 0,
  };

  const hideMonitorLayout = shouldCollapseMonitorRegion || monitorStagePhase === "HIDDEN" || isWorkMode;
  const monitorRegionStyle: CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    ...(!hideMonitorLayout && !prefersReducedMotion && monitorStagePhase === "EXITING"
      ? { animation: `tmiMonitorExit ${MONITOR_STAGE_TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1) forwards` }
      : {}),
    ...(!hideMonitorLayout && !prefersReducedMotion && monitorStagePhase === "ENTERING"
      ? { animation: `tmiMonitorEnter ${MONITOR_STAGE_TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1) both` }
      : {}),
    ...(hideMonitorLayout ? monitorZeroGeometry : {}),
  };

  const clearMonitorPhaseTimer = () => {
    if (monitorPhaseTimerRef.current != null) {
      window.clearTimeout(monitorPhaseTimerRef.current);
      monitorPhaseTimerRef.current = null;
    }
  };

  const scheduleMonitorPhase = (handler: () => void) => {
    if (prefersReducedMotion) {
      handler();
      return;
    }
    clearMonitorPhaseTimer();
    monitorPhaseTimerRef.current = window.setTimeout(() => {
      monitorPhaseTimerRef.current = null;
      handler();
    }, MONITOR_STAGE_TRANSITION_MS);
  };

  const transitionMonitorLayout = (nextMode: MonitorLayoutMode) => {
    if (monitorTransitionLocked) return;
    if (nextMode === monitorLayoutMode) return;
    const nextCount = nextMode === "DUAL" ? 2 : nextMode === "PRIMARY_ONLY" ? 1 : 0;
    if (mobilePresentation.monitorCount !== nextCount) {
      mobilePresentation.setMonitorCount(nextCount);
    }

    if (nextMode === "HIDDEN") {
      setMonitorStagePhase("EXITING");
      scheduleMonitorPhase(() => {
        setMonitorLayoutMode("HIDDEN");
        setMonitorStagePhase("HIDDEN");
      });
      return;
    }

    if (monitorLayoutMode === "HIDDEN") {
      setMonitorLayoutMode(nextMode);
      setMonitorStagePhase("ENTERING");
      scheduleMonitorPhase(() => setMonitorStagePhase("VISIBLE"));
      return;
    }

    setMonitorLayoutMode(nextMode);
    setMonitorStagePhase("ENTERING");
    scheduleMonitorPhase(() => setMonitorStagePhase("VISIBLE"));
  };

  // Role-switcher CONTROL_FOCUS: collapse empty stage while picker is open (no workspace yet).
  // Manual HIDE wins: do not restore Stage on close unless this control performed the collapse.
  useEffect(() => {
    if (!isMobile) return;
    if (isWorkMode) {
      if (monitorLayoutModeRef.current !== "HIDDEN") {
        stageCollapseRestoreModeRef.current = monitorLayoutModeRef.current;
        stageCollapsedByControlRef.current = true;
      }
      clearMonitorPhaseTimer();
      if (monitorLayoutMode !== "HIDDEN") setMonitorLayoutMode("HIDDEN");
      if (monitorStagePhase !== "HIDDEN") setMonitorStagePhase("HIDDEN");
      return;
    }

    if (isControlMode && monitorLayoutModeRef.current !== "PRIMARY_ONLY") {
      stageCollapseRestoreModeRef.current = monitorLayoutModeRef.current === "HIDDEN"
        ? stageCollapseRestoreModeRef.current
        : monitorLayoutModeRef.current;
      stageCollapsedByControlRef.current = true;
      transitionMonitorLayout("PRIMARY_ONLY");
      return;
    }

    if (!isWorkMode && !isControlMode && stageCollapsedByControlRef.current && monitorLayoutModeRef.current === "HIDDEN") {
      stageCollapsedByControlRef.current = false;
      transitionMonitorLayout(stageCollapseRestoreModeRef.current);
      return;
    }

    const onFocus = () => {
      if (mobilePresentation.mode !== "WATCH") return;
      if (monitorLayoutModeRef.current !== "HIDDEN") {
        stageCollapseRestoreModeRef.current = monitorLayoutModeRef.current;
        stageCollapsedByControlRef.current = true;
        transitionMonitorLayout("HIDDEN");
      }
    };
    const onFocusEnd = () => {
      if (mobilePresentation.mode !== "WATCH") return;
      if (stageCollapsedByControlRef.current) {
        stageCollapsedByControlRef.current = false;
        transitionMonitorLayout(stageCollapseRestoreModeRef.current);
      }
    };
    window.addEventListener("tmi:control-focus", onFocus);
    window.addEventListener("tmi:control-focus-end", onFocusEnd);
    return () => {
      window.removeEventListener("tmi:control-focus", onFocus);
      window.removeEventListener("tmi:control-focus-end", onFocusEnd);
    };
  }, [isMobile, mobilePresentation.mode, monitorTransitionLocked, monitorLayoutMode, prefersReducedMotion]);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => () => clearMonitorPhaseTimer(), []);

  /** Explicit 📺 MONITORS while in WORK — user asked for WATCH; clear manual hide. */
  const restoreStageMonitors = () => {
    if (mobilePresentation.mode === "CONTROL") {
      mobilePresentation.closeControl();
    } else if (mobilePresentation.mode === "WORK") {
      mobilePresentation.closeWorkspace();
    } else {
      useWorkspacePresentationStore.getState().closeSurface("DRAWER");
    }
    stageCollapsedByControlRef.current = false;
    transitionMonitorLayout(stageCollapseRestoreModeRef.current);
    setMobileLeftOpen(false);
  };

  const openStageWorkspace = (id: string) => {
    traceLaunch("OPEN_STAGE_WORKSPACE", { source: "command-center-shell", workspaceId: id });
    setMobileLeftOpen(false);
    setMobileRightOpen(false);
    // Monitor presentation mode persists while entering WORK.
    presentCanonicalWorkspace(id as any, "DRAWER");
  };

  /** Manual Stage hide (session strip / header toggle) — ownership stays with the user. */
  const hideStageManually = () => {
    stageCollapsedByControlRef.current = false;
    transitionMonitorLayout("HIDDEN");
  };

  const cycleMonitorMode = (): MonitorLayoutMode => {
    if (monitorLayoutMode === "DUAL") return "PRIMARY_ONLY";
    if (monitorLayoutMode === "PRIMARY_ONLY") return "HIDDEN";
    return "DUAL";
  };

  const monitorButtonTitle =
    stageDeckWork
      ? "Restore monitors from WORK surface"
      : monitorTransitionLocked
        ? "Monitor layout transition in progress"
        : `Cycle monitors ${monitorCount} → ${cycleMonitorMode() === "DUAL" ? 2 : cycleMonitorMode() === "PRIMARY_ONLY" ? 1 : 0}`;

  const hasActiveWorkspaceSurface = Boolean(drawerWorkspace && isDrawerExpanded);
  const isLiveRoomRoute = pathname.startsWith("/live/") || pathname.startsWith("/room/");
  const monetizationExperienceMode: AdRailExperienceMode = isLiveRoomRoute
    ? "live-room"
    : hasActiveWorkspaceSurface
      ? "workspace"
      : "dashboard";

  /** Unified monitor-cycle control used by command-bar controls on mobile and desktop. */
  const toggleStageMonitors = () => {
    if (monitorTransitionLocked) return;
    if (stageDeckWork) {
      restoreStageMonitors();
      return;
    }
    stageCollapsedByControlRef.current = false;
    transitionMonitorLayout(cycleMonitorMode());
  };

  // Deterministic mobile proof opener: bypasses click flakiness by forcing the
  // canonical workspace path once for explicit proof URLs.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (proofDrawerDeepLinkDone.current) return;

    const params = new URLSearchParams(window.location.search);
    const isProofReplay = params.get("proof") === "1";
    const drawer = params.get("drawer");
    if (!isProofReplay || drawer !== "yopho") return;

    proofDrawerDeepLinkDone.current = true;
    if (diagnosticsEnabled) document.documentElement.setAttribute("data-proof-yopho-open", "1");
    setAppearanceOpen(false);
    setActivePanel(null);
    drawerStateStore.setLastPanel(role, null);
    presentCanonicalWorkspace("yopho", "DRAWER");
    hubDrawerDeepLinkDone.current = true;
  }, [role, diagnosticsEnabled]);

  // Deep-link: /hub/fan?drawer=playlist&playlistId=… or /hub/fan?drawer=yopho (workspace)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hubDrawerDeepLinkDone.current) return;

    if (diagnosticsEnabled) document.documentElement.setAttribute("data-proof-effect", "entered");

    const params = new URLSearchParams(window.location.search);
    const drawer = params.get("drawer") as UniversalDrawerModuleId | null;
    const playlistId = params.get("playlistId");
    const isProofReplay = params.get("proof") === "1";
    if (!drawer) {
      if (diagnosticsEnabled) document.documentElement.setAttribute("data-proof-effect", "no-drawer");
      return;
    }
    if (!getUniversalDrawerModule(drawer)) {
      if (diagnosticsEnabled) document.documentElement.setAttribute("data-proof-effect", `invalid-${drawer}`);
      return;
    }

    if (isProofReplay) {
      if (diagnosticsEnabled) document.documentElement.setAttribute("data-proof-drawer-open", drawer);
      setAppearanceOpen(false);
      setActivePanel(null);
      drawerStateStore.setLastPanel(role, null);
      if (drawer === "playlist" && playlistId) setDeepLinkPlaylistId(playlistId);
      presentCanonicalWorkspace(drawer as any, "DRAWER");
      if (diagnosticsEnabled) document.documentElement.setAttribute("data-proof-effect", `proof-open-${drawer}`);
      hubDrawerDeepLinkDone.current = true;
      return;
    }

    const consumeKey = `${HUB_DRAWER_DEEPLINK_KEY}:${pathname}:${drawer}:${playlistId ?? ""}`;
    try {
      if (sessionStorage.getItem(consumeKey) === "1") {
        hubDrawerDeepLinkDone.current = true;
        const clean = new URLSearchParams(window.location.search);
        clean.delete("drawer");
        if (drawer !== "playlist") clean.delete("playlistId");
        const qs = clean.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
        return;
      }
      sessionStorage.setItem(consumeKey, "1");
    } catch {
      /* private mode — still open once via ref */
    }

    hubDrawerDeepLinkDone.current = true;
    setAppearanceOpen(false);

    if (drawer === "yopho") {
      openHubQuickLaunch({
        moduleId: "yopho",
        role,
        userId,
        actionId: "ACTION_OPEN_YOPHO_STUDIO",
        openDrawer: (id) => {
          setActivePanel(id);
          drawerStateStore.setLastPanel(role, id);
        },
        openAppearance: () => setAppearanceOpen(true),
        closeDrawer: () => {
          setActivePanel(null);
          drawerStateStore.setLastPanel(role, null);
        },
      });
    } else {
      setActivePanel(drawer);
      drawerStateStore.setLastPanel(role, drawer);
      if (drawer === "playlist" && playlistId) setDeepLinkPlaylistId(playlistId);
    }

    const clean = new URLSearchParams(window.location.search);
    clean.delete("drawer");
    if (drawer !== "playlist") clean.delete("playlistId");
    const qs = clean.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [role, userId, pathname, router, diagnosticsEnabled]);

  useEffect(() => {
    const unsubCast = subscribePlaylistCast((payload: PlaylistCastPayload) => {
      const cast: CommandCenterPlaylistCast = {
        playlistId: payload.playlistId,
        trackId: payload.trackId,
        title: payload.title,
        artist: payload.artist,
        coverUrl: payload.coverUrl,
        audioUrl: payload.audioUrl,
        isPlaying: Boolean(payload.audioUrl),
      };
      setPlaylistCast(cast);
    });
    const unsubNow = subscribePlaylistNowPlaying((payload) => {
      setPlaylistCast((prev) => {
        if (!prev || prev.playlistId !== payload.playlistId) {
          return {
            playlistId: payload.playlistId,
            trackId: payload.trackId,
            title: payload.title,
            artist: payload.artist,
            coverUrl: payload.coverUrl,
            audioUrl: payload.audioUrl,
            isPlaying: payload.isPlaying,
            progress: payload.progress,
          };
        }
        return {
          ...prev,
          trackId: payload.trackId ?? prev.trackId,
          title: payload.title || prev.title,
          artist: payload.artist ?? prev.artist,
          coverUrl: payload.coverUrl ?? prev.coverUrl,
          audioUrl: payload.audioUrl ?? prev.audioUrl,
          isPlaying: payload.isPlaying,
          progress: payload.progress,
        };
      });
    });
    return () => {
      unsubCast();
      unsubNow();
    };
  }, []);

  const togglePanel = (id: CommandCenterPanelId) => {
    setAppearanceOpen(false);
    setActivePanel((prev) => {
      const next = prev === id ? null : id;
      drawerStateStore.setLastPanel(role, next);
      return next;
    });
  };

  /** Always open/swap into drawer (never toggle-close) — used by dock + drawer chips. */
  const openPanel = (id: CommandCenterPanelId) => {
    setAppearanceOpen(false);
    setMobileLeftOpen(false);
    setMobileRightOpen(false);
    // Prefer Media Console / Stage Deck presentation over legacy CommandCenterDrawer + FLOATING.
    const opened = openCanonicalWorkspaceQuick(id);
    if (opened) {
      setActivePanel(null);
      drawerStateStore.setLastPanel(role, null);
      return;
    }
    setActivePanel(id);
    drawerStateStore.setLastPanel(role, id);
  };

  const openAppearance = () => {
    setActivePanel(null);
    setAppearanceOpen((v) => !v);
    drawerStateStore.setLastPanel(role, null);
  };

  const closeDrawer = () => {
    setActivePanel(null);
    setAppearanceOpen(false);
    drawerStateStore.setLastPanel(role, null);
  };

  const launchQuickModule = (moduleId: CommandCenterPanelId, actionId?: ActionId) => {
    openHubQuickLaunch({
      moduleId,
      role,
      userId,
      actionId,
      openDrawer: openPanel,
      openAppearance: () => {
        setActivePanel(null);
        setAppearanceOpen(true);
        drawerStateStore.setLastPanel(role, null);
      },
      closeDrawer,
    });
  };

  const isModuleActive = (moduleId: CommandCenterPanelId) =>
    activePanel === moduleId || isUniversalWorkspaceOpenForModule(moduleId);

  const openPerformerBioMagazineTab = (tabId: PerformerBioTab) => {
    // Route through Stage Deck (WATCH/WORK mutual exclusivity) on mobile instead of the
    // legacy CommandCenterDrawer, which is desktop-only and left this dead-tap on phones.
    if (isMobile) {
      openStageWorkspace("bio-magazine");
    } else {
      openPanel("bio_magazine");
    }
    if (typeof window === "undefined") return;
    const emit = () => {
      window.dispatchEvent(new CustomEvent(BIO_MAGAZINE_TAB_EVENT, { detail: { tab: tabId } }));
    };
    emit();
    window.requestAnimationFrame(emit);
    window.setTimeout(emit, 90);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/live/go", { cache: "no-store" });
        const data = (await res.json()) as { sessions?: LiveApiSession[] };
        const top = data.sessions?.[0];
        if (cancelled) return;
        if (!top) {
          setFeatured(null);
          return;
        }
        const profile = getPerformerById(top.userId);
        setFeatured({
          name: profile?.name ?? top.displayName,
          route: profile?.liveRoomRoute ?? `/live/rooms/${top.roomId}`,
          videoUrl: profile?.introVideoUrl ?? profile?.motionPosterUrl,
          imageUrl: profile?.profileImageUrl ?? top.avatarUrl ?? undefined,
          viewers: top.viewerCount,
          performerId: top.userId,
          performerSlug: profile?.slug,
        });
      } catch {
        if (!cancelled) setFeatured(null);
      }
    };
    void load();
    const id = setInterval(() => void load(), 10000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  useEffect(() => {
    // Use matchMedia — reads CSS viewport width, immune to layout-overflow inflating window.innerWidth.
    const mql = window.matchMedia("(max-width: 900px)");
    const check = () => {
      const mobile = mql.matches;
      setIsMobile(mobile);
      if (!mobile) { setMobileLeftOpen(false); setMobileRightOpen(false); }
    };
    check();
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  const mediaSlots: CommandCenterMediaSlot[] = useMemo(() => {
    const stageVideo =
      featured?.videoUrl ||
      process.env.NEXT_PUBLIC_DEFAULT_MONITOR_VIDEO?.trim() ||
      "/assets/videos/rooms/monday-night-stage.mp4";
    const monitorA: CommandCenterMediaSlot = playlistCast
      ? {
          id: "mon-a",
          label: "MONITOR A · PLAYLIST CAST",
          kind: "playlist",
          playlistCast,
          imageUrl: playlistCast.coverUrl,
        }
      : {
          id: "mon-a",
          label: "MONITOR A · STAGE",
          videoUrl: featured?.videoUrl ?? stageVideo,
          imageUrl: featured?.imageUrl,
          kind: "video",
        };
    return [
      monitorA,
      {
        id: "mon-b",
        label: "MONITOR B · STAGE PREVIEW",
        videoUrl: featured?.videoUrl ?? stageVideo ?? "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        kind: "video",
      },
    ];
  }, [featured, playlistCast]);

  const railBtn = (opts: {
    key: string;
    label: string;
    info?: string;
    active?: boolean;
    accent?: string;
    onClick?: () => void;
    href?: string;
    testId?: string;
    dataTmiAction?: string;
    dataTmiWorkspace?: string;
  }) => {
    const active = Boolean(opts.active);
    const accent = opts.accent ?? theme.primary;
    const style: CSSProperties = {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "9px 10px",
      borderRadius: 8,
      cursor: "pointer",
      width: "100%",
      textAlign: "left",
      fontFamily: "inherit",
      textDecoration: "none",
      background: active ? `${accent}22` : "transparent",
      border: active ? `1px solid ${accent}88` : "1px solid transparent",
      color: active ? accent : "#fff",
      boxShadow: active ? `0 0 12px ${accent}33` : "none",
      transition: "all 120ms ease",
    };
    const inner = (
      <>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.05em" }}>{opts.label}</span>
        {opts.info ? (
          <span
            style={{
              fontSize: 7,
              fontWeight: 900,
              color: active ? "#050510" : "rgba(255,255,255,0.4)",
              background: active ? accent : "rgba(255,255,255,0.06)",
              padding: "1px 5px",
              borderRadius: 4,
            }}
          >
            {opts.info}
          </span>
        ) : null}
      </>
    );
    if (opts.href) {
      return (
        <Link
          key={opts.key}
          href={opts.href}
          style={style}
          data-testid={opts.testId}
          data-tmi-action={opts.dataTmiAction}
          data-tmi-workspace={opts.dataTmiWorkspace}
        >
          {inner}
        </Link>
      );
    }
    return (
      <button
        key={opts.key}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          opts.onClick?.();
        }}
        data-testid={opts.testId}
        data-tmi-action={opts.dataTmiAction}
        data-tmi-workspace={opts.dataTmiWorkspace}
        style={style}
      >
        {inner}
      </button>
    );
  };

  return (
    <div
      data-command-center-shell
      data-role={role}
      style={{
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        background: theme.bgBase,
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
        overflowX: "clip",
      }}
    >
      <style>{`
        @keyframes tmiMonitorExit {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-6px) scale(0.97); }
        }
        @keyframes tmiMonitorEnter {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <CommandCenterTopNav userId={userId} displayName={resolvedDisplayName} />

      {/* Status bar */}
      <div
        style={{
          height: 44,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: `1px solid ${theme.primary}22`,
          background: theme.bgGlass,
          backdropFilter: "blur(12px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.16em", color: theme.primary }}>
            TMI · {role === "performer" ? "PERFORMER" : "FAN"} COMMAND CENTER
          </span>
          {featured ? (
            <button
              type="button"
              onClick={() => {
                if (featured.performerId) {
                  setActivePerformer({
                    id: featured.performerId,
                    slug: featured.performerSlug ?? featured.performerId,
                    name: featured.name,
                  });
                }
              }}
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.45)",
                background: "transparent",
                border: "none",
                cursor: featured.performerId ? "pointer" : "default",
                fontFamily: "inherit",
                padding: 0,
              }}
              title={featured.performerId ? "Set as ACTIVE_PERFORMER" : undefined}
            >
              Live: {featured.name}
              {featured.viewers != null ? ` · ${featured.viewers.toLocaleString()} watching` : ""}
            </button>
          ) : (
            <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 700 }}>
              No one live right now
            </span>
          )}
          {activePerformer ? (
            <span
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.06em",
                color: "#FFD700",
                border: "1px solid rgba(255,215,0,0.35)",
                borderRadius: 6,
                padding: "3px 8px",
              }}
              title="Living OS ACTIVE_PERFORMER"
            >
              ACTIVE · {(activePerformer.name ?? activePerformer.slug).toUpperCase()}
            </span>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isMobile && (
            <>
              <button
                type="button"
                onClick={toggleStageMonitors}
                disabled={monitorTransitionLocked && !isWorkMode}
                style={{
                  background: effectiveMonitorCount > 0 ? "rgba(255,255,255,0.06)" : "rgba(0,229,255,0.22)",
                  border: "1px solid #00E5FF",
                  borderRadius: 6,
                  color: "#00E5FF",
                  fontSize: 10,
                  fontWeight: 900,
                  padding: "4px 10px",
                  cursor: monitorTransitionLocked && !isWorkMode ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                  opacity: monitorTransitionLocked && !isWorkMode ? 0.75 : 1,
                }}
                title={monitorButtonTitle}
              >
                📺 MONITORS {isWorkMode ? 0 : monitorCount}
              </button>
              <button
                type="button"
                data-testid="tmi-gps-trigger"
                data-tmi-action="open-gps"
                onClick={() => setMobileLeftOpen((v) => !v)}
                style={{ background: "transparent", border: `1px solid ${theme.primary}44`, borderRadius: 6, color: theme.primary, fontSize: 10, fontWeight: 800, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}
              >
                ☰ GPS
              </button>
              <button
                type="button"
                onClick={() => setMobileRightOpen((v) => !v)}
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 6, color: "#fff", fontSize: 10, fontWeight: 800, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}
              >
                💬 CHAT
              </button>
            </>
          )}
          {!isMobile ? (
            <button
              type="button"
              onClick={toggleStageMonitors}
              disabled={monitorTransitionLocked}
              style={{
                background: monitorCount > 0 ? "rgba(255,255,255,0.06)" : "rgba(0,229,255,0.22)",
                border: "1px solid #00E5FF",
                borderRadius: 6,
                color: "#00E5FF",
                fontSize: 10,
                fontWeight: 900,
                padding: "4px 10px",
                cursor: monitorTransitionLocked ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: monitorTransitionLocked ? 0.75 : 1,
              }}
              title={monitorButtonTitle}
            >
              📺 MONITORS {monitorCount}
            </button>
          ) : null}
        </div>
      </div>

      {/* ══ MEDIA ZONE — mobile: single-column flex (no grid); desktop: 3-column grid ══ */}
      {isMobile ? (
        /* ── MOBILE: pure flex-column, zero grid, zero in-flow side rails ── */
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minWidth: 0,
            overflowY: stageDeckWork ? "hidden" : "auto",
            overflowX: "hidden",
          }}
        >
          <div
            ref={mediaStageRef}
            data-hub-monitor-stage
            data-stage-deck={stageDeckWork ? "work" : stageDeckShowMonitors ? "watch" : "collapsed"}
            data-presentation-mode={mobilePresentation.mode}
            data-presentation-transition={mobilePresentation.transition}
            style={{
              position: "relative",
              minWidth: 0,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              flex: stageDeckWork ? 1 : undefined,
              // WORK: explicit viewport height bypasses the minHeight:100vh parent ambiguity
              height: stageDeckWork ? "calc(100dvh - 100px)" : undefined,
              overflow: stageDeckWork ? "hidden" : undefined,
            }}
          >
            {/* WATCH surface — keep mounted when WORK/COLLAPSED so MediaStream survives */}
            <div
              aria-hidden={!stageDeckShowMonitors}
              style={monitorRegionStyle}
            >
              <GlobalErrorBoundary context="Command Center Monitors">
                <CommandCenterMediaStack
                  slots={mediaSlots}
                  bezelVariant="chrome"
                  naturalHeight
                  monitorLayoutMode={monitorLayoutForStack}
                  role={role === "performer" ? "performer" : "fan"}
                  seriesLabel={role === "performer" ? "PERFORMER HUB · CHROME SERIES · DUAL 16:9 MONITORS" : "FAN HUB · CHROME SERIES · DUAL 16:9 MONITORS"}
                />
              </GlobalErrorBoundary>
            </div>

            {stageDeckWork ? (
              <CanonicalBottomDrawerHost
                userId={userId}
                displayName={resolvedDisplayName}
                role={role === "performer" ? "performer" : "fan"}
                stageDeck
              />
            ) : (
              <>
                {monitorLayoutMode !== "HIDDEN" && (
                  <CommandCenterSessionControlStrip
                    role={role === "performer" ? "performer" : "fan"}
                    leaveLabel="📺 MONITORS"
                    onLeaveRoom={hideStageManually}
                    onEnterStage={() => router.push("/live/go")}
                  />
                )}
                <PersistentMediaInteractionDock
                  role={role === "performer" ? "performer" : "fan"}
                  userId={userId}
                  roomId={featured?.route?.replace(/\//g, "-") ?? "hub-command-center"}
                  onLobbyNav={
                    role === "fan"
                      ? () => openStageWorkspace("lobby")
                      : () => openPanel("media_locker")
                  }
                  onOpenModule={(mod) => openPanel(mod as CommandCenterPanelId)}
                />
                {/* Mobile quick-action strip — Stage Deck WORK tools (in-place, no navigate) */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    overflowX: "auto",
                    padding: "8px 12px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                    scrollbarWidth: "none" as const,
                  }}
                >
                  {(
                    role === "performer"
                      ? [
                          {
                            id: "magazine",
                            label: "📰 MAGAZINE",
                            onClick: () => {
                              if (typeof window !== "undefined") {
                                sessionStorage.setItem("tmi_magazine_origin", window.location.pathname + window.location.search);
                              }
                              router.push("/magazine/issue/current");
                            },
                          },
                          { id: "my-article", label: "✍️ MY ARTICLE", onClick: () => openPerformerBioMagazineTab("magazine") },
                          { id: "photos", label: "🖼️ PHOTOS", onClick: () => openPerformerBioMagazineTab("gallery") },
                          { id: "bio", label: "👤 BIO", onClick: () => openPerformerBioMagazineTab("biography") },
                          { id: "music", label: "🎵 MUSIC", onClick: () => openPerformerBioMagazineTab("music") },
                          { id: "press-media", label: "🎙️ PRESS/MEDIA", onClick: () => openPerformerBioMagazineTab("interviews") },
                          { id: "preview", label: "👁️ PREVIEW", onClick: () => openPerformerBioMagazineTab("magazine") },
                          { id: "submit-update", label: "✅ SUBMIT/UPDATE", onClick: () => openPerformerBioMagazineTab("profile") },
                          { id: "yopho", label: "📷 YOPHO" },
                          { id: "playlist-studio", label: "🎚️ PLAYER" },
                          { id: "live-destinations", label: "📹 LIVE" },
                          { id: "messaging", label: "💬 MSGS" },
                        ]
                      : [
                          {
                            id: "magazine",
                            label: "📰 MAGAZINE",
                            onClick: () => {
                              if (typeof window !== "undefined") {
                                sessionStorage.setItem("tmi_magazine_origin", window.location.pathname + window.location.search);
                              }
                              router.push("/magazine/issue/current");
                            },
                          },
                          { id: "yopho", label: "📷 YOPHO" },
                          { id: "playlist-studio", label: "🎵 PLAYLIST" },
                          { id: "stream-win", label: "📻 STREAM & WIN", onClick: () => openStageWorkspace("playlist-studio") },
                          { id: "video-shuffle", label: "🔀 VIDEO SHUFFLE", onClick: () => openStageWorkspace("live-destinations") },
                          { id: "avatar-quick", label: "👤 AVATAR" },
                          { id: "memory-wall", label: "🧠 MEMORY" },
                          { id: "messaging", label: "💬 MSGS" },
                          { id: "lobby", label: "🏟️ LOBBY WALL" },
                          { id: "inventory", label: "🎒 INV" },
                          { id: "live-destinations", label: "📹 LIVE" },
                          { id: "share-studio", label: "↗ SHARE" },
                        ]
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={item.id === "yopho" ? "tmi-yopho-trigger" : `tmi-${item.id}-trigger`}
                      data-tmi-workspace={item.id}
                      onClick={item.onClick ?? (() => openStageWorkspace(item.id))}
                      style={{ flexShrink: 0, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "6px 10px", color: "#fff", cursor: "pointer", fontFamily: "inherit", fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", whiteSpace: "nowrap" }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <CommandCenterPlaylistBand
                  role={role}
                  userId={userId}
                  displayName={resolvedDisplayName}
                  expanded={false}
                  initialPlaylistId={deepLinkPlaylistId}
                  onCollapse={() => { useWorkspacePresentationStore.getState().closeSurface("DRAWER"); closeDrawer(); }}
                />

                {/* Monetization lives in scroll depth only — never overlays stage controls. */}
                <div style={{ padding: "0 12px 16px" }}>
                  {role === "performer" ? <PerformerCreatorControlCluster compact /> : null}
                  {role === "fan" ? (
                    <>
                      <AdRail
                        placement="fan-cc-bottom"
                        role="fan"
                        reserve="medium-rectangle"
                        experienceMode={monetizationExperienceMode}
                      />
                      <AdRail
                        placement="fan-cc-mid"
                        role="fan"
                        reserve="mobile-banner"
                        experienceMode={monetizationExperienceMode}
                      />
                    </>
                  ) : (
                    <AdRail
                      placement="performer-cc-bottom"
                      role="performer"
                      reserve="medium-rectangle"
                      experienceMode={monetizationExperienceMode}
                    />
                  )}
                </div>
              </>
            )}
          </div>
          {!isMobile && activePanel && (
            <GlobalErrorBoundary context="Command Center Drawer">
              <CommandCenterDrawer
                role={role}
                activePanel={activePanel}
                appearanceOpen={appearanceOpen}
                userId={userId}
                displayName={resolvedDisplayName}
                onClose={closeDrawer}
                onSelectPanel={openPanel}
                initialPlaylistId={deepLinkPlaylistId}
              />
            </GlobalErrorBoundary>
          )}
        </div>
      ) : (
        /* ── DESKTOP: 3-column grid, rails are static in-flow grid children ── */
        <div
          style={{
            position: "relative",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: "calc(100vh - 100px)",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            overflowX: "clip",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: typeof window !== "undefined" && window.innerWidth < 900 ? "1fr" : "230px minmax(0, 1fr) 300px",
              alignItems: "start",
              width: "100%",
              minWidth: 0,
            }}
          >
            {/* Left rail — static in-flow grid child (0px footprint on mobile) */}
            <div
              style={{
                display: typeof window !== "undefined" && window.innerWidth < 768 ? "none" : "flex",
                background: `${theme.bgSurface}ee`,
                borderRight: `1px solid ${theme.primary}18`,
                padding: "12px 12px",
                flexDirection: "column",
                gap: 5,
                overflowY: "auto",
              }}
            >
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: "0.14em", marginBottom: 4 }}>
                OPERATING CENTERS
              </div>
              {centers.map((center) => {
                const isActive = center.modules.some((m) => isModuleActive(m as CommandCenterPanelId));
                return railBtn({
                  key: center.id,
                  label: `${center.icon} ${center.label}`,
                  info: center.info,
                  accent: center.accent,
                  active: isActive,
                  onClick: () => launchQuickModule(center.primaryModule as CommandCenterPanelId, center.actionId),
                });
              })}
              {drawerLaunchers.length > 0 ? (
                <>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: "0.14em", margin: "10px 0 4px" }}>
                    OPEN DRAWERS
                  </div>
                  {drawerLaunchers.map((id) => {
                    const mod = getUniversalDrawerModule(id);
                    if (!mod) return null;
                    return railBtn({
                      key: `drawer-${id}`,
                      label: mod.label,
                      info: mod.info,
                      accent: mod.accent,
                      active: isModuleActive(id),
                      onClick: () => launchQuickModule(id),
                    });
                  })}
                </>
              ) : null}
              {railBtn({ key: "friends", label: "FRIENDS", href: "/friends" })}
              {role === "performer"
                ? railBtn({ key: "golive", label: "GO LIVE", info: "Broadcast", href: "/live/go" })
                : null}
              {railBtn({
                key: "camera",
                label: "CAMERA",
                info: "HD still → Memory Wall",
                onClick: () => setIsCameraOpen(true),
              })}
              {railBtn({
                key: "settings",
                label: "SETTINGS",
                info: "Account",
                accent: theme.primary,
                onClick: () => openCanonicalWorkspaceQuick("settings", "DRAWER"),
              })}
              <CommandCenterIdentityCard userId={userId} displayName={resolvedDisplayName} role={role === "performer" ? "performer" : "fan"} />
            </div>

            {/* Center media — monitors + persistent dock (blueprint anchor) */}
            <div
              ref={mediaStageRef}
              data-hub-monitor-stage
              style={{ minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}
            >
              <div aria-hidden={monitorLayoutMode === "HIDDEN"} style={monitorRegionStyle}>
                <GlobalErrorBoundary context="Command Center Monitors">
                  <CommandCenterMediaStack
                    slots={mediaSlots}
                    bezelVariant="chrome"
                    naturalHeight
                    monitorLayoutMode={monitorLayoutForStack}
                    role={role === "performer" ? "performer" : "fan"}
                    seriesLabel={
                      role === "performer"
                        ? "PERFORMER HUB · CHROME SERIES · DUAL 16:9 MONITORS"
                        : "FAN HUB · CHROME SERIES · DUAL 16:9 MONITORS"
                    }
                  />
                </GlobalErrorBoundary>
              </div>
              <CommandCenterSessionControlStrip
                role={role === "performer" ? "performer" : "fan"}
                leaveLabel="📺 MONITORS"
                onLeaveRoom={hideStageManually}
                onEnterStage={() => router.push("/live/go")}
              />
              <PersistentMediaInteractionDock
                role={role === "performer" ? "performer" : "fan"}
                userId={userId}
                roomId={featured?.route?.replace(/\//g, "-") ?? "hub-command-center"}
                onLobbyNav={
                  role === "fan"
                    ? () => presentCanonicalWorkspace("lobby", "DRAWER")
                    : () => openPanel("media_locker")
                }
                onOpenModule={(mod) => openPanel(mod as CommandCenterPanelId)}
              />
              {/* Playlist band expands only when Media Console mode=expanded (playlist drawer). */}
              <CommandCenterPlaylistBand
                role={role}
                userId={userId}
                displayName={resolvedDisplayName}
                expanded={
                  (drawerWorkspace === "playlist-studio" && mediaConsoleMode === "expanded") ||
                  activePanel === "playlist"
                }
                initialPlaylistId={deepLinkPlaylistId}
                onCollapse={() => {
                  useWorkspacePresentationStore.getState().closeSurface("DRAWER");
                  closeDrawer();
                }}
              />
              <CanonicalBottomDrawerHost
                userId={userId}
                displayName={resolvedDisplayName}
                role={role === "performer" ? "performer" : "fan"}
              />
            </div>

            {/* Right rail — static in-flow grid child (0px footprint on mobile) */}
            <div
              style={{
                display: typeof window !== "undefined" && window.innerWidth < 768 ? "none" : "flex",
                background: `${theme.bgSurface}ee`,
                borderLeft: `1px solid ${theme.primary}18`,
                padding: 12,
                flexDirection: "column",
                gap: 10,
                overflowY: "auto",
              }}
            >
              <OperationsSidebar
                role={role}
                userId={userId}
                displayName={resolvedDisplayName}
                featuredPerformerName={featured?.name}
              />
              <div>
                <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>ROOMS NEARBY</div>
                <button
                  type="button"
                  onClick={() => presentCanonicalWorkspace("lobby", "DRAWER")}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    fontSize: 10,
                    color: theme.secondary,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Open Live Lobby Wall →
                </button>
              </div>
              {/* Rule 12 ads for fans; Rule 26 — no sponsor-management chrome on performer hub */}
              {role === "fan" ? (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                    AD SLOT · {FAN_AD_ZONE}
                  </div>
                  <UnifiedAdSlot venue="dashboard" slotKey="dashboardSidebar" format="rectangle" label="ADVERTISEMENT" accentColor={theme.primary} />
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                    PLATFORM
                  </div>
                  {suppressProofPerformerAd ? (
                    <div
                      data-proof-ad-suppressed="1"
                      style={{
                        minHeight: 90,
                        borderRadius: 8,
                        border: `1px dashed ${theme.primary}55`,
                        background: "rgba(255,255,255,0.02)",
                        color: "rgba(255,255,255,0.55)",
                        fontSize: 9,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textTransform: "uppercase",
                      }}
                    >
                      Proof Ad Suppressed
                    </div>
                  ) : (
                    <UnifiedAdSlot venue="dashboard" slotKey="dashboardSidebar" format="rectangle" label="TMI PROMOTION" accentColor={theme.primary} />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Layer 2 — Full Drawers: below persistent dock + separator (playlist expands here) */}
          <GlobalErrorBoundary context="Command Center Drawer">
            <CommandCenterDrawer
              role={role}
              activePanel={activePanel}
              appearanceOpen={appearanceOpen}
              userId={userId}
              displayName={resolvedDisplayName}
              onClose={closeDrawer}
              onSelectPanel={openPanel}
              initialPlaylistId={deepLinkPlaylistId}
            />
          </GlobalErrorBoundary>

          {/* Monetization lives below core experience and sponsor ribbon, never over controls. */}
          <div style={{ padding: "12px 16px 18px" }}>
            {role === "performer" ? <PerformerCreatorControlCluster /> : null}
            {role === "fan" ? (
              <>
                <AdRail
                  placement="fan-cc-bottom"
                  role="fan"
                  reserve="medium-rectangle"
                  experienceMode={monetizationExperienceMode}
                />
                <AdRail
                  placement="fan-cc-mid"
                  role="fan"
                  reserve="mobile-banner"
                  experienceMode={monetizationExperienceMode}
                />
              </>
            ) : (
              <AdRail
                placement="performer-cc-bottom"
                role="performer"
                reserve="medium-rectangle"
                experienceMode={monetizationExperienceMode}
              />
            )}
          </div>
        </div>
      )}

      {/* Mobile rail overlays — position:fixed panes outside layout flow, toggled by status bar */}
      {isMobile && (mobileLeftOpen || mobileRightOpen) && (
        <div
          role="presentation"
          onClick={() => { setMobileLeftOpen(false); setMobileRightOpen(false); }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9400, touchAction: "none" }}
        />
      )}
      {isMobile && mobileLeftOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "min(85vw, 300px)",
            height: "100dvh",
            zIndex: 9500,
            background: `${theme.bgSurface}f0`,
            borderRight: `1px solid ${theme.primary}30`,
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            overflowY: "auto",
          }}
        >
          <button
            type="button"
            onClick={() => setMobileLeftOpen(false)}
            style={{ alignSelf: "flex-end", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "0 4px 4px", marginBottom: 4 }}
          >
            ✕
          </button>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: "0.14em", marginBottom: 4 }}>
            GPS · NAV
          </div>
          {/* Admin / role switch lives in GPS only on mobile — never floats over Monitor A. */}
          <div style={{ marginBottom: 8 }}>
            <RoleSwitcherWidget accentColor={theme.primary} />
          </div>
          {railBtn({
            key: "live-lobby-wall",
            label: "📡 LIVE LOBBY WALL",
            info: "Discovery · Join live rooms",
            accent: "#FF2DAA",
            onClick: () => {
              openStageWorkspace("live-destinations");
              setMobileLeftOpen(false);
            },
            testId: "tmi-gps-discovery-trigger",
            dataTmiAction: "open-workspace",
            dataTmiWorkspace: "live-destinations",
          })}
          {centers.map((center) => {
            const isActive = center.modules.some((m) => isModuleActive(m as CommandCenterPanelId));
            const isYoPhoCenter = center.primaryModule === "yopho";
            return railBtn({
              key: center.id,
              label: `${center.icon} ${center.label}`,
              info: center.info,
              accent: center.accent,
              active: isActive,
              onClick: () => { launchQuickModule(center.primaryModule as CommandCenterPanelId, center.actionId); setMobileLeftOpen(false); },
              testId: isYoPhoCenter ? "tmi-gps-yopho-trigger" : undefined,
              dataTmiAction: isYoPhoCenter ? "open-workspace" : undefined,
              dataTmiWorkspace: isYoPhoCenter ? "yopho" : undefined,
            });
          })}
          {drawerLaunchers.length > 0 ? (
            <>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: "0.14em", margin: "10px 0 4px" }}>
                OPEN DRAWERS
              </div>
              {drawerLaunchers.map((id) => {
                const mod = getUniversalDrawerModule(id);
                if (!mod) return null;
                const isYoPho = id === "yopho";
                return railBtn({
                  key: `drawer-${id}`,
                  label: mod.label,
                  info: mod.info,
                  accent: mod.accent,
                  active: isModuleActive(id),
                  onClick: () => {
                    if (isYoPho) {
                      traceLaunch("WORKSPACE_LAUNCH", {
                        workspace: "yopho",
                        source: "GPS_PANEL",
                        role,
                        surface: "mobile-left-rail",
                      });
                    }
                    launchQuickModule(id);
                    setMobileLeftOpen(false);
                  },
                  testId: isYoPho ? "tmi-gps-yopho-trigger" : undefined,
                  dataTmiAction: isYoPho ? "open-workspace" : undefined,
                  dataTmiWorkspace: isYoPho ? "yopho" : undefined,
                });
              })}
            </>
          ) : null}
          {railBtn({
            key: "avatar-lobby",
            label: "🏟️ FAN LOBBY",
            info: "Social hangout before the show",
            onClick: () => { presentCanonicalWorkspace("lobby", "DRAWER"); setMobileLeftOpen(false); },
          })}
          {railBtn({ key: "friends", label: "FRIENDS", href: "/friends" })}
          {role === "performer"
            ? railBtn({ key: "golive", label: "GO LIVE", info: "Broadcast", href: "/live/go" })
            : null}
          {railBtn({
            key: "camera",
            label: "CAMERA",
            info: "HD still → Memory Wall",
            onClick: () => { setIsCameraOpen(true); setMobileLeftOpen(false); },
          })}
          {railBtn({
            key: "settings",
            label: "SETTINGS",
            info: "Account",
            accent: theme.primary,
            onClick: () => { openCanonicalWorkspaceQuick("settings", "DRAWER"); setMobileLeftOpen(false); },
          })}
          <CommandCenterIdentityCard userId={userId} displayName={resolvedDisplayName} role={role === "performer" ? "performer" : "fan"} />
        </div>
      )}
      {isMobile && mobileRightOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "min(85vw, 300px)",
            height: "100dvh",
            zIndex: 9500,
            background: `${theme.bgSurface}f0`,
            borderLeft: `1px solid ${theme.primary}30`,
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            overflowY: "auto",
          }}
        >
          <button
            type="button"
            onClick={() => setMobileRightOpen(false)}
            style={{ alignSelf: "flex-end", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "0 4px 4px", marginBottom: 4 }}
          >
            ✕
          </button>
          <OperationsSidebar role={role} userId={userId} displayName={resolvedDisplayName} featuredPerformerName={featured?.name} />
          {/* Discovery lives in the GPS (left) panel only, per direction — one owner, not scattered. */}
          {role === "fan" ? (
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>AD SLOT · {FAN_AD_ZONE}</div>
              <UnifiedAdSlot venue="dashboard" slotKey="dashboardSidebar" format="rectangle" label="ADVERTISEMENT" accentColor={theme.primary} />
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>PLATFORM</div>
              {suppressProofPerformerAd ? (
                <div
                  data-proof-ad-suppressed="1"
                  style={{
                    minHeight: 90,
                    borderRadius: 8,
                    border: `1px dashed ${theme.primary}55`,
                    background: "rgba(255,255,255,0.02)",
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textTransform: "uppercase",
                  }}
                >
                  Proof Ad Suppressed
                </div>
              ) : (
                <UnifiedAdSlot venue="dashboard" slotKey="dashboardSidebar" format="rectangle" label="TMI PROMOTION" accentColor={theme.primary} />
              )}
            </div>
          )}
        </div>
      )}

      {/* Canonical 4-zone quick panels — desktop only. Mobile uses GPS + Stage Deck. */}
      {!isMobile && <CanonicalLeftQuickPanelHost />}
      {!isMobile && <CanonicalRightQuickPanelHost />}

      {/* Points-earned flight animation — fires on real backend balance increases only */}
      <PointFlightEngine />

      <CameraCaptureOverlay isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      <FloatingWorkspacePanel />
      <UniversalWorkspaceHost userId={userId} displayName={resolvedDisplayName} role={role} />
    </div>
  );
}
