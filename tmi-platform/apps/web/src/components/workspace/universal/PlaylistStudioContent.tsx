/**
 * Playlist Studio Phase 1 — Visualizer | Library | Queue+EQ
 * Wires PersonalPlaylistEngine + PlaylistEngine when data exists; honest empty otherwise.
 * FFT visualizer is a CSS stub (no Web Audio analyser yet) — labeled honestly.
 */

"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { personalPlaylistEngine } from "@/lib/studio/PersonalPlaylistEngine";
import { getAllPlaylists, getAllTracks, getTrack } from "@/lib/playlists/PlaylistEngine";
import type { WorkspaceContext } from "@/lib/workspace/universal/types";

export interface PlaylistStudioContentProps {
  context: WorkspaceContext;
  userId?: string;
}

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

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 140);
    return () => window.clearInterval(id);
  }, []);

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
        source: "library" as const,
      }));
    }
    if (catalogTracks.length > 0) {
      return catalogTracks.slice(0, 40).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artistName,
        duration: "—:—",
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
        }
      : null);

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
        display: "grid",
        gridTemplateColumns: "minmax(160px, 1fr) minmax(220px, 1.2fr) minmax(200px, 1fr)",
        gap: 10,
        height: "100%",
        minHeight: 0,
        padding: 10,
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
      }}
    >
      {/* Visualizer */}
      <section style={col}>
        <header style={sectionHeader}>
          VISUALIZER
          <span style={{ fontWeight: 600, color: "rgba(255,255,255,0.4)", fontSize: 9 }}>
            Preview only — no audio analyser yet
          </span>
        </header>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: 3,
            padding: 16,
            background:
              "radial-gradient(ellipse at bottom, rgba(170,45,255,0.25), transparent 70%)",
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
                  background: "linear-gradient(180deg, #00FFFF, #AA2DFF)",
                  boxShadow: "0 0 8px rgba(170,45,255,0.45)",
                }}
              />
            );
          })}
        </div>
        <div style={{ padding: "8px 12px", fontSize: 11, color: "rgba(255,255,255,0.65)" }}>
          {active ? (
            <>
              <div style={{ fontWeight: 800, color: "#fff" }}>{active.title}</div>
              <div>{active.artist}</div>
            </>
          ) : (
            <div>No track selected</div>
          )}
        </div>
      </section>

      {/* Library */}
      <section style={col}>
        <header style={sectionHeader}>LIBRARY</header>
        <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
          {libraryRows.length === 0 ? (
            <div style={emptyBox}>
              No songs in your playlist yet. Upload or add tracks to your library.
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
                      ? "1px solid rgba(170,45,255,0.7)"
                      : "1px solid rgba(255,255,255,0.08)",
                    background: activeRow
                      ? "rgba(170,45,255,0.2)"
                      : "rgba(255,255,255,0.03)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
            queueRows.map((row, idx) => (
              <div
                key={`${row.id}-${idx}`}
                style={{
                  padding: "7px 10px",
                  marginBottom: 4,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: 11,
                }}
              >
                <div style={{ fontWeight: 700 }}>{row.title}</div>
                <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>{row.artist}</div>
              </div>
            ))
          )}
        </div>
        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.1em", color: "rgba(255,255,255,0.45)", marginBottom: 8 }}>
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
