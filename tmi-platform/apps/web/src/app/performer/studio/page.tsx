"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePresenceEngine } from "@/lib/live/presenceEngine";
import ActionCanister from "@/components/room/ActionCanister";
import WidgetDrawer from "@/components/room/WidgetDrawer";
import { DrawerProvider } from "@/components/room/DrawerContext";
import WebRTCBroadcast from "@/components/media/WebRTCBroadcast";

// ── Color tokens (matches reference design) ────────────────────────────────────
const C = {
  bg:      "#050815",
  panel:   "rgba(8,14,38,.95)",
  card:    "rgba(12,20,50,.9)",
  red:     "#E63000",
  orange:  "#FF6B00",
  amber:   "#FF8C00",
  gold:    "#FFD700",
  green:   "#00FF7F",
  cyan:    "#00E5FF",
  white:   "#FFFFFF",
  muted:   "rgba(255,255,255,0.45)",
  dimmer:  "rgba(255,255,255,0.2)",
} as const;

// ── Google Fonts injection ─────────────────────────────────────────────────────
const FONT_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700;900&display=swap');
  * { box-sizing: border-box; }
  body { background: ${C.bg}; }
  .orbitron { font-family: 'Orbitron', monospace; }
  .exo2     { font-family: 'Exo 2', sans-serif; }
  @keyframes flicker {
    0%,100% { opacity:1; } 7% { opacity:.85; } 14% { opacity:1; } 28% { opacity:.9; } 56% { opacity:1; } 70% { opacity:.88; }
  }
  @keyframes pulse-red {
    0%,100% { box-shadow: 0 0 0 0 rgba(230,48,0,.0); }
    50%      { box-shadow: 0 0 0 8px rgba(230,48,0,.35); }
  }
  @keyframes marquee {
    0%   { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  @keyframes float-up {
    0%   { transform: translateY(0) scale(1);   opacity: 1; }
    100% { transform: translateY(-90px) scale(1.6); opacity: 0; }
  }
  @keyframes ledBlink {
    0%,100% { opacity: 1; }
    50%     { opacity: 0.25; }
  }
  .flicker    { animation: flicker 4s linear infinite; }
  .pulse-red  { animation: pulse-red 1.6s ease-in-out infinite; }
  .float-react { animation: float-up 1.8s ease-out forwards; }
`;

// ── Types & seed data ──────────────────────────────────────────────────────────
type LicenseType = "Lease" | "Premium" | "Exclusive";
interface Beat {
  id: number;
  title: string;
  genre: string;
  bpm: number;
  price: number;
  license: LicenseType;
  market: boolean;
}
const SEED_BEATS: Beat[] = [
  { id: 1, title: "Midnight Cipher",  genre: "Trap",      bpm: 140, price: 29,  license: "Lease",     market: true  },
  { id: 2, title: "Gold Rush",        genre: "Hip-Hop",   bpm: 92,  price: 49,  license: "Premium",   market: true  },
  { id: 3, title: "Neon District",    genre: "R&B",       bpm: 85,  price: 79,  license: "Exclusive", market: false },
  { id: 4, title: "Stellar Bounce",   genre: "Pop/Trap",  bpm: 118, price: 39,  license: "Lease",     market: true  },
  { id: 5, title: "Dark Matter",      genre: "Drill",     bpm: 145, price: 99,  license: "Premium",   market: false },
];

const LOBBY_FANS = [
  { name: "JamesSky",  tier: "Gold",    emoji: "🥇" },
  { name: "Lily88",    tier: "Silver",  emoji: "🥈" },
  { name: "Alex94",    tier: "Diamond", emoji: "💎" },
  { name: "NovaFan",   tier: "Bronze",  emoji: "🥉" },
];

const SET_LIST = [
  "Midnight Cipher", "Gold Rush", "Neon District", "Stellar Bounce", "Dark Matter",
];

type Tab = "BROADCAST" | "BEAT LOCKER" | "ANALYTICS" | "SCHEDULE" | "SETTINGS";
const TABS: Tab[] = ["BROADCAST", "BEAT LOCKER", "ANALYTICS", "SCHEDULE", "SETTINGS"];

// ── Hardware Rack Panel ────────────────────────────────────────────────────────
function HardwareRack() {
  const UNITS = [
    "AUDIO INTERFACE",
    "STREAM ENCODER",
    "PATCH BAY",
    "POWER DIST",
  ];
  return (
    <div style={{
      background: "#080e1a",
      border: "1px solid rgba(0,229,255,0.2)",
      borderRadius: 6,
      padding: "6px 8px",
      marginTop: 8,
    }}>
      <div className="orbitron" style={{ fontSize: 7, color: C.cyan, letterSpacing: "0.12em", marginBottom: 6 }}>EQUIPMENT RACK</div>
      {UNITS.map((unit, i) => (
        <div key={unit} style={{
          height: 44,
          borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", gap: 8,
          paddingLeft: 4,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: C.green,
            boxShadow: `0 0 5px ${C.green}`,
            animation: `ledBlink ${1.2 + i * 0.3}s ease-in-out infinite`,
            flexShrink: 0,
          }} />
          <span className="orbitron" style={{ fontSize: 7, color: C.muted, letterSpacing: "0.08em" }}>{unit}</span>
        </div>
      ))}
    </div>
  );
}

// ── VU Meter (L/R) ─────────────────────────────────────────────────────────────
function LiveVuMeter() {
  const [levels, setLevels] = useState<[number[], number[]]>([
    Array.from({ length: 10 }, () => Math.random()),
    Array.from({ length: 10 }, () => Math.random()),
  ]);
  useEffect(() => {
    const t = setInterval(() => {
      setLevels([
        Array.from({ length: 10 }, () => Math.random()),
        Array.from({ length: 10 }, () => Math.random()),
      ]);
    }, 150);
    return () => clearInterval(t);
  }, []);

  function MeterCol({ vals }: { vals: number[] }) {
    return (
      <div style={{ display: "flex", flexDirection: "column-reverse", gap: 1, width: 10 }}>
        {vals.map((v, i) => {
          const lit = v * 10 > (9 - i);
          const segColor = i >= 8 ? C.red : i >= 6 ? C.gold : C.green;
          return (
            <div key={i} style={{
              height: 6, borderRadius: 1,
              background: lit ? segColor : "rgba(255,255,255,0.07)",
              boxShadow: lit && i >= 8 ? `0 0 4px ${segColor}` : "none",
              transition: "background 0.12s",
            }} />
          );
        })}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ fontSize: 7, color: C.muted, letterSpacing: "0.1em" }} className="orbitron">AUDIO</div>
      <div style={{ display: "flex", gap: 3 }}>
        <MeterCol vals={levels[0]} />
        <MeterCol vals={levels[1]} />
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        <span style={{ fontSize: 6, color: C.dimmer, width: 10, textAlign: "center" }}>L</span>
        <span style={{ fontSize: 6, color: C.dimmer, width: 10, textAlign: "center" }}>R</span>
      </div>
    </div>
  );
}

// ── Broadcast Timestamp ────────────────────────────────────────────────────────
function BroadcastTimestamp() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const ts = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });
  return (
    <span style={{
      fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.6)",
      position: "absolute", bottom: 8, left: 8,
      background: "rgba(0,0,0,0.4)", padding: "2px 4px", borderRadius: 2,
    }}>
      {date} {ts}
    </span>
  );
}

// ── Signal Strength Bars ───────────────────────────────────────────────────────
function SignalBars({ isLive }: { isLive: boolean }) {
  const bars = [3, 5, 7, 10, 13];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: 4, height: h,
          background: isLive ? C.green : "rgba(255,255,255,0.15)",
          borderRadius: 1,
          boxShadow: isLive ? `0 0 4px ${C.green}` : "none",
          transition: "background 0.3s",
        }} />
      ))}
      <span className="orbitron" style={{
        fontSize: 7, marginLeft: 4,
        color: isLive ? C.green : C.muted,
        letterSpacing: "0.08em",
      }}>
        {isLive ? "SIGNAL STRONG" : "NO SIGNAL"}
      </span>
    </div>
  );
}

// ── Reaction float overlay ─────────────────────────────────────────────────────
interface FloatReaction { id: number; emoji: string; x: number; }

function ReactionFloater({ reactions }: { reactions: FloatReaction[] }) {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {reactions.map(r => (
        <span
          key={r.id}
          className="float-react"
          style={{ position: "absolute", bottom: 20, left: `${r.x}%`, fontSize: 22, userSelect: "none" }}
        >
          {r.emoji}
        </span>
      ))}
    </div>
  );
}

// ── Countdown timer ────────────────────────────────────────────────────────────
function Countdown() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, "0");
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, "0");
  const s = String(secs % 60).padStart(2, "0");
  return (
    <span className="orbitron" style={{ fontSize: 22, color: C.gold, fontWeight: 900, letterSpacing: "0.12em" }}>
      {h}:{m}:{s}
    </span>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${color}44`, borderRadius: 10,
      padding: "10px 12px", textAlign: "center",
    }}>
      <div className="orbitron" style={{ fontSize: 18, fontWeight: 900, color }}>{value}</div>
      <div className="exo2" style={{ fontSize: 9, color: C.muted, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Live Mode Panel ────────────────────────────────────────────────────────────
function LiveModePanel({
  presence,
  reactions,
  onReact,
}: {
  presence: ReturnType<typeof usePresenceEngine>;
  reactions: FloatReaction[];
  onReact: (emoji: string) => void;
}) {
  const ACTIONS = [
    { emoji: "👍", label: "Thanks" },
    { emoji: "❤️",  label: "Hearts" },
    { emoji: "💡", label: "Flicker" },
    { emoji: "🎉", label: "Confetti" },
    { emoji: "⚡", label: "Spark" },
  ];
  const TIPS = [
    { name: "JamesSky", amount: "$20" },
    { name: "Lily88",   amount: "$15" },
    { name: "Alex94",   amount: "$10" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Marquee screen */}
      <div
        className="pulse-red"
        style={{
          height: 180, borderRadius: 12, overflow: "hidden", position: "relative",
          background: "radial-gradient(ellipse at bottom, #1a0a28 0%, #050815 70%)",
          border: `2px solid ${C.red}`,
        }}
      >
        {/* Audience silhouettes */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, display: "flex", alignItems: "flex-end", justifyContent: "space-around", opacity: 0.35 }}>
          {["👤","👤","👥","👤","👤","👥","👤","👤"].map((s, i) => (
            <span key={i} style={{ fontSize: 24 }}>{s}</span>
          ))}
        </div>
        {/* Scrolling marquee */}
        <div style={{ position: "absolute", top: 12, left: 0, right: 0, overflow: "hidden", whiteSpace: "nowrap" }}>
          <div
            className="orbitron"
            style={{
              display: "inline-block",
              animation: "marquee 12s linear infinite",
              fontSize: 10, color: C.cyan, letterSpacing: "0.18em", fontWeight: 700,
            }}
          >
            ♪ NOW PERFORMING LIVE ♪ THE MUSICIANS INDEX ♪ WELCOME TO THE SHOW ♪ NOW PERFORMING LIVE ♪ THE MUSICIANS INDEX ♪ WELCOME TO THE SHOW ♪&nbsp;
          </div>
        </div>
        {/* ON AIR badge */}
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: C.red, borderRadius: 6, padding: "3px 8px",
          fontSize: 9, fontWeight: 900, color: C.white, letterSpacing: "0.15em",
        }} className="orbitron flicker">
          ● ON AIR
        </div>
        {/* Broadcast timestamp burn-in */}
        <BroadcastTimestamp />
        {/* CRT scanline overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
          boxShadow: "inset 0 0 40px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)",
        }} />
        <ReactionFloater reactions={reactions} />
      </div>

      {/* Action dock */}
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        {ACTIONS.map(a => (
          <button
            key={a.label}
            onClick={() => onReact(a.emoji)}
            title={a.label}
            style={{
              flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 11,
              background: C.card, border: `1px solid rgba(255,255,255,0.12)`,
              color: C.white, cursor: "pointer", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 2,
            }}
          >
            <span style={{ fontSize: 16 }}>{a.emoji}</span>
            <span className="exo2" style={{ fontSize: 8, color: C.muted }}>{a.label}</span>
          </button>
        ))}
        <div style={{
          flex: 1, padding: "6px 0", borderRadius: 8, fontSize: 8, fontWeight: 900,
          background: `${C.orange}22`, border: `1px solid ${C.orange}55`,
          color: C.orange, textAlign: "center", letterSpacing: "0.1em",
        }} className="orbitron">
          AD SLOT
        </div>
      </div>

      {/* Tips + Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: C.card, border: `1px solid ${C.gold}33`, borderRadius: 10, padding: 12 }}>
          <div className="orbitron" style={{ fontSize: 9, color: C.gold, letterSpacing: "0.14em", marginBottom: 8 }}>LIVE TIPS</div>
          {TIPS.map(t => (
            <div key={t.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 6 }}>
              <span className="exo2" style={{ color: C.muted }}>{t.name}</span>
              <span className="orbitron" style={{ color: C.green, fontWeight: 700 }}>+{t.amount}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <StatCard label="VIEWERS" value={presence.watching} color={C.cyan} />
            </div>
            <LiveVuMeter />
          </div>
          <StatCard label="TIPS"    value="$45"              color={C.green} />
          <StatCard label="RATING"  value="4.9★"             color={C.gold} />
        </div>
      </div>
    </div>
  );
}

// ── Green Room (Private Mode) ──────────────────────────────────────────────────
function GreenRoomPanel({ onStartShow }: { onStartShow: () => void }) {
  const [checked, setChecked] = useState<boolean[]>(SET_LIST.map(() => false));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.cyan}33`, borderRadius: 14, padding: 16 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div className="orbitron" style={{ fontSize: 11, color: C.cyan, letterSpacing: "0.12em" }}>
            🟢 PRIVATE LOBBY — GREEN ROOM
          </div>
          <div className="exo2" style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>
            Your pre-show waiting area. Fans can&apos;t see you yet.
          </div>
        </div>
        <Countdown />
      </div>

      <div style={{ height: 1, background: `${C.cyan}22`, margin: "12px 0" }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {/* Fans waiting */}
        <div>
          <div className="orbitron" style={{ fontSize: 9, color: C.muted, letterSpacing: "0.14em", marginBottom: 8 }}>FANS WAITING IN LOBBY</div>
          {LOBBY_FANS.map(f => (
            <div key={f.name} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
              borderRadius: 8, background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.1)",
              marginBottom: 5,
            }}>
              <span style={{ fontSize: 14 }}>{f.emoji}</span>
              <span className="exo2" style={{ fontSize: 11, color: C.white, flex: 1 }}>{f.name}</span>
              <span className="orbitron" style={{ fontSize: 8, color: C.muted }}>{f.tier}</span>
            </div>
          ))}
          <div className="exo2" style={{ fontSize: 10, color: C.muted, paddingLeft: 8, marginTop: 4 }}>
            + 847 more waiting...
          </div>
        </div>

        {/* Set list */}
        <div>
          <div className="orbitron" style={{ fontSize: 9, color: C.muted, letterSpacing: "0.14em", marginBottom: 8 }}>SET LIST — TONIGHT</div>
          {SET_LIST.map((song, i) => (
            <label key={song} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 8px",
              borderRadius: 8, marginBottom: 5, cursor: "pointer",
              background: checked[i] ? `${C.green}12` : "rgba(255,255,255,0.03)",
              border: `1px solid ${checked[i] ? C.green + "44" : "rgba(255,255,255,0.08)"}`,
            }}>
              <input
                type="checkbox"
                checked={checked[i]}
                onChange={() => setChecked(p => { const n = [...p]; n[i] = !n[i]; return n; })}
                style={{ accentColor: C.green, width: 13, height: 13, cursor: "pointer" }}
              />
              <span className="exo2" style={{
                fontSize: 11,
                color: checked[i] ? C.green : C.muted,
                textDecoration: checked[i] ? "line-through" : "none",
              }}>
                {song}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Hardware Rack */}
      <HardwareRack />

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          onClick={onStartShow}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 11, fontWeight: 900,
            letterSpacing: "0.1em", cursor: "pointer",
            background: `${C.green}22`, border: `2px solid ${C.green}`, color: C.green,
          }}
          className="orbitron"
        >
          ▶ START SHOW
        </button>
        <button style={{
          flex: 1, padding: "10px 0", borderRadius: 10, fontSize: 11, fontWeight: 900,
          letterSpacing: "0.1em", cursor: "pointer",
          background: "transparent", border: `2px solid ${C.red}88`, color: C.red,
        }} className="orbitron">
          ✕ CANCEL
        </button>
      </div>
    </div>
  );
}

// ── Right sidebar ──────────────────────────────────────────────────────────────
function RightSidebar() {
  const RECENT_BOOKINGS = [
    { venue: "Club Aria",    date: "Jun 14" },
    { venue: "Pulse Lounge", date: "Jun 21" },
    { venue: "Neon Stage",   date: "Jul 3"  },
  ];
  return (
    <div style={{ width: 170, minWidth: 170, display: "flex", flexDirection: "column", gap: 10 }}>
      <StatCard label="FOLLOWERS"  value="12.4K" color={C.cyan} />
      <StatCard label="TOTAL TIPS" value="$2.1K" color={C.green} />
      <StatCard label="SHOWS DONE" value={47}    color={C.gold} />

      {/* Book Me */}
      <div style={{ background: C.card, border: `1px solid ${C.amber}55`, borderRadius: 10, padding: 12 }}>
        <div className="orbitron" style={{ fontSize: 9, color: C.amber, letterSpacing: "0.14em", marginBottom: 6 }}>BOOK ME</div>
        <div className="exo2" style={{ fontSize: 10, color: C.muted, marginBottom: 8 }}>Available for venues &amp; promoters</div>
        <a href="/bookings" style={{
          display: "block", textAlign: "center", padding: "7px 0", borderRadius: 7,
          fontSize: 9, fontWeight: 900, letterSpacing: "0.1em",
          background: `${C.amber}22`, border: `1px solid ${C.amber}66`,
          color: C.amber, textDecoration: "none",
        }} className="orbitron">
          SEND REQUEST
        </a>
      </div>

      {/* Sponsor slots */}
      <div style={{ background: C.card, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: 12 }}>
        <div className="orbitron" style={{ fontSize: 9, color: C.muted, letterSpacing: "0.14em", marginBottom: 6 }}>SPONSOR SLOTS</div>
        {[1, 2].map(n => (
          <div key={n} style={{
            display: "flex", alignItems: "center", gap: 6, marginBottom: 5,
            padding: "5px 7px", borderRadius: 7,
            background: `${C.green}10`, border: `1px solid ${C.green}33`,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green }} />
            <span className="exo2" style={{ fontSize: 9, color: C.muted, flex: 1 }}>Slot {n}</span>
            <span className="orbitron" style={{ fontSize: 7, color: C.green, letterSpacing: "0.1em" }}>OPEN</span>
          </div>
        ))}
        <a href="/sponsors" style={{ fontSize: 9, color: C.cyan, textDecoration: "none", fontWeight: 700 }} className="orbitron">
          FIND SPONSORS ›
        </a>
      </div>

      {/* Recent bookings */}
      <div style={{ background: C.card, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 12 }}>
        <div className="orbitron" style={{ fontSize: 9, color: C.muted, letterSpacing: "0.14em", marginBottom: 8 }}>RECENT BOOKINGS</div>
        {RECENT_BOOKINGS.map(b => (
          <div key={b.venue} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="exo2" style={{ fontSize: 10, color: C.muted }}>{b.venue}</span>
            <span className="orbitron" style={{ fontSize: 8, color: C.cyan }}>{b.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Beat Locker tab ────────────────────────────────────────────────────────────
function BeatLockerTab() {
  const [beats, setBeats] = useState<Beat[]>(SEED_BEATS);
  const LICENSES: LicenseType[] = ["Lease", "Premium", "Exclusive"];
  const licenseColor: Record<LicenseType, string> = {
    Lease: C.cyan, Premium: C.gold, Exclusive: C.red,
  };

  const setLicense = (id: number, license: LicenseType) =>
    setBeats(b => b.map(x => x.id === id ? { ...x, license } : x));
  const toggleMarket = (id: number) =>
    setBeats(b => b.map(x => x.id === id ? { ...x, market: !x.market } : x));

  return (
    <div style={{ padding: "16px 0" }}>
      {/* Upload row */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "center" }}>
        <button style={{
          padding: "9px 18px", borderRadius: 9, fontSize: 10, fontWeight: 900, letterSpacing: "0.12em",
          background: `${C.cyan}22`, border: `1px solid ${C.cyan}66`,
          color: C.cyan, cursor: "pointer",
        }} className="orbitron">
          ⬆ UPLOAD BEAT
        </button>
        <div style={{
          flex: 1, padding: "9px 16px", borderRadius: 9, fontSize: 10,
          background: "rgba(255,255,255,0.03)", border: "2px dashed rgba(255,255,255,0.15)",
          color: C.muted, textAlign: "center",
        }} className="exo2">
          Drag &amp; drop .wav / .mp3 here
        </div>
      </div>

      {/* Beat list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {beats.map(beat => (
          <div key={beat.id} style={{
            display: "grid",
            gridTemplateColumns: "1fr 70px 54px 130px 60px 46px",
            alignItems: "center", gap: 10, padding: "10px 14px",
            background: C.card, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10,
          }}>
            <span className="exo2" style={{ fontSize: 11, color: C.white, fontWeight: 600 }}>{beat.title}</span>
            <span className="exo2" style={{ fontSize: 10, color: C.muted }}>{beat.genre}</span>
            <span className="orbitron" style={{ fontSize: 9, color: C.cyan }}>{beat.bpm} bpm</span>

            {/* License selector */}
            <div style={{ display: "flex", gap: 4 }}>
              {LICENSES.map(lic => (
                <button
                  key={lic}
                  onClick={() => setLicense(beat.id, lic)}
                  style={{
                    flex: 1, padding: "4px 0", borderRadius: 5, fontSize: 7, fontWeight: 900,
                    letterSpacing: "0.06em", cursor: "pointer",
                    background: beat.license === lic ? `${licenseColor[lic]}33` : "transparent",
                    border: `1px solid ${beat.license === lic ? licenseColor[lic] : "rgba(255,255,255,0.12)"}`,
                    color: beat.license === lic ? licenseColor[lic] : C.dimmer,
                  }}
                  className="orbitron"
                >
                  {lic.slice(0, 3).toUpperCase()}
                </button>
              ))}
            </div>

            <span className="orbitron" style={{ fontSize: 10, color: C.gold, fontWeight: 700, textAlign: "right" }}>
              ${beat.price}
            </span>

            {/* Marketplace toggle */}
            <div
              onClick={() => toggleMarket(beat.id)}
              role="switch"
              aria-checked={beat.market}
              style={{
                width: 38, height: 20, borderRadius: 10, cursor: "pointer",
                background: beat.market ? `${C.green}55` : "rgba(255,255,255,0.1)",
                border: `1px solid ${beat.market ? C.green : "rgba(255,255,255,0.15)"}`,
                position: "relative", transition: "all 0.2s",
              }}
            >
              <div style={{
                position: "absolute", top: 3, left: beat.market ? 20 : 3,
                width: 12, height: 12, borderRadius: "50%",
                background: beat.market ? C.green : C.muted,
                transition: "left 0.2s",
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Beat stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <StatCard label="TOTAL BEATS"        value={beats.length} color={C.cyan} />
        <StatCard label="SALES TODAY"        value={3}            color={C.green} />
        <StatCard label="REVENUE THIS MONTH" value="$187"         color={C.gold} />
      </div>
    </div>
  );
}

// ── Stub tabs ──────────────────────────────────────────────────────────────────
function AnalyticsTab() {
  return (
    <div style={{ padding: "32px 0", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>📊</div>
      <div className="orbitron" style={{ fontSize: 12, color: C.muted, letterSpacing: "0.14em" }}>ANALYTICS DASHBOARD</div>
      <div className="exo2" style={{ fontSize: 11, color: C.dimmer, marginTop: 6 }}>Full stats coming soon — stream data collecting now.</div>
    </div>
  );
}
function ScheduleTab() {
  return (
    <div style={{ padding: "32px 0", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>📅</div>
      <div className="orbitron" style={{ fontSize: 12, color: C.muted, letterSpacing: "0.14em" }}>SHOW SCHEDULE</div>
      <div className="exo2" style={{ fontSize: 11, color: C.dimmer, marginTop: 6 }}>Book and manage upcoming shows from here.</div>
    </div>
  );
}
function SettingsTab() {
  return (
    <div style={{ padding: "32px 0", textAlign: "center" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>⚙️</div>
      <div className="orbitron" style={{ fontSize: 12, color: C.muted, letterSpacing: "0.14em" }}>STUDIO SETTINGS</div>
      <div className="exo2" style={{ fontSize: 11, color: C.dimmer, marginTop: 6 }}>Profile, notifications, and stream preferences.</div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ArtistStudioPage() {
  const [isLive,    setIsLive]    = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("BROADCAST");
  const [reactions, setReactions] = useState<FloatReaction[]>([]);
  const reactionId                = useRef(0);

  const presence = usePresenceEngine(
    "broadcast-studio",
    8000,
    isLive ? "performance" : "private",
  );

  const toggleLive = () => setIsLive(v => !v);

  const fireReaction = (emoji: string) => {
    const id = ++reactionId.current;
    const x  = 10 + Math.random() * 80;
    setReactions(r => [...r, { id, emoji, x }]);
    setTimeout(() => setReactions(r => r.filter(rx => rx.id !== id)), 1900);
  };

  return (
    <DrawerProvider>
      <style dangerouslySetInnerHTML={{ __html: FONT_STYLE }} />

      {/* Left fixed action canister */}
      <ActionCanister actions={[
        { id: "messages",      label: "Messages",   icon: "💬" },
        { id: "notifications", label: "Alerts",     icon: "🔔" },
        { id: "friends",       label: "Friends",    icon: "👥" },
        { id: "bookings",      label: "Bookings",   icon: "📅" },
        { id: "sponsors",      label: "Sponsors",   icon: "🤝" },
        { id: "revenue",       label: "Revenue",    icon: "💰" },
        { id: "communication", label: "Comms",      icon: "📡" },
      ]} />

      {/* Right slide-in widget drawer */}
      <WidgetDrawer />

      <div style={{ minHeight: "100vh", background: C.bg, color: C.white, paddingLeft: 72, overflowY: "auto", overflowX: "hidden" }}>

        {/* ── Welcome banner ── */}
        <div style={{
          padding: "16px 24px", textAlign: "center",
          background: "linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(8,14,38,0.95) 100%)",
          borderBottom: `1px solid ${C.gold}44`,
        }}>
          <div className="orbitron" style={{ fontSize: 13, color: C.gold, fontWeight: 900, letterSpacing: "0.14em", marginBottom: 4 }}>
            🎵 WELCOME TO YOUR PROMOTION HUB 🎵
          </div>
          <div className="exo2" style={{ fontSize: 11, color: C.muted }}>
            We thank you for joining. Ready to take you and your music global. We grow together.
          </div>
        </div>

        {/* ── Header bar ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, padding: "12px 24px",
          background: C.panel, borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexWrap: "wrap",
        }}>
          <div className="orbitron flicker" style={{ fontSize: 16, color: C.red, fontWeight: 900, letterSpacing: "0.12em" }}>
            ARTIST DASHBOARD
          </div>

          <div style={{ display: "flex", gap: 8, marginLeft: 8 }}>
            {[
              { label: "⬆ Upload",       href: "/performer/upload" },
              { label: "🎭 Set Up Show",  href: "/performer/setup-show" },
              { label: "🤝 Sponsor",      href: "/sponsors" },
            ].map(btn => (
              <a
                key={btn.label}
                href={btn.href}
                style={{
                  padding: "6px 12px", borderRadius: 7, fontSize: 9, fontWeight: 900,
                  letterSpacing: "0.08em", textDecoration: "none",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                  color: C.muted,
                }}
                className="orbitron"
              >
                {btn.label}
              </a>
            ))}
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 14 }}>
            <SignalBars isLive={isLive} />
            <button
              onClick={toggleLive}
              style={{
                padding: "8px 20px", borderRadius: 9,
                fontSize: 10, fontWeight: 900, letterSpacing: "0.12em", cursor: "pointer",
                background: isLive ? `${C.red}22` : `${C.green}22`,
                border: `2px solid ${isLive ? C.red : C.green}`,
                color: isLive ? C.red : C.green,
                boxShadow: isLive ? `0 0 16px ${C.red}55` : "none",
              }}
              className="orbitron"
            >
              {isLive ? "⏹ END SHOW" : "🔴 GO LIVE"}
            </button>
          </div>
        </div>

        {/* ── Chat bar ── */}
        <div style={{
          display: "flex", gap: 8, padding: "10px 24px",
          background: "rgba(8,14,38,0.7)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder="Talk to your fans or pin a message..."
            style={{
              flex: 1, padding: "9px 14px", borderRadius: 9, fontSize: 11,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              color: C.white, outline: "none", fontFamily: "'Exo 2', sans-serif",
            }}
          />
          <button style={{
            padding: "9px 20px", borderRadius: 9, fontSize: 10, fontWeight: 900, letterSpacing: "0.1em",
            background: `${C.cyan}22`, border: `1px solid ${C.cyan}66`,
            color: C.cyan, cursor: "pointer",
          }} className="orbitron">
            PUBLISH
          </button>
          <a href="/assistant" style={{
            padding: "9px 14px", borderRadius: 9, fontSize: 18, textDecoration: "none",
            background: "rgba(170,45,255,0.15)", border: "1px solid rgba(170,45,255,0.4)",
            display: "flex", alignItems: "center",
          }}>
            🤖
          </a>
        </div>

        {/* ── Main 2-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 170px", gap: 16, padding: "16px 24px" }}>

          {/* LEFT: live mode or green room */}
          <div>
            <AnimatePresence mode="wait">
              {isLive ? (
                <motion.div
                  key="live"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <LiveModePanel presence={presence} reactions={reactions} onReact={fireReaction} />
                </motion.div>
              ) : (
                <motion.div
                  key="greenroom"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <GreenRoomPanel onStartShow={toggleLive} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT sidebar */}
          <RightSidebar />
        </div>

        {/* ── Beat Locker tabs ── */}
        <div style={{ padding: "0 24px 32px" }}>
          {/* Tab bar */}
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid rgba(255,255,255,0.1)", marginBottom: 0 }}>
            {TABS.map(tab => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "10px 18px", fontSize: 9, fontWeight: 900, letterSpacing: "0.12em",
                    cursor: "pointer", background: "transparent", border: "none",
                    borderBottom: `2px solid ${active ? C.cyan : "transparent"}`,
                    color: active ? C.cyan : C.muted,
                    transition: "all 0.2s",
                  }}
                  className="orbitron"
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === "BROADCAST"  && <WebRTCBroadcast accentColor={C.red} />}
              {activeTab === "BEAT LOCKER" && <BeatLockerTab />}
              {activeTab === "ANALYTICS"   && <AnalyticsTab />}
              {activeTab === "SCHEDULE"    && <ScheduleTab />}
              {activeTab === "SETTINGS"    && <SettingsTab />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </DrawerProvider>
  );
}
