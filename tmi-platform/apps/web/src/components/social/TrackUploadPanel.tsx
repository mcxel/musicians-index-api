"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type TrackType = "upload" | "link";

export interface TrackEntry {
  id: string;
  title: string;
  artist: string;
  url: string;
  type: TrackType;
  genre?: string;
  addedAt: number;
}

interface TrackUploadPanelProps {
  playlistName?: string;
  accentColor?: string;
  onAdd?: (track: TrackEntry) => void;
  initialTracks?: TrackEntry[];
}

export default function TrackUploadPanel({
  playlistName = "My Playlist",
  accentColor = "#AA2DFF",
  onAdd,
  initialTracks = [],
}: TrackUploadPanelProps) {
  const [tracks, setTracks] = useState<TrackEntry[]>(initialTracks);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<TrackType>("link");
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [genre, setGenre] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    setError("");
    if (!title.trim()) { setError("Track title required"); return; }
    if (!artist.trim()) { setError("Artist name required"); return; }
    if (mode === "link" && !url.trim()) { setError("URL required"); return; }

    const entry: TrackEntry = {
      id: `track-${Date.now()}`,
      title: title.trim(),
      artist: artist.trim(),
      url: url.trim() || "#",
      type: mode,
      genre: genre.trim() || undefined,
      addedAt: Date.now(),
    };

    const next = [entry, ...tracks];
    setTracks(next);
    onAdd?.(entry);
    setTitle(""); setArtist(""); setUrl(""); setGenre("");
    setOpen(false);
  };

  return (
    <div style={{
      border: `1px solid ${accentColor}33`,
      borderRadius: 12,
      background: "rgba(10,5,20,0.8)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 14px",
        borderBottom: tracks.length > 0 || open ? `1px solid ${accentColor}22` : "none",
        background: "rgba(255,255,255,0.03)",
      }}>
        <span style={{ fontSize: 14 }}>🎵</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: "#e2e8f0", flex: 1 }}>{playlistName}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{tracks.length} tracks</span>
        <button
          onClick={() => setOpen(!open)}
          style={{
            padding: "5px 12px", borderRadius: 7, fontSize: 10, fontWeight: 800,
            background: `${accentColor}22`, border: `1px solid ${accentColor}44`,
            color: accentColor, cursor: "pointer", letterSpacing: "0.08em",
          }}
        >
          + ADD TRACK
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div style={{ padding: 14 }}>
              {/* Mode toggle */}
              <div style={{ display: "flex", gap: 0, marginBottom: 12, borderRadius: 7, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", width: "fit-content" }}>
                {(["link", "upload"] as TrackType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    style={{
                      padding: "6px 16px", fontSize: 10, fontWeight: 800, letterSpacing: "0.1em",
                      textTransform: "uppercase", cursor: "pointer", border: "none",
                      background: mode === m ? `${accentColor}22` : "transparent",
                      color: mode === m ? accentColor : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {m === "link" ? "🔗 Link" : "⬆ Upload"}
                  </button>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Track title"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 10px", color: "#fff", fontSize: 12, outline: "none" }}
                />
                <input
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Artist name"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 10px", color: "#fff", fontSize: 12, outline: "none" }}
                />
              </div>

              {mode === "link" ? (
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste song URL (Spotify, SoundCloud, YouTube…)"
                  style={{ width: "100%", marginBottom: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 10px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }}
                />
              ) : (
                <label style={{ display: "block", marginBottom: 8, cursor: "pointer" }}>
                  <div style={{ border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 7, padding: "14px", textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    Click to upload audio file (MP3, WAV, FLAC)
                  </div>
                  <input type="file" accept="audio/*" style={{ display: "none" }} onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setUrl(URL.createObjectURL(f)); setTitle(f.name.replace(/\.[^.]+$/, "")); }
                  }} />
                </label>
              )}

              <input
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Genre (optional)"
                style={{ width: "100%", marginBottom: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7, padding: "7px 10px", color: "#fff", fontSize: 12, outline: "none", boxSizing: "border-box" }}
              />

              {error && <div style={{ marginBottom: 8, fontSize: 11, color: "#fca5a5" }}>{error}</div>}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={handleAdd}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: "pointer", background: `${accentColor}33`, border: `1px solid ${accentColor}55`, color: accentColor, letterSpacing: "0.08em" }}
                >
                  ADD TO PLAYLIST
                </button>
                <button
                  onClick={() => setOpen(false)}
                  style={{ padding: "8px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track list */}
      {tracks.length > 0 && (
        <div style={{ maxHeight: 280, overflowY: "auto" }}>
          {tracks.map((t, i) => (
            <div
              key={t.id}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "9px 14px",
                borderBottom: i < tracks.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", width: 18, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{t.artist}{t.genre ? ` · ${t.genre}` : ""}</div>
              </div>
              {t.url !== "#" && (
                <a href={t.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: accentColor, textDecoration: "none", flexShrink: 0 }}>▶ PLAY</a>
              )}
              <button
                onClick={() => setTracks(tracks.filter((x) => x.id !== t.id))}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", fontSize: 14, cursor: "pointer", flexShrink: 0 }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
