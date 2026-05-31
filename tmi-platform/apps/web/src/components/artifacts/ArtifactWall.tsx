"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PlaylistArtifact from "./PlaylistArtifact";
import { SKIN_META, type ArtifactSkin, type ArtifactTrack } from "@/lib/artifacts/artifactEngine";

// ── Default artifact collection per role ──────────────────────────────────────

const DEFAULT_FAN_ARTIFACTS: { skin: ArtifactSkin; title: string; tracks: ArtifactTrack[] }[] = [
  { skin: "submarine", title: "Top Charts – Pop",   tracks: [
    { id: "f1", title: "Good Days",      artist: "SZA",           duration: "4:39", sourceUrl: "#", source: "link" },
    { id: "f2", title: "Golden Hour",    artist: "JVKE",          duration: "3:29", sourceUrl: "#", source: "link" },
    { id: "f3", title: "Heat Waves",     artist: "Glass Animals", duration: "3:59", sourceUrl: "#", source: "link" },
  ]},
  { skin: "tree",      title: "Top Charts – Indie", tracks: [
    { id: "f4", title: "As It Was",      artist: "Harry Styles",  duration: "2:37", sourceUrl: "#", source: "link" },
    { id: "f5", title: "Daylight",       artist: "David Kushner", duration: "3:28", sourceUrl: "#", source: "link" },
  ]},
  { skin: "ufo",       title: "Top Charts – EDM",   tracks: [
    { id: "f6", title: "Neon Lights",    artist: "Marshmello",    duration: "3:41", sourceUrl: "#", source: "link" },
    { id: "f7", title: "Blinding Lights",artist: "The Weeknd",    duration: "3:20", sourceUrl: "#", source: "link" },
  ]},
  { skin: "house",     title: "Top Charts – R&B",   tracks: [
    { id: "f8", title: "Creepin'",       artist: "Metro Boomin",  duration: "3:32", sourceUrl: "#", source: "link" },
    { id: "f9", title: "Rich Flex",      artist: "Drake",         duration: "3:25", sourceUrl: "#", source: "link" },
  ]},
];

const DEFAULT_PERFORMER_ARTIFACTS: { skin: ArtifactSkin; title: string; tracks: ArtifactTrack[] }[] = [
  { skin: "rocket",    title: "My Album",          tracks: [] },
  { skin: "car",       title: "Tour Playlist",     tracks: [] },
  { skin: "train",     title: "Battle Pack",        tracks: [] },
  { skin: "submarine", title: "Producer Picks",    tracks: [] },
];

// ── Skin shop / unlock ────────────────────────────────────────────────────────

function SkinShop({ userPoints, onClose, onUnlock }: { userPoints: number; onClose: () => void; onUnlock: (skin: ArtifactSkin) => void }) {
  const skins = (Object.keys(SKIN_META) as ArtifactSkin[]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#080818", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 16, padding: 20, width: "min(520px, 95vw)", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em" }}>ARTIFACT VAULT</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Spend points to unlock character skins</div>
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#FFD700" }}>⭐ {userPoints} pts</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {skins.map((s) => {
            const m = SKIN_META[s];
            const owned = userPoints >= m.unlockPoints || m.unlockPoints === 0;
            return (
              <div key={s} style={{
                padding: "14px 16px", borderRadius: 10, cursor: "pointer",
                background: owned ? `${m.primary}08` : "rgba(255,255,255,0.02)",
                border: `1px solid ${owned ? m.primary + "44" : "rgba(255,255,255,0.08)"}`,
                opacity: owned ? 1 : 0.5,
              }}>
                <div style={{ fontSize: 24, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: owned ? m.primary : "rgba(255,255,255,0.4)", marginBottom: 2 }}>{m.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>{m.description}</div>
                {owned ? (
                  <button onClick={() => { onUnlock(s); onClose(); }}
                    style={{ padding: "5px 12px", borderRadius: 6, fontSize: 9, fontWeight: 800, background: m.primary, color: "#000", border: "none", cursor: "pointer" }}>
                    USE SKIN
                  </button>
                ) : (
                  <div style={{ fontSize: 9, color: "#FFD700", fontWeight: 700 }}>🔒 {m.unlockPoints} pts</div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={onClose} style={{ width: "100%", marginTop: 16, padding: 10, borderRadius: 8, fontSize: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Add to Library modal ──────────────────────────────────────────────────────

function AddToLibraryModal({ available, onClose, onAdd }: {
  available: { skin: ArtifactSkin; title: string; tracks: ArtifactTrack[] }[];
  onClose: () => void;
  onAdd: (items: number[]) => void;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const toggle = (i: number) => setSelected((s) => s.includes(i) ? s.filter((x) => x !== i) : [...s, i]);
  const totalTracks = selected.reduce((sum, i) => sum + (available[i]?.tracks.length ?? 0), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#080818", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 16, padding: 20, width: "min(480px, 95vw)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: "#FFD700", letterSpacing: "0.1em" }}>ADD TO LIBRARY</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setSelected([0])} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 9, fontWeight: 700, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", cursor: "pointer" }}>Select One</button>
            <button onClick={() => setSelected(available.map((_, i) => i))} style={{ padding: "4px 10px", borderRadius: 6, fontSize: 9, fontWeight: 700, background: "rgba(255,215,0,0.1)", border: "1px solid rgba(255,215,0,0.3)", color: "#FFD700", cursor: "pointer" }}>Select All ({available.length})</button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {available.map((a, i) => {
            const m = SKIN_META[a.skin];
            const sel = selected.includes(i);
            return (
              <div key={i} onClick={() => toggle(i)}
                style={{ padding: 12, borderRadius: 10, cursor: "pointer", border: `2px solid ${sel ? m.primary : "rgba(255,255,255,0.1)"}`, background: sel ? `${m.primary}08` : "rgba(255,255,255,0.02)", transition: "all 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${sel ? m.primary : "rgba(255,255,255,0.3)"}`, background: sel ? m.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#000" }}>
                    {sel ? "✓" : ""}
                  </div>
                  <span style={{ fontSize: 16 }}>{m.icon}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: sel ? m.primary : "#e2e8f0", marginBottom: 2 }}>{a.title}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{a.tracks.length} tracks · Updated just now</div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{selected.length} selected · {totalTracks} tracks</div>
          <button
            onClick={() => { onAdd(selected); onClose(); }}
            disabled={selected.length === 0}
            style={{ padding: "8px 20px", borderRadius: 8, fontSize: 11, fontWeight: 800, background: selected.length > 0 ? "#FFD700" : "rgba(255,255,255,0.08)", color: selected.length > 0 ? "#000" : "rgba(255,255,255,0.3)", border: "none", cursor: selected.length > 0 ? "pointer" : "default" }}>
            ADD SELECTED
          </button>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: 8, borderRadius: 8, fontSize: 10, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>Cancel</button>
      </motion.div>
    </motion.div>
  );
}

// ── ArtifactWall ──────────────────────────────────────────────────────────────

interface ArtifactWallProps {
  role?: "fan" | "performer" | "artist";
  userPoints?: number;
  accentColor?: string;
  title?: string;
}

export default function ArtifactWall({
  role = "fan",
  userPoints = 324,
  accentColor = "#FFD700",
  title = "Your Playlists",
}: ArtifactWallProps) {
  const defaults = role === "performer" ? DEFAULT_PERFORMER_ARTIFACTS : DEFAULT_FAN_ARTIFACTS;
  const [artifacts, setArtifacts] = useState(defaults);
  const [page, setPage]           = useState(0);
  const [showShop,    setShowShop]    = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedIds,    setSavedIds]    = useState<string[]>([]);

  const PER_PAGE = 4;
  const totalPages = Math.ceil(artifacts.length / PER_PAGE);
  const visible = artifacts.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <div style={{ background: "rgba(5,5,18,0.9)", borderRadius: 14, border: `1px solid ${accentColor}22`, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${accentColor}18`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 900, color: accentColor, letterSpacing: "0.14em", flex: 1 }}>{title.toUpperCase()}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>Page {page + 1} / {Math.max(totalPages, 1)}</span>
        <button onClick={() => setShowShop(true)}
          style={{ padding: "4px 10px", borderRadius: 6, fontSize: 9, fontWeight: 800, background: `${accentColor}15`, border: `1px solid ${accentColor}33`, color: accentColor, cursor: "pointer" }}>
          🔓 SKINS
        </button>
        <button onClick={() => setShowLibrary(true)}
          style={{ padding: "4px 10px", borderRadius: 6, fontSize: 9, fontWeight: 800, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
          + LIBRARY
        </button>
      </div>

      {/* Artifact grid */}
      <div style={{ padding: "20px 16px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, justifyItems: "center" }}>
        {visible.map((a, i) => (
          <PlaylistArtifact
            key={`${a.skin}-${i}`}
            artifactId={`artifact-${page * PER_PAGE + i}`}
            skin={a.skin}
            title={a.title}
            initialTracks={a.tracks}
            initialPoints={userPoints}
            listeners={Math.floor(Math.random() * 500)}
            onAddToLibrary={(id) => setSavedIds((s) => [...s, id])}
          />
        ))}
      </div>

      {/* Now Playing global bar */}
      <div style={{ borderTop: `1px solid ${accentColor}18`, background: "rgba(0,0,0,0.4)", padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          style={{ width: 26, height: 26, borderRadius: "50%", background: accentColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#000", fontWeight: 900, cursor: "pointer", flexShrink: 0 }}>
          ▶
        </motion.div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ overflow: "hidden", height: 14 }}>
            <motion.div animate={{ x: ["0%", "-100%"] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{ whiteSpace: "nowrap", fontSize: 10, color: accentColor, fontWeight: 700 }}>
              Song Title · Artist Name · Link
            </motion.div>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginTop: 3 }}>
            <motion.div animate={{ width: ["0%", "100%"] }} transition={{ duration: 240, repeat: Infinity, ease: "linear" }}
              style={{ height: "100%", background: accentColor, borderRadius: 2 }} />
          </div>
        </div>
        <div style={{ fontSize: 9, color: accentColor, fontWeight: 900, flexShrink: 0 }}>+10 PTS</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>⭐ {userPoints}</div>

        {/* Page navigation */}
        {totalPages > 1 && (
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button onClick={() => setPage((p) => Math.max(p - 1, 0))}
              style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "rgba(255,255,255,0.05)", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>↑</button>
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
              style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, background: "rgba(255,255,255,0.05)", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>↓</button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showShop    && <SkinShop userPoints={userPoints} onClose={() => setShowShop(false)} onUnlock={() => {}} />}
        {showLibrary && <AddToLibraryModal available={defaults} onClose={() => setShowLibrary(false)} onAdd={() => {}} />}
      </AnimatePresence>
    </div>
  );
}
