"use client";

/**
 * Shared Fan + Performer Command Center shell (blueprint chrome).
 * Same layout: L rail | dual→quad→octo media | R rail | bottom drawer | dock.
 * Role-gated drawer payloads (Rule 26). Shell colors via ThemeEngine (device persist).
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import PersistentMediaInteractionDock from "./PersistentMediaInteractionDock";
import CommandCenterPlaylistBand from "./CommandCenterPlaylistBand";
import CommandCenterSessionControlStrip from "./CommandCenterSessionControlStrip";
import UnifiedAdSlot from "@/components/ads/UnifiedAdSlot";
import QuickPanelDock from "@/components/drawers/QuickPanelDock";
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
import { liveDiscoveryOverlayStore } from "@/lib/discovery/liveDiscoveryOverlayStore";
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
import { openCanonicalWorkspaceQuick } from "@/lib/workspace/universal/openCanonicalPresentation";
import { useWorkspacePresentationStore } from "@/lib/workspace/universal/WorkspacePresentationRuntime";

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

function CommandCenterShellInner({ role, userId, displayName }: CommandCenterShellProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const drawerWorkspace = useWorkspacePresentationStore((s) => s.drawerWorkspace);
  const mediaConsoleMode = useWorkspacePresentationStore((s) => s.mediaConsoleMode);
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

  // Deep-link: /hub/fan?drawer=playlist&playlistId=… or /hub/fan?drawer=yopho (workspace)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (hubDrawerDeepLinkDone.current) return;

    const params = new URLSearchParams(window.location.search);
    const drawer = params.get("drawer") as UniversalDrawerModuleId | null;
    const playlistId = params.get("playlistId");
    if (!drawer || !getUniversalDrawerModule(drawer)) return;

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
  }, [role, userId, pathname, router]);

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
    // Prefer Media Console / 4-zone presentation over legacy CommandCenterDrawer + FLOATING.
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
    const check = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) { setMobileLeftOpen(false); setMobileRightOpen(false); }
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
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
        <Link key={opts.key} href={opts.href} style={style}>
          {inner}
        </Link>
      );
    }
    return (
      <button key={opts.key} type="button" onClick={opts.onClick} style={style}>
        {inner}
      </button>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bgBase,
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Inter', sans-serif",
      }}
    >
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
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>No one live right now</span>
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
                onClick={() => setMobileLeftOpen((v) => !v)}
                style={{ background: "transparent", border: `1px solid ${theme.primary}44`, borderRadius: 6, color: theme.primary, fontSize: 10, fontWeight: 800, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit" }}
              >
                ☰ OPS
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
          <RoleSwitcherWidget accentColor={theme.primary} />
        </div>
      </div>

      {/* Media + rails + drawer dock */}
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          overflowX: "hidden",
          paddingBottom: 0,
        }}
      >
        {isMobile && (mobileLeftOpen || mobileRightOpen) && (
          <div
            role="presentation"
            onClick={() => { setMobileLeftOpen(false); setMobileRightOpen(false); }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 9400, touchAction: "none" }}
          />
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "230px minmax(0, 1fr) 300px",
            alignItems: "start",
          }}
        >
          {/* Left rail — desktop static grid child; mobile fixed slide-in overlay */}
          <div
            style={{
              ...(isMobile ? {
                position: "fixed" as const,
                top: 0,
                left: 0,
                height: "100dvh",
                width: 280,
                zIndex: 9500,
                transform: mobileLeftOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
              } : {}),
              background: `${theme.bgSurface}ee`,
              borderRight: `1px solid ${theme.primary}18`,
              padding: "12px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
              overflowY: "auto" as const,
            }}
          >
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileLeftOpen(false)}
                style={{ alignSelf: "flex-end", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "0 4px 4px" }}
              >
                ✕
              </button>
            )}
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
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(255,255,255,0.4)",
                    fontWeight: 900,
                    letterSpacing: "0.14em",
                    margin: "10px 0 4px",
                  }}
                >
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
              : railBtn({ key: "camera", label: "CAMERA", info: "Go Live", href: "/live/go" })}
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
            <GlobalErrorBoundary context="Command Center Monitors">
              <CommandCenterMediaStack
                slots={mediaSlots}
                bezelVariant="chrome"
                naturalHeight
                seriesLabel={
                  role === "performer"
                    ? "PERFORMER HUB · CHROME SERIES · DUAL 16:9 MONITORS"
                    : "FAN HUB · CHROME SERIES · DUAL 16:9 MONITORS"
                }
              />
            </GlobalErrorBoundary>
            <CommandCenterSessionControlStrip
              role={role === "performer" ? "performer" : "fan"}
              onLeaveRoom={() => router.push(featured?.route ?? "/live/lobby")}
              onEnterStage={() => router.push("/live/go")}
            />
            <PersistentMediaInteractionDock
              role={role === "performer" ? "performer" : "fan"}
              userId={userId}
              roomId={featured?.route?.replace(/\//g, "-") ?? "hub-command-center"}
              onLobbyNav={
                role === "fan"
                  ? () => {
                      liveDiscoveryOverlayStore.open();
                      openCanonicalWorkspaceQuick("lobby");
                    }
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

          {/* Right rail — desktop static grid child; mobile fixed slide-in overlay */}
          <div
            style={{
              ...(isMobile ? {
                position: "fixed" as const,
                top: 0,
                right: 0,
                height: "100dvh",
                width: 300,
                zIndex: 9500,
                transform: mobileRightOpen ? "translateX(0)" : "translateX(100%)",
                transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)",
              } : {}),
              background: `${theme.bgSurface}ee`,
              borderLeft: `1px solid ${theme.primary}18`,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflowY: "auto" as const,
            }}
          >
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobileRightOpen(false)}
                style={{ alignSelf: "flex-end", background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: "0 4px 4px" }}
              >
                ✕
              </button>
            )}
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
                onClick={() => liveDiscoveryOverlayStore.open()}
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
                <UnifiedAdSlot venue="dashboard" slotKey="dashboardSidebar" format="rectangle" label="TMI PROMOTION" accentColor={theme.primary} />
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
      </div>

      {/* Layer 1 — Canonical 4-zone quick panels (desktop only) + legacy quick dock */}
      {!isMobile && <CanonicalLeftQuickPanelHost />}
      {!isMobile && <CanonicalRightQuickPanelHost />}
      <QuickPanelDock role={role} />

      {/* Points-earned flight animation — fires on real backend balance increases only */}
      <PointFlightEngine />

      <FloatingWorkspacePanel />
      <UniversalWorkspaceHost userId={userId} displayName={resolvedDisplayName} role={role} />
    </div>
  );
}
