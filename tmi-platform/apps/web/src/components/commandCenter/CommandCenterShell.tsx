"use client";

/**
 * Shared Fan + Performer Command Center shell (blueprint chrome).
 * Same layout: L rail | dual→quad→octo media | R rail | bottom drawer | dock.
 * Role-gated drawer payloads (Rule 26). Shell colors via ThemeEngine (device persist).
 */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MasterControlDock from "@/components/shell/MasterControlDock";
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
import { livingOsCommandBus } from "@/lib/os/livingOsCommandBus";
import {
  ActivePerformerProvider,
  useActivePerformer,
} from "@/lib/context/ActivePerformerContext";
import RoleSwitcherWidget from "@/components/navigation/RoleSwitcherWidget";
import OperationsSidebar from "@/components/sidebar/OperationsSidebar";
import CommandCenterTopNav from "./CommandCenterTopNav";
import CommandCenterIdentityCard from "./CommandCenterIdentityCard";
import PointFlightEngine from "@/components/hud/PointFlightEngine";

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

function CommandCenterShellInner({ role, userId, displayName }: CommandCenterShellProps) {
  const router = useRouter();
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

  const [activePanel, setActivePanel] = useState<CommandCenterPanelId | null>(
    () => drawerStateStore.getLastPanel(role)
  );
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  /** Split-button quick panel: left segment opens this lightweight popover,
   *  right chevron opens the same module's full drawer via onOpenFull. */
  const [quickPanel, setQuickPanel] = useState<{
    label: string;
    info?: string;
    accent: string;
    top: number;
    left: number;
    onOpenFull: () => void;
  } | null>(null);
  const [playlistCast, setPlaylistCast] = useState<CommandCenterPlaylistCast | null>(null);
  const [deepLinkPlaylistId, setDeepLinkPlaylistId] = useState<string | null>(null);
  const [featured, setFeatured] = useState<{
    name: string;
    route: string;
    videoUrl?: string;
    imageUrl?: string;
    viewers?: number;
    performerId?: string;
    performerSlug?: string;
  } | null>(null);

  // Deep-link: /hub/fan?drawer=playlist&playlistId=… or /hub/performer?drawer=bio_magazine
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const drawer = params.get("drawer") as UniversalDrawerModuleId | null;
    const playlistId = params.get("playlistId");
    if (!drawer || !getUniversalDrawerModule(drawer)) return;
    setAppearanceOpen(false);
    setActivePanel(drawer);
    drawerStateStore.setLastPanel(role, drawer);
    if (drawer === "playlist" && playlistId) setDeepLinkPlaylistId(playlistId);
  }, [role]);

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
            {active ? "OPEN" : opts.info}
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

  /**
   * Split rail button — same label, two click targets (2026-08-05, Marcel):
   * left segment (~80%) opens a quick-panel popover; the unlabeled right
   * chevron (~20%) opens the same module's full drawer. No renaming — it's
   * the same button, just split into two actions.
   */
  const splitRailBtn = (opts: {
    key: string;
    label: string;
    info?: string;
    active?: boolean;
    accent?: string;
    onOpenFull: () => void;
  }) => {
    const active = Boolean(opts.active);
    const accent = opts.accent ?? theme.primary;
    return (
      <div
        key={opts.key}
        style={{
          display: "flex",
          alignItems: "stretch",
          width: "100%",
          borderRadius: 8,
          background: active ? `${accent}22` : "transparent",
          border: active ? `1px solid ${accent}88` : "1px solid transparent",
          boxShadow: active ? `0 0 12px ${accent}33` : "none",
          overflow: "hidden",
        }}
      >
        <button
          type="button"
          onClick={(e) => {
            const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
            // Popover is ~220px wide — on narrow/mobile viewports, `rect.right + 8`
            // pushes it off-screen for most rail buttons (reported 2026-08-05:
            // only the buttons whose 20% chevron happened to get tapped directly
            // "worked" — the 80% main-area quick panel was rendering off-screen).
            // Clamp both axes to the viewport instead of assuming space exists.
            const POPOVER_WIDTH = 220;
            const POPOVER_MAX_HEIGHT = 260;
            const left = Math.min(rect.right + 8, window.innerWidth - POPOVER_WIDTH - 12);
            const top = Math.min(rect.top, window.innerHeight - POPOVER_MAX_HEIGHT - 12);
            setQuickPanel({
              label: opts.label,
              info: opts.info,
              accent,
              top: Math.max(12, top),
              left: Math.max(12, left),
              onOpenFull: opts.onOpenFull,
            });
          }}
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "9px 8px 9px 10px",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "inherit",
            color: active ? accent : "#fff",
          }}
        >
          <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {opts.label}
          </span>
          {opts.info ? (
            <span
              style={{
                flexShrink: 0,
                fontSize: 7,
                fontWeight: 900,
                color: active ? "#050510" : "rgba(255,255,255,0.4)",
                background: active ? accent : "rgba(255,255,255,0.06)",
                padding: "1px 5px",
                borderRadius: 4,
                marginLeft: 6,
              }}
            >
              {active ? "OPEN" : opts.info}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          aria-label={`Open ${opts.label} drawer`}
          title="Open full drawer"
          onClick={(e) => {
            e.stopPropagation();
            setQuickPanel(null);
            opts.onOpenFull();
          }}
          style={{
            flexShrink: 0,
            width: 20,
            border: "none",
            borderLeft: `1px solid ${active ? accent + "44" : "rgba(255,255,255,0.1)"}`,
            background: "transparent",
            color: active ? accent : "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          ›
        </button>
      </div>
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
        <button
          type="button"
          onClick={openAppearance}
          style={{
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.1em",
            padding: "6px 12px",
            borderRadius: 8,
            cursor: "pointer",
            border: `1px solid ${theme.secondary}66`,
            background: appearanceOpen ? `${theme.secondary}22` : "rgba(255,255,255,0.04)",
            color: theme.secondary,
            fontFamily: "inherit",
          }}
        >
          🎨 SHELL COLORS
        </button>
        <RoleSwitcherWidget accentColor={theme.primary} />
      </div>

      {/* Media + rails + drawer dock.
          Dock clearance (170) only when drawer closed — when open, drop that
          dead band so the sheet bottom edge sits lower (closer to dock). */}
      <div
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          paddingBottom: activePanel || appearanceOpen ? 0 : 170,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "230px minmax(0, 1fr) 300px",
            minHeight: 520,
          }}
        >
          {/* Left rail */}
          <div
            style={{
              background: `${theme.bgSurface}cc`,
              borderRight: `1px solid ${theme.primary}18`,
              padding: "12px 12px",
              display: "flex",
              flexDirection: "column",
              gap: 5,
              overflowY: "auto",
            }}
          >
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 900, letterSpacing: "0.14em", marginBottom: 4 }}>
              OPERATING CENTERS
            </div>
            {centers.map((center) => {
              const isActive = center.modules.some((m) => m === activePanel);
              return splitRailBtn({
                key: center.id,
                label: `${center.icon} ${center.label}`,
                info: center.info,
                accent: center.accent,
                active: isActive,
                onOpenFull: () => {
                  livingOsCommandBus.executeAction(center.actionId, { role });
                  togglePanel(center.primaryModule as CommandCenterPanelId);
                },
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
                  return splitRailBtn({
                    key: `drawer-${id}`,
                    label: mod.label,
                    info: mod.info,
                    accent: mod.accent,
                    active: activePanel === id,
                    onOpenFull: () => togglePanel(id),
                  });
                })}
              </>
            ) : null}

            {railBtn({
              key: "appearance",
              label: "SHELL COLORS",
              info: "This device",
              accent: theme.secondary,
              active: appearanceOpen,
              onClick: openAppearance,
            })}
            <div style={{ height: 8 }} />
            {railBtn({ key: "friends", label: "FRIENDS", href: "/friends" })}
            {role === "performer"
              ? railBtn({ key: "golive", label: "GO LIVE", info: "Broadcast", href: "/live/go" })
              : railBtn({ key: "camera", label: "CAMERA", info: "Go Live", href: "/live/go" })}
            {railBtn({ key: "settings", label: "SETTINGS", href: "/settings" })}

            <CommandCenterIdentityCard userId={userId} displayName={resolvedDisplayName} role={role === "performer" ? "performer" : "fan"} />
          </div>

          {/* Center media — prototype dual stacked 16:9 chrome bezel */}
          <CommandCenterMediaStack
            slots={mediaSlots}
            bezelVariant="chrome"
            seriesLabel={
              role === "performer"
                ? "PERFORMER HUB · CHROME SERIES · DUAL 16:9 MONITORS"
                : "FAN HUB · CHROME SERIES · DUAL 16:9 MONITORS"
            }
          />

          {/* Right rail */}
          <div
            style={{
              background: `${theme.bgSurface}cc`,
              borderLeft: `1px solid ${theme.primary}18`,
              padding: 12,
              display: "flex",
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

        <MasterControlDock
          role={role === "performer" ? "performer" : "fan"}
          onLeaveRoom={() => router.push(featured?.route ?? "/live/lobby")}
          onEnterStage={() => router.push(role === "performer" ? "/live/go" : "/live/go")}
          onLobbyNav={
            role === "fan"
              ? () => openPanel("lobby")
              : () => openPanel("media_locker")
          }
          onOpenModule={(mod) => openPanel(mod)}
        />

        {/* Layer 2 — Full Drawers: Mounts below Master Control Dock as vertical page extension */}
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
      </div>

      {/* Layer 1 — Quick Panels (Living OS): instant overlays, never block live media */}
      <QuickPanelDock role={role} />

      {/* Points-earned flight animation — fires on real backend balance increases only */}
      <PointFlightEngine />

      {/* Split-button quick panel popover (left segment of splitRailBtn) */}
      {quickPanel ? (
        <>
          <div
            onClick={() => setQuickPanel(null)}
            style={{ position: "fixed", inset: 0, zIndex: 499, background: "transparent" }}
          />
          <div
            style={{
              position: "fixed",
              top: quickPanel.top,
              left: quickPanel.left,
              zIndex: 500,
              width: 220,
              maxWidth: "calc(100vw - 24px)",
              background: "#0d1117",
              border: `1px solid ${quickPanel.accent}55`,
              borderRadius: 10,
              padding: 12,
              boxShadow: "0 16px 40px rgba(0,0,0,0.65)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.06em", color: quickPanel.accent }}>
                {quickPanel.label}
              </span>
              <button
                type="button"
                onClick={() => setQuickPanel(null)}
                aria-label="Close quick panel"
                style={{ border: "none", background: "transparent", color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer" }}
              >
                ×
              </button>
            </div>
            {quickPanel.info ? (
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{quickPanel.info}</span>
            ) : null}
            <button
              type="button"
              onClick={() => {
                const openFull = quickPanel.onOpenFull;
                setQuickPanel(null);
                openFull();
              }}
              style={{
                marginTop: 2,
                padding: "8px 10px",
                borderRadius: 8,
                border: `1px solid ${quickPanel.accent}66`,
                background: `${quickPanel.accent}18`,
                color: quickPanel.accent,
                fontSize: 10,
                fontWeight: 800,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Open Full Drawer →
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
