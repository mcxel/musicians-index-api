"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePresenceEngine } from "@/lib/live/presenceEngine";
import { DrawerProvider } from "@/components/room/DrawerContext";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import TieredAdSlot from "@/components/ads/TieredAdSlot";

// ── Types ─────────────────────────────────────────────────────────────────────

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TRACKS: Track[] = [
  { id: 1, title: "Big Moves",        artist: "Chario Ace",  duration: "3:42" },
  { id: 2, title: "Wave Rider",        artist: "BJM",         duration: "4:18" },
  { id: 3, title: "Thunder Zone",      artist: "Big KazhDog", duration: "3:55" },
  { id: 4, title: "Night Frequency",   artist: "Chario Ace",  duration: "5:01" },
  { id: 5, title: "Sound Pressure",    artist: "BJM",         duration: "4:27" },
];

const REACTION_BUTTONS = [
  { emoji: "👍", label: "Thank You" },
  { emoji: "❤️",  label: "Hearts"   },
  { emoji: "✋", label: "Flicker"  },
  { emoji: "🎉", label: "Confetti" },
  { emoji: "⚡", label: "Spark"    },
  { emoji: "🎵", label: "Vibe"     },
];

// ── CSS keyframes injected via <style> ────────────────────────────────────────

const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}
@keyframes pulse {
  0%, 100% { box-shadow: 0 0 8px #E6300088; }
  50%       { box-shadow: 0 0 22px #E63000cc, 0 0 40px #E6300044; }
}
@keyframes flicker {
  0%,100%  { opacity: 1; }
  10%      { opacity: 0.85; }
  20%      { opacity: 1; }
  30%      { opacity: 0.7; }
  40%      { opacity: 1; }
  60%      { opacity: 0.9; }
  80%      { opacity: 0.6; }
  90%      { opacity: 1; }
}
@keyframes ticker {
  0%   { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
@keyframes eqBar {
  0%, 100% { height: 6px;  }
  50%       { height: 22px; }
}
@keyframes floatUp {
  0%   { transform: translateY(0) scale(1);   opacity: 1; }
  100% { transform: translateY(-120px) scale(1.4); opacity: 0; }
}
@keyframes bobble {
  0%, 100% { transform: scale(1) rotate(-2deg); }
  50%       { transform: scale(1.06) rotate(2deg); }
}
@keyframes glow {
  0%, 100% { text-shadow: 0 0 8px #00E5FF88; }
  50%       { text-shadow: 0 0 22px #00E5FFcc, 0 0 40px #00E5FF44; }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes progressAnim {
  from { width: 0%; }
  to   { width: 58%; }
}
@keyframes vuPulse {
  0%   { height: 20%; }
  100% { height: 100%; }
}
@keyframes venueTicker {
  0%   { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}
@keyframes radarSpin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

.tmi-orbitron { font-family: 'Orbitron', monospace !important; }
.tmi-exo      { font-family: 'Exo 2', sans-serif !important; }

.tmi-scroll::-webkit-scrollbar { width: 4px; }
.tmi-scroll::-webkit-scrollbar-track { background: transparent; }
.tmi-scroll::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.3); border-radius: 4px; }
`;

// ── Sub-components ────────────────────────────────────────────────────────────

function Panel({ children, style, glowColor = "#E63000" }: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  glowColor?: string;
}) {
  return (
    <div style={{
      background: "rgba(8,14,38,.95)",
      border: `1px solid ${glowColor}44`,
      borderRadius: 12,
      padding: 14,
      ...style,
    }}>
      {children}
    </div>
  );
}

function EqBars() {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 24 }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 4,
            background: "#00E5FF",
            borderRadius: 2,
            animation: `eqBar ${0.4 + i * 0.08}s ease-in-out infinite`,
            animationDelay: `${i * 0.07}s`,
          }}
        />
      ))}
    </div>
  );
}

function VuMeterBars() {
  const [levels, setLevels] = useState<number[]>(() => Array.from({ length: 16 }, () => 20 + Math.random() * 80));
  useEffect(() => {
    const t = setInterval(() => {
      setLevels(Array.from({ length: 16 }, () => 20 + Math.random() * 80));
    }, 180);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 32 }}>
      {levels.map((h, i) => {
        const pct = h;
        const color = pct > 80 ? "#E63000" : pct > 55 ? "#FFD700" : "#00FF7F";
        return (
          <div
            key={i}
            style={{
              width: 4,
              height: `${pct}%`,
              background: color,
              borderRadius: "2px 2px 0 0",
              transition: "height 0.15s ease",
              boxShadow: pct > 80 ? `0 0 4px ${color}` : "none",
            }}
          />
        );
      })}
    </div>
  );
}

function SidebarAd() {
  return (
    <div style={{
      background: "rgba(12,20,50,.9)",
      border: "1px solid rgba(255,107,0,0.3)",
      borderRadius: 8,
      padding: 10,
      textAlign: "center",
      marginTop: 8,
    }}>
      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", marginBottom: 6 }}>SPONSORED</div>
      <div style={{ fontSize: 10, color: "#FF6B00", fontWeight: 700, marginBottom: 4 }}>TMI PRO</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Remove ads + unlock all skins</div>
      <a href="/upgrade" style={{
        display: "block", padding: "6px 0",
        background: "linear-gradient(135deg, #FF6B00, #FF8C00)",
        color: "#000", borderRadius: 6, fontSize: 9, fontWeight: 800,
        textDecoration: "none", letterSpacing: "0.08em",
      }}>UPGRADE NOW</a>
    </div>
  );
}

function ActionDockAd() {
  return (
    <div style={{
      background: "rgba(12,20,50,.9)",
      border: "1px solid rgba(255,107,0,0.25)",
      borderRadius: 8,
      padding: "8px 12px",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <div style={{ fontSize: 18 }}>📢</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, color: "#FF6B00", fontWeight: 700 }}>AD — Go Pro</div>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.4)" }}>No ads, all skins, more PunPoints</div>
      </div>
      <a href="/upgrade" style={{
        padding: "5px 10px", background: "#FF6B00", color: "#000",
        borderRadius: 6, fontSize: 8, fontWeight: 800, textDecoration: "none",
      }}>→</a>
    </div>
  );
}

// ── Main inner component (needs DrawerProvider in parent) ─────────────────────

function FanTheaterInner() {
  const presence = usePresenceEngine("fan-theater");

  // Reactions state
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const reactionCounter = useRef(0);

  // Playlist state
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [shuffleOn, setShuffleOn] = useState(false);
  const [loopOn, setLoopOn] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);

  // Chat input
  const [chatMsg, setChatMsg] = useState("");

  // New fan arrival toast
  const [arrivalName, setArrivalName] = useState<string | null>(null);
  const arrivalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Progress ticker
  useEffect(() => {
    if (!isPlaying) return;
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { setCurrentTrack((c) => (c + 1) % TRACKS.length); return 0; }
        return p + 0.3;
      });
    }, 300);
    return () => clearInterval(t);
  }, [isPlaying]);

  // Watch joinedRecently for arrival toast
  useEffect(() => {
    const name = presence.joinedRecently[0];
    if (!name) return;
    setArrivalName(name);
    if (arrivalTimer.current) clearTimeout(arrivalTimer.current);
    arrivalTimer.current = setTimeout(() => setArrivalName(null), 3000);
  }, [presence.joinedRecently]);

  function fireReaction(emoji: string) {
    const id = ++reactionCounter.current;
    const x = 20 + Math.random() * 60; // percent across marquee
    setReactions((prev) => [...prev, { id, emoji, x }]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 1400);
  }

  function sendChat(e: React.FormEvent) {
    e.preventDefault();
    setChatMsg("");
  }

  function prevTrack() {
    setCurrentTrack((c) => (c - 1 + TRACKS.length) % TRACKS.length);
    setProgress(0);
  }

  function nextTrack() {
    setCurrentTrack((c) => (c + 1) % TRACKS.length);
    setProgress(0);
  }

  const track = TRACKS[currentTrack]!;
  const progressPct = `${progress.toFixed(1)}%`;
  const elapsed = Math.floor((progress / 100) * 222); // assume ~3:42 = 222s
  const elapsedStr = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div
      className="tmi-exo"
      style={{
        minHeight: "100vh",
        background: "#050815",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* ActionCanister (fixed left) */}
      <ActionCanister actions={[
        { id: "messages",      label: "Messages",    icon: "💬" },
        { id: "notifications", label: "Alerts",      icon: "🔔" },
        { id: "friends",       label: "Friends",     icon: "👥" },
        { id: "groups",        label: "Groups",      icon: "🏠" },
        { id: "video-calls",   label: "Video",       icon: "📹" },
        { id: "inventory",     label: "Artifacts",   icon: "💎" },
        { id: "bookings",      label: "Bookings",    icon: "📅" },
      ]} />

      {/* WidgetDrawer (slides in from right) */}
      <WidgetDrawer />

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "12px 20px",
        background: "rgba(8,14,38,.95)",
        borderBottom: "1px solid rgba(230,48,0,0.25)",
      }}>
        <div
          className="tmi-orbitron"
          style={{
            fontSize: 16, fontWeight: 900, color: "#E63000",
            letterSpacing: "0.12em",
            animation: "flicker 4s infinite",
          }}
        >
          FAN DASHBOARD ☠
        </div>

        <div style={{ flex: 1 }} />

        <a
          href="/fan/trivia"
          style={{
            padding: "7px 16px", borderRadius: 7,
            background: "rgba(255,107,0,0.15)",
            border: "1px solid #FF6B0066",
            color: "#FF6B00", fontSize: 10, fontWeight: 800,
            textDecoration: "none", letterSpacing: "0.1em",
          }}
        >
          TRIVIA
        </a>

        <a
          href="/upgrade"
          style={{
            padding: "7px 16px", borderRadius: 7,
            background: "linear-gradient(135deg, #FF8C00, #FFD700)",
            color: "#000", fontSize: 10, fontWeight: 800,
            textDecoration: "none", letterSpacing: "0.1em",
          }}
        >
          UPGRADED
        </a>
      </div>

      {/* ── TICKER ─────────────────────────────────────────── */}
      <div style={{
        background: "rgba(230,48,0,0.08)",
        borderBottom: "1px solid rgba(230,48,0,0.15)",
        padding: "5px 0", overflow: "hidden",
      }}>
        <div style={{
          whiteSpace: "nowrap",
          animation: "ticker 28s linear infinite",
          fontSize: 9, color: "#FF6B00", letterSpacing: "0.12em", fontWeight: 700,
        }}>
          🔴 LIVE NOW — Chario Ace on Monday Stage &nbsp;|&nbsp; 🎵 New Drop: Wave Rider by BJM &nbsp;|&nbsp;
          ⚡ Billboard Fans: 38.5K watching &nbsp;|&nbsp; 🏆 Top PunPoints this week: NightOwl42 — 4,820 pts &nbsp;|&nbsp;
          🎉 Dirty Dozens — Battle Arena open &nbsp;|&nbsp; 📢 Upgrade to TMI Pro — No ads + all skins
        </div>
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────── */}
      <div style={{
        flex: 1,
        display: "grid",
        gridTemplateColumns: "1fr 170px",
        gap: 14,
        padding: "16px 20px",
      }}>

        {/* ─── LEFT COLUMN ─────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Artist Spotlight */}
          <Panel glowColor="#FFD700">
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{
                width: 54, height: 54, borderRadius: "50%",
                background: "linear-gradient(135deg, #FFD70033, #FF8C0022)",
                border: "2px solid #FFD70066",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, animation: "bobble 3s ease-in-out infinite",
              }}>
                🎤
              </div>
              <div style={{ flex: 1 }}>
                <div className="tmi-orbitron" style={{ fontSize: 14, fontWeight: 900, color: "#FFD700" }}>
                  Chario Ace
                </div>
                <div style={{ fontSize: 10, color: "#E63000", fontWeight: 700, marginTop: 2 }}>
                  Hip-Hop / R&amp;B
                </div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                  Next Show: <span style={{ color: "#00FF7F" }}>Tonight 9PM EST</span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="tmi-orbitron" style={{ fontSize: 18, fontWeight: 900, color: "#00E5FF", animation: "glow 2s infinite" }}>
                  {presence.watching.toLocaleString()}
                </div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em" }}>VIEWERS</div>

                {/* Arrival toast */}
                <AnimatePresence>
                  {arrivalName && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      style={{ fontSize: 9, color: "#00FF7F", marginTop: 4 }}
                    >
                      +{arrivalName}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button style={{
                flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 10, fontWeight: 800,
                background: "rgba(255,215,0,0.15)", border: "1px solid #FFD70066",
                color: "#FFD700", cursor: "pointer", letterSpacing: "0.08em",
              }}>
                🎵 SPIN
              </button>
              <button style={{
                flex: 1, padding: "8px 0", borderRadius: 7, fontSize: 10, fontWeight: 800,
                background: "rgba(230,48,0,0.15)", border: "1px solid #E6300066",
                color: "#E63000", cursor: "pointer", letterSpacing: "0.08em",
              }}>
                👍 VOTE
              </button>
            </div>
          </Panel>

          {/* Marquee Screen (stage) */}
          <div style={{
            height: 180, borderRadius: 12, overflow: "hidden", position: "relative",
            background: "linear-gradient(135deg, #0a001a 0%, #020210 100%)",
            border: "2px solid #E63000",
            animation: "pulse 2.5s infinite",
          }}>
            {/* LED strip across top */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 3, zIndex: 6,
              background: "linear-gradient(90deg, #E63000, #FFD700, #00E5FF, #FF2DAA, #00FF7F)",
              boxShadow: "0 0 12px rgba(0,229,255,0.6)",
            }} />

            {/* Stage lighting bars — cyan, gold, fuchsia */}
            {([
              { color: "#00E5FF", angle: -25, left: "30%" },
              { color: "#FFD700", angle: 0,   left: "50%" },
              { color: "#FF2DAA", angle: 25,  left: "70%" },
            ] as { color: string; angle: number; left: string }[]).map((sl, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.15, 0.25, 0.15] }}
                transition={{ repeat: Infinity, duration: 3 + i * 0.9, ease: "easeInOut" }}
                style={{
                  position: "absolute", top: 0, left: sl.left,
                  width: 3, height: "60%",
                  background: `linear-gradient(180deg, ${sl.color}55, transparent)`,
                  transformOrigin: "top center",
                  transform: `translateX(-50%) rotate(${sl.angle}deg)`,
                  zIndex: 2,
                }}
              />
            ))}

            {/* Center content */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 6,
              zIndex: 3,
            }}>
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                style={{ fontSize: 40 }}
              >
                🎤
              </motion.div>
              <div className="tmi-orbitron" style={{
                fontSize: 9, color: "#E63000", fontWeight: 900,
                letterSpacing: "0.2em", animation: "blink 1.2s infinite",
              }}>
                ● LIVE NOW
              </div>
            </div>

            {/* Crowd silhouettes — 12 alternating heights with bobble */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
              background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.85))",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              gap: 3, paddingBottom: 2, zIndex: 4,
            }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 0,
                  animation: `bobble ${1.8 + (i % 3) * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.12}s`,
                }}>
                  {/* Head */}
                  <div style={{
                    width: i % 2 === 0 ? 7 : 9,
                    height: i % 2 === 0 ? 7 : 9,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.7)",
                    marginBottom: 1,
                  }} />
                  {/* Shoulders */}
                  <div style={{
                    width: i % 2 === 0 ? 14 : 18,
                    height: i % 2 === 0 ? 10 : 13,
                    borderRadius: "50% 50% 0 0",
                    background: "rgba(0,0,0,0.7)",
                  }} />
                </div>
              ))}
            </div>

            {/* CRT scanline overlay */}
            <div style={{
              position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
              background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
              boxShadow: "inset 0 0 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)",
            }} />

            {/* Floating reactions */}
            {reactions.map((r) => (
              <div
                key={r.id}
                style={{
                  position: "absolute",
                  bottom: 40,
                  left: `${r.x}%`,
                  fontSize: 22,
                  pointerEvents: "none",
                  animation: "floatUp 1.3s ease-out forwards",
                  zIndex: 6,
                }}
              >
                {r.emoji}
              </div>
            ))}
          </div>

          {/* Action Dock */}
          <Panel glowColor="#00E5FF" style={{ padding: 12 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
              {REACTION_BUTTONS.map(({ emoji, label }) => (
                <motion.button
                  key={label}
                  whileTap={{ scale: 1.35 }}
                  onClick={() => fireReaction(emoji)}
                  title={label}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 2, padding: "8px 10px", borderRadius: 8,
                    background: "rgba(0,229,255,0.08)", border: "1px solid rgba(0,229,255,0.2)",
                    cursor: "pointer", color: "#fff",
                    flex: "1 1 auto",
                  }}
                >
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)", letterSpacing: "0.06em" }}>{label.toUpperCase()}</span>
                </motion.button>
              ))}
            </div>
            <TieredAdSlot tier="free" placement="fan-theater-action-dock" height={54} />
          </Panel>

          {/* Chat Input */}
          <form onSubmit={sendChat} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={chatMsg}
              onChange={(e) => setChatMsg(e.target.value)}
              placeholder="Say something to the crowd..."
              style={{
                flex: 1, padding: "10px 14px",
                background: "rgba(8,14,38,.95)",
                border: "1px solid rgba(0,229,255,0.25)",
                borderRadius: 8, color: "#fff", fontSize: 11,
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 16px", borderRadius: 8,
                background: "linear-gradient(135deg, #E63000, #FF6B00)",
                border: "none", color: "#fff", fontWeight: 800,
                fontSize: 11, cursor: "pointer", letterSpacing: "0.06em",
              }}
            >
              SEND
            </button>
          </form>

          {/* Ad slot — shown to free users between content sections */}
          <TieredAdSlot tier="free" placement="fan-theater-in-content" height={72} />

          {/* Fan Analytics */}
          <Panel glowColor="#00E5FF">
            <div className="tmi-orbitron" style={{ fontSize: 10, fontWeight: 900, color: "#00E5FF", letterSpacing: "0.14em", marginBottom: 10 }}>
              FAN ANALYTICS
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              {[
                { label: "Watch Time", value: "4h 22m", color: "#00E5FF" },
                { label: "Tips Sent",  value: "$12.00",  color: "#FFD700" },
                { label: "Following",  value: "14",       color: "#00FF7F" },
              ].map((s) => (
                <div key={s.label} style={{
                  flex: 1, textAlign: "center",
                  padding: "8px 4px", borderRadius: 8,
                  background: "rgba(12,20,50,.9)",
                  border: `1px solid ${s.color}33`,
                }}>
                  <div className="tmi-orbitron" style={{ fontSize: 13, fontWeight: 900, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", marginTop: 2 }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
            {/* Mini bar chart */}
            <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 36 }}>
              {[55, 80, 40, 100, 65, 90, 70].map((h, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ delay: i * 0.06, duration: 0.5 }}
                  style={{
                    flex: 1, borderRadius: "3px 3px 0 0",
                    background: `linear-gradient(180deg, #00E5FF, #00E5FF44)`,
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 8, color: "rgba(255,255,255,0.25)" }}>{d}</span>
              ))}
            </div>
          </Panel>
        </div>

        {/* ─── RIGHT COLUMN (170px) ─────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Cosmetic Shop */}
          <Panel glowColor="#FF6B00" style={{ padding: 10 }}>
            <div className="tmi-orbitron" style={{ fontSize: 8, fontWeight: 900, color: "#FF6B00", letterSpacing: "0.12em", marginBottom: 8 }}>
              COSMETIC SHOP
            </div>
            {[
              { icon: "🔴", label: "DEFAULT",  badge: "FREE", color: "#00FF7F" },
              { icon: "💧", label: "RAF SKIN",  badge: "RAF",  color: "#00E5FF" },
              { icon: "⭕", label: "EPIC SKIN", badge: "EPIC", color: "#FF6B00" },
            ].map((s) => (
              <button
                key={s.label}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  width: "100%", padding: "7px 8px", borderRadius: 7,
                  background: "rgba(12,20,50,.9)", border: `1px solid ${s.color}44`,
                  color: "#fff", cursor: "pointer", marginBottom: 5, textAlign: "left",
                }}
              >
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <span style={{ flex: 1, fontSize: 8, fontWeight: 700, letterSpacing: "0.06em" }}>{s.label}</span>
                <span style={{ fontSize: 7, color: s.color, fontWeight: 800 }}>{s.badge}</span>
              </button>
            ))}
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 4, textAlign: "center" }}>
              <a href="/upgrade" style={{ color: "#FF6B00", textDecoration: "none" }}>Unlock all skins →</a>
            </div>
          </Panel>

          {/* Billboard Fans */}
          <Panel glowColor="#FFD700" style={{ padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 4 }}>BILLBOARD FANS</div>
            <div className="tmi-orbitron" style={{ fontSize: 20, fontWeight: 900, color: "#FFD700", animation: "glow 2s infinite" }}>
              38.5K
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>Chario Ace</div>
            <motion.div
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.4 }}
              style={{ width: 6, height: 6, borderRadius: "50%", background: "#E63000", margin: "6px auto 0" }}
            />
          </Panel>

          {/* PunPoints */}
          <Panel glowColor="#FF8C00" style={{ padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", marginBottom: 6 }}>PUNPOINTS</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 4 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} style={{ fontSize: i <= 3 ? 14 : 10, color: i <= 3 ? "#FFD700" : "rgba(255,255,255,0.2)" }}>★</span>
              ))}
            </div>
            <div className="tmi-orbitron" style={{ fontSize: 16, fontWeight: 900, color: "#FF8C00" }}>1,240</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>pts this week</div>
            <a href="/upgrade" style={{
              display: "block", marginTop: 8, padding: "6px 0",
              background: "rgba(255,140,0,0.2)", border: "1px solid #FF8C0066",
              color: "#FF8C00", borderRadius: 6, fontSize: 8, fontWeight: 800,
              textDecoration: "none", letterSpacing: "0.08em",
            }}>
              UPGRADE →
            </a>
          </Panel>

          {/* Memory Wall */}
          <Panel glowColor="#AA2DFF" style={{ padding: 10 }}>
            <div className="tmi-orbitron" style={{ fontSize: 8, fontWeight: 900, color: "#AA2DFF", letterSpacing: "0.1em", marginBottom: 8 }}>
              MEMORY WALL
            </div>
            {["🎬 Videos", "🎵 Audio", "🖼️ Images"].map((item) => (
              <a
                key={item}
                href="/fan/memories"
                style={{
                  display: "block", padding: "6px 8px", marginBottom: 4,
                  background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.2)",
                  borderRadius: 6, fontSize: 9, color: "rgba(255,255,255,0.7)",
                  textDecoration: "none", fontWeight: 600,
                }}
              >
                {item}
              </a>
            ))}
          </Panel>

          {/* Tier-aware ad slot */}
          <TieredAdSlot tier="free" placement="fan-theater-sidebar" height={100} />
        </div>
      </div>

      {/* ── VENUE TICKER (fixed bottom) ──────────────────── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
        background: "rgba(0,0,0,0.9)",
        borderTop: "1px solid #E63000",
        height: 22,
        overflow: "hidden",
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          whiteSpace: "nowrap",
          fontSize: 9, color: "#FF6B00", letterSpacing: "0.12em", fontWeight: 700,
          animation: "venueTicker 32s linear infinite",
        }}>
          🔴 FAN THEATER LIVE &nbsp;·&nbsp; 4,200 WATCHING &nbsp;·&nbsp; CHARIO ACE ON STAGE &nbsp;·&nbsp; TIPS: $312 TODAY &nbsp;·&nbsp; VIP SEATS AVAILABLE &nbsp;·&nbsp; NEXT SHOW: 9PM EST &nbsp;·&nbsp; 🔴 FAN THEATER LIVE &nbsp;·&nbsp; 4,200 WATCHING &nbsp;·&nbsp; CHARIO ACE ON STAGE &nbsp;·&nbsp; TIPS: $312 TODAY &nbsp;·&nbsp; VIP SEATS AVAILABLE &nbsp;·&nbsp; NEXT SHOW: 9PM EST &nbsp;·&nbsp;
        </div>
      </div>

      {/* ── PLAYLIST ENGINE (full width) ─────────────────── */}
      <div style={{ padding: "0 20px 20px" }}>
        <div style={{
          background: "rgba(8,14,38,.95)",
          border: "2px solid #00E5FF",
          borderRadius: 14,
          boxShadow: "0 0 28px rgba(0,229,255,0.25)",
          padding: 16,
        }}>
          {/* Engine header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div className="tmi-orbitron" style={{ fontSize: 12, fontWeight: 900, color: "#00E5FF", letterSpacing: "0.14em", animation: "glow 2s infinite" }}>
              🎵 PLAYLIST ENGINE
            </div>
            <div style={{
              padding: "3px 8px", borderRadius: 4,
              background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.3)",
              fontSize: 8, color: "#00E5FF", fontWeight: 800, letterSpacing: "0.1em",
            }}>
              SUBMARINE SKIN v1
            </div>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setShuffleOn((s) => !s)}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 9, fontWeight: 800,
                background: shuffleOn ? "rgba(0,229,255,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${shuffleOn ? "#00E5FF66" : "rgba(255,255,255,0.1)"}`,
                color: shuffleOn ? "#00E5FF" : "rgba(255,255,255,0.4)",
                cursor: "pointer", letterSpacing: "0.08em",
              }}
            >
              ⇄ SHUFFLE
            </button>
            <button
              onClick={() => setLoopOn((l) => !l)}
              style={{
                padding: "5px 12px", borderRadius: 6, fontSize: 9, fontWeight: 800,
                background: loopOn ? "rgba(0,229,255,0.2)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${loopOn ? "#00E5FF66" : "rgba(255,255,255,0.1)"}`,
                color: loopOn ? "#00E5FF" : "rgba(255,255,255,0.4)",
                cursor: "pointer", letterSpacing: "0.08em",
              }}
            >
              ↻ LOOP
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 1fr", gap: 16, alignItems: "start" }}>
            {/* Spinning CD */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #1a2a4a, #050815)",
              border: "3px solid #00E5FF",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
              animation: isPlaying ? "spin 4s linear infinite" : "none",
              boxShadow: "0 0 16px rgba(0,229,255,0.4)",
              flexShrink: 0,
            }}>
              💿
            </div>

            {/* Now playing */}
            <div>
              <div className="tmi-orbitron" style={{ fontSize: 13, fontWeight: 900, color: "#00E5FF", marginBottom: 2 }}>
                {track.title}
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
                {track.artist}
              </div>

              {/* EQ bars + VU meters */}
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end", marginBottom: 10 }}>
                {isPlaying ? <EqBars /> : (
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>⏸ Paused</div>
                )}
                {isPlaying && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}>VU</div>
                    <VuMeterBars />
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div style={{ marginBottom: 6 }}>
                <div style={{
                  height: 4, borderRadius: 2,
                  background: "rgba(255,255,255,0.1)",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, left: 0, bottom: 0,
                    width: progressPct,
                    background: "linear-gradient(90deg, #00E5FF, #00FF7F)",
                    borderRadius: 2, transition: "width 0.3s linear",
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{elapsedStr}</span>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{track.duration}</span>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <button onClick={prevTrack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 18, cursor: "pointer", padding: 0 }}>⏮</button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPlaying((p) => !p)}
                  style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "linear-gradient(135deg, #00E5FF, #00FF7F)",
                    border: "none", color: "#000", fontSize: 14,
                    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 900,
                  }}
                >
                  {isPlaying ? "⏸" : "▶"}
                </motion.button>
                <button onClick={nextTrack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 18, cursor: "pointer", padding: 0 }}>⏭</button>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, marginLeft: 6 }}>
                  <span style={{ fontSize: 10 }}>🔊</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    style={{ flex: 1, accentColor: "#00E5FF", height: 3 }}
                  />
                </div>
              </div>
            </div>

            {/* Track list */}
            <div
              className="tmi-scroll"
              style={{ maxHeight: 140, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}
            >
              {TRACKS.map((t, i) => (
                <button
                  key={t.id}
                  onClick={() => { setCurrentTrack(i); setProgress(0); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 10px", borderRadius: 7,
                    background: i === currentTrack ? "rgba(0,229,255,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${i === currentTrack ? "rgba(0,229,255,0.35)" : "rgba(255,255,255,0.07)"}`,
                    cursor: "pointer", textAlign: "left", width: "100%",
                  }}
                >
                  <span style={{ fontSize: 10, color: i === currentTrack ? "#00E5FF" : "rgba(255,255,255,0.25)", fontWeight: 700, minWidth: 14 }}>
                    {i === currentTrack && isPlaying ? "▶" : `${i + 1}`}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: i === currentTrack ? "#fff" : "rgba(255,255,255,0.6)" }}>{t.title}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{t.artist}</div>
                  </div>
                  <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{t.duration}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page export ───────────────────────────────────────────────────────────────

export default function FanTheaterPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <DrawerProvider>
        <FanTheaterInner />
      </DrawerProvider>
    </>
  );
}
