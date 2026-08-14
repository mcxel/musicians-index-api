"use client";

/**
 * PlaylistCanister — Phase 5.4 High-Fidelity Cyberpunk Music Player
 * 3-Column Glassmorphic Deck:
 *   Left: Glowing Neon Turntable / Visualizer & Transport Controls
 *   Center: Playlist Library Grid (real playlists via /api/user/content)
 *   Right: Now Playing Tracklist + Equalizer
 *
 * All playlist/track data is real (Prisma Playlist/PlaylistItem/Song via
 * /api/user/content + /api/user/playlists/[id]/songs) — no fabricated
 * "Hustle & Flow / MarcelID" now-playing state (Rule 20). Honest empty
 * states when the user has no playlists or a selected playlist is empty.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { sanitizePublicDisplayLabel } from "@/lib/auth/resolveSessionIdentity";
import { castPlaylistToMonitor } from "@/lib/playlists/PlaylistMonitorCast";
import {
  sendPlaybackCommand,
  subscribePlaybackCommands,
  syncNowPlaying,
} from "@/lib/playlists/commandCenterPlaybackBus";
import { resolvePlaylistLibraryHeader } from "@/lib/playlists/playlistLibraryDisplayName";
import {
  fetchShareThreadOptions,
  sharePlaylistToThread,
  type MessageThreadOption,
} from "@/lib/playlists/sharePlaylistToThread";

interface ApiPlaylistSummary {
  id: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  shareToken?: string | null;
  _count?: { items: number };
}

interface ApiSong {
  id: string;
  title: string;
  audioUrl?: string | null;
  coverUrl?: string | null;
  genre?: string | null;
  bpm?: number | null;
}

interface PlaylistCanisterProps {
  entityId: string;
  entityName?: string;
  accentColor?: string;
  isOwner?: boolean;
  role?: "fan" | "performer";
  initialPlaylistId?: string | null;
  /** compact = under-dock library strip; full = 3-column canister deck */
  layout?: "compact" | "full";
}

const CARD_ACCENTS = ["#00FFFF", "#FF2DAA", "#FFD700", "#AA2DFF", "#00FF88", "#FF0055"];

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || !Number.isFinite(seconds)) return "—:—";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PlaylistCanister({
  entityId,
  entityName,
  accentColor = "#FF5500",
  isOwner = false,
  role = "fan",
  initialPlaylistId = null,
  layout = "full",
}: PlaylistCanisterProps) {
  const isCompact = layout === "compact";
  const [isMobile, setIsMobile] = useState(true); // mobile-first: avoids 3-column overflow on phones
  const [playlists, setPlaylists] = useState<ApiPlaylistSummary[]>([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(initialPlaylistId);
  const [tracks, setTracks] = useState<ApiSong[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [eqGains, setEqGains] = useState<number[]>(new Array(9).fill(50));
  const [shareOpen, setShareOpen] = useState(false);
  const [threads, setThreads] = useState<MessageThreadOption[]>([]);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [ownerLabel, setOwnerLabel] = useState<string | null>(null);
  const [savingDisplayName, setSavingDisplayName] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedPlaylist = useMemo(
    () => playlists.find((p) => p.id === selectedId) ?? null,
    [playlists, selectedId],
  );

  const libraryHeader = useMemo(
    () =>
      resolvePlaylistLibraryHeader({
        activePlaylistName: selectedPlaylist?.name,
        role,
      }),
    [selectedPlaylist?.name, role],
  );

  const publicOwnerName = useMemo(() => {
    const base = ownerLabel ?? entityName;
    return sanitizePublicDisplayLabel(base, { email: sessionEmail, userId: entityId });
  }, [ownerLabel, entityName, sessionEmail, entityId]);

  // Mobile detection — matchMedia is immune to layout-overflow inflating window.innerWidth
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 767px)");
    const check = () => setIsMobile(mql.matches);
    check();
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  useEffect(() => {
    if (!isOwner) return;
    let cancelled = false;
    (async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
        if (!sessionRes.ok || cancelled) return;
        const sessionData = (await sessionRes.json()) as {
          user?: { id?: string; name?: string; email?: string };
        };
        const email = sessionData.user?.email ?? null;
        if (!cancelled) setSessionEmail(email);

        let profileName: string | null = sessionData.user?.name?.trim() ?? null;
        const profileRes = await fetch("/api/user/profile", { credentials: "include", cache: "no-store" });
        if (profileRes.ok) {
          const profileData = (await profileRes.json()) as {
            profile?: { displayName?: string | null };
          };
          profileName = profileData.profile?.displayName?.trim() ?? profileName;
        }
        if (!cancelled && profileName) setOwnerLabel(profileName);
      } catch {
        /* keep prop fallback */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOwner]);

  const editDisplayName = async () => {
    const next = window.prompt("Your display name on playlists and casts:", publicOwnerName);
    if (!next?.trim() || next.trim() === publicOwnerName) return;
    setSavingDisplayName(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ displayName: next.trim() }),
      });
      if (res.ok) {
        setOwnerLabel(next.trim());
        window.dispatchEvent(
          new CustomEvent("tmi:display-name-updated", { detail: { name: next.trim() } }),
        );
      }
    } finally {
      setSavingDisplayName(false);
    }
  };

  const activeTrack = tracks[currentTrackIndex] ?? null;

  useEffect(() => {
    return subscribePlaybackCommands((command) => {
      if (command === "toggle") setIsPlaying((p) => !p);
      else if (command === "play") setIsPlaying(true);
      else if (command === "pause") setIsPlaying(false);
      else if (command === "prev") setCurrentTrackIndex((prev) => Math.max(0, prev - 1));
      else if (command === "next") {
        setCurrentTrackIndex((prev) => Math.min(Math.max(tracks.length - 1, 0), prev + 1));
      }
    });
  }, [tracks.length]);

  useEffect(() => {
    if (!selectedId) return;
    if (!activeTrack) {
      syncNowPlaying({
        playlistId: selectedId,
        title: "",
        artist: libraryHeader,
        isPlaying: false,
      });
      return;
    }
    syncNowPlaying({
      playlistId: selectedId,
      trackId: activeTrack.id,
      title: activeTrack.title,
      artist: libraryHeader,
      coverUrl: activeTrack.coverUrl,
      audioUrl: activeTrack.audioUrl,
      isPlaying,
    });
    castPlaylistToMonitor({
      playlistId: selectedId,
      trackId: activeTrack.id,
      title: activeTrack.title,
      artist: libraryHeader,
      coverUrl: activeTrack.coverUrl,
      audioUrl: activeTrack.audioUrl,
      targetMonitorId: "mon-a",
    });
  }, [selectedId, activeTrack, isPlaying, libraryHeader]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !selectedId || !activeTrack) return;
    const publishProgress = () => {
      if (!el.duration || !Number.isFinite(el.duration)) return;
      syncNowPlaying({
        playlistId: selectedId,
        trackId: activeTrack.id,
        title: activeTrack.title,
        artist: libraryHeader,
        coverUrl: activeTrack.coverUrl,
        audioUrl: activeTrack.audioUrl,
        isPlaying: !el.paused,
        progress: el.currentTime / el.duration,
      });
    };
    el.addEventListener("timeupdate", publishProgress);
    el.addEventListener("play", publishProgress);
    el.addEventListener("pause", publishProgress);
    return () => {
      el.removeEventListener("timeupdate", publishProgress);
      el.removeEventListener("play", publishProgress);
      el.removeEventListener("pause", publishProgress);
    };
  }, [selectedId, activeTrack, libraryHeader]);

  // ── Load real playlists ────────────────────────────────────────────────
  const loadPlaylists = useCallback(async () => {
    setLoadingPlaylists(true);
    try {
      const res = await fetch("/api/user/content", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json() as { playlists?: ApiPlaylistSummary[] };
        const list = data.playlists ?? [];
        setPlaylists(list);
        setSelectedId((prev) => prev ?? list[0]?.id ?? null);
      }
    } catch {
      /* honest fallback: empty playlist state */
    } finally {
      setLoadingPlaylists(false);
    }
  }, []);

  useEffect(() => {
    void loadPlaylists();
  }, [loadPlaylists]);

  // ── Load real tracks for the selected playlist ────────────────────────
  useEffect(() => {
    if (!selectedId) {
      setTracks([]);
      setCurrentTrackIndex(0);
      return;
    }
    let cancelled = false;
    setLoadingTracks(true);
    (async () => {
      try {
        const res = await fetch(`/api/user/playlists/${selectedId}/songs`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = await res.json() as { items?: { song: ApiSong }[] };
        setTracks((data.items ?? []).map((i) => i.song));
        setCurrentTrackIndex(0);
      } catch {
        if (!cancelled) setTracks([]);
      } finally {
        if (!cancelled) setLoadingTracks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const createPlaylist = async () => {
    const name = window.prompt("Playlist name?");
    if (!name?.trim()) return;
    setCreatingPlaylist(true);
    try {
      const res = await fetch("/api/user/content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const data = await res.json() as { playlist: { id: string } };
        await loadPlaylists();
        setSelectedId(data.playlist.id);
      }
    } finally {
      setCreatingPlaylist(false);
    }
  };

  const openShare = async () => {
    setShareStatus(null);
    setShareOpen(true);
    const opts = await fetchShareThreadOptions();
    setThreads(opts);
  };

  const sendShare = async (threadId: string) => {
    if (!selectedId || !activeTrack) {
      setShareStatus("Select a track first.");
      return;
    }
    const selectedPlaylist = playlists.find((p) => p.id === selectedId);
    const result = await sharePlaylistToThread({
      threadId,
      playlistId: selectedId,
      playlistTitle: selectedPlaylist?.name ?? "Playlist",
      trackId: activeTrack.id,
      trackTitle: activeTrack.title,
    });
    setShareStatus(result.ok ? "Shared to conversation." : result.error ?? "Share failed.");
    if (result.ok) setTimeout(() => setShareOpen(false), 900);
  };

  const castSelected = () => {
    if (!selectedId || !activeTrack) return;
    castPlaylistToMonitor({
      playlistId: selectedId,
      trackId: activeTrack.id,
      title: activeTrack.title,
      artist: libraryHeader,
      targetMonitorId: "mon-a",
    });
  };

  if (isCompact) {
    return (
      <div
        data-playlist-canister-compact
        style={{
          background: "rgba(5,3,16,0.88)",
          border: `1px solid ${accentColor}55`,
          borderRadius: 10,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          color: "#fff",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.12em", color: accentColor }}>
            {libraryHeader}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button type="button" onClick={() => void createPlaylist()} disabled={creatingPlaylist} style={actionBtn("#00FF88")}>
              {creatingPlaylist ? "…" : "+ PLAYLIST"}
            </button>
            <button type="button" onClick={() => sendPlaybackCommand("open-full")} style={actionBtn("#FFD700")}>
              EXPAND ⛶
            </button>
          </div>
        </div>
        {loadingPlaylists ? (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "8px 0" }}>Loading playlists…</div>
        ) : playlists.length === 0 ? (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "8px 0" }}>
            No playlists yet. Create one to start playback in the mini player above.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            {playlists.map((pl, i) => {
              const active = pl.id === selectedId;
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              return (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setSelectedId(pl.id)}
                  style={{
                    flexShrink: 0,
                    minWidth: 120,
                    padding: "8px 10px",
                    borderRadius: 8,
                    border: active ? `1px solid ${accent}` : "1px solid rgba(255,255,255,0.12)",
                    background: active ? `${accent}22` : "rgba(255,255,255,0.03)",
                    color: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontSize: 10, fontWeight: 900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {pl.name}
                  </div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {pl._count?.items ?? 0} tracks
                  </div>
                </button>
              );
            })}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 120, overflowY: "auto" }}>
          {loadingTracks ? (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Loading tracks…</div>
          ) : tracks.length === 0 ? (
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Select a playlist with tracks to play.</div>
          ) : (
            tracks.slice(0, 8).map((track, idx) => (
              <button
                key={track.id}
                type="button"
                onClick={() => {
                  setCurrentTrackIndex(idx);
                  setIsPlaying(true);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  padding: "5px 8px",
                  borderRadius: 6,
                  border:
                    idx === currentTrackIndex
                      ? `1px solid ${accentColor}88`
                      : "1px solid rgba(255,255,255,0.06)",
                  background: idx === currentTrackIndex ? `${accentColor}18` : "transparent",
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 9, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {track.title}
                </span>
                <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>
                  {idx === currentTrackIndex && isPlaying ? "▶" : ""}
                </span>
              </button>
            ))
          )}
        </div>
        {activeTrack?.audioUrl ? (
          <audio
            ref={audioRef}
            key={activeTrack.audioUrl}
            src={activeTrack.audioUrl}
            data-audio-owner="playlist-canister"
            controls={false}
            autoPlay={isPlaying}
            style={{ display: "none" }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(5,3,16,0.92)",
        border: `1.5px solid ${accentColor}`,
        borderRadius: 14,
        padding: 12,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        color: "#fff",
        fontFamily: "'Inter', sans-serif",
        boxShadow: `0 0 30px ${accentColor}33`,
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: `linear-gradient(135deg, ${accentColor}, #AA2DFF)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 16,
            }}
          >
            🎵
          </div>
          <div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>NOW PLAYING</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#fff" }}>
              {activeTrack ? (
                <>
                  {activeTrack.title}
                  <span style={{ color: "#00FFFF", fontSize: 11 }}> · {libraryHeader}</span>
                </>
              ) : (
                <span style={{ color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>No track selected</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={() => void openShare()} disabled={!activeTrack} style={actionBtn("#00FFFF")}>
            ↗ SHARE
          </button>
          <button type="button" onClick={castSelected} disabled={!activeTrack} style={actionBtn("#FFD700")}>
            📺 CAST TO MONITOR
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.4)", padding: "4px 8px", background: "rgba(255,255,255,0.05)", borderRadius: 6 }}>
            Library: <strong style={{ color: "#00FF88" }}>{libraryHeader}</strong>
            {isOwner && publicOwnerName ? (
              <>
                <span style={{ opacity: 0.35 }}>·</span>
                <span style={{ fontSize: 9 }}>Curator: {publicOwnerName}</span>
                <button
                  type="button"
                  disabled={savingDisplayName}
                  onClick={() => void editDisplayName()}
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    padding: "2px 6px",
                    borderRadius: 4,
                    border: "1px solid rgba(0,255,255,0.35)",
                    background: "transparent",
                    color: "#00FFFF",
                    cursor: savingDisplayName ? "wait" : "pointer",
                  }}
                >
                  {savingDisplayName ? "…" : "EDIT NAME"}
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* 3-Column Main Content Deck — stacks to single column on mobile */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "320px minmax(0, 1fr) 300px",
          gap: 12,
          minHeight: isMobile ? undefined : 440,
        }}
      >
        {/* LEFT COLUMN: Glowing Neon Vinyl Turntable & Transport */}
        <div
          style={{
            background: "rgba(10,5,25,0.7)",
            border: `1px solid ${accentColor}4d`,
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ position: "relative", width: 220, height: 220, marginTop: 10 }}>
            <div
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background: `conic-gradient(from 0deg, ${accentColor}, #AA2DFF, #00FFFF, #FFD700, ${accentColor})`,
                filter: "blur(6px)",
                opacity: isPlaying ? 0.8 : 0.2,
                animation: isPlaying ? "spin 12s linear infinite" : "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                background: "radial-gradient(circle, #1a052e 30%, #000 70%)",
                border: `2px solid ${accentColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: `0 0 25px ${accentColor}80`,
              }}
            >
              <div
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${accentColor}, #AA2DFF)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  padding: 8,
                }}
              >
                {activeTrack ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", textShadow: "0 0 10px #000", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>
                      {activeTrack.title}
                    </div>
                    <div style={{ fontSize: 10, color: "#00FFFF", fontWeight: 800, marginTop: 2 }}>{libraryHeader}</div>
                  </>
                ) : (
                  <span style={{ fontSize: 24, opacity: 0.5 }}>🎵</span>
                )}
              </div>
            </div>
          </div>

          <div style={{ width: "100%", textAlign: "center", marginTop: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff" }}>{activeTrack?.title ?? "—"}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{libraryHeader}</div>

            <div style={{ display: "flex", gap: 3, height: 24, alignItems: "center", justifyContent: "center", margin: "12px 0 6px" }}>
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 3,
                    height: isPlaying ? `${Math.sin(i + Date.now() / 200) * 10 + 14}px` : "6px",
                    background: i % 2 === 0 ? "#00FFFF" : accentColor,
                    borderRadius: 2,
                    transition: "height 0.1s ease",
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              {activeTrack ? formatDuration(null) : "—:— / —:—"}
            </div>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 10 }}>
            <button
              type="button"
              disabled={tracks.length === 0}
              onClick={() => setCurrentTrackIndex((prev) => Math.max(0, prev - 1))}
              style={transportBtn()}
            >
              ⏮
            </button>
            <button
              type="button"
              disabled={!activeTrack}
              onClick={() => setIsPlaying((p) => !p)}
              style={transportMainBtn()}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button
              type="button"
              disabled={tracks.length === 0}
              onClick={() => setCurrentTrackIndex((prev) => Math.min(tracks.length - 1, prev + 1))}
              style={transportBtn()}
            >
              ⏭
            </button>
          </div>
          {activeTrack?.audioUrl ? (
            <audio
              ref={audioRef}
              key={activeTrack.audioUrl}
              src={activeTrack.audioUrl}
              data-audio-owner="playlist-canister"
              controls={false}
              autoPlay={isPlaying}
              style={{ display: "none" }}
            />
          ) : null}
        </div>

        {/* CENTER COLUMN: Playlist Library Cards Grid */}
        <div
          style={{
            background: "rgba(10,5,25,0.5)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            padding: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.14em", color: accentColor }}>
              PLAYLIST LIBRARY
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={() => void createPlaylist()} disabled={creatingPlaylist} style={actionBtn("#00FF88")}>
                {creatingPlaylist ? "…" : "+ ADD PLAYLIST"}
              </button>
              <button type="button" onClick={() => void openShare()} disabled={!activeTrack} style={actionBtn("#00FFFF")}>
                ↗ SHARE
              </button>
            </div>
          </div>

          {loadingPlaylists ? (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.35)", fontSize: 11 }}>
              Loading playlists…
            </div>
          ) : playlists.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "rgba(255,255,255,0.35)", fontSize: 11, textAlign: "center", padding: 24 }}>
              <span style={{ fontSize: 24 }}>🎵</span>
              No playlists yet. Create your first playlist.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 8,
                flex: 1,
                overflowY: "auto",
                paddingRight: 4,
              }}
            >
              {playlists.map((card, idx) => {
                const active = card.id === selectedId;
                const accent = CARD_ACCENTS[idx % CARD_ACCENTS.length];
                const count = card._count?.items ?? 0;
                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedId(card.id)}
                    style={{
                      background: active ? `${accent}1f` : "rgba(255,255,255,0.03)",
                      border: active ? `1.5px solid ${accent}` : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      padding: 10,
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 6,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 8,
                          background: `linear-gradient(135deg, ${accent}, #000)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 18,
                          flexShrink: 0,
                          overflow: "hidden",
                        }}
                      >
                        {card.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={card.coverUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          "📻"
                        )}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {card.name}
                        </div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                          {count} {count === 1 ? "track" : "tracks"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Now Playing Tracklist + Equalizer */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              flex: 1,
              background: "rgba(10,5,25,0.6)",
              border: "1px solid rgba(170,45,255,0.3)",
              borderRadius: 12,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
              maxHeight: 240,
              overflowY: "auto",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 900, color: "#AA2DFF", letterSpacing: "0.12em" }}>
              {activeTrack ? `NOW PLAYING: ${activeTrack.title}` : "TRACKLIST"}
            </div>
            {loadingTracks ? (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "12px 4px", textAlign: "center" }}>
                Loading tracks…
              </div>
            ) : tracks.length === 0 ? (
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", padding: "12px 4px", textAlign: "center" }}>
                {selectedId ? "No tracks in this playlist yet." : "Select a playlist to see its tracks."}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {tracks.map((t, idx) => {
                  const active = idx === currentTrackIndex;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                setCurrentTrackIndex(idx);
                setIsPlaying(true);
              }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "4px 6px",
                        borderRadius: 6,
                        background: active ? "rgba(0,255,255,0.15)" : "transparent",
                        border: active ? "1px solid #00FFFF" : "1px solid transparent",
                        color: active ? "#00FFFF" : "rgba(255,255,255,0.7)",
                        fontSize: 10,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontWeight: active ? 900 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {idx + 1}. {t.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* EQUALIZER */}
          <div
            style={{
              background: "rgba(10,5,25,0.8)",
              border: "1px solid rgba(255,215,0,0.35)",
              borderRadius: 12,
              padding: 10,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em" }}>
                EQUALIZER
              </div>
              <button type="button" onClick={() => setEqGains(new Array(9).fill(50))} style={eqModeBtn("#00FFFF")}>
                RESET
              </button>
            </div>

            <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 90, justifyContent: "space-between", padding: "0 4px" }}>
              {["60", "170", "310", "600", "1K", "3K", "6K", "12K", "14K"].map((freq, i) => {
                const val = eqGains[i] ?? 50;
                return (
                  <div key={freq} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = Math.round(100 - ((e.clientY - rect.top) / rect.height) * 100);
                        setEqGains((prev) => prev.map((g, gi) => (gi === i ? Math.max(0, Math.min(100, pct)) : g)));
                      }}
                      style={{ height: 70, width: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, position: "relative", cursor: "pointer" }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          width: "100%",
                          height: `${val}%`,
                          background: "linear-gradient(0deg, #FF5500, #FFD700)",
                          borderRadius: 3,
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", fontWeight: 800 }}>{freq}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal Overlay */}
      {shareOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShareOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 360,
              background: "#080518",
              border: "1px solid #00FFFF",
              borderRadius: 14,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, color: "#00FFFF", letterSpacing: "0.1em", marginBottom: 6 }}>
              SHARE PLAYLIST & TRACK
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 12 }}>
              Sends playlist payload into an active conversation thread.
            </div>
            {threads.length === 0 ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>
                No active conversations. Open Messages drawer to start a chat.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {threads.map((t) => (
                  <button
                    key={t.threadId}
                    type="button"
                    onClick={() => void sendShare(t.threadId)}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "rgba(0,255,255,0.08)",
                      border: "1px solid #00FFFF",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
            {shareStatus ? (
              <div style={{ fontSize: 10, color: shareStatus.includes("Shared") ? "#00FF88" : "#FF0055", marginBottom: 10 }}>
                {shareStatus}
              </div>
            ) : null}
            <button type="button" onClick={() => setShareOpen(false)} style={actionBtn("rgba(255,255,255,0.4)")}>
              CLOSE
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function actionBtn(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: "0.08em",
    border: `1px solid ${color}66`,
    borderRadius: 6,
    padding: "5px 12px",
    background: `${color}18`,
    color,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function transportBtn(): CSSProperties {
  return {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}

function transportMainBtn(): CSSProperties {
  return {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #FF5500, #AA2DFF)",
    border: "2px solid #00FFFF",
    color: "#fff",
    fontSize: 18,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 15px rgba(0,255,255,0.5)",
  };
}

function eqModeBtn(color: string): CSSProperties {
  return {
    fontSize: 7,
    fontWeight: 900,
    padding: "2px 6px",
    borderRadius: 4,
    border: `1px solid ${color}44`,
    background: `${color}15`,
    color,
    cursor: "pointer",
  };
}
