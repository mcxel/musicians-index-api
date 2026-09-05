"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { personalPlaylistEngine } from "@/lib/studio/PersonalPlaylistEngine";
import { getAllTracks, getTrack, type Track } from "@/lib/playlists/PlaylistEngine";
import type { WorkspaceContext } from "@/lib/workspace/universal/types";
import {
  FREE_DEFAULT_CHASSIS_ID,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
  MEDIA_PLAYER_STORE_SKUS,
  canEquipChassis,
  type MediaPlayerChassisId,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import {
  equipChassisApi,
  ensureDefaultMediaPlayer,
  getEquippedChassisId,
  getOwnedChassisIds,
  hydrateMediaPlayerOwnership,
  ownsChassis,
  purchaseChassisWithPointsApi,
  purchaseChassisWithStripe,
  subscribeMediaPlayerInventory,
  unequipChassisApi,
} from "@/lib/artifacts/MediaPlayerInventory";
import { normalizeMembershipTier } from "@/registries/eos/MembershipRegistry";
import { spendTmiPoints } from "@/lib/progression/ProgressionEngine";
import { resolveStudioTrackAudioUrl } from "@/lib/media/durablePlayableUrl";
import DualLayerCrossfade from "@/components/media/DualLayerCrossfade";
import TrackFlipTransition from "@/components/media/TrackFlipTransition";
import MediaPlayerChassisPreview from "@/components/media/MediaPlayerChassisPreview";
import MediaUrlImporter from "@/components/media/MediaUrlImporter";

export interface PlaylistStudioContentProps {
  context: WorkspaceContext;
  userId?: string;
}

type PlayerScreenMode = "artwork" | "video" | "visualizer";

type LibraryRow = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  artworkUrl?: string;
  videoUrl?: string;
  audioUrl?: string | null;
  /** Non-audio platform URL (YouTube/SoundCloud/etc.) — open externally, not in <audio> */
  sourceUrl?: string;
  source: "library" | "catalog";
};

type QueueRow = {
  id: string;
  title: string;
  artist: string;
};

type ApiPlaylistSummary = {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  _count?: { items: number };
};

type OwnedPlaylistRow = {
  id: string;
  name: string;
  trackCount: number;
  source: "api" | "local";
};

type ApiPlaylistSong = {
  id: string;
  title: string;
  audioUrl?: string | null;
  coverUrl?: string | null;
  genre?: string | null;
};

const LOCAL_LIBRARY_PREFIX = "local-library-";

const FREE_SKIN_IDS: MediaPlayerChassisId[] = [
  FREE_DEFAULT_CHASSIS_ID,
  "tmi_classic",
  "tmi_dark",
  "tmi_neon",
];

function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "—:—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Returns true only for URLs the browser's <audio> element can actually play.
function isDirectAudioStream(url: string | null | undefined): boolean {
  if (!url) return false;
  if (/\.(mp3|wav|ogg|m4a|aac|flac|opus|webm)($|\?)/i.test(url)) return true;
  if (url.startsWith("/api/upload/media/") || url.startsWith("/api/media/")) return true;
  if (url.includes(".public.blob.vercel-storage.com")) return true;
  return false;
}

function resolveTrackAudioUrl(
  track: Track | { platforms?: Partial<Record<string, string>>; audioUrl?: string; streamUrl?: string; uri?: string },
): string | null {
  const ext = track as {
    audioUrl?: string;
    streamUrl?: string;
    uri?: string;
    platforms?: Partial<Record<string, string>>;
  };
  return resolveStudioTrackAudioUrl({
    audioUrl: ext.audioUrl,
    streamUrl: ext.streamUrl,
    uri: ext.uri,
    platforms: ext.platforms,
  });
}

export default function PlaylistStudioContent({
  context,
  userId: userIdProp = "local-user",
}: PlaylistStudioContentProps) {
  const [tick, setTick] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(context.trackId ?? null);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(context.playlistId ?? null);
  const [ownedPlaylists, setOwnedPlaylists] = useState<ApiPlaylistSummary[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [playlistTracks, setPlaylistTracks] = useState<ApiPlaylistSong[]>([]);
  const [loadingPlaylistTracks, setLoadingPlaylistTracks] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountTier, setAccountTier] = useState("FREE");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [ownedChassisIds, setOwnedChassisIds] = useState<MediaPlayerChassisId[]>([...FREE_SKIN_IDS]);
  const [screenMode, setScreenMode] = useState<PlayerScreenMode>("artwork");
  const [userId, setUserId] = useState(userIdProp);
  const [equippedId, setEquippedId] = useState(FREE_DEFAULT_CHASSIS_ID);
  const [previewId, setPreviewId] = useState<MediaPlayerChassisId | null>(null);
  const [studioMsg, setStudioMsg] = useState<string | null>(null);
  const [ownedTick, setOwnedTick] = useState(0);
  const [libraryTick, setLibraryTick] = useState(0);
  const [addByUrlOpen, setAddByUrlOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [localQueue, setLocalQueue] = useState<QueueRow[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackSelectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onFocus = (e: Event) => {
      const section = (e as CustomEvent<{ section?: string }>).detail?.section;
      if (section === "track-selector") {
        window.setTimeout(() => {
          trackSelectorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 120);
      }
    };
    window.addEventListener("tmi:playlist-studio-focus", onFocus);
    return () => window.removeEventListener("tmi:playlist-studio-focus", onFocus);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(max-width: 900px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/session", { credentials: "include", cache: "no-store" })
      .then((r) => r.json())
      .then((d: {
        user?: { id?: string; tier?: string; role?: string } | null;
        authenticated?: boolean;
        tier?: string;
        role?: string;
      }) => {
        if (!active) return;
        if (d.user?.id) {
          setUserId(d.user.id);
          setIsAuthenticated(true);
        } else {
          setUserId(userIdProp);
          setIsAuthenticated(false);
        }
        setAccountTier(d.user?.tier ?? d.tier ?? "FREE");
        setUserRole(d.user?.role ?? d.role ?? null);
      })
      .catch(() => {
        if (active) {
          setUserId(userIdProp);
          setIsAuthenticated(false);
        }
      });
    return () => {
      active = false;
    };
  }, [userIdProp]);

  useEffect(() => {
    return subscribeMediaPlayerInventory(() => {
      setOwnedChassisIds(getOwnedChassisIds(userId));
      setEquippedId(getEquippedChassisId(userId));
    });
  }, [userId]);

  const loadOwnedPlaylists = useCallback(async () => {
    setLoadingPlaylists(true);
    try {
      const res = await fetch("/api/user/content", { credentials: "include", cache: "no-store" });
      if (res.ok) {
        const data = (await res.json()) as { playlists?: ApiPlaylistSummary[] };
        const list = data.playlists ?? [];
        setOwnedPlaylists(list);
        setSelectedPlaylistId((prev) => {
          if (prev && list.some((p) => p.id === prev)) return prev;
          if (context.playlistId && list.some((p) => p.id === context.playlistId)) return context.playlistId;
          return list[0]?.id ?? `${LOCAL_LIBRARY_PREFIX}${userId}`;
        });
      } else if (res.status === 401) {
        setOwnedPlaylists([]);
        setSelectedPlaylistId(`${LOCAL_LIBRARY_PREFIX}${userId}`);
      }
    } catch {
      setOwnedPlaylists([]);
      setSelectedPlaylistId(`${LOCAL_LIBRARY_PREFIX}${userId}`);
    } finally {
      setLoadingPlaylists(false);
    }
  }, [userId, context.playlistId]);

  useEffect(() => {
    void loadOwnedPlaylists();
  }, [loadOwnedPlaylists]);

  useEffect(() => {
    if (!selectedPlaylistId || selectedPlaylistId.startsWith(LOCAL_LIBRARY_PREFIX)) {
      setPlaylistTracks([]);
      return;
    }
    let active = true;
    setLoadingPlaylistTracks(true);
    fetch(`/api/user/playlists/${selectedPlaylistId}/songs`, { credentials: "include", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { items?: { song: ApiPlaylistSong }[] } | null) => {
        if (!active) return;
        setPlaylistTracks((data?.items ?? []).map((i) => i.song));
      })
      .catch(() => {
        if (active) setPlaylistTracks([]);
      })
      .finally(() => {
        if (active) setLoadingPlaylistTracks(false);
      });
    return () => {
      active = false;
    };
  }, [selectedPlaylistId, libraryTick]);

  useEffect(() => {
    let active = true;
    ensureDefaultMediaPlayer(userId);
    hydrateMediaPlayerOwnership(userId).then((state) => {
      if (!active) return;
      setEquippedId(state.equippedChassisId);
      setOwnedChassisIds(state.ownedChassisIds);
      setPreviewId(null);
    });
    return () => {
      active = false;
    };
  }, [userId, ownedTick]);

  const runtimeChassisId = equippedId;
  const displayChassisId = previewId ?? runtimeChassisId;
  const chassis =
    MEDIA_PLAYER_CHASSIS_REGISTRY[displayChassisId] ?? MEDIA_PLAYER_CHASSIS_REGISTRY.standard;
  const isPreviewingUnowned = !!previewId && !ownsChassis(userId, previewId);

  const chassisChoices = useMemo(() => {
    const ids = Array.from(new Set([...FREE_SKIN_IDS, ...MEDIA_PLAYER_STORE_SKUS]));
    return ids.map((id) => MEDIA_PLAYER_CHASSIS_REGISTRY[id]).filter(Boolean);
  }, []);

  const personal = useMemo(() => {
    void context.playlistId;
    void context.trackId;
    void libraryTick;
    return personalPlaylistEngine.listSongs(userId);
  }, [userId, context.playlistId, context.trackId, libraryTick]);

  const catalogTracks = useMemo(() => getAllTracks().filter((t) => t.isActive), []);
  const personalSongIds = useMemo(() => new Set(personal.map((s) => s.songId)), [personal]);

  const membershipTier = useMemo(() => normalizeMembershipTier(accountTier), [accountTier]);

  const ownedPlaylistRows = useMemo((): OwnedPlaylistRow[] => {
    if (ownedPlaylists.length > 0) {
      return ownedPlaylists.map((p) => ({
        id: p.id,
        name: p.name,
        trackCount: p._count?.items ?? 0,
        source: "api" as const,
      }));
    }
    if (!isAuthenticated || personal.length > 0) {
      return [{
        id: `${LOCAL_LIBRARY_PREFIX}${userId}`,
        name: "My Library",
        trackCount: personal.length,
        source: "local" as const,
      }];
    }
    return [];
  }, [ownedPlaylists, isAuthenticated, personal.length, userId]);

  const selectedOwnedPlaylist = useMemo(
    () => ownedPlaylistRows.find((p) => p.id === selectedPlaylistId) ?? null,
    [ownedPlaylistRows, selectedPlaylistId],
  );

  const equippableSkins = useMemo(() => {
    void ownedTick;
    const ids = (Object.keys(MEDIA_PLAYER_CHASSIS_REGISTRY) as MediaPlayerChassisId[]).filter((id) =>
      canEquipChassis(id, membershipTier as Parameters<typeof canEquipChassis>[1], ownedChassisIds),
    );
    return ids.map((id) => MEDIA_PLAYER_CHASSIS_REGISTRY[id]).filter(Boolean);
  }, [membershipTier, ownedChassisIds, ownedTick]);

  const bonusSkinCount = useMemo(
    () => equippableSkins.filter((c) => !FREE_SKIN_IDS.includes(c.id)).length,
    [equippableSkins],
  );

  const playlistRoleHint = useMemo(() => {
    const role = (userRole ?? "").toUpperCase();
    if (role === "PERFORMER" || role === "BAND") return "Media Locker playlists you created";
    if (role === "FAN") return "Personal playlists you own";
    if (!isAuthenticated) return "Sign in to sync playlists across devices";
    return "Playlists you created on TMI";
  }, [userRole, isAuthenticated]);

  const rowFromCatalog = useCallback((t: Track): LibraryRow => ({
    id: t.id,
    title: t.title,
    artist: t.artistName,
    duration: "—:—",
    artworkUrl:
      (t as { coverArtUrl?: string; artworkUrl?: string }).coverArtUrl
      ?? (t as { artworkUrl?: string }).artworkUrl,
    videoUrl: (t as { videoUrl?: string }).videoUrl,
    audioUrl: resolveTrackAudioUrl(t),
    source: "catalog",
  }), []);

  const libraryRows = useMemo((): LibraryRow[] => {
    const usingApiPlaylist =
      selectedPlaylistId != null
      && !selectedPlaylistId.startsWith(LOCAL_LIBRARY_PREFIX)
      && playlistTracks.length > 0;

    if (usingApiPlaylist) {
      return playlistTracks.map((s) => {
        const rawUrl = s.audioUrl ?? null;
        const playable = isDirectAudioStream(rawUrl)
          ? resolveTrackAudioUrl({ audioUrl: rawUrl ?? undefined })
          : null;
        return {
          id: s.id,
          title: s.title,
          artist: s.genre ?? "—",
          duration: "—:—",
          artworkUrl: s.coverUrl ?? undefined,
          audioUrl: playable,
          sourceUrl: (!playable && rawUrl) ? rawUrl : undefined,
          source: "library" as const,
        };
      });
    }

    if (personal.length > 0) {
      return personal.map((s) => {
        const catalog = getTrack(s.songId);
        return {
          id: s.songId,
          title: s.title,
          artist: s.artistName,
          duration: formatDuration(s.duration),
          artworkUrl:
            (s as { artworkUrl?: string; coverUrl?: string }).artworkUrl
            ?? (s as { coverUrl?: string }).coverUrl
            ?? (catalog as { coverArtUrl?: string } | undefined)?.coverArtUrl,
          videoUrl: (s as { videoUrl?: string }).videoUrl ?? (catalog as { videoUrl?: string } | undefined)?.videoUrl,
          audioUrl:
            resolveTrackAudioUrl(s as { audioUrl?: string; streamUrl?: string; platforms?: Partial<Record<string, string>> })
            ?? (catalog ? resolveTrackAudioUrl(catalog) : null),
          source: "library",
        };
      });
    }

    if (
      selectedPlaylistId
      && !selectedPlaylistId.startsWith(LOCAL_LIBRARY_PREFIX)
      && !loadingPlaylistTracks
    ) {
      return [];
    }

    if (catalogTracks.length > 0) {
      return catalogTracks.slice(0, 40).map(rowFromCatalog);
    }
    return [];
  }, [personal, catalogTracks, rowFromCatalog, selectedPlaylistId, playlistTracks, loadingPlaylistTracks]);

  const active = useMemo((): LibraryRow | null => {
    const fromLibrary = libraryRows.find((r) => r.id === selectedId);
    if (fromLibrary) return fromLibrary;
    const fromQueue = localQueue.find((r) => r.id === selectedId);
    if (fromQueue) {
      const catalog = getTrack(fromQueue.id);
      return {
        id: fromQueue.id,
        title: fromQueue.title,
        artist: fromQueue.artist,
        duration: "—:—",
        audioUrl: catalog ? resolveTrackAudioUrl(catalog) : null,
        source: "catalog",
      };
    }
    if (context.trackTitle) {
      return {
        id: context.trackId ?? "context",
        title: context.trackTitle,
        artist: context.artistName ?? "—",
        duration: "—:—",
        artworkUrl: context.artworkUrl,
        videoUrl: context.videoUrl,
        audioUrl: null,
        source: "library",
      };
    }
    return null;
  }, [libraryRows, localQueue, selectedId, context.trackTitle, context.trackId, context.artistName, context.artworkUrl, context.videoUrl]);

  const artworkSrc = active?.artworkUrl ?? null;
  const videoSrc = active?.videoUrl ?? null;
  const audioSrc = active?.audioUrl ?? null;
  const activeTrackIndex = selectedId ? libraryRows.findIndex((row) => row.id === selectedId) : -1;
  const activeQueueIndex = selectedId ? localQueue.findIndex((row) => row.id === selectedId) : -1;

  const playNow = useCallback((trackId: string) => {
    setSelectedId(trackId);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !audioSrc) return;
    void el.play().catch(() => {});
  }, [selectedId, audioSrc]);

  const addCatalogTrack = (trackId: string, title: string, artistName: string, releaseDate: string) => {
    const added = personalPlaylistEngine.addDiscoveredSong(userId, {
      songId: trackId,
      title,
      artistId: trackId,
      artistName,
      duration: 0,
      createdAt: releaseDate,
    });
    if (added) {
      setLibraryTick((n) => n + 1);
      setStudioMsg(`Added "${title}" to your library.`);
    } else {
      setStudioMsg(`"${title}" is already in your library.`);
    }
  };

  const addToQueue = useCallback((trackId: string, title: string, artist: string) => {
    setLocalQueue((prev) => {
      if (prev.some((row) => row.id === trackId)) {
        setStudioMsg(`"${title}" is already in the queue.`);
        return prev;
      }
      setStudioMsg(`Added "${title}" to queue.`);
      return [...prev, { id: trackId, title, artist }];
    });
  }, []);

  const createNamedQueue = () => {
    const name = newPlaylistName.trim();
    if (!name) {
      setStudioMsg("Enter a playlist name first.");
      return;
    }
    void (async () => {
      try {
        const res = await fetch("/api/user/content", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
        if (res.ok) {
          const data = (await res.json()) as { playlist?: { id: string } };
          setNewPlaylistName("");
          await loadOwnedPlaylists();
          if (data.playlist?.id) setSelectedPlaylistId(data.playlist.id);
          setStudioMsg(`Playlist "${name}" created — add tracks from the track selector.`);
          return;
        }
        if (res.status === 401) {
          personalPlaylistEngine.getOrCreatePlaylist(userId);
          setNewPlaylistName("");
          setSelectedPlaylistId(`${LOCAL_LIBRARY_PREFIX}${userId}`);
          setLibraryTick((n) => n + 1);
          setStudioMsg(`Local playlist "${name}" ready — sign in to save playlists to your account.`);
          return;
        }
        setStudioMsg("Could not create playlist. Try again.");
      } catch {
        setStudioMsg("Could not create playlist. Try again.");
      }
    })();
  };

  const selectOwnedPlaylist = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setSelectedId(null);
    setStudioMsg(null);
  };

  const equipOwnedSkin = (skinId: MediaPlayerChassisId) => {
    const c = MEDIA_PLAYER_CHASSIS_REGISTRY[skinId];
    if (!c) return;
    const equipped = equippedId === skinId;
    setPreviewId(null);
    void (async () => {
      if (equipped) {
        await unequipChassisApi(userId);
        setStudioMsg(`Unequipped ${c.label} · Standard active.`);
      } else {
        const r = await equipChassisApi(userId, skinId);
        setStudioMsg(r.ok ? `Equipped ${c.label}.` : r.message ?? "Cannot equip");
      }
      setOwnedTick((n) => n + 1);
      setEquippedId(getEquippedChassisId(userId));
    })();
  };

  const selectRelativeTrack = (direction: -1 | 1) => {
    const pool = localQueue.length > 0 ? localQueue : libraryRows;
    if (pool.length === 0) return;
    const currentIndex =
      selectedId != null ? pool.findIndex((row) => row.id === selectedId) : -1;
    const baseIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (baseIndex + direction + pool.length) % pool.length;
    setSelectedId(pool[nextIndex]?.id ?? null);
  };

  const col: CSSProperties = {
    ...(isMobile ? { flexShrink: 0, width: "100%", boxSizing: "border-box" } : { flex: 1 }),
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    background: "rgba(0,0,0,0.28)",
    overflow: "hidden",
  };

  const actionBtn = (label: string, onClick: () => void, accent: string, disabled?: boolean) => (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        fontSize: 7,
        fontWeight: 900,
        letterSpacing: "0.06em",
        padding: "5px 7px",
        borderRadius: 999,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        border: `1px solid ${accent}88`,
        background: `${accent}18`,
        color: accent,
        fontFamily: "inherit",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  const myPlaylistSkinsSection = (
    <section style={col}>
      <header style={sectionHeader}>
        MY PLAYLIST SKINS
        <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
          Player appearance — not playlist content
        </span>
      </header>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
          {equippableSkins.length} style{equippableSkins.length === 1 ? "" : "s"} available on your account
          {bonusSkinCount > 0 ? ` · ${bonusSkinCount} bonus unlock${bonusSkinCount === 1 ? "" : "s"}` : ""}.
          Switching skins never resets playback.
        </div>
        {equippableSkins.length === 0 ? (
          <div style={emptyBox}>No player styles unlocked yet. Free styles appear after sign-in.</div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {equippableSkins.map((c) => {
              const equipped = equippedId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => equipOwnedSkin(c.id)}
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.06em",
                    padding: "6px 10px",
                    borderRadius: 999,
                    cursor: "pointer",
                    border: equipped ? `1px solid ${c.accent}` : "1px solid rgba(255,255,255,0.12)",
                    background: equipped ? `${c.accent}22` : "rgba(255,255,255,0.03)",
                    color: equipped ? c.accent : "rgba(255,255,255,0.55)",
                    fontFamily: "inherit",
                  }}
                >
                  {c.icon} {c.label.replace(/^TMI /, "")}
                  {equipped ? " · ACTIVE" : ""}
                </button>
              );
            })}
          </div>
        )}
        {bonusSkinCount === 0 ? (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            Unlock more styles in My Media Players below (points, tier rewards, or purchase).
          </div>
        ) : null}
        {studioMsg ? (
          <div
            style={{
              fontSize: 11,
              color: studioMsg.includes("Not enough") || studioMsg.includes("Cannot") ? "#ffb0b0" : "#9dffc8",
            }}
          >
            {studioMsg}
          </div>
        ) : null}
      </div>
    </section>
  );

  const playerSection = (
    <section
      style={{
        ...col,
        background: "linear-gradient(180deg, rgba(170,45,255,0.16), rgba(4,6,14,0.96))",
        borderColor: `${chassis.accent}44`,
      }}
    >
      <header style={sectionHeader}>
        NOW PLAYING
        <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
          {MEDIA_PLAYER_CHASSIS_REGISTRY[runtimeChassisId]?.icon}{" "}
          {MEDIA_PLAYER_CHASSIS_REGISTRY[runtimeChassisId]?.label ?? "Standard"}
        </span>
      </header>
      <div style={{ padding: isMobile ? 12 : 14, display: "flex", flexDirection: "column", gap: 12 }}>
        <div
          style={{
            minHeight: isMobile ? 260 : 220,
            borderRadius: 14,
            overflow: "hidden",
            border: `1px solid ${chassis.accent}33`,
            background: "rgba(0,0,0,0.35)",
            position: "relative",
          }}
        >
          {screenMode === "artwork" ? (
            <DualLayerCrossfade
              src={artworkSrc}
              alt={active ? `${active.title} artwork` : "Artwork"}
              fallbackLabel="No artwork"
              accent={chassis.accent}
              style={{ borderRadius: 0 }}
            />
          ) : null}
          {screenMode === "video" ? (
            videoSrc ? (
              <video
                src={videoSrc}
                controls
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover", background: "#000" }}
              />
            ) : (
              <div style={{ ...emptyBox, margin: 16, height: "calc(100% - 32px)" }}>
                No video URL for this track. Switch to Artwork or Visualizer.
              </div>
            )
          ) : null}
          {screenMode === "visualizer" ? (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                gap: 3,
                padding: 16,
              }}
              aria-label="Audio visualizer"
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const h = 8 + ((Math.sin(tick * 0.55 + i * 0.55) + 1) * 0.5) * 70;
                return (
                  <span
                    key={i}
                    style={{
                      width: 6,
                      height: h,
                      borderRadius: 2,
                      background: `linear-gradient(180deg, ${chassis.accent}, #AA2DFF)`,
                      boxShadow: `0 0 8px ${chassis.accent}73`,
                    }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <TrackFlipTransition transitionKey={active?.id ?? "none"} neonSweep accent={chassis.accent}>
            {active ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>{active.title}</div>
                <div style={{ fontSize: 12, color: chassis.accent, fontWeight: 700 }}>{active.artist}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{active.duration}</div>
              </>
            ) : (
              <div style={{ fontSize: 14, fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>No track selected</div>
            )}
          </TrackFlipTransition>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
            {active
              ? activeQueueIndex >= 0
                ? `Queue position ${activeQueueIndex + 1} of ${localQueue.length}`
                : `Track ${Math.max(activeTrackIndex + 1, 1)} of ${libraryRows.length || 1}`
              : "Choose a track below to focus the player."}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "center" }}>
          <button type="button" onClick={() => selectRelativeTrack(-1)} style={transportBtn(chassis.accent)}>
            ◀ PREV
          </button>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {(
              [
                { id: "artwork" as const, label: "ARTWORK" },
                { id: "video" as const, label: "VIDEO" },
                { id: "visualizer" as const, label: "FX" },
              ] as const
            ).map((m) => {
              const on = screenMode === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setScreenMode(m.id)}
                  style={{
                    fontSize: 8,
                    fontWeight: 900,
                    letterSpacing: "0.06em",
                    padding: "6px 8px",
                    borderRadius: 999,
                    cursor: "pointer",
                    border: on ? `1px solid ${chassis.accent}` : "1px solid rgba(255,255,255,0.12)",
                    background: on ? `${chassis.accent}22` : "transparent",
                    color: on ? chassis.accent : "rgba(255,255,255,0.45)",
                    fontFamily: "inherit",
                  }}
                >
                  {m.label}
                </button>
              );
            })}
          </div>
          <button type="button" onClick={() => selectRelativeTrack(1)} style={transportBtn(chassis.accent)}>
            NEXT ▶
          </button>
        </div>

        {audioSrc ? (
          <audio
            ref={audioRef}
            src={audioSrc}
            controls
            preload="metadata"
            style={{ width: "100%", height: 34 }}
          />
        ) : (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            {active ? "No playable audio URL on this track yet." : "Select a track to begin playback."}
          </div>
        )}
      </div>
    </section>
  );

  const currentPlaylistSection = (
    <section style={col}>
      <header style={sectionHeader}>CURRENT PLAYLIST</header>
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>
          {selectedOwnedPlaylist?.name ?? "No playlist selected"}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
          {loadingPlaylistTracks
            ? "Loading tracks…"
            : selectedOwnedPlaylist
              ? `${libraryRows.length} track${libraryRows.length === 1 ? "" : "s"} · ${playlistRoleHint}`
              : "Select a playlist from My Playlists or create one below."}
        </div>
        {selectedId ? (
          <div style={{ fontSize: 10, color: chassis.accent, fontWeight: 700 }}>
            Active position:{" "}
            {activeTrackIndex >= 0
              ? `${activeTrackIndex + 1} of ${libraryRows.length}`
              : activeQueueIndex >= 0
                ? `${activeQueueIndex + 1} of ${localQueue.length} (queue)`
                : "—"}
          </div>
        ) : (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>No track focused</div>
        )}
      </div>
    </section>
  );

  const trackSelectorSection = (
    <section style={col} ref={trackSelectorRef} data-section="track-selector">
      <header style={sectionHeader}>TRACK SELECTOR</header>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {loadingPlaylistTracks ? (
          <div style={emptyBox}>Loading playlist tracks…</div>
        ) : catalogTracks.length === 0 && libraryRows.length === 0 ? (
          <div style={emptyBox}>
            {selectedOwnedPlaylist
              ? `"${selectedOwnedPlaylist.name}" has no tracks yet. Add songs from the catalog below.`
              : "No tracks available yet."}
          </div>
        ) : (
          <>
            {libraryRows.length > 0 ? (
              <>
                <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", marginBottom: 6, letterSpacing: "0.08em" }}>
                  {selectedOwnedPlaylist ? selectedOwnedPlaylist.name.toUpperCase() : "YOUR LIBRARY"}
                </div>
                {libraryRows.map((row) => (
                  <div
                    key={`lib-${row.id}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      padding: "10px 12px",
                      marginBottom: 6,
                      borderRadius: 10,
                      border: selectedId === row.id ? `1px solid ${chassis.accent}b3` : "1px solid rgba(255,255,255,0.08)",
                      background: selectedId === row.id ? `${chassis.accent}14` : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <span>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{row.title}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{row.artist} · {row.duration}</div>
                    </span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {actionBtn("PLAY NOW", () => playNow(row.id), chassis.accent)}
                      {actionBtn("ADD TO QUEUE", () => addToQueue(row.id, row.title, row.artist), "#AA2DFF")}
                      {row.sourceUrl && (
                        <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.06em", padding: "6px 8px",
                            borderRadius: 6, border: "1px solid rgba(255,255,255,0.2)",
                            background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)",
                            textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 3 }}>
                          OPEN SOURCE ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </>
            ) : null}
            {catalogTracks.length > 0 ? (
              <>
                <div style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.4)", margin: "8px 0 6px", letterSpacing: "0.08em" }}>
                  CATALOG
                </div>
                {catalogTracks.slice(0, 40).map((track) => {
            const inLibrary = personalSongIds.has(track.id);
            const row = rowFromCatalog(track);
            return (
              <div
                key={track.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  padding: "10px 12px",
                  marginBottom: 6,
                  borderRadius: 10,
                  border: selectedId === track.id
                    ? `1px solid ${chassis.accent}b3`
                    : "1px solid rgba(255,255,255,0.08)",
                  background: selectedId === track.id ? `${chassis.accent}14` : "rgba(255,255,255,0.03)",
                }}
              >
                <span>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{track.title}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{track.artistName}</div>
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {actionBtn("PLAY NOW", () => playNow(track.id), chassis.accent)}
                  {actionBtn(
                    inLibrary ? "IN LIBRARY" : "ADD TO PLAYLIST",
                    () => addCatalogTrack(track.id, track.title, track.artistName, track.releaseDate),
                    "#00FF88",
                    inLibrary,
                  )}
                  {actionBtn(
                    "ADD TO QUEUE",
                    () => addToQueue(track.id, row.title, row.artist),
                    "#AA2DFF",
                  )}
                </div>
              </div>
            );
                })}
              </>
            ) : null}
          </>
        )}
      </div>
    </section>
  );

  const myPlaylistsSection = (
    <section style={col}>
      <header style={sectionHeader}>
        MY PLAYLISTS
        <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
          Content containers you own
        </span>
      </header>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {loadingPlaylists ? (
          <div style={emptyBox}>Loading your playlists…</div>
        ) : ownedPlaylistRows.length === 0 ? (
          <div style={emptyBox}>
            {isAuthenticated
              ? "No playlists yet. Create one below or add tracks from the selector."
              : "Sign in to see playlists synced to your account. You can still build a local library offline."}
          </div>
        ) : (
          ownedPlaylistRows.map((pl) => {
            const active = selectedPlaylistId === pl.id;
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => selectOwnedPlaylist(pl.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  marginBottom: 6,
                  borderRadius: 10,
                  border: active ? `1px solid ${chassis.accent}b3` : "1px solid rgba(255,255,255,0.08)",
                  background: active ? `${chassis.accent}14` : "rgba(255,255,255,0.03)",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: "#fff",
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700 }}>{pl.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
                  {pl.trackCount} track{pl.trackCount === 1 ? "" : "s"}
                  {pl.source === "local" ? " · Local only" : " · Saved to account"}
                  {active ? " · SELECTED" : ""}
                </div>
              </button>
            );
          })
        )}
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 4, lineHeight: 1.4 }}>
          {playlistRoleHint}
        </div>
      </div>
    </section>
  );

  const addByUrlSection = (
    <section style={col}>
      <header style={{ ...sectionHeader, cursor: "pointer" }} onClick={() => setAddByUrlOpen((v) => !v)}>
        ADD MEDIA BY URL
        <span style={{ marginLeft: "auto", fontWeight: 600, color: "rgba(255,255,255,0.35)", fontSize: 9 }}>
          {addByUrlOpen ? "▲ CLOSE" : "▼ OPEN"}
        </span>
      </header>
      {addByUrlOpen && (
        <MediaUrlImporter
          compact
          defaultPlaylistId={selectedPlaylistId && !selectedPlaylistId.startsWith(LOCAL_LIBRARY_PREFIX) ? selectedPlaylistId : undefined}
          onImported={(track) => {
            setLibraryTick((n) => n + 1);
            setStudioMsg(`✓ "${track.title}" saved${track.addedToPlaylist ? " and added to playlist" : " to collection"}.`);
            if (track.addedToPlaylist) void loadOwnedPlaylists();
          }}
        />
      )}
    </section>
  );

  const createPlaylistSection = (
    <section style={col}>
      <header style={sectionHeader}>CREATE PLAYLIST</header>
      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="New playlist name"
            style={{
              flex: 1,
              minWidth: 0,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(0,0,0,0.35)",
              color: "#fff",
              fontSize: 11,
              fontFamily: "inherit",
            }}
          />
          <button
            type="button"
            onClick={createNamedQueue}
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.08em",
              padding: "8px 12px",
              borderRadius: 8,
              border: `1px solid ${chassis.accent}88`,
              background: `${chassis.accent}18`,
              color: chassis.accent,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
            }}
          >
            CREATE
          </button>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.45 }}>
          {ownedPlaylistRows.length > 0
            ? `${ownedPlaylistRows.length} owned playlist${ownedPlaylistRows.length === 1 ? "" : "s"}. Select one in My Playlists, then add tracks below.`
            : "Name a playlist, then add tracks from Track Selector."}
        </div>
      </div>
    </section>
  );

  const queueSection = (
    <section style={col}>
      <header style={sectionHeader}>QUEUE</header>
      <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
        {localQueue.length === 0 ? (
          <div style={emptyBox}>Queue empty — use ADD TO QUEUE on any track.</div>
        ) : (
          <TrackFlipTransition
            transitionKey={selectedId ?? localQueue[0]?.id ?? "queue"}
            mode="slide"
            neonSweep
            accent={chassis.accent}
          >
            {localQueue.map((row, idx) => (
              <button
                key={`${row.id}-${idx}`}
                type="button"
                onClick={() => setSelectedId(row.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 10px",
                  marginBottom: 4,
                  borderRadius: 8,
                  background: row.id === selectedId ? `${chassis.accent}22` : "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 11,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ fontWeight: 700 }}>{row.title}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>{row.artist}</div>
              </button>
            ))}
          </TrackFlipTransition>
        )}
      </div>
    </section>
  );

  const mediaPlayersSection = (
    <section style={col}>
      <header style={sectionHeader}>MY MEDIA PLAYERS</header>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)" }}>
          Equipped: {MEDIA_PLAYER_CHASSIS_REGISTRY[runtimeChassisId]?.label ?? runtimeChassisId}
          {isPreviewingUnowned ? (
            <>
              <span style={{ margin: "0 6px", opacity: 0.35 }}>·</span>
              <span style={{ color: "#FFD700" }}>Preview: {chassis.label}</span>
            </>
          ) : null}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(132px, 1fr))",
            gap: 8,
            maxHeight: isMobile ? 280 : 220,
            overflowY: "auto",
          }}
        >
          {chassisChoices.map((c) => {
            const owned = ownsChassis(userId, c.id);
            const equipped = equippedId === c.id;
            const previewing = previewId === c.id;
            return (
              <MediaPlayerChassisPreview
                key={c.id}
                chassis={c}
                owned={owned}
                equipped={equipped}
                previewOnly={!owned}
                onClick={() => {
                  if (owned) {
                    setPreviewId(null);
                    void (async () => {
                      if (equipped) {
                        await unequipChassisApi(userId);
                        setStudioMsg(`Unequipped ${c.label} · Standard active.`);
                      } else {
                        const r = await equipChassisApi(userId, c.id);
                        setStudioMsg(r.ok ? `Equipped ${c.label}.` : r.message ?? "Cannot equip");
                      }
                      setOwnedTick((n) => n + 1);
                      setEquippedId(getEquippedChassisId(userId));
                    })();
                  } else {
                    setPreviewId(previewing ? null : c.id);
                    setStudioMsg(
                      previewing
                        ? null
                        : `Previewing ${c.label}. Purchase to own this player style.`,
                    );
                  }
                }}
                footer={
                  !owned ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void (async () => {
                            const cost = c.pricePoints ?? 299;
                            const r = await purchaseChassisWithPointsApi(userId, c.id, () =>
                              spendTmiPoints(userId, cost, `media_player_${c.id}`),
                            );
                            setStudioMsg(r.message);
                            if (r.ok) {
                              setPreviewId(null);
                              setOwnedTick((n) => n + 1);
                            }
                          })();
                        }}
                        style={{
                          fontSize: 8,
                          fontWeight: 900,
                          padding: "5px 6px",
                          borderRadius: 5,
                          border: `1px solid ${c.accent}88`,
                          background: `${c.accent}22`,
                          color: c.accent,
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        BUY {c.pricePoints ?? 299} PTS
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          void (async () => {
                            const r = await purchaseChassisWithStripe(c.id);
                            if (r.ok && r.url) window.location.href = r.url;
                            else setStudioMsg(r.message ?? "Stripe unavailable");
                          })();
                        }}
                        style={{
                          fontSize: 8,
                          fontWeight: 900,
                          padding: "5px 6px",
                          borderRadius: 5,
                          border: "1px solid #FFD70088",
                          background: "#FFD70022",
                          color: "#FFD700",
                          cursor: "pointer",
                          fontFamily: "inherit",
                        }}
                      >
                        BUY ${((c.priceUsdCents ?? 299) / 100).toFixed(2)}
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      Tap to {equipped ? "unequip" : "equip"}
                    </div>
                  )
                }
              />
            );
          })}
        </div>
      </div>
    </section>
  );

  const orderedSections = [
    playerSection,
    currentPlaylistSection,
    myPlaylistsSection,
    myPlaylistSkinsSection,
    addByUrlSection,
    trackSelectorSection,
    createPlaylistSection,
    queueSection,
    mediaPlayersSection,
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          padding: "8px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(170,45,255,0.08)",
        }}
      >
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", color: "#AA2DFF" }}>
            MEDIA PLAYER STUDIO
          </div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {MEDIA_PLAYER_CHASSIS_REGISTRY[runtimeChassisId]?.icon}{" "}
            {MEDIA_PLAYER_CHASSIS_REGISTRY[runtimeChassisId]?.label ?? "Standard"}
            {isPreviewingUnowned ? (
              <>
                <span style={{ margin: "0 6px", opacity: 0.35 }}>·</span>
                <span style={{ color: "#FFD700" }}>Preview: {chassis.label}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {isMobile ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            flex: 1,
            minHeight: 0,
            padding: 10,
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            overflowY: "auto",
            overflowX: "hidden",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {orderedSections}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
            gap: 10,
            flex: 1,
            minHeight: 0,
            padding: 10,
            overflowY: "auto",
          }}
        >
          {orderedSections}
        </div>
      )}
    </div>
  );
}

function transportBtn(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    padding: "8px 10px",
    borderRadius: 10,
    cursor: "pointer",
    border: `1px solid ${color}88`,
    background: `${color}18`,
    color,
    fontFamily: "inherit",
    whiteSpace: "nowrap",
  };
}

const sectionHeader: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  padding: "10px 12px",
  fontSize: 10,
  fontWeight: 900,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.7)",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
};

const emptyBox: CSSProperties = {
  padding: 16,
  borderRadius: 10,
  border: "1px dashed rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.5)",
  fontSize: 12,
  lineHeight: 1.45,
};
