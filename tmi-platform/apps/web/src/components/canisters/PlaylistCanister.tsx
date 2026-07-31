"use client";

/**
 * PlaylistCanister — Rule 15 canonical canister.
 * Command Center drawer surface: real playlists from /api/user/content,
 * share-by-playlistId into messaging, cast-to-monitor onto dual stack.
 * Honest empty states (Rule 20). No fake listener counts.
 */

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { castPlaylistToMonitor } from "@/lib/playlists/PlaylistMonitorCast";
import {
  fetchShareThreadOptions,
  sharePlaylistToThread,
  type MessageThreadOption,
} from "@/lib/playlists/sharePlaylistToThread";
import type { ArtifactTrack } from "@/lib/artifacts/artifactEngine";

const PlaylistArtifact = dynamic(
  () => import("@/components/artifacts/PlaylistArtifact"),
  { ssr: false, loading: () => <PlaceholderShell label="Loading playlist…" accentColor="#AA2DFF" /> },
);

function PlaceholderShell({ label, accentColor }: { label: string; accentColor: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: `1px solid ${accentColor}22`,
        borderRadius: 14,
        padding: "24px",
        textAlign: "center",
        color: "rgba(255,255,255,0.3)",
        fontSize: 12,
      }}
    >
      {label}
    </div>
  );
}

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
  artistName?: string | null;
  audioUrl?: string | null;
  coverUrl?: string | null;
  duration?: number | null;
}

interface PlaylistCanisterProps {
  entityId: string;
  entityName?: string;
  accentColor?: string;
  isOwner?: boolean;
  /** fan | performer — controls add-track destination (Rule 26). */
  role?: "fan" | "performer";
  /** Deep-link: open this playlistId when drawer mounts. */
  initialPlaylistId?: string | null;
}

function fmtDuration(sec?: number | null): string {
  if (sec == null || !Number.isFinite(sec) || sec <= 0) return "—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function songToArtifactTrack(song: ApiSong): ArtifactTrack {
  return {
    id: song.id,
    title: song.title,
    artist: song.artistName?.trim() || "Unknown artist",
    duration: fmtDuration(song.duration),
    sourceUrl: song.audioUrl?.trim() || "#",
    source: song.audioUrl?.trim() ? "tmi" : "tmi",
  };
}

export function PlaylistCanister({
  entityId,
  entityName,
  accentColor = "#AA2DFF",
  isOwner = false,
  role = "fan",
  initialPlaylistId = null,
}: PlaylistCanisterProps) {
  const [playlists, setPlaylists] = useState<ApiPlaylistSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialPlaylistId);
  const [tracks, setTracks] = useState<ArtifactTrack[]>([]);
  const [selectedMeta, setSelectedMeta] = useState<ApiPlaylistSummary | null>(null);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareTrackId, setShareTrackId] = useState<string | null>(null);
  const [threads, setThreads] = useState<MessageThreadOption[]>([]);
  const [shareStatus, setShareStatus] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const addHref = role === "performer" ? "/hub/performer?tab=uploads" : "/hub/fan";

  const loadPlaylists = useCallback(async () => {
    setLoadingList(true);
    setListError(null);
    try {
      const res = await fetch("/api/user/content", { credentials: "include", cache: "no-store" });
      if (res.status === 401) {
        setPlaylists([]);
        setListError("Sign in to load your playlists.");
        return;
      }
      if (!res.ok) {
        setPlaylists([]);
        setListError("Unable to load playlists.");
        return;
      }
      const data = (await res.json()) as { playlists?: ApiPlaylistSummary[] };
      const list = Array.isArray(data.playlists) ? data.playlists : [];
      setPlaylists(list);
      if (initialPlaylistId && list.some((p) => p.id === initialPlaylistId)) {
        setSelectedId(initialPlaylistId);
      } else if (!selectedId && list.length === 1) {
        setSelectedId(list[0]!.id);
      }
    } catch {
      setPlaylists([]);
      setListError("Unable to load playlists.");
    } finally {
      setLoadingList(false);
    }
  }, [initialPlaylistId, selectedId]);

  useEffect(() => {
    void loadPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount + entity change
  }, [entityId]);

  useEffect(() => {
    if (!selectedId) {
      setTracks([]);
      setSelectedMeta(null);
      return;
    }
    let cancelled = false;
    setLoadingTracks(true);
    void (async () => {
      try {
        const res = await fetch(`/api/playlists/${selectedId}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (!cancelled) {
            setTracks([]);
            setSelectedMeta(playlists.find((p) => p.id === selectedId) ?? null);
          }
          return;
        }
        const data = (await res.json()) as {
          playlist?: ApiPlaylistSummary & {
            items?: Array<{ song?: ApiSong | null; songId?: string }>;
          };
        };
        if (cancelled) return;
        const pl = data.playlist;
        setSelectedMeta(pl ?? playlists.find((p) => p.id === selectedId) ?? null);
        const songs = (pl?.items ?? [])
          .map((item) => item.song)
          .filter((s): s is ApiSong => Boolean(s?.id && s.title));
        setTracks(songs.map(songToArtifactTrack));
      } catch {
        if (!cancelled) {
          setTracks([]);
          setSelectedMeta(playlists.find((p) => p.id === selectedId) ?? null);
        }
      } finally {
        if (!cancelled) setLoadingTracks(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, playlists]);

  const openShare = async (trackId?: string) => {
    if (!selectedId || !selectedMeta) return;
    setShareTrackId(trackId ?? null);
    setShareStatus(null);
    setShareOpen(true);
    const opts = await fetchShareThreadOptions();
    setThreads(opts);
  };

  const sendShare = async (threadId: string) => {
    if (!selectedId || !selectedMeta) return;
    const track = shareTrackId ? tracks.find((t) => t.id === shareTrackId) : undefined;
    const result = await sharePlaylistToThread({
      threadId,
      playlistId: selectedId,
      playlistTitle: selectedMeta.name,
      trackId: shareTrackId ?? undefined,
      trackTitle: track?.title,
    });
    setShareStatus(result.ok ? "Shared to conversation." : result.error ?? "Share failed.");
    if (result.ok) {
      setTimeout(() => setShareOpen(false), 900);
    }
  };

  const castSelected = (track?: ArtifactTrack) => {
    if (!selectedId || !selectedMeta) return;
    const t = track ?? tracks[0];
    castPlaylistToMonitor({
      playlistId: selectedId,
      trackId: t?.id,
      title: t?.title ?? selectedMeta.name,
      artist: t?.artist ?? entityName,
      coverUrl: selectedMeta.coverUrl,
      audioUrl: t?.sourceUrl !== "#" ? t?.sourceUrl : null,
      targetMonitorId: "mon-a",
    });
  };

  const createPlaylist = async () => {
    const name = newName.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const res = await fetch("/api/user/content", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        setListError("Could not create playlist.");
        return;
      }
      const data = (await res.json()) as { playlist?: ApiPlaylistSummary };
      setNewName("");
      await loadPlaylists();
      if (data.playlist?.id) setSelectedId(data.playlist.id);
    } catch {
      setListError("Could not create playlist.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.015)",
        border: `1px solid ${accentColor}22`,
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px 18px",
          borderBottom: `1px solid ${accentColor}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 9, letterSpacing: "0.3em", color: accentColor, fontWeight: 800 }}>
          🎵 PLAYLIST {entityName ? `— ${entityName.toUpperCase()}` : ""}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {isOwner && (
            <Link
              href={addHref}
              style={{
                fontSize: 9,
                color: accentColor,
                fontWeight: 700,
                textDecoration: "none",
                letterSpacing: "0.08em",
                border: `1px solid ${accentColor}44`,
                borderRadius: 6,
                padding: "3px 10px",
              }}
            >
              + ADD TRACK
            </Link>
          )}
          {selectedId && selectedMeta ? (
            <>
              <button type="button" onClick={() => void openShare()} style={actionBtn("#00FFFF")}>
                ↗ SHARE
              </button>
              <button type="button" onClick={() => castSelected()} style={actionBtn("#FFD700")}>
                📺 CAST
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12 }}>
        {loadingList ? (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: 16 }}>
            Loading playlists…
          </div>
        ) : null}

        {listError ? (
          <div style={{ fontSize: 11, color: "rgba(252,165,165,0.9)", textAlign: "center" }}>{listError}</div>
        ) : null}

        {!loadingList && !listError && playlists.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px 12px" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10, lineHeight: 1.5 }}>
              No playlists yet. Create one to start collecting tracks.
            </div>
            {isOwner ? (
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Playlist name"
                  style={{
                    flex: 1,
                    maxWidth: 220,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    padding: "8px 10px",
                    color: "#fff",
                    fontSize: 12,
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  disabled={!newName.trim() || creating}
                  onClick={() => void createPlaylist()}
                  style={{
                    ...actionBtn(accentColor),
                    opacity: newName.trim() && !creating ? 1 : 0.4,
                    cursor: newName.trim() && !creating ? "pointer" : "default",
                  }}
                >
                  {creating ? "…" : "CREATE"}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {playlists.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)" }}>
              YOUR PLAYLISTS
            </div>
            {playlists.map((p) => {
              const active = p.id === selectedId;
              const count = p._count?.items ?? 0;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    background: active ? `${accentColor}18` : "rgba(255,255,255,0.03)",
                    border: active ? `1px solid ${accentColor}66` : "1px solid rgba(255,255,255,0.08)",
                    color: "#fff",
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 800 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {count === 0 ? "No tracks yet" : `${count} track${count === 1 ? "" : "s"}`}
                  </div>
                </button>
              );
            })}
            {isOwner ? (
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="New playlist name"
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8,
                    padding: "7px 10px",
                    color: "#fff",
                    fontSize: 11,
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  disabled={!newName.trim() || creating}
                  onClick={() => void createPlaylist()}
                  style={{
                    ...actionBtn(accentColor),
                    opacity: newName.trim() && !creating ? 1 : 0.4,
                  }}
                >
                  + NEW
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        {selectedId ? (
          <div style={{ borderTop: `1px solid ${accentColor}14`, paddingTop: 12 }}>
            {loadingTracks ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textAlign: "center", padding: 12 }}>
                Loading tracks…
              </div>
            ) : null}

            {!loadingTracks && tracks.length === 0 ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "16px 8px", lineHeight: 1.5 }}>
                No tracks yet. Add songs from your library to this playlist.
              </div>
            ) : null}

            {!loadingTracks && tracks.length > 0 ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12, maxHeight: 180, overflowY: "auto" }}>
                  {tracks.map((t, i) => (
                    <div
                      key={t.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        padding: "7px 8px",
                        borderRadius: 8,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", width: 16 }}>{i + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {t.title}
                        </div>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{t.artist}</div>
                      </div>
                      <button type="button" onClick={() => castSelected(t)} title="Cast to monitor" style={miniBtn("#FFD700")}>
                        📺
                      </button>
                      <button type="button" onClick={() => void openShare(t.id)} title="Share track" style={miniBtn("#00FFFF")}>
                        ↗
                      </button>
                    </div>
                  ))}
                </div>
                <PlaylistArtifact
                  key={selectedId}
                  artifactId={selectedId}
                  title={selectedMeta?.name ?? "Playlist"}
                  initialTracks={tracks}
                  listeners={0}
                />
              </>
            ) : null}
          </div>
        ) : null}
      </div>

      {shareOpen ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.8)",
            zIndex: 400,
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
              maxWidth: 340,
              background: "#080818",
              border: `1px solid ${accentColor}44`,
              borderRadius: 14,
              padding: 18,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 900, color: accentColor, letterSpacing: "0.1em", marginBottom: 4 }}>
              SHARE {shareTrackId ? "TRACK" : "PLAYLIST"}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 12 }}>
              Sends {"{ type: 'playlist', playlistId }"} into a real conversation — not the whole player UI.
            </div>
            {threads.length === 0 ? (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, marginBottom: 12 }}>
                No conversations yet. Open Messages and start a thread, then share again.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12, maxHeight: 220, overflowY: "auto" }}>
                {threads.map((t) => (
                  <button
                    key={t.threadId}
                    type="button"
                    onClick={() => void sendShare(t.threadId)}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(0,255,255,0.22)",
                      color: "#e2e8f0",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
            {shareStatus ? (
              <div style={{ fontSize: 11, color: shareStatus.includes("Shared") ? "#22c55e" : "#fca5a5", marginBottom: 8 }}>
                {shareStatus}
              </div>
            ) : null}
            <div style={{ display: "flex", gap: 8 }}>
              <Link
                href={role === "performer" ? "/hub/performer" : "/hub/fan"}
                onClick={() => setShareOpen(false)}
                style={{ ...actionBtn("#AA2DFF"), textDecoration: "none" }}
              >
                OPEN MESSAGES DRAWER
              </Link>
              <button type="button" onClick={() => setShareOpen(false)} style={actionBtn("rgba(255,255,255,0.45)")}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function actionBtn(color: string): CSSProperties {
  return {
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: "0.08em",
    border: `1px solid ${color}55`,
    borderRadius: 6,
    padding: "4px 10px",
    background: `${color}18`,
    color,
    cursor: "pointer",
    fontFamily: "inherit",
  };
}

function miniBtn(color: string): CSSProperties {
  return {
    background: `${color}14`,
    border: `1px solid ${color}44`,
    borderRadius: 6,
    color,
    fontSize: 12,
    padding: "2px 6px",
    cursor: "pointer",
    flexShrink: 0,
  };
}

export default PlaylistCanister;
