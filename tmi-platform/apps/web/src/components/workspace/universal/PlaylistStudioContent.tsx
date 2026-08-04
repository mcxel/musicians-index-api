/**
 * Media Player Studio Phase 1 — mounts MediaPlayerChassis + PlaylistArtifact.
 * Visualizer | Library | Queue+EQ with Artwork | Video | Visualizer mode toggle.
 * DualLayerCrossfade on artwork; TrackFlipTransition on now-playing / queue switch.
 */

"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { personalPlaylistEngine } from "@/lib/studio/PersonalPlaylistEngine";
import { getAllPlaylists, getAllTracks, getTrack } from "@/lib/playlists/PlaylistEngine";
import type { WorkspaceContext } from "@/lib/workspace/universal/types";
import {
  FREE_DEFAULT_CHASSIS_ID,
  MEDIA_PLAYER_CHASSIS_REGISTRY,
} from "@/lib/artifacts/PlaylistArtifactEngine";
import {
  ensureDefaultMediaPlayer,
  getEquippedChassisId,
} from "@/lib/artifacts/MediaPlayerInventory";
import DualLayerCrossfade from "@/components/media/DualLayerCrossfade";
import TrackFlipTransition from "@/components/media/TrackFlipTransition";

export interface PlaylistStudioContentProps {
  context: WorkspaceContext;
  userId?: string;
}

type PlayerScreenMode = "artwork" | "video" | "visualizer";

function formatDuration(sec: number): string {
  if (!Number.isFinite(sec) || sec <= 0) return "—:—";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function PlaylistStudioContent({
  context,
  userId = "local-user",
}: PlaylistStudioContentProps) {
  const [tick, setTick] = useState(0);
  const [eq, setEq] = useState({ low: 50, mid: 50, high: 50 });
  const [selectedId, setSelectedId] = useState<string | null>(context.trackId ?? null);
  const [screenMode, setScreenMode] = useState<PlayerScreenMode>("artwork");
  const [chassisId, setChassisId] = useState(FREE_DEFAULT_CHASSIS_ID);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    ensureDefaultMediaPlayer(userId);
    setChassisId(getEquippedChassisId(userId));
  }, [userId]);

  const chassis = MEDIA_PLAYER_CHASSIS_REGISTRY[chassisId] ?? MEDIA_PLAYER_CHASSIS_REGISTRY.standard;

  const personal = useMemo(() => {
    void context.playlistId;
    void context.trackId;
    return personalPlaylistEngine.listSongs(userId);
  }, [userId, context.playlistId, context.trackId]);

  const catalogTracks = useMemo(() => getAllTracks().filter((t) => t.isActive), []);
  const playlists = useMemo(() => getAllPlaylists(), []);

  const libraryRows = useMemo(() => {
    if (personal.length > 0) {
      return personal.map((s) => ({
        id: s.songId,
        title: s.title,
        artist: s.artistName,
        duration: formatDuration(s.duration),
        artworkUrl: (s as { artworkUrl?: string; coverUrl?: string }).artworkUrl
          ?? (s as { coverUrl?: string }).coverUrl,
        videoUrl: (s as { videoUrl?: string }).videoUrl,
        source: "library" as const,
      }));
    }
    if (catalogTracks.length > 0) {
      return catalogTracks.slice(0, 40).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artistName,
        duration: "—:—",
        artworkUrl: (t as { coverArtUrl?: string; artworkUrl?: string }).coverArtUrl
          ?? (t as { artworkUrl?: string }).artworkUrl,
        videoUrl: (t as { videoUrl?: string }).videoUrl,
        source: "catalog" as const,
      }));
    }
    return [];
  }, [personal, catalogTracks]);

  const queueRows = useMemo(() => {
    const pl = playlists[0];
    if (!pl?.entries?.length) return libraryRows.slice(0, 8);
    return pl.entries.slice(0, 12).map((e) => {
      const t = getTrack(e.trackId);
      return {
        id: e.trackId,
        title: t?.title ?? e.trackId,
        artist: t?.artistName ?? "—",
        duration: "—:—",
      };
    });
  }, [playlists, libraryRows]);

  const active =
    libraryRows.find((r) => r.id === selectedId) ??
    (context.trackTitle
      ? {
          id: context.trackId ?? "context",
          title: context.trackTitle,
          artist: context.artistName ?? "—",
          duration: "—:—",
          artworkUrl: context.artworkUrl,
          videoUrl: context.videoUrl,
        }
      : null);

  const artworkSrc = active?.artworkUrl ?? null;
  const videoSrc = active?.videoUrl ?? null;

  const col: CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    background: "rgba(0,0,0,0.28)",
    overflow: "hidden",
  };

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
            Chassis: {chassis.icon} {chassis.label}
            <span style={{ margin: "0 6px", opacity: 0.35 }}>·</span>
            Playlist Artifact package (separate from YoPho / album cover)
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {(
            [
              { id: "artwork" as const, label: "ARTWORK" },
              { id: "video" as const, label: "VIDEO" },
              { id: "visualizer" as const, label: "VISUALIZER" },
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
                  padding: "5px 8px",
                  borderRadius: 6,
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
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(160px, 1fr) minmax(220px, 1.2fr) minmax(200px, 1fr)",
          gap: 10,
          flex: 1,
          minHeight: 0,
          padding: 10,
        }}
      >
        {/* Player screen */}
        <section style={col}>
          <header style={sectionHeader}>
            PLAYER SCREEN
            <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
              {screenMode === "visualizer"
                ? "Preview only — no audio analyser yet"
                : screenMode === "video"
                  ? "Video slot"
                  : "Artwork dual-layer crossfade"}
            </span>
          </header>
          <div
            style={{
              flex: 1,
              minHeight: 120,
              position: "relative",
              background:
                "radial-gradient(ellipse at bottom, rgba(170,45,255,0.25), transparent 70%)",
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
                  No video URL for this track. Add a video source or switch to Artwork / Visualizer.
                </div>
              )
            ) : null}

            {screenMode === "visualizer" ? (
              <div
                style={{
                  flex: 1,
                  height: "100%",
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  gap: 3,
                  padding: 16,
                }}
                aria-label="CSS visualizer stub — real FFT not connected"
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
          <div style={{ padding: "8px 12px", fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
            <TrackFlipTransition
              transitionKey={active?.id ?? "none"}
              neonSweep
              accent={chassis.accent}
            >
              {active ? (
                <>
                  <div style={{ fontWeight: 800, color: "#fff" }}>{active.title}</div>
                  <div>{active.artist}</div>
                </>
              ) : (
                <div>No track selected</div>
              )}
            </TrackFlipTransition>
          </div>
        </section>

        {/* Library — Playlist Artifact tracks */}
        <section style={col}>
          <header style={sectionHeader}>PLAYLIST ARTIFACT · LIBRARY</header>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {libraryRows.length === 0 ? (
              <div style={emptyBox}>
                No songs in your playlist artifact yet. Upload or add tracks to your library.
              </div>
            ) : (
              libraryRows.map((row) => {
                const activeRow = row.id === selectedId;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelectedId(row.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 8,
                      padding: "8px 10px",
                      marginBottom: 4,
                      borderRadius: 8,
                      border: activeRow
                        ? `1px solid ${chassis.accent}b3`
                        : "1px solid rgba(255,255,255,0.08)",
                      background: activeRow
                        ? `${chassis.accent}33`
                        : "rgba(255,255,255,0.03)",
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.title}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{row.artist}</div>
                    </span>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", flexShrink: 0 }}>
                      {row.duration}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Queue + EQ */}
        <section style={col}>
          <header style={sectionHeader}>QUEUE + EQ</header>
          <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
            {queueRows.length === 0 ? (
              <div style={emptyBox}>Queue empty — select tracks from Library.</div>
            ) : (
              <TrackFlipTransition
                transitionKey={selectedId ?? queueRows[0]?.id ?? "queue"}
                mode="slide"
                neonSweep
                accent={chassis.accent}
              >
                {queueRows.map((row, idx) => (
                  <div
                    key={`${row.id}-${idx}`}
                    style={{
                      padding: "7px 10px",
                      marginBottom: 4,
                      borderRadius: 8,
                      background:
                        row.id === selectedId
                          ? `${chassis.accent}22`
                          : "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      fontSize: 11,
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{row.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>{row.artist}</div>
                  </div>
                ))}
              </TrackFlipTransition>
            )}
          </div>
          <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div
              style={{
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.45)",
                marginBottom: 8,
              }}
            >
              EQ (UI only — not wired to audio output)
            </div>
            {(["low", "mid", "high"] as const).map((band) => (
              <label
                key={band}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                  fontSize: 10,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                <span style={{ width: 36 }}>{band}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={eq[band]}
                  onChange={(e) =>
                    setEq((prev) => ({ ...prev, [band]: Number(e.target.value) }))
                  }
                  style={{ flex: 1 }}
                />
              </label>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
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
