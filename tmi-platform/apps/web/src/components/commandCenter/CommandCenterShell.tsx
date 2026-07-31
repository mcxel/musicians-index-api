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
import SponsorRail from "@/components/sponsors/SponsorRail";
import { getRailSponsors } from "@/lib/commerce/SponsorRegistry";
import CommandCenterMediaStack, {
  type CommandCenterMediaSlot,
  type CommandCenterPlaylistCast,
} from "./CommandCenterMediaStack";
import CommandCenterDrawer from "./CommandCenterDrawer";
import {
  panelsForRole,
  type CommandCenterPanelId,
  type CommandCenterRole,
} from "./commandCenterRegistry";
import { FAN_AD_ZONE } from "./FanCommandDrawerRegistry";
import { PERFORMER_SPONSOR_ZONE } from "./PerformerCommandDrawerRegistry";
import { useTheme } from "@/lib/design/ThemeEngine";
import { getPerformerById } from "@/lib/performers/PerformerRegistry";
import {
  subscribePlaylistCast,
  subscribePlaylistNowPlaying,
  type PlaylistCastPayload,
} from "@/lib/playlists/PlaylistMonitorCast";

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
  const router = useRouter();
  const theme = useTheme();
  const panels = panelsForRole(role);
  const primary = panels.filter((p) => p.primary);
  const secondary = panels.filter((p) => !p.primary);

  const [activePanel, setActivePanel] = useState<CommandCenterPanelId | null>(null);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [playlistCast, setPlaylistCast] = useState<CommandCenterPlaylistCast | null>(null);
  const [deepLinkPlaylistId, setDeepLinkPlaylistId] = useState<string | null>(null);
  const [featured, setFeatured] = useState<{
    name: string;
    route: string;
    videoUrl?: string;
    imageUrl?: string;
    viewers?: number;
  } | null>(null);

  // Deep-link: /hub/fan?drawer=playlist&playlistId=…
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const drawer = params.get("drawer");
    const playlistId = params.get("playlistId");
    if (drawer === "playlist") {
      setAppearanceOpen(false);
      setActivePanel("playlist");
      if (playlistId) setDeepLinkPlaylistId(playlistId);
    } else if (drawer === "messaging") {
      setAppearanceOpen(false);
      setActivePanel("messaging");
    }
  }, []);

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
    setActivePanel((prev) => (prev === id ? null : id));
  };

  /** Always open/swap into drawer (never toggle-close) — used by dock + drawer chips. */
  const openPanel = (id: CommandCenterPanelId) => {
    setAppearanceOpen(false);
    setActivePanel(id);
  };

  const openAppearance = () => {
    setActivePanel(null);
    setAppearanceOpen((v) => !v);
  };

  const closeDrawer = () => {
    setActivePanel(null);
    setAppearanceOpen(false);
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
        label: "MONITOR B · AUDIENCE",
        kind: "audience",
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
      {/* Top bar */}
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
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              Live: {featured.name}
              {featured.viewers != null ? ` · ${featured.viewers.toLocaleString()} watching` : ""}
            </span>
          ) : (
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>No one live right now</span>
          )}
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
      </div>

      {/* Media + rails + drawer */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: "calc(100vh - 44px)",
          maxHeight: "calc(100vh - 44px)",
          overflow: "hidden",
          paddingBottom: 100,
        }}
      >
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "230px minmax(0, 1fr) 300px",
            overflow: "hidden",
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
              MAIN MENU
            </div>
            <div style={{ fontSize: 8, color: `${theme.tertiary}99`, fontWeight: 800, letterSpacing: "0.12em" }}>
              OPEN DRAWER
            </div>
            {primary.map((p) =>
              railBtn({
                key: p.id,
                label: p.label,
                info: p.info,
                accent: p.accent,
                active: activePanel === p.id,
                onClick: () => togglePanel(p.id),
              }),
            )}
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.28)", fontWeight: 800, letterSpacing: "0.12em", marginTop: 8 }}>
              MORE IN DRAWER
            </div>
            {secondary.map((p) =>
              railBtn({
                key: p.id,
                label: p.label,
                info: p.info,
                accent: p.accent,
                active: activePanel === p.id,
                onClick: () => togglePanel(p.id),
              }),
            )}
            {railBtn({
              key: "appearance",
              label: "SHELL COLORS",
              info: "This device",
              accent: theme.secondary,
              active: appearanceOpen,
              onClick: openAppearance,
            })}
            <div style={{ height: 8 }} />
            {railBtn({ key: "live", label: "LIVE ROOMS", info: "Discover", href: "/live/lobby" })}
            {railBtn({
              key: "msg",
              label: "MESSAGES",
              info: "Invite · join",
              accent: "#00FFFF",
              active: activePanel === "messaging",
              onClick: () => togglePanel("messaging"),
            })}
            {railBtn({ key: "friends", label: "FRIENDS", href: "/friends" })}
            {role === "performer"
              ? railBtn({ key: "golive", label: "GO LIVE", info: "Broadcast", href: "/live/go" })
              : railBtn({ key: "camera", label: "CAMERA", info: "Go Live", href: "/live/go" })}
            {railBtn({ key: "store", label: "STORE", href: "/store" })}
            {railBtn({ key: "settings", label: "SETTINGS", href: "/settings" })}

            <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
              <div style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{displayName}</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: theme.primary, letterSpacing: "0.08em", marginTop: 2 }}>
                {role === "performer" ? "PERFORMER" : "FAN"} · THEME {theme.name.toUpperCase()}
              </div>
            </div>
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
            <div style={{ flex: 1, minHeight: 160, background: "rgba(0,0,0,0.25)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", padding: 10, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 6, marginBottom: 8 }}>
                {["CHAT", "ROOM", "PEOPLE"].map((t, i) => (
                  <span key={t} style={{ fontSize: 10, fontWeight: 900, color: i === 0 ? theme.primary : "rgba(255,255,255,0.35)" }}>
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", padding: 12 }}>
                {featured ? "No messages yet — say something!" : "Join a live room to chat"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>ROOMS NEARBY</div>
              <Link href="/live/lobby" style={{ display: "block", fontSize: 10, color: theme.secondary, textDecoration: "none", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}>
                Open Live Lobby Wall →
              </Link>
            </div>

            {/* Rule 12: Fan ads vs Performer sponsors — never empty */}
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
                  SPONSORS · {PERFORMER_SPONSOR_ZONE}
                </div>
                <SponsorRail sponsors={getRailSponsors("dashboard-performer")} zone={PERFORMER_SPONSOR_ZONE} />
                <Link
                  href="/sponsors/advertise"
                  style={{ display: "block", marginTop: 8, fontSize: 9, color: theme.tertiary, textDecoration: "none", fontWeight: 800 }}
                >
                  Sell a placement →
                </Link>
              </div>
            )}
          </div>
        </div>

        <CommandCenterDrawer
          role={role}
          activePanel={activePanel}
          appearanceOpen={appearanceOpen}
          userId={userId}
          displayName={displayName}
          onClose={closeDrawer}
          onSelectPanel={role === "fan" ? openPanel : undefined}
          initialPlaylistId={deepLinkPlaylistId}
        />
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
        onOpenModule={
          role === "fan"
            ? (mod) => openPanel(mod)
            : (mod) => {
                if (mod === "playlist") openPanel("playlist");
                else if (mod === "memory") openPanel("memory");
                else if (mod === "yopho") openPanel("yopho");
                else openPanel("media_locker");
              }
        }
      />
    </div>
  );
}
