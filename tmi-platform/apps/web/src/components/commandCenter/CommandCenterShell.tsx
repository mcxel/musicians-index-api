"use client";

/**
 * Shared Fan + Performer Command Center shell (blueprint chrome).
 * Single-column: media → session strip → experience → dock → drawers.
 * Legacy L/R in-flow side rails excised (2026-08-28). Role-gated drawers (Rule 26).
 */

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  usePathname,
  useRouter,
  useSearchParams,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import PersistentMediaInteractionDock from "./PersistentMediaInteractionDock";
import CommandCenterPlaylistBand from "./CommandCenterPlaylistBand";
import CommandCenterSessionControlStrip from "./CommandCenterSessionControlStrip";
import {
  PENDING_GO_LIVE_KEY,
  presentInstantGoLiveInPlace,
} from "@/lib/dock/presentInstantGoLiveInPlace";
import type { LivePrivacy } from "@/lib/live/LiveDestinationRouter";
import { useGoLiveTransition } from "@/lib/live/goLiveTransitionStore";
import { useLivePrivacyState } from "@/lib/live/livePrivacyState";
import { useCanonicalMediaPlayerRuntime } from "@/lib/media/canonicalMediaPlayerRuntime";
import { useCanonicalAudioMixerStore } from "@/lib/audio/CanonicalAudioBusDirector";
import { useMediaPlayerAudiencePresence } from "@/lib/media/useMediaPlayerAudiencePresence";
import { inferWatchCategoryFromRoomId } from "@/lib/media/universalMediaPlayerWatchRoute";
import { useWatchSession } from "@/lib/presence/WatchSessionContext";
import { DEFAULT_MONITOR_A } from "@/lib/personal-media";
import CameraCaptureOverlay from "@/components/panels/CameraCaptureOverlay";
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
import CommandCenterTopNav from "./CommandCenterTopNav";
import CanonicalCommandCenterFrame from "./CanonicalCommandCenterFrame";
import PerformerExperienceQuickStrip from "./PerformerExperienceQuickStrip";
import {
  openCanonicalWorkspaceQuick,
  presentCanonicalWorkspace,
} from "@/lib/workspace/universal/openCanonicalPresentation";
import CommandCenterIdentityCard from "./CommandCenterIdentityCard";
import FloatingWorkspacePanel from "@/components/workspace/FloatingWorkspacePanel";
import UniversalWorkspaceHost from "@/components/workspace/universal/UniversalWorkspaceHost";
import GlobalErrorBoundary from "@/components/system/GlobalErrorBoundary";
import {
  openHubQuickLaunch,
  isUniversalWorkspaceOpenForModule,
} from "@/lib/commandCenter/hubQuickLaunch";
import CompactQuickPanelHost, { SnipsOverlayHost } from "@/components/hud/CompactQuickPanelHost";
import { useCompactQuickPanelStore } from "@/lib/hud/compactQuickPanelStore";
import PointFlightEngine from "@/components/hud/PointFlightEngine";
import CanonicalBottomDrawerHost from "@/components/workspace/universal/CanonicalBottomDrawerHost";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";
import AdRail, { type AdRailExperienceMode } from "@/components/monetization/AdRail";
import TmiIdentitySurface from "./TmiIdentitySurface";

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

interface HubDebugSnapshot {
  authUserId: string | null;
  authRole: string | null;
  authActiveRole: string | null;
  username: string | null;
  artistSlug: string | null;
  fanProfileId: string | null;
  performerProfileId: string | null;
  liveSessionId: string | null;
  experienceType: string | null;
  participantCount: number | null;
  cartCount: number | null;
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

function formatDebugValue(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined || value === "") return "NONE";
  return String(value);
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

/**
 * Isolates useSearchParams behind Suspense so CommandCenterShell can hydrate
 * without Next.js CSR-bailout wiping the SSR hub tree (YoPho cert blocker).
 */
function HubSearchParamsBridge({
  onParams,
}: {
  onParams: (params: ReadonlyURLSearchParams) => void;
}) {
  const searchParams = useSearchParams();
  useEffect(() => {
    if (searchParams) {
      onParams(searchParams);
    }
  }, [searchParams, onParams]);
  return null;
}

function CommandCenterShellInner({ role, userId, displayName }: CommandCenterShellProps) {
  const isDevBuild = process.env.NODE_ENV === "development";
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [searchParams, setSearchParams] = useState<ReadonlyURLSearchParams | null>(null);
  const onHubSearchParams = useCallback((params: ReadonlyURLSearchParams) => {
    setSearchParams(params);
  }, []);
  const isProofReplay = searchParams?.get("proof") === "1";
  const proofAdsOverride = searchParams?.get("proofAds");
  const diagnosticsEnabled = isDevBuild || Boolean(isProofReplay);
  // Dev-only isolation switch for /hub/performer?proof=1 crash triage.
  const suppressProofPerformerAd =
    role === "performer" &&
    Boolean(isProofReplay) &&
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

  // Off-hub GO LIVE taps land here with ?golive=1 + optional sessionStorage payload.
  useEffect(() => {
    if (!searchParams || searchParams.get("golive") !== "1") return;
    let pending: Record<string, unknown> | null = null;
    try {
      const raw = sessionStorage.getItem(PENDING_GO_LIVE_KEY);
      if (raw) {
        sessionStorage.removeItem(PENDING_GO_LIVE_KEY);
        pending = JSON.parse(raw) as Record<string, unknown>;
      }
    } catch {
      /* sessionStorage unavailable */
    }
    const dockRole = role === "performer" ? "PERFORMER" : "FAN";
    void presentInstantGoLiveInPlace({
      role: (pending?.role as string | undefined) ?? dockRole,
      privacy: pending?.privacy as LivePrivacy | undefined,
      preferredExperience: (pending?.preferredExperience as string | undefined) ?? "live",
      roomId: pending?.roomId as string | undefined,
      publishSession: (pending?.publishSession as boolean | undefined) ?? true,
    });
    router.replace(pathname);
  }, [searchParams, role, pathname, router]);

  const { stopWatching, current: watchSession } = useWatchSession();
  const publishedRoomId = useLivePrivacyState((s) => s.publishedRoomId);
  const isLivePublished = useLivePrivacyState((s) => s.isLivePublished);
  const inPlaceCategory = useGoLiveTransition((s) => s.inPlace?.category ?? null);
  const mediaRoomId = useCanonicalMediaPlayerRuntime((s) => s.roomId);
  const mediaLayout = useCanonicalMediaPlayerRuntime((s) => s.layout);
  const mediaPrimaryAudioFrame = useCanonicalMediaPlayerRuntime((s) => s.primaryAudioFrame);
  const mediaScreenShareAudioSourceId = useCanonicalMediaPlayerRuntime((s) => s.screenShareAudioSourceId);
  const mediaFrames = useCanonicalMediaPlayerRuntime((s) => s.frames);
  const audioBuses = useCanonicalAudioMixerStore((s) => s.buses);
  const [hubDebugSnapshot, setHubDebugSnapshot] = useState<HubDebugSnapshot>({
    authUserId: null,
    authRole: null,
    authActiveRole: null,
    username: null,
    artistSlug: null,
    fanProfileId: null,
    performerProfileId: null,
    liveSessionId: null,
    experienceType: null,
    participantCount: null,
    cartCount: null,
  });

  // Lobby Wall / discovery → Universal Media Player watch (same session, hub surface)
  useEffect(() => {
    const watchId = searchParams?.get("watch")?.trim();
    if (!watchId) return;

    const media = useCanonicalMediaPlayerRuntime.getState();
    const boundRoomId = media.roomId;
    if (boundRoomId && boundRoomId !== watchId) {
      media.reset();
    }
    if (!useCanonicalMediaPlayerRuntime.getState().roomId) {
      media.setRoomId(watchId);
    }
    media.assignSource("a", role === "performer" ? "SELF_CAMERA" : "PERFORMER_FEED");
    media.assignSource("b", "AUDIENCE_VIEW");
    media.setLayout("SPLIT_2");
    media.setPrimaryAudio("a");

    const category = inferWatchCategoryFromRoomId(watchId);
    useGoLiveTransition.getState().bindInPlace(
      {
        roomId: watchId,
        category,
        privacy: "public",
        href: `/hub/${role}?watch=${encodeURIComponent(watchId)}`,
        roomUrl: null,
        venueEnvironment: category === "lounge" ? "indoor" : "indoor",
      },
      DEFAULT_MONITOR_A,
    );
    useGoLiveTransition.getState().clearWarp();

    window.dispatchEvent(
      new CustomEvent("tmi:watch-session-bind", {
        detail: {
          roomId: watchId,
          title: `Live · ${watchId}`,
          accentColor: "#FF2DAA",
          viewers: 0,
        },
      }),
    );

    router.replace(pathname);
  }, [searchParams, role, pathname, router]);

  // Switch-away: release watch/MNS binding when hub loads without ?watch= (never drop published host).
  useEffect(() => {
    // Wait until Suspense bridge delivers params — null means "not ready", not "no watch".
    if (!searchParams) return;
    if (searchParams.get("watch")?.trim()) return;
    if (useLivePrivacyState.getState().isLivePublished) return;

    const inPlace = useGoLiveTransition.getState().inPlace;
    if (!inPlace?.roomId) return;

    useGoLiveTransition.getState().releaseInPlace();
    useCanonicalMediaPlayerRuntime.getState().reset();
    stopWatching();
  }, [searchParams, pathname, stopWatching]);

  const inPlaceRoomId = useGoLiveTransition((s) => s.inPlace?.roomId ?? null);
  const isPublishedHost =
    Boolean(isLivePublished && publishedRoomId && inPlaceRoomId && publishedRoomId === inPlaceRoomId);
  const localhostDebugEnabled =
    searchParams?.get("tmiDebug") === "1" &&
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

  useEffect(() => {
    if (!localhostDebugEnabled) return;
    let cancelled = false;

    const pollDebug = async () => {
      const roomId = inPlaceRoomId ?? publishedRoomId ?? mediaRoomId ?? null;
      const [authRes, profileRes, liveRes, cartRes] = await Promise.allSettled([
        fetch("/api/auth/session", { cache: "no-store", credentials: "include" }),
        fetch("/api/profile/self", { cache: "no-store", credentials: "include" }),
        fetch("/api/live/go", { cache: "no-store", credentials: "include" }),
        fetch("/api/cart", { cache: "no-store", credentials: "include" }),
      ]);

      if (cancelled) return;

      let authUserId: string | null = null;
      let authRole: string | null = null;
      let authActiveRole: string | null = null;
      let username: string | null = null;
      let artistSlug: string | null = null;
      let fanProfileId: string | null = null;
      let performerProfileId: string | null = null;
      let liveSessionId: string | null = null;
      let experienceType: string | null = null;
      let participantCount: number | null = null;
      let cartCount: number | null = null;

      if (authRes.status === "fulfilled" && authRes.value.ok) {
        try {
          const data = (await authRes.value.json()) as {
            authenticated?: boolean;
            role?: string;
            user?: {
              id?: string;
              role?: string;
              activeRole?: string;
              username?: string | null;
              artistSlug?: string | null;
            };
          };
          if (data.authenticated) {
            authUserId = data.user?.id ?? null;
            authRole = data.user?.role ?? data.role ?? null;
            authActiveRole = data.user?.activeRole ?? null;
            username = data.user?.username ?? null;
            artistSlug = data.user?.artistSlug ?? null;
          }
        } catch {
          // Keep NONE fallbacks when auth payload is unavailable.
        }
      }

      if (profileRes.status === "fulfilled" && profileRes.value.ok) {
        try {
          const profileData = (await profileRes.value.json()) as {
            ok?: boolean;
            profile?: {
              role?: string;
              id?: string;
              username?: string | null;
              artistSlug?: string | null;
            };
          };
          if (profileData.ok) {
            username = username ?? profileData.profile?.username ?? null;
            artistSlug = artistSlug ?? profileData.profile?.artistSlug ?? null;
            if ((profileData.profile?.role ?? "").toUpperCase() === "FAN") {
              fanProfileId = profileData.profile?.id ?? null;
            }
            if ((profileData.profile?.role ?? "").toUpperCase() === "PERFORMER") {
              performerProfileId = profileData.profile?.id ?? null;
            }
          }
        } catch {
          // Keep NONE fallbacks when profile payload is unavailable.
        }
      }

      if (liveRes.status === "fulfilled" && liveRes.value.ok) {
        try {
          const liveData = (await liveRes.value.json()) as {
            sessions?: Array<{
              id?: string;
              roomId?: string;
              category?: string;
              experienceType?: string;
              viewerCount?: number;
            }>;
          };
          const sessions = Array.isArray(liveData.sessions) ? liveData.sessions : [];
          const session = sessions.find((s) => s.roomId === roomId) ?? null;
          liveSessionId = session?.id ?? null;
          experienceType = session?.experienceType ?? session?.category ?? inPlaceCategory ?? null;
          participantCount =
            typeof session?.viewerCount === "number"
              ? session.viewerCount
              : (watchSession?.viewers ?? null);
        } catch {
          // Keep NONE fallbacks when live payload is unavailable.
        }
      } else {
        participantCount = watchSession?.viewers ?? null;
      }

      if (cartRes.status === "fulfilled" && cartRes.value.ok) {
        try {
          const cartData = (await cartRes.value.json()) as { itemCount?: number };
          cartCount = typeof cartData.itemCount === "number" ? cartData.itemCount : null;
        } catch {
          // Keep NONE fallback when cart payload is unavailable.
        }
      }

      if (!cancelled) {
        setHubDebugSnapshot({
          authUserId,
          authRole,
          authActiveRole,
          username,
          artistSlug,
          fanProfileId,
          performerProfileId,
          liveSessionId,
          experienceType,
          participantCount,
          cartCount,
        });
      }
    };

    void pollDebug();
    const id = window.setInterval(() => {
      void pollDebug();
    }, 8000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [
    inPlaceCategory,
    inPlaceRoomId,
    localhostDebugEnabled,
    mediaRoomId,
    publishedRoomId,
    watchSession?.viewers,
  ]);

  // Real audience occupancy on media-player watch path (Fan SOCIAL_LIVE join allowed).
  // Host GO LIVE path skips join — END LIVE remains session authority.
  useMediaPlayerAudiencePresence({
    roomId: inPlaceRoomId,
    userId,
    displayName: liveDisplayName || displayName,
    accountRole: role,
    isPublishedHost,
    enabled: Boolean(inPlaceRoomId),
  });

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
    // Messages + notifications live in CommandCenterTopNav / AccountCommandMenu only.
    const headerOwned = new Set(["messaging", "notifications"]);
    return list.filter((id) => !ocPrimaryIds.has(id) && !headerOwned.has(id));
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
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  useEffect(() => {
    document.documentElement.setAttribute("data-shell-build", "ccs-2026-08-27-canonical-slice1");
    if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
      (window as Window & { __TMI_WORKSPACE_STORE__?: typeof useWorkspacePresentationStore }).__TMI_WORKSPACE_STORE__ =
        useWorkspacePresentationStore;
    }
  }, []);
  // Also stamp during render so cert can observe hydrate without waiting an extra effect tick.
  if (typeof window !== "undefined") {
    document.documentElement.setAttribute("data-shell-build", "ccs-2026-08-27-canonical-slice1");
  }
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
  const isIdentityStageOwner =
    isMobile && isWatchMode && !stageDeckWork && effectiveMonitorCount === 0;
  const shouldCollapseMonitorRegion =
    isWorkMode ||
    (isWatchMode && effectiveMonitorCount === 0 && !isIdentityStageOwner);
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
  /** WATCH + MONITORS 0: keep a square reserved stage so identity overlays
   *  monitor geometry instead of inserting extra in-flow height that shoves
   *  the dock / GPS / drawers. Media stack stays display:none inside this box. */
  const identityReservedGeometry: CSSProperties = {
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    minHeight: 0,
    aspectRatio: "1 / 1",
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: "auto",
    overflow: "hidden",
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
  };

  const openStageWorkspace = (id: string) => {
    traceLaunch("OPEN_STAGE_WORKSPACE", { source: "command-center-shell", workspaceId: id });
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
    const drawer = params.get("drawer") as UniversalDrawerModuleId | "avatar" | "avatar-quick" | null;
    const playlistId = params.get("playlistId");
    const isProofReplay = params.get("proof") === "1";
    if (!drawer) {
      if (diagnosticsEnabled) document.documentElement.setAttribute("data-proof-effect", "no-drawer");
      return;
    }
    // Fan Avatar Canister lives in Universal Workspace (avatar-quick), not UniversalDrawerRegistry.
    const isAvatarCanisterDeepLink = drawer === "avatar" || drawer === "avatar-quick";
    if (!isAvatarCanisterDeepLink && !getUniversalDrawerModule(drawer as UniversalDrawerModuleId)) {
      if (diagnosticsEnabled) document.documentElement.setAttribute("data-proof-effect", `invalid-${drawer}`);
      return;
    }

    if (isProofReplay) {
      if (diagnosticsEnabled) document.documentElement.setAttribute("data-proof-drawer-open", drawer);
      setAppearanceOpen(false);
      setActivePanel(null);
      drawerStateStore.setLastPanel(role, null);
      if (drawer === "playlist" && playlistId) setDeepLinkPlaylistId(playlistId);
      if (isAvatarCanisterDeepLink) {
        presentCanonicalWorkspace("avatar-quick", "DRAWER");
      } else {
        openCanonicalWorkspaceQuick(drawer as UniversalDrawerModuleId, "DRAWER");
      }
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

    if (isAvatarCanisterDeepLink) {
      presentCanonicalWorkspace("avatar-quick", "DRAWER");
    } else if (drawer === "yopho") {
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
      const moduleId = drawer as UniversalDrawerModuleId;
      setActivePanel(moduleId);
      drawerStateStore.setLastPanel(role, moduleId);
      if (moduleId === "playlist" && playlistId) setDeepLinkPlaylistId(playlistId);
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
        videoUrl: payload.videoUrl,
        isPlaying: Boolean(payload.audioUrl || payload.videoUrl),
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
            videoUrl: payload.videoUrl,
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
          videoUrl: payload.videoUrl ?? prev.videoUrl,
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

  const openYophoInPlace = useCallback(() => {
    try {
      document.documentElement.setAttribute("data-yopho-open-intent", "1");
      useCompactQuickPanelStore.getState().openPanel("yopho", "bottom-left");
      setAppearanceOpen(false);
      setActivePanel("yopho");
      drawerStateStore.setLastPanel(role, "yopho");
      presentCanonicalWorkspace("yopho", "DRAWER");
    } catch (err) {
      console.error("[TMI] openYophoInPlace failed", err);
      document.documentElement.setAttribute("data-yopho-open-error", String(err));
    }
  }, [role]);

  // Cert/debug + cast-button bridge — assign every render so HMR cannot leave window hook undefined.
  if (typeof window !== "undefined") {
    (window as Window & { __TMI_OPEN_YOPHO__?: () => void }).__TMI_OPEN_YOPHO__ = openYophoInPlace;
  }

  useEffect(() => {
    const onCastYopho = () => openYophoInPlace();
    window.addEventListener("tmi:hub-cast-yopho", onCastYopho);
    return () => window.removeEventListener("tmi:hub-cast-yopho", onCastYopho);
  }, [openYophoInPlace]);

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
      setIsMobile(mql.matches);
    };
    check();
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  const mediaSlots: CommandCenterMediaSlot[] = useMemo(() => {
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
          label: "MONITOR A · CAMERA",
          kind: "empty",
        };
    return [
      monitorA,
      {
        id: "mon-b",
        label: "MONITOR B · VENUE",
        kind: "empty",
      },
    ];
  }, [playlistCast]);

  return (
    <div
      data-command-center-shell
      data-canonical-shell={role === "performer" ? "performer" : "fan"}
      data-role={role}
      data-active-command-panel={activePanel ?? "none"}
      data-drawer-workspace={drawerWorkspace ?? "none"}
      data-drawer-expanded={isDrawerExpanded ? "1" : "0"}
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
      <Suspense fallback={null}>
        <HubSearchParamsBridge onParams={onHubSearchParams} />
      </Suspense>
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
                if (featured.route) {
                  router.push(featured.route);
                  return;
                }
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

      {/* ══ MEDIA ZONE — single-column (no legacy L/R side rails) ══ */}
      {isMobile ? (
        /* ── MOBILE: pure flex-column ── */
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
            {/* Reserved monitor rectangle. Identity overlays this slot at MONITORS 0.
                Dock / sponsor / drawers are siblings below — never children of it. */}
            <div
              data-hub-reclaimed-monitor-stage
              data-identity-stage-owner={isIdentityStageOwner ? "true" : "false"}
              style={
                isIdentityStageOwner
                  ? identityReservedGeometry
                  : { position: "relative", minWidth: 0, minHeight: 0 }
              }
            >
              {/* WATCH surface — keep mounted when WORK/COLLAPSED so MediaStream survives */}
              <div
                aria-hidden={!stageDeckShowMonitors}
                style={
                  isIdentityStageOwner
                    ? monitorZeroGeometry
                    : monitorRegionStyle
                }
              >
                <GlobalErrorBoundary context="Command Center Monitors">
                  <CommandCenterMediaStack
                    slots={mediaSlots}
                    bezelVariant="chrome"
                    naturalHeight
                    monitorLayoutMode={monitorLayoutForStack}
                    role={role === "performer" ? "performer" : "fan"}
                    userId={userId}
                    displayName={resolvedDisplayName}
                    onOpenYopho={openYophoInPlace}
                    seriesLabel={role === "performer" ? "PERFORMER HUB · CHROME SERIES · DUAL 16:9 MONITORS" : "FAN HUB · CHROME SERIES · DUAL 16:9 MONITORS"}
                  />
                </GlobalErrorBoundary>
              </div>

              {isIdentityStageOwner ? (
                <div
                  data-tmi-identity-stage
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                  }}
                >
                  <TmiIdentitySurface
                    userId={userId}
                    displayName={resolvedDisplayName}
                    role={role === "performer" ? "performer" : "fan"}
                    accentColor={theme.primary}
                  />
                </div>
              ) : null}
            </div>

            {stageDeckWork ? (
              <CanonicalBottomDrawerHost
                userId={userId}
                displayName={resolvedDisplayName}
                role={role === "performer" ? "performer" : "fan"}
                stageDeck
              />
            ) : null}
          </div>

          {!stageDeckWork ? (
              <>
                <CommandCenterSessionControlStrip
                  role={role === "performer" ? "performer" : "fan"}
                  userId={userId}
                  displayName={resolvedDisplayName}
                />
                {role === "performer" ? <PerformerExperienceQuickStrip /> : null}
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
                <CommandCenterPlaylistBand
                  role={role}
                  userId={userId}
                  displayName={resolvedDisplayName}
                  expanded={
                    (drawerWorkspace === "playlist-studio" && mediaConsoleMode === "expanded") ||
                    activePanel === "playlist"
                  }
                  initialPlaylistId={deepLinkPlaylistId}
                  onCollapse={() => { useWorkspacePresentationStore.getState().closeSurface("DRAWER"); closeDrawer(); }}
                />
                <CanonicalBottomDrawerHost
                  userId={userId}
                  displayName={resolvedDisplayName}
                  role={role === "performer" ? "performer" : "fan"}
                />

                {/* Monetization lives in scroll depth only — never overlays stage controls. */}
                <div style={{ padding: "0 12px 16px" }}>
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
          ) : null}
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
        /* ── DESKTOP: canonical single-column shell (no legacy side rails) ── */
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
          <CanonicalCommandCenterFrame
            role={role === "performer" ? "performer" : "fan"}
            mediaStage={
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
                      userId={userId}
                      displayName={resolvedDisplayName}
                      onOpenYopho={openYophoInPlace}
                      seriesLabel={
                        role === "performer"
                          ? "PERFORMER HUB · CHROME SERIES · DUAL 16:9 MONITORS"
                          : "FAN HUB · CHROME SERIES · DUAL 16:9 MONITORS"
                      }
                    />
                  </GlobalErrorBoundary>
                </div>
              </div>
            }
            sessionStrip={
              <CommandCenterSessionControlStrip
                role={role === "performer" ? "performer" : "fan"}
                userId={userId}
                displayName={resolvedDisplayName}
              />
            }
            experienceStrip={role === "performer" ? <PerformerExperienceQuickStrip /> : undefined}
            mediaDock={
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
            }
            playlistBand={
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
            }
            bottomDrawer={
              <CanonicalBottomDrawerHost
                userId={userId}
                displayName={resolvedDisplayName}
                role={role === "performer" ? "performer" : "fan"}
              />
            }
            drawer={
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
            }
            monetization={
              <div style={{ padding: "12px 16px 18px" }}>
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
            }
          />
        </div>
      )}

      <CompactQuickPanelHost
        userId={userId}
        displayName={resolvedDisplayName}
        role={role === "performer" ? "performer" : "fan"}
      />
      <SnipsOverlayHost />

      {/* Points-earned flight animation — fires on real backend balance increases only */}
      <PointFlightEngine />

      <CameraCaptureOverlay isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      <FloatingWorkspacePanel />
      <UniversalWorkspaceHost userId={userId} displayName={resolvedDisplayName} role={role} />

      {localhostDebugEnabled ? (
        <div
          data-tmi-local-debug-overlay="1"
          style={{
            position: "fixed",
            right: 10,
            bottom: 10,
            zIndex: 10030,
            width: 320,
            maxWidth: "calc(100vw - 20px)",
            background: "rgba(6,10,22,0.92)",
            border: "1px solid rgba(0,255,255,0.35)",
            borderRadius: 10,
            boxShadow: "0 12px 40px rgba(0,0,0,0.55)",
            color: "#d7f7ff",
            fontFamily: "monospace",
            fontSize: 10,
            lineHeight: 1.45,
            padding: "8px 10px",
            pointerEvents: "none",
          }}
        >
          <div style={{ color: "#00ffff", fontWeight: 800, marginBottom: 6 }}>TMI QA DEBUG</div>
          <div style={{ color: "rgba(255,255,255,0.85)", marginBottom: 3 }}>AUTH</div>
          <div>userId: {formatDebugValue(hubDebugSnapshot.authUserId ?? userId)}</div>
          <div>role: {formatDebugValue(hubDebugSnapshot.authRole ?? role)}</div>
          <div>activeRole: {formatDebugValue(hubDebugSnapshot.authActiveRole)}</div>
          <div>fanProfileId: {formatDebugValue(hubDebugSnapshot.fanProfileId)}</div>
          <div>performerProfileId: {formatDebugValue(hubDebugSnapshot.performerProfileId)}</div>
          <div>username: {formatDebugValue(hubDebugSnapshot.username)}</div>
          <div>artistSlug: {formatDebugValue(hubDebugSnapshot.artistSlug)}</div>

          <div style={{ color: "rgba(255,255,255,0.85)", margin: "6px 0 3px" }}>SESSION</div>
          <div>experience: {formatDebugValue(hubDebugSnapshot.experienceType ?? inPlaceCategory)}</div>
          <div>roomId: {formatDebugValue(inPlaceRoomId ?? publishedRoomId ?? mediaRoomId)}</div>
          <div>liveSessionId: {formatDebugValue(hubDebugSnapshot.liveSessionId)}</div>
          <div>published: {isLivePublished ? "ACTIVE" : "NOT ACTIVE"}</div>
          <div>
            participants: {formatDebugValue(hubDebugSnapshot.participantCount ?? watchSession?.viewers ?? null)}
          </div>

          <div style={{ color: "rgba(255,255,255,0.85)", margin: "6px 0 3px" }}>MEDIA</div>
          <div>layout: {formatDebugValue(mediaLayout)}</div>
          <div>programAudioFrame: {formatDebugValue(mediaPrimaryAudioFrame)}</div>
          <div>screenShareAudioOwner: {formatDebugValue(mediaScreenShareAudioSourceId)}</div>
          <div>slotA: {formatDebugValue(mediaFrames.a?.source)}</div>
          <div>slotB: {formatDebugValue(mediaFrames.b?.source)}</div>
          <div>slotC: {formatDebugValue(mediaFrames.c?.source)}</div>
          <div>slotD: {formatDebugValue(mediaFrames.d?.source)}</div>
          <div>jumbotron: NOT ACTIVE</div>

          <div style={{ color: "rgba(255,255,255,0.85)", margin: "6px 0 3px" }}>AUDIO BUSES</div>
          <div>
            PROGRAM: {audioBuses.PROGRAM.muted ? "MUTED" : "LIVE"} · src=
            {formatDebugValue(audioBuses.PROGRAM.currentSourceName)}
          </div>
          <div>
            VOICE: {audioBuses.VOICE.muted ? "MUTED" : "LIVE"} · src=
            {formatDebugValue(audioBuses.VOICE.currentSourceName)}
          </div>
          <div>
            SHARE: {audioBuses.SHARE.muted ? "MUTED" : "LIVE"} · src=
            {formatDebugValue(audioBuses.SHARE.currentSourceName)}
          </div>

          <div style={{ color: "rgba(255,255,255,0.85)", margin: "6px 0 3px" }}>COMMERCE</div>
          <div>cartCount: {formatDebugValue(hubDebugSnapshot.cartCount)}</div>
        </div>
      ) : null}
    </div>
  );
}
