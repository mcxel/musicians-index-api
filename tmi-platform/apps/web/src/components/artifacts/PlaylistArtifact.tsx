"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  type ArtifactSkin, type ArtifactTrack, type EQState,
  SKIN_META, DEFAULT_EQ, interleaveTMI, parseSourceLabel, SOURCE_COLORS, fmtPoints,
} from "@/lib/artifacts/artifactEngine";
import { ActivityTimelineEngine } from "@/lib/timeline/ActivityTimelineEngine";

// ── Scrolling ticker ──────────────────────────────────────────────────────────

function Ticker({ text, color }: { text: string; color: string }) {
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: "100%" }}>
      <motion.div
        animate={{ x: ["100%", "-150%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{ display: "inline-block", fontSize: 9, color, fontWeight: 700, letterSpacing: "0.08em" }}
      >
        {text}
      </motion.div>
    </div>
  );
}

// ── Monitor Display (shared inside every skin window) ─────────────────────────

function MonitorDisplay({
  tracks, currentIdx, isPlaying, points, primary, accent, listeners,
  streams, shares, rank,
  onPrev, onPlay, onNext, onLike,
}: {
  tracks: ArtifactTrack[]; currentIdx: number; isPlaying: boolean;
  points: number; primary: string; accent: string; listeners: number;
  streams?: number; shares?: number; rank?: number;
  onPrev: () => void; onPlay: () => void; onNext: () => void; onLike: () => void;
}) {
  const track = tracks[currentIdx];
  const total = tracks.length;
  const nextTrack = tracks[(currentIdx + 1) % total];
  const tickerText = track
    ? `NOW PLAYING: ${track.artist.toUpperCase()} — ${track.title.toUpperCase()}   ·   UP NEXT: ${nextTrack?.artist} — ${nextTrack?.title}   ·   ${listeners} LISTENERS   ·   +10 XP AVAILABLE   ·   `
    : "ADD TRACKS TO GET STARTED  ·  ";

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#050510", borderRadius: 8, overflow: "hidden" }}>
      {/* Now Playing header */}
      <div style={{ padding: "4px 8px", borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)" }}>
        <div style={{ fontSize: 7, fontWeight: 900, color: primary, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 1 }}>Now Playing</div>
        {track ? (
          <>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.title}</div>
            <div style={{ fontSize: 9, color: primary, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{track.artist}</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>Track {currentIdx + 1} / {total} · {track.duration}</div>
          </>
        ) : (
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>No tracks yet</div>
        )}
      </div>

      {/* Visualizer bars — animate when playing */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 2, padding: "4px 6px" }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <motion.div
            key={i}
            animate={isPlaying ? {
              height: [`${8 + Math.sin(i * 0.8) * 14}px`, `${18 + Math.sin(i * 1.2) * 14}px`, `${8 + Math.sin(i * 0.8) * 14}px`],
            } : { height: "4px" }}
            transition={{ duration: 0.5 + i * 0.07, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: 4, background: `linear-gradient(180deg, ${primary}, ${accent})`, borderRadius: 2, minHeight: 4 }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ padding: "0 8px 2px" }}>
        <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <motion.div
            animate={isPlaying ? { width: ["0%", "100%"] } : {}}
            transition={isPlaying ? { duration: 240, ease: "linear", repeat: Infinity } : {}}
            style={{ height: "100%", background: `linear-gradient(90deg, ${primary}, ${accent})`, borderRadius: 2 }}
          />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "4px 8px 6px" }}>
        <button onClick={onPrev} style={ctrlBtn(primary)}>⏮</button>
        <button onClick={onPlay}
          style={{ ...ctrlBtn(primary), width: 28, height: 28, borderRadius: "50%", background: primary, color: "#000", fontSize: 11 }}>
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button onClick={onNext} style={ctrlBtn(primary)}>⏭</button>
        <button onClick={onLike} style={{ ...ctrlBtn("#FF2DAA"), marginLeft: 4 }}>♥</button>
        <div style={{ marginLeft: "auto", fontSize: 9, fontWeight: 900, color: primary }}>{fmtPoints(points)}</div>
      </div>

      {/* Stream & Win stats row */}
      {(streams != null || shares != null || rank != null) && (
        <div style={{ padding: "2px 8px", display: "flex", gap: 6, alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          {streams != null && <span style={{ fontSize: 7, color: primary, fontWeight: 800 }}>▶ {streams >= 1000 ? `${(streams/1000).toFixed(1)}K` : streams}</span>}
          {shares != null && <span style={{ fontSize: 7, color: accent, fontWeight: 700 }}>📤 {shares}</span>}
          {rank != null && <span style={{ fontSize: 7, color: "#FFD700", fontWeight: 900 }}>#{rank}</span>}
          <span style={{ marginLeft: "auto", fontSize: 7, color: primary, fontWeight: 900 }}>{fmtPoints(points)} XP</span>
        </div>
      )}

      {/* Scrolling ticker */}
      <div style={{ background: "rgba(0,0,0,0.5)", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "3px 0", overflow: "hidden" }}>
        <Ticker text={tickerText} color={primary} />
      </div>
    </div>
  );
}

function ctrlBtn(color: string): React.CSSProperties {
  return {
    background: "none", border: "none", color, fontSize: 13,
    cursor: "pointer", padding: "2px 4px", borderRadius: 4,
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}

// ── Equalizer drawer ──────────────────────────────────────────────────────────

function EQSlider({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700, width: 42, letterSpacing: "0.08em" }}>{label}</span>
      <div style={{ flex: 1, position: "relative", height: 18, display: "flex", alignItems: "center" }}>
        <div style={{ width: "100%", height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${value}%`, height: "100%", background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: 2 }} />
        </div>
        <input
          type="range" min={0} max={100} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
        />
        <div style={{ position: "absolute", left: `${value}%`, transform: "translateX(-50%)", width: 10, height: 10, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
      </div>
      <span style={{ fontSize: 9, color, fontWeight: 700, width: 24, textAlign: "right" }}>{value}</span>
    </div>
  );
}

// ── Share modal ────────────────────────────────────────────────────────────────

function ShareModal({ artifactId, title, primary, onClose }: { artifactId: string; title: string; primary: string; onClose: () => void }) {
  const url = `https://tmi.live/artifact/${artifactId}`;
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(url).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const options = [
    { label: "📋 Copy Link",       action: copy },
    { label: "👤 Share to Friend", action: () => window.open(`/messages/new?msg=${encodeURIComponent(url)}`) },
    { label: "🏠 Share to Lobby",  action: () => window.open(`/rooms/world-dance-party?share=${artifactId}`) },
    { label: "🎭 Share to Room",   action: () => window.open(`/rooms?share=${artifactId}`) },
    { label: "⭐ Share to Profile",action: () => window.open(`/profile?artifact=${artifactId}`) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#080818", border: `1px solid ${primary}44`, borderRadius: 14, padding: 20, width: 300 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: primary, letterSpacing: "0.1em", marginBottom: 4 }}>SHARE ARTIFACT</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 12 }}>{title}</div>
        <div style={{ fontSize: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "6px 10px", marginBottom: 12, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
          {url}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
          {options.map((o) => (
            <button key={o.label} onClick={o.action}
              style={{ textAlign: "left", padding: "8px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, background: "rgba(255,255,255,0.04)", border: `1px solid ${primary}22`, color: "#e2e8f0", cursor: "pointer" }}>
              {o.label}
            </button>
          ))}
        </div>
        {copied && <div style={{ fontSize: 10, color: "#22c55e", textAlign: "center", fontWeight: 700 }}>✓ Copied to clipboard!</div>}
        <button onClick={onClose} style={{ width: "100%", marginTop: 8, padding: "8px", borderRadius: 8, fontSize: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}>
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// ── Add Track form ─────────────────────────────────────────────────────────────

function AddTrackForm({ primary, onAdd, onClose }: { primary: string; onAdd: (t: ArtifactTrack) => void; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [url, setUrl] = useState("");
  const [dur, setDur] = useState("");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!title.trim() || !artist.trim()) { setErr("Title and artist required"); return; }
    onAdd({
      id: `track-${Date.now()}`,
      title: title.trim(), artist: artist.trim(),
      duration: dur.trim() || "0:00",
      sourceUrl: url.trim() || "#",
      source: parseSourceLabel(url.trim()),
    });
    onClose();
  };

  const inp: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7,
    padding: "7px 10px", color: "#fff", fontSize: 11, outline: "none", boxSizing: "border-box",
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onClose}>
      <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#080818", border: `1px solid ${primary}44`, borderRadius: 14, padding: 20, width: 300 }}>
        <div style={{ fontSize: 12, fontWeight: 900, color: primary, letterSpacing: "0.1em", marginBottom: 12 }}>ADD TRACK</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Song title" style={inp} />
          <input value={artist} onChange={(e) => setArtist(e.target.value)} placeholder="Artist name" style={inp} />
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Spotify / YouTube / SoundCloud / TMI URL" style={inp} />
          <input value={dur} onChange={(e) => setDur(e.target.value)} placeholder="Duration (e.g. 3:28)" style={inp} />
        </div>
        {err && <div style={{ fontSize: 10, color: "#fca5a5", marginTop: 8 }}>{err}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={submit} style={{ flex: 1, padding: "9px", borderRadius: 8, fontSize: 11, fontWeight: 800, background: primary, color: "#000", cursor: "pointer", border: "none" }}>ADD</button>
          <button onClick={onClose} style={{ padding: "9px 16px", borderRadius: 8, fontSize: 11, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>Cancel</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── SKINS ─────────────────────────────────────────────────────────────────────

// Submarine Skin
function SubmarineSkin({ isPlaying, primary, accent, isOpen, onClick, children }: SkinProps) {
  return (
    <div style={{ position: "relative", width: 280, margin: "0 auto" }}>
      {/* Bubbles */}
      {[20, 60, 110, 150, 200, 240].map((x, i) => (
        <motion.div key={i}
          animate={isPlaying ? { y: [0, -60, -120], opacity: [0.7, 0.5, 0] } : { opacity: 0 }}
          transition={{ duration: 2 + i * 0.4, repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
          style={{ position: "absolute", bottom: 60, left: x, width: 6 + (i % 3) * 4, height: 6 + (i % 3) * 4, borderRadius: "50%", border: "1.5px solid rgba(173,216,230,0.6)", background: "rgba(173,216,230,0.1)" }}
        />
      ))}

      {/* Main body */}
      <motion.div animate={{ y: isPlaying ? [0, -3, 0] : 0 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        onClick={onClick} style={{ cursor: "pointer", position: "relative" }}>

        {/* Periscope */}
        <div style={{ margin: "0 auto", width: 14, height: 36, background: primary, borderRadius: "4px 4px 0 0", marginBottom: -2, boxShadow: `0 0 8px ${primary}88` }}>
          <div style={{ width: 28, height: 10, background: primary, borderRadius: 4, marginTop: 6, marginLeft: -7, boxShadow: `0 0 6px ${primary}66` }} />
        </div>

        {/* Sub hull */}
        <div style={{ width: 280, height: 140, borderRadius: "50%", background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`, position: "relative", boxShadow: `0 4px 20px ${primary}44, 0 0 40px ${primary}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>

          {/* Porthole (left) */}
          <div style={{ position: "absolute", left: 24, width: 30, height: 30, borderRadius: "50%", background: "#003366", border: `3px solid ${accent}`, boxShadow: `inset 0 0 8px rgba(0,100,200,0.6)` }}>
            <div style={{ position: "absolute", top: 5, left: 5, width: 8, height: 5, borderRadius: "50%", background: "rgba(255,255,255,0.3)", transform: "rotate(-30deg)" }} />
          </div>

          {/* Monitor window */}
          <div style={{ width: 148, height: 96, borderRadius: 8, overflow: "hidden", background: "#020212", border: `2px solid ${accent}88`, boxShadow: `inset 0 0 12px rgba(0,0,0,0.8), 0 0 10px ${primary}33` }}>
            {children}
          </div>

          {/* Propeller (right) */}
          <div style={{ position: "absolute", right: -14, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            {[0, 1, 2].map((b) => (
              <motion.div key={b}
                animate={isPlaying ? { rotate: [0, 360] } : { rotate: 0 }}
                transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }}
                style={{ width: 16, height: 28, borderRadius: 8, background: accent, transform: `rotate(${b * 60}deg)`, transformOrigin: "50% 100%", boxShadow: `0 0 4px ${accent}88` }}
              />
            ))}
          </div>

          {/* Chevron toggle */}
          <div style={{ position: "absolute", bottom: 8, right: 52, fontSize: 12, color: accent, fontWeight: 900, opacity: 0.7 }}>
            {isOpen ? "▲" : "▼"}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// UFO Skin
function UFOSkin({ isPlaying, primary, accent, isOpen, onClick, children }: SkinProps) {
  return (
    <div style={{ position: "relative", width: 280, margin: "0 auto" }}>
      {/* Stars */}
      {[10, 50, 90, 200, 250, 270].map((x, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
          style={{ position: "absolute", top: 4 + (i % 3) * 12, left: x, width: 3, height: 3, borderRadius: "50%", background: primary }}
        />
      ))}

      <motion.div
        animate={{ y: isPlaying ? [0, -5, 0] : 0, rotate: isPlaying ? [0, 1, -1, 0] : 0 }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        onClick={onClick} style={{ cursor: "pointer", paddingTop: 8 }}>

        {/* Dome */}
        <div style={{ margin: "0 auto", width: 160, height: 80, borderRadius: "80px 80px 0 0", background: `linear-gradient(135deg, rgba(0,255,255,0.15) 0%, rgba(170,45,255,0.25) 100%)`, border: `1.5px solid ${primary}55`, borderBottom: "none", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Neon strips in dome */}
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div key={i}
              animate={isPlaying ? { opacity: [0.3, 1, 0.3], scaleY: [0.6, 1, 0.6] } : { opacity: 0.2 }}
              transition={{ duration: 0.3 + i * 0.1, repeat: Infinity, delay: i * 0.06 }}
              style={{ width: 3, height: 40 + i * 6, borderRadius: 2, background: i % 2 === 0 ? primary : accent, margin: "0 4px" }}
            />
          ))}
        </div>

        {/* Saucer body */}
        <div style={{ width: 280, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, #1a6b6b 0%, #0d4444 100%)`, position: "relative", boxShadow: `0 4px 20px ${primary}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Rim lights */}
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <motion.div key={i}
              animate={isPlaying ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.3 }}
              transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
              style={{ position: "absolute", left: `${10 + i * 12}%`, top: 10, width: 8, height: 8, borderRadius: "50%", background: primary, boxShadow: `0 0 6px ${primary}` }}
            />
          ))}

          {/* Monitor */}
          <div style={{ width: 160, height: 44, borderRadius: 6, overflow: "hidden", background: "#020212", border: `2px solid ${primary}66`, boxShadow: `inset 0 0 10px rgba(0,0,0,0.9)` }}>
            {children}
          </div>

          <div style={{ position: "absolute", right: 30, bottom: 8, fontSize: 12, color: primary, fontWeight: 900, opacity: 0.7 }}>{isOpen ? "▲" : "▼"}</div>
        </div>

        {/* Landing legs */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 60px" }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 4, height: 14, background: "#1a6b6b", borderRadius: 2 }} />
          ))}
        </div>

        {/* Thrusters */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 90px" }}>
          {[0, 1].map((i) => (
            <motion.div key={i}
              animate={isPlaying ? { opacity: [0.5, 1, 0.5], scaleY: [0.8, 1.3, 0.8] } : { opacity: 0.3 }}
              transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.15 }}
              style={{ width: 14, height: 16, borderRadius: "0 0 8px 8px", background: `linear-gradient(180deg, ${accent}, #FF6600)`, boxShadow: `0 4px 8px ${accent}88` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Rocket Skin
function RocketSkin({ isPlaying, primary, accent, isOpen, onClick, children }: SkinProps) {
  return (
    <div style={{ position: "relative", width: 140, margin: "0 auto" }}>
      {/* Stars */}
      {[0, 30, 80, 120, 20, 100].map((x, i) => (
        <motion.div key={i}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 1.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          style={{ position: "absolute", top: i * 18, left: x > 140 ? x - 80 : x, width: 2, height: 2, borderRadius: "50%", background: "#FFD700" }}
        />
      ))}

      <motion.div
        animate={{ y: isPlaying ? [0, -6, 0] : 0 }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        onClick={onClick} style={{ cursor: "pointer" }}>

        {/* Nose cone */}
        <div style={{ margin: "0 auto", width: 0, height: 0, borderLeft: "28px solid transparent", borderRight: "28px solid transparent", borderBottom: `52px solid #FF6B35` }} />

        {/* Rocket body */}
        <div style={{ margin: "0 auto", width: 56, background: "linear-gradient(180deg, #1a4a5c 0%, #0d3040 100%)", borderRadius: "4px", position: "relative", paddingTop: 8 }}>
          {/* Stripe */}
          <div style={{ height: 8, background: primary, margin: "0 0 6px" }} />

          {/* Monitor window */}
          <div style={{ width: 44, height: 60, margin: "0 auto 8px", borderRadius: 6, overflow: "hidden", background: "#020212", border: `2px solid ${primary}66` }}>
            {children}
          </div>

          {/* Second stripe */}
          <div style={{ height: 6, background: "#FF6B35", margin: "0 0 0" }} />

          {/* Fins */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: -8, position: "relative" }}>
            <div style={{ width: 0, height: 0, borderRight: "22px solid transparent", borderTop: `40px solid #FF6B35` }} />
            <div style={{ width: 0, height: 0, borderLeft: "22px solid transparent", borderTop: `40px solid #FF6B35` }} />
          </div>
          <div style={{ position: "absolute", bottom: 4, right: 8, fontSize: 10, color: primary, fontWeight: 900, opacity: 0.8 }}>{isOpen ? "▲" : "▼"}</div>
        </div>

        {/* Exhaust flames */}
        <div style={{ display: "flex", justifyContent: "center", gap: 4 }}>
          {[0, 1, 2].map((i) => (
            <motion.div key={i}
              animate={isPlaying ? { scaleY: [0.8, 1.5, 0.8], opacity: [0.7, 1, 0.7] } : { opacity: 0.2 }}
              transition={{ duration: 0.2 + i * 0.1, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: 10, height: 24 + i * 4, borderRadius: "50% 50% 20% 20%", background: `linear-gradient(180deg, #FFD700, #FF4500, transparent)` }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Tree Skin
function TreeSkin({ isPlaying, primary, accent, isOpen, onClick, children }: SkinProps) {
  const glowDots = [
    [60, 20], [100, 10], [140, 16], [80, 40], [120, 35], [155, 48],
    [50, 55], [110, 60], [145, 30], [75, 70], [130, 65], [90, 80],
  ];
  return (
    <div style={{ width: 220, margin: "0 auto", cursor: "pointer" }} onClick={onClick}>
      {/* Stars */}
      {[10, 180, 200, 5, 215].map((x, i) => (
        <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1.5 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
          style={{ position: "absolute", top: 6 + i * 14, left: x, width: 3, height: 3, borderRadius: "50%", background: "#FFD700" }} />
      ))}

      {/* Canopy */}
      <motion.div animate={{ scale: isPlaying ? [1, 1.01, 1] : 1 }} transition={{ duration: 2, repeat: Infinity }}>
        <div style={{ width: 200, height: 160, borderRadius: "50% 50% 40% 40%", background: "linear-gradient(135deg, #2d6a2d 0%, #1a4a1a 100%)", margin: "0 auto", position: "relative", boxShadow: "0 4px 20px rgba(0,100,0,0.4)" }}>
          {/* Glow dots (fireflies) */}
          {glowDots.map(([x, y], i) => (
            <motion.div key={i}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 1 + i * 0.2, repeat: Infinity, delay: i * 0.15 }}
              style={{ position: "absolute", left: x, top: y, width: 8, height: 8, borderRadius: "50%", background: primary, boxShadow: `0 0 8px ${primary}, 0 0 16px ${primary}66` }}
            />
          ))}
        </div>
      </motion.div>

      {/* Trunk */}
      <div style={{ width: 48, height: 60, background: "linear-gradient(180deg, #6b3a1f, #4a2510)", margin: "-8px auto 0", borderRadius: "0 0 6px 6px" }} />

      {/* Monitor panel */}
      <div style={{ width: 170, margin: "-30px auto 0", borderRadius: 10, overflow: "hidden", background: "#050510", border: `2px solid ${primary}55`, boxShadow: `0 0 20px ${primary}22` }}>
        <div style={{ padding: 4, height: 90 }}>{children}</div>
        <div style={{ padding: "4px 8px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 10, color: primary, fontWeight: 900 }}>+10 PTS</div>
          <div style={{ fontSize: 9, fontWeight: 800, color: accent }}>{isOpen ? "▲ CLOSE" : "▼ TRACKS"}</div>
        </div>
      </div>
    </div>
  );
}

// House Skin
function HouseSkin({ isPlaying, primary, accent, isOpen, onClick, children }: SkinProps) {
  return (
    <div style={{ width: 200, margin: "0 auto", cursor: "pointer" }} onClick={onClick}>
      {/* Roof */}
      <div style={{ width: 0, height: 0, borderLeft: "100px solid transparent", borderRight: "100px solid transparent", borderBottom: `70px solid #8B2500`, margin: "0 auto" }} />
      {/* Chimney */}
      <div style={{ width: 20, height: 24, background: "#8B2500", marginLeft: 148, marginTop: -56, position: "relative" }}>
        {isPlaying && (
          <motion.div animate={{ opacity: [0, 0.6, 0], y: [-4, -14] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ position: "absolute", top: -10, left: 4, width: 12, height: 12, borderRadius: "50%", background: "rgba(200,200,200,0.4)" }} />
        )}
      </div>

      {/* Body */}
      <div style={{ width: 200, background: "linear-gradient(180deg, #5a2a10 0%, #3d1a08 100%)", borderRadius: "0 0 8px 8px", position: "relative", marginTop: -24, paddingBottom: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
        {/* Windows */}
        <div style={{ display: "flex", justifyContent: "space-around", padding: "14px 18px 6px" }}>
          {[0, 1].map((i) => (
            <motion.div key={i}
              animate={{ opacity: isPlaying ? [0.6, 1, 0.6] : 0.7 }}
              transition={{ duration: 2 + i, repeat: Infinity }}
              style={{ width: 36, height: 28, background: "rgba(255,200,80,0.25)", border: `1.5px solid rgba(255,215,0,0.5)`, borderRadius: 4, boxShadow: "0 0 10px rgba(255,200,80,0.3), inset 0 0 6px rgba(255,215,0,0.1)" }}>
              <div style={{ width: "100%", height: "50%", borderBottom: "1px solid rgba(255,215,0,0.3)" }} />
            </motion.div>
          ))}
        </div>

        {/* Monitor */}
        <div style={{ width: 166, margin: "0 auto", borderRadius: 8, overflow: "hidden", background: "#020212", border: `2px solid ${primary}55`, height: 90 }}>
          {children}
        </div>

        {/* Door */}
        <div style={{ width: 36, height: 28, background: "#6b3a10", border: "1px solid rgba(255,215,0,0.3)", borderRadius: "3px 3px 0 0", margin: "8px auto 0", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: primary }} />
        </div>
        <div style={{ position: "absolute", bottom: 14, right: 12, fontSize: 10, color: primary, fontWeight: 900, opacity: 0.8 }}>{isOpen ? "▲" : "▼"}</div>
      </div>
    </div>
  );
}

// Car Skin (neon outline)
function CarSkin({ isPlaying, primary, accent, isOpen, onClick, children }: SkinProps) {
  const neon = (opacity = 1) => `rgba(255,215,0,${opacity})`;
  return (
    <div style={{ position: "relative", width: 260, margin: "0 auto", cursor: "pointer" }} onClick={onClick}>
      {/* Floating hearts */}
      {isPlaying && [40, 210].map((x, i) => (
        <motion.div key={i}
          animate={{ y: [0, -20, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.6 }}
          style={{ position: "absolute", top: 16, left: x, fontSize: 16, color: "#FF2DAA" }}>
          ♥
        </motion.div>
      ))}

      <motion.div
        animate={{ y: isPlaying ? [0, -2, 0] : 0 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}>

        {/* Car body — neon outline */}
        <div style={{ position: "relative", height: 130 }}>
          {/* Roof outline */}
          <div style={{ position: "absolute", top: 10, left: 30, right: 30, height: 50, borderRadius: "16px 16px 0 0", border: `2px solid ${primary}`, boxShadow: `0 0 8px ${primary}66, inset 0 0 4px ${primary}22` }} />

          {/* Windshield (song info area) */}
          <div style={{ position: "absolute", top: 16, left: 46, right: 46, height: 38, borderRadius: "10px 10px 0 0", overflow: "hidden", background: "rgba(0,0,0,0.6)", border: `1px solid ${primary}44` }}>
            {children}
          </div>

          {/* Hood + trunk */}
          <div style={{ position: "absolute", top: 56, left: 10, right: 10, height: 34, border: `2px solid ${primary}`, borderRadius: 4, boxShadow: `0 0 8px ${primary}44` }}>
            {/* Grill lines */}
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ position: "absolute", left: 20 + i * 12, top: 10, width: 8, height: 14, border: `1px solid ${primary}66`, borderRadius: 2 }} />
            ))}
          </div>

          {/* Headlights */}
          {[14, 216].map((x, i) => (
            <motion.div key={i}
              animate={isPlaying ? { boxShadow: [`0 0 8px ${primary}`, `0 0 16px ${primary}`, `0 0 8px ${primary}`] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ position: "absolute", top: 62, left: x, width: 20, height: 20, borderRadius: "50%", border: `2px solid ${primary}`, background: isPlaying ? `${primary}22` : "transparent" }}
            />
          ))}

          {/* Wheels */}
          {[44, 172].map((x, i) => (
            <div key={i} style={{ position: "absolute", bottom: 2, left: x, width: 36, height: 36, borderRadius: "50%", border: `3px solid ${primary}`, boxShadow: `0 0 10px ${primary}55, 0 0 20px ${primary}22` }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${primary}66`, margin: "7px auto" }} />
            </div>
          ))}

          <div style={{ position: "absolute", bottom: 14, right: 36, fontSize: 10, color: primary, fontWeight: 900 }}>{isOpen ? "▲" : "▼"}</div>
        </div>

        {/* License plate / add library */}
        <div style={{ textAlign: "center", padding: "4px 0" }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: neon(0.5), letterSpacing: "0.1em" }}>ADD TO LIBRARY</span>
        </div>
      </motion.div>
    </div>
  );
}

// Train Skin
function TrainSkin({ isPlaying, primary, accent, isOpen, onClick, children }: SkinProps) {
  return (
    <div style={{ position: "relative", width: 220, margin: "0 auto", cursor: "pointer" }} onClick={onClick}>
      <motion.div
        animate={{ x: isPlaying ? [0, 2, -2, 0] : 0 }}
        transition={{ duration: 0.3, repeat: Infinity }}>

        {/* Smokestack */}
        <div style={{ width: 22, height: 32, background: "#8B2500", borderRadius: "4px 4px 0 0", margin: "0 0 0 40px", position: "relative" }}>
          <div style={{ position: "absolute", top: -6, left: -4, width: 30, height: 8, background: "#6b1a00", borderRadius: 4 }} />
          {isPlaying && (
            <motion.div animate={{ y: [-8, -24], opacity: [0.6, 0] }} transition={{ duration: 1.2, repeat: Infinity }}
              style={{ position: "absolute", top: -20, left: 3, width: 16, height: 16, borderRadius: "50%", background: "rgba(180,180,180,0.4)" }} />
          )}
        </div>

        {/* Engine cabin */}
        <div style={{ background: "linear-gradient(180deg, #CC4400 0%, #992200 100%)", borderRadius: "8px 8px 0 0", padding: 8, position: "relative", boxShadow: "0 4px 16px rgba(200,60,0,0.4)" }}>
          {/* Top windows */}
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            {[0, 1].map((i) => (
              <motion.div key={i} animate={isPlaying ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.7 }} transition={{ duration: 1.5 + i, repeat: Infinity }}
                style={{ flex: 1, height: 20, background: "rgba(255,200,80,0.2)", border: `1px solid ${primary}55`, borderRadius: 4 }} />
            ))}
          </div>

          {/* Monitor */}
          <div style={{ width: "100%", borderRadius: 6, overflow: "hidden", background: "#020212", border: `2px solid ${primary}55`, height: 88 }}>
            {children}
          </div>
          <div style={{ position: "absolute", bottom: 10, right: 8, fontSize: 10, color: primary, fontWeight: 900 }}>{isOpen ? "▲" : "▼"}</div>
        </div>

        {/* Wheels */}
        <div style={{ background: "#661100", padding: "4px 8px 0", display: "flex", alignItems: "center", gap: 8 }}>
          {[0, 1, 2, 3].map((i) => (
            <motion.div key={i}
              animate={isPlaying ? { rotate: [0, 360] } : { rotate: 0 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
              style={{ width: i === 1 || i === 2 ? 36 : 26, height: i === 1 || i === 2 ? 36 : 26, borderRadius: "50%", border: `3px solid ${primary}`, boxShadow: `0 0 8px ${primary}44` }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", border: `2px solid ${primary}66`, margin: i === 1 || i === 2 ? "11px auto" : "7px auto" }} />
            </motion.div>
          ))}
        </div>

        {/* Track */}
        <div style={{ height: 6, background: `linear-gradient(90deg, transparent, ${primary}33, transparent)`, borderTop: `1px solid ${primary}22` }} />
      </motion.div>
    </div>
  );
}

interface SkinProps {
  isPlaying: boolean; primary: string; accent: string;
  isOpen: boolean; onClick: () => void;
  children: React.ReactNode;
}

const SKIN_COMPONENTS: Record<ArtifactSkin, React.FC<SkinProps>> = {
  submarine: SubmarineSkin,
  ufo:       UFOSkin,
  rocket:    RocketSkin,
  tree:      TreeSkin,
  house:     HouseSkin,
  car:       CarSkin,
  train:     TrainSkin,
};

// ── PlaylistArtifact (main export) ────────────────────────────────────────────

interface PlaylistArtifactProps {
  artifactId?: string;
  skin?: ArtifactSkin;
  title?: string;
  initialTracks?: ArtifactTrack[];
  initialPoints?: number;
  listeners?: number;
  initialStreams?: number;
  shares?: number;
  rank?: number;
  onAddToLibrary?: (artifactId: string) => void;
}

export default function PlaylistArtifact({
  artifactId = `artifact-${Date.now()}`,
  skin = "submarine",
  title = "My Playlist",
  initialTracks = [],
  initialPoints = 0,
  listeners = 0,
  initialStreams = 0,
  shares,
  rank,
  onAddToLibrary,
}: PlaylistArtifactProps) {
  const meta = SKIN_META[skin];
  const SkinComponent = SKIN_COMPONENTS[skin];

  const [isOpen,        setIsOpen]        = useState(false);
  const [isPlaying,     setIsPlaying]     = useState(false);
  const [currentIdx,    setCurrentIdx]    = useState(0);
  const [tracks,        setTracks]        = useState<ArtifactTrack[]>(
    initialTracks.length > 0 ? interleaveTMI(initialTracks) : interleaveTMI([])
  );
  const [eq,            setEQ]            = useState<EQState>(DEFAULT_EQ);
  const [points,        setPoints]        = useState(initialPoints);
  const [streamCount,   setStreamCount]   = useState(initialStreams);
  const [xpFlash,       setXpFlash]       = useState(false);
  const [showShare,     setShowShare]     = useState(false);
  const [showAddTrack,  setShowAddTrack]  = useState(false);
  const [liked,         setLiked]        = useState(false);
  const [addedLibrary,  setAddedLibrary]  = useState(false);
  const pointsTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      pointsTimer.current = setInterval(() => {
        setPoints((p) => p + 10);
        setXpFlash(true);
        setTimeout(() => setXpFlash(false), 1200);
      }, 30000); // +10 pts every 30s of listening
    }
    return () => { if (pointsTimer.current) clearInterval(pointsTimer.current); };
  }, [isPlaying]);

  const handleAddTrack = useCallback((t: ArtifactTrack) => {
    setTracks((prev) => interleaveTMI([t, ...prev.filter((x) => !x.id.startsWith("tmi-"))]));
  }, []);

  return (
    <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
      {/* +10 XP flash */}
      <AnimatePresence>
        {xpFlash && (
          <motion.div initial={{ y: 0, opacity: 1 }} animate={{ y: -32, opacity: 0 }} exit={{}}
            transition={{ duration: 1.2 }}
            style={{ position: "absolute", top: -10, right: 0, fontSize: 11, fontWeight: 900, color: meta.primary, zIndex: 10, pointerEvents: "none" }}>
            +10 XP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Character skin with monitor */}
      <SkinComponent
        isPlaying={isPlaying} primary={meta.primary} accent={meta.accent}
        isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}
      >
        <MonitorDisplay
          tracks={tracks} currentIdx={currentIdx} isPlaying={isPlaying}
          points={points} primary={meta.primary} accent={meta.accent} listeners={listeners}
          streams={streamCount} shares={shares} rank={rank}
          onPrev={() => setCurrentIdx((i) => (i - 1 + tracks.length) % Math.max(tracks.length, 1))}
          onPlay={() => { setIsPlaying(p => { if (!p) setStreamCount(n => n + 1); return !p; }); }}
          onNext={() => { setCurrentIdx((i) => (i + 1) % Math.max(tracks.length, 1)); setPoints((p) => p + 10); setStreamCount(n => n + 1); }}
          onLike={() => setLiked(!liked)}
        />
      </SkinComponent>

      {/* Expanded drawer — tracklist + EQ + controls */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden", width: "100%", maxWidth: 300 }}
          >
            <div style={{ background: "rgba(5,5,20,0.95)", border: `1px solid ${meta.primary}33`, borderRadius: "0 0 12px 12px", overflow: "hidden" }}>
              {/* Title bar */}
              <div style={{ padding: "8px 12px", borderBottom: `1px solid ${meta.primary}22`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: meta.primary, letterSpacing: "0.1em", flex: 1 }}>{title.toUpperCase()}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{tracks.length} tracks · {fmtPoints(points)} pts</span>
              </div>

              {/* Track list */}
              <div style={{ maxHeight: 180, overflowY: "auto" }}>
                {tracks.map((t, i) => (
                  <div key={t.id} onClick={() => { setCurrentIdx(i); setIsPlaying(true); }}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", cursor: "pointer", background: i === currentIdx ? `${meta.primary}11` : "transparent", borderLeft: i === currentIdx ? `2px solid ${meta.primary}` : "2px solid transparent" }}>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", width: 16, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: i === currentIdx ? meta.primary : "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.title}</div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{t.artist}</div>
                    </div>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", flexShrink: 0 }}>{t.duration}</span>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: SOURCE_COLORS[t.source], flexShrink: 0 }} />
                    {t.sourceUrl !== "#" && (
                      <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                        style={{ fontSize: 8, color: meta.accent, textDecoration: "none", flexShrink: 0 }}>▶</a>
                    )}
                  </div>
                ))}
                {tracks.length === 0 && (
                  <div style={{ padding: "16px 12px", textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
                    No tracks yet. Add a Spotify, YouTube, or SoundCloud link.
                  </div>
                )}
              </div>

              {/* Equalizer */}
              <div style={{ padding: "10px 12px", borderTop: `1px solid ${meta.primary}14` }}>
                <div style={{ fontSize: 8, fontWeight: 900, color: meta.primary, letterSpacing: "0.14em", marginBottom: 8 }}>EQUALIZER</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <EQSlider label="BASS"   value={eq.bass}   onChange={(v) => setEQ((e) => ({ ...e, bass: v }))}   color={meta.primary} />
                  <EQSlider label="MID"    value={eq.mid}    onChange={(v) => setEQ((e) => ({ ...e, mid: v }))}    color={meta.accent} />
                  <EQSlider label="TREBLE" value={eq.treble} onChange={(v) => setEQ((e) => ({ ...e, treble: v }))} color="#00FFFF" />
                  <EQSlider label="VOL"    value={eq.volume} onChange={(v) => setEQ((e) => ({ ...e, volume: v }))} color="#22c55e" />
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: "flex", gap: 6, padding: "8px 12px 12px", flexWrap: "wrap" }}>
                <button onClick={() => setShowAddTrack(true)}
                  style={{ padding: "6px 12px", borderRadius: 7, fontSize: 9, fontWeight: 800, background: `${meta.primary}22`, border: `1px solid ${meta.primary}44`, color: meta.primary, cursor: "pointer", letterSpacing: "0.08em" }}>
                  + ADD TRACK
                </button>
                <button onClick={() => setShowShare(true)}
                  style={{ padding: "6px 12px", borderRadius: 7, fontSize: 9, fontWeight: 800, background: "rgba(0,255,255,0.08)", border: "1px solid rgba(0,255,255,0.25)", color: "#00FFFF", cursor: "pointer", letterSpacing: "0.08em" }}>
                  ↗ SHARE
                </button>
                <button onClick={() => setLiked(!liked)}
                  style={{ padding: "6px 12px", borderRadius: 7, fontSize: 9, fontWeight: 800, background: liked ? "rgba(255,45,170,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${liked ? "rgba(255,45,170,0.4)" : "rgba(255,255,255,0.1)"}`, color: liked ? "#FF2DAA" : "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                  {liked ? "♥ LIKED" : "♡ LIKE"}
                </button>
                <button
                  onClick={() => {
                    setAddedLibrary(true);
                    onAddToLibrary?.(artifactId);
                    ActivityTimelineEngine.addEvent({ userId: 'current-user', type: 'MEMORY_SAVED', label: `💾 Saved "${title}" to Library`, xpEarned: 10 });
                  }}
                  style={{ padding: "6px 12px", borderRadius: 7, fontSize: 9, fontWeight: 800, background: addedLibrary ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${addedLibrary ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`, color: addedLibrary ? "#22c55e" : "rgba(255,255,255,0.4)", cursor: "pointer" }}>
                  {addedLibrary ? "✓ SAVED" : "+ LIBRARY"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Points bar */}
      <div style={{ width: "100%", maxWidth: 300, marginTop: 6, background: "rgba(0,0,0,0.5)", borderRadius: 20, overflow: "hidden", border: `1px solid ${meta.primary}22`, display: "flex", alignItems: "center", gap: 8, padding: "4px 10px" }}>
        <span style={{ fontSize: 11 }}>⭐</span>
        <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${Math.min((points / 1000) * 100, 100)}%` }}
            style={{ height: "100%", background: `linear-gradient(90deg, ${meta.primary}, ${meta.accent})`, borderRadius: 3 }}
          />
        </div>
        <span style={{ fontSize: 10, fontWeight: 900, color: meta.primary, minWidth: 44, textAlign: "right" }}>{fmtPoints(points)} pts</span>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showShare && <ShareModal artifactId={artifactId} title={title} primary={meta.primary} onClose={() => setShowShare(false)} />}
        {showAddTrack && <AddTrackForm primary={meta.primary} onAdd={handleAddTrack} onClose={() => setShowAddTrack(false)} />}
      </AnimatePresence>
    </div>
  );
}
