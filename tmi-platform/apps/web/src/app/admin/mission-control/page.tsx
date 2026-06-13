"use client";

import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePresenceEngine } from "@/lib/live/presenceEngine";

// ─── Design tokens (reference: tmi_complete_all_four_dashboards_v2.html) ──────
const C = {
  bg:     "#050815",
  panel:  "rgba(8,14,38,.95)",
  card:   "rgba(12,20,50,.9)",
  red:    "#E63000",
  orange: "#FF6B00",
  amber:  "#FF8C00",
  gold:   "#FFD700",
  border: "rgba(220,70,0,.5)",
  dim:    "rgba(255,140,0,.4)",
  green:  "#00FF7F",
  cyan:   "#00E5FF",
  purple: "#9B59B6",
};

// ─── Types ────────────────────────────────────────────────────────────────────
type GateStatus = "ok" | "warn" | "error" | "pending";
interface Gate { id: string; label: string; status: GateStatus; latencyMs?: number; detail?: string; }
type BotStatus = "ONLINE" | "BUSY" | "OFFLINE";
interface BotEntry { id: string; name: string; role: string; status: BotStatus; }
type AdminTab = "USERS" | "CONTENT" | "BOTS";
type KillLevel = "info" | "warn" | "error" | "crit";
interface KillEvent { id: string; ts: number; level: KillLevel; source: string; msg: string; }
interface ApiRoom { id: string; name: string; emoji: string; status: "live"|"preshow"|"idle"; watchers: number; capacity: number; href: string; }
interface HealthCheck { ok: boolean; latencyMs?: number; detail?: string; }
interface HealthResponse { checks: { db?: HealthCheck; stripe?: HealthCheck; resend?: HealthCheck; daily?: HealthCheck; }; }
interface AdminUser { id: string; email: string; displayName?: string; role: string; tier: string; createdAt: string; }

// ─── Seed data ────────────────────────────────────────────────────────────────
const BOTS: BotEntry[] = [
  { id: "big-ace",        name: "Big Ace",         role: "Global Commander",  status: "ONLINE"  },
  { id: "michael-charlie",name: "Michael Charlie",  role: "TMI Conductor",     status: "ONLINE"  },
  { id: "chatguard",      name: "ChatGuard",        role: "Security",          status: "ONLINE"  },
  { id: "revenuebot",     name: "RevenueBot",       role: "Finance",           status: "BUSY"    },
  { id: "bookingbot",     name: "BookingBot",       role: "Booking",           status: "ONLINE"  },
  { id: "adbot",          name: "AdBot",            role: "Advertising",       status: "OFFLINE" },
  { id: "designbot",      name: "DesignBot",        role: "UI Stability",      status: "ONLINE"  },
  { id: "launchbot",      name: "LaunchBot",        role: "Onboarding",        status: "BUSY"    },
];

const ROOMS_SEED = [
  { id: "fan-theater",        name: "Fan Theater",        emoji: "🎭", isLive: true  },
  { id: "broadcast-studio",   name: "Artist Studio",      emoji: "🎤", isLive: false },
  { id: "world-concert",      name: "World Concert",      emoji: "🎶", isLive: true  },
  { id: "world-dance-party",  name: "Dance Party",        emoji: "💃", isLive: true  },
  { id: "monday-stage",       name: "Monday Stage",       emoji: "🎸", isLive: false },
  { id: "cypher",             name: "Nova Cipher",        emoji: "⚡", isLive: true  },
  { id: "battle",             name: "Battle Arena",       emoji: "⚔️", isLive: false },
  { id: "dirty-dozens",       name: "Dirty Dozens",       emoji: "🎮", isLive: false },
];

const STAT_CARDS = [
  { icon: "👥", label: "Total Users",    value: "—", delta: "live",  deltaColor: C.green },
  { icon: "🟢", label: "Online Now",     value: "—",  delta: "live",    deltaColor: C.green },
  { icon: "💳", label: "Paid Members",   value: "—",  delta: "live",   deltaColor: C.green },
  { icon: "💰", label: "Revenue Today",  value: "—", delta: "Stripe",deltaColor: C.green },
  { icon: "🎤", label: "Live Now",       value: "—",     delta: "live",    deltaColor: C.green },
  { icon: "📢", label: "Ad Revenue",     value: "—",   delta: "live",  deltaColor: C.cyan  },
];

const PLATFORM_HEALTH: Gate[] = [
  { id: "auth",     label: "Auth",     status: "ok"      },
  { id: "db",       label: "Database", status: "ok"      },
  { id: "stripe",   label: "Stripe",   status: "pending" },
  { id: "webrtc",   label: "WebRTC",   status: "ok"      },
  { id: "presence", label: "Presence", status: "ok"      },
  { id: "video",    label: "Video",    status: "warn"    },
];

const ACCOUNT_LINKS = [
  { icon: "💳", label: "Stripe",         status: "ok"      },
  { icon: "🎵", label: "Spotify",        status: "ok"      },
  { icon: "🅿️", label: "PayPal",         status: "ok"      },
  { icon: "🎬", label: "Memory Streams", status: "offline" },
  { icon: "🖥",  label: "SBA Hosting",   status: "ok"      },
  { icon: "🔧", label: "PunWorkly",      status: "warn"    },
];

let _seq = 1;
function makeEvent(level: KillLevel, msg: string, source = "system"): KillEvent {
  return { id: `ev-${Date.now()}-${_seq++}`, ts: Date.now(), level, source, msg };
}

const AUTO_EVENTS: Array<[KillLevel, string, string]> = [
  ["info",  "presence",  "Fan Theater: +3 viewers joined"],
  ["info",  "stripe",    "Payment received: $24.99 (Gold sub)"],
  ["warn",  "webrtc",    "World Concert: packet loss 4.2%"],
  ["info",  "auth",      "New signup: artist role"],
  ["info",  "bots",      "Big Ace: directive executed successfully"],
  ["warn",  "db",        "Slow query detected: 420ms on users table"],
  ["info",  "presence",  "Battle Arena: peak audience hit — 312 watching"],
  ["error", "daily",     "Daily.co: room creation timeout — retrying"],
  ["info",  "revenue",   "Ad slot click-through: $0.85 earned"],
  ["crit",  "auth",      "Rate limit triggered: 14 failed logins / 2min"],
  ["info",  "presence",  "Monday Stage: streamer went live"],
  ["warn",  "stripe",    "Webhook retry #2 for evt_3Qr..."],
  ["info",  "bots",      "Michael Charlie: 62 bot heartbeats confirmed"],
];

const SEED_EVENTS: KillEvent[] = [
  makeEvent("info",  "Mission Control online — all systems nominal"),
  makeEvent("info",  "Big Ace initialized — global command active"),
  makeEvent("info",  "Michael Charlie conducting — TMI live"),
  makeEvent("warn",  "Redis latency elevated — monitoring", "db"),
  makeEvent("info",  "Beat Locker: 89 beats indexed in marketplace"),
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6, ...style }}>
      {children}
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: ".12em", color: C.amber, textTransform: "uppercase" as const }}>{children}</div>;
}

function Val({ children, size = 12 }: { children: React.ReactNode; size?: number }) {
  return <div style={{ fontFamily: "'Orbitron', monospace", fontWeight: 700, color: C.gold, fontSize: size }}>{children}</div>;
}

function StatusDot({ status, blink }: { status: "green" | "yellow" | "red" | "dim"; blink?: boolean }) {
  const colors = { green: C.green, yellow: C.gold, red: C.red, dim: C.dim };
  return (
    <span style={{
      display: "inline-block", width: 6, height: 6, borderRadius: "50%",
      background: colors[status], flexShrink: 0,
      boxShadow: status !== "dim" ? `0 0 5px ${colors[status]}` : "none",
      animation: blink ? "mcBlink 1.2s ease-in-out infinite" : "none",
    }} />
  );
}

function GateRow({ gate }: { gate: Gate }) {
  const s = gate.status;
  const ds = s === "ok" ? "green" : s === "warn" ? "yellow" : s === "error" ? "red" : "dim";
  const label = s === "ok" ? "OK" : s === "warn" ? "Warn" : s === "error" ? "ERR" : "...";
  const lc = s === "ok" ? C.green : s === "warn" ? C.gold : s === "error" ? C.red : C.dim;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
      <span style={{ fontSize: 8, color: C.dim }}>{gate.label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        <StatusDot status={ds as "green"} blink={s === "pending"} />
        <span style={{ fontSize: 7, color: lc }}>{label}</span>
      </div>
    </div>
  );
}

function BotRow({ bot, onSummon }: { bot: BotEntry; onSummon: (id: string) => void }) {
  const ds = bot.status === "ONLINE" ? "green" : bot.status === "BUSY" ? "yellow" : "dim";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <StatusDot status={ds as "green"} blink={bot.status === "ONLINE"} />
        <div>
          <div style={{ fontSize: 8, color: C.amber }}>{bot.name}</div>
          <div style={{ fontSize: 6, color: C.dim }}>{bot.role}</div>
        </div>
      </div>
      <button
        onClick={() => onSummon(bot.id)}
        style={{
          background: "transparent", border: `1px solid ${bot.status === "OFFLINE" ? C.green : C.red}`,
          color: bot.status === "OFFLINE" ? C.green : C.amber,
          fontSize: 7, padding: "1px 5px", borderRadius: 3, cursor: "pointer",
          fontFamily: "'Exo 2', sans-serif", fontWeight: 700,
        }}
      >
        {bot.status === "OFFLINE" ? "Start" : "⚡"}
      </button>
    </div>
  );
}

function RoomMonitorTile({ room }: { room: typeof ROOMS_SEED[0] }) {
  const presence = usePresenceEngine(room.id, 12000, room.isLive ? "performance" : "private");
  return (
    <div style={{
      height: 62, background: room.isLive ? "rgba(10,0,2,.9)" : "rgba(3,10,10,.9)",
      border: `1px solid ${room.isLive ? C.red : C.border}`, borderRadius: 4,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      cursor: "pointer", position: "relative", gap: 2,
    }}>
      {room.isLive && (
        <div style={{ position: "absolute", top: 4, left: 4, display: "flex", alignItems: "center", gap: 2 }}>
          <StatusDot status="green" blink />
          <span style={{ fontSize: 6, color: C.green }}>LIVE</span>
        </div>
      )}
      <span style={{ fontSize: 14 }}>{room.emoji}</span>
      <span style={{ fontSize: 9, color: C.gold }}>{room.name}</span>
      {room.isLive && <span style={{ fontSize: 7, color: C.dim }}>{presence.watching} watching</span>}
    </div>
  );
}

// ─── System Clock ─────────────────────────────────────────────────────────────
function SystemClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "monospace", fontSize: 10, color: C.gold }}>
      {t.toLocaleTimeString("en-US", { hour12: false })} EST
    </span>
  );
}

// ─── Animated Gate Row ────────────────────────────────────────────────────────
function AnimatedGateRow({ gate }: { gate: Gate }) {
  const s = gate.status;
  const ds = s === "ok" ? "green" : s === "warn" ? "yellow" : s === "error" ? "red" : "dim";
  const label = s === "ok" ? "OK" : s === "warn" ? "Warn" : s === "error" ? "ERR" : "...";
  const lc = s === "ok" ? C.green : s === "warn" ? C.gold : s === "error" ? C.red : C.dim;
  return (
    <motion.div
      animate={{ opacity: s === "ok" ? [0.5, 1] : 1 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}
    >
      <span style={{ fontSize: 8, color: C.dim }}>{gate.label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        {gate.latencyMs !== undefined && (
          <span style={{ fontSize: 6, color: gate.latencyMs > 300 ? C.gold : "#555" }}>{gate.latencyMs}ms</span>
        )}
        <StatusDot status={ds as "green"} blink={s === "pending"} />
        <span style={{ fontSize: 7, color: lc }}>{label}</span>
      </div>
    </motion.div>
  );
}

// ─── TV Frame Tile ────────────────────────────────────────────────────────────
function TvFrameTile({ room, panicMode, staticWatchers }: { room: typeof ROOMS_SEED[0]; panicMode?: boolean; staticWatchers?: number }) {
  const presence = usePresenceEngine(room.id, 12000, room.isLive ? "performance" : "private");
  const watcherCount = staticWatchers ?? presence.watching;
  const borderColor = panicMode ? "#FF0000" : room.isLive ? C.red : C.border;
  const bgColor = panicMode ? "rgba(40,0,0,.95)" : room.isLive ? "rgba(10,0,2,.9)" : "rgba(3,10,10,.9)";
  return (
    <div style={{
      height: 62,
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: 4,
      cursor: "pointer",
      position: "relative",
      overflow: "hidden",
      boxShadow: `inset 0 0 20px rgba(0,0,0,0.8), 0 0 ${panicMode ? "12px rgba(255,0,0,0.4)" : "8px rgba(0,0,0,0.5)"}`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 2,
      transition: "border-color 0.3s, background 0.3s",
    }}>
      {/* Scanline overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.07) 3px, rgba(0,0,0,0.07) 4px)",
      }} />
      {/* Corner notch marks */}
      {[
        { top: 2, left: 2 }, { top: 2, right: 2 },
        { bottom: 2, left: 2 }, { bottom: 2, right: 2 },
      ].map((pos, idx) => (
        <div key={idx} style={{
          position: "absolute", width: 3, height: 3,
          background: panicMode ? "#FF0000" : C.amber, ...pos,
        }} />
      ))}
      {(room.isLive || panicMode) && (
        <div style={{ position: "absolute", top: 4, left: 4, display: "flex", alignItems: "center", gap: 2, zIndex: 2 }}>
          <StatusDot status={panicMode ? "red" : "green"} blink />
          <span style={{ fontSize: 6, color: panicMode ? "#FF4444" : C.green }}>{panicMode ? "PANIC" : "LIVE"}</span>
        </div>
      )}
      <span style={{ fontSize: 14, zIndex: 2 }}>{room.emoji}</span>
      <span style={{ fontSize: 9, color: panicMode ? "#FF8888" : C.gold, zIndex: 2 }}>{room.name}</span>
      {(room.isLive || staticWatchers !== undefined) && (
        <span style={{ fontSize: 7, color: C.dim, zIndex: 2 }}>{watcherCount} watching</span>
      )}
    </div>
  );
}

// ─── Radar Sweep ──────────────────────────────────────────────────────────────
function RadarSweep() {
  return (
    <div style={{ position: "relative", width: 44, height: 44 }}>
      <svg width="44" height="44" viewBox="0 0 44 44" style={{ position: "absolute", inset: 0 }}>
        <circle cx="22" cy="22" r="17" fill="none" stroke="rgba(220,70,0,.3)" strokeWidth="4"/>
        <circle cx="22" cy="22" r="17" fill="none" stroke={C.green} strokeWidth="4" strokeDasharray="76 24" strokeDashoffset="17" transform="rotate(-90 22 22)"/>
        <text x="22" y="26" textAnchor="middle" fill={C.green} fontSize="9" fontFamily="monospace">76%</text>
      </svg>
      {/* Rotating conic-gradient radar sweep */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: "conic-gradient(from 0deg, rgba(0,255,127,0.3) 0deg, transparent 60deg)",
        animation: "radarSpin 3s linear infinite",
        mixBlendMode: "screen",
      }} />
    </div>
  );
}

function TrustKillerFeed({ events }: { events: KillEvent[] }) {
  const lc = (l: KillLevel) => l === "crit" ? "#FF00AA" : l === "error" ? C.red : l === "warn" ? C.gold : "#666";
  return (
    <Panel style={{ padding: "6px 8px", height: 140, overflowY: "auto" as const }}>
      <Lbl>Trust Killer Feed — Live Event Stream</Lbl>
      <div style={{ marginTop: 4 }}>
        <AnimatePresence initial={false}>
          {events.slice(0, 20).map((ev) => (
            <motion.div key={ev.id}
              initial={{ opacity: 0, x: -8, backgroundColor: lc(ev.level) + "22" }}
              animate={{ opacity: 1, x: 0, backgroundColor: "transparent" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", gap: 5, marginBottom: 2, fontFamily: "monospace", alignItems: "flex-start" }}>
              <span style={{ fontSize: 7, color: "#444", flexShrink: 0 }}>
                {new Date(ev.ts).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
              <span style={{ fontSize: 7, color: "#555", flexShrink: 0, minWidth: 54 }}>[{ev.source}]</span>
              <span style={{ fontSize: 7, color: lc(ev.level), fontWeight: 700, flexShrink: 0, minWidth: 32 }}>{ev.level.toUpperCase()}</span>
              <span style={{ fontSize: 7, color: "#999" }}>{ev.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Panel>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MissionControlPage() {
  const [events, setEvents] = useState<KillEvent[]>([...SEED_EVENTS].reverse());
  const [adminTab, setAdminTab] = useState<AdminTab>("USERS");
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [gates, setGates] = useState<Gate[]>(PLATFORM_HEALTH);
  const [userSearch, setUserSearch] = useState("");
  const [bots, setBots] = useState<BotEntry[]>(BOTS);
  const [taskInput, setTaskInput] = useState("");
  const [panicMode, setPanicMode] = useState(false);
  const [apiRooms, setApiRooms] = useState<ApiRoom[] | null>(null);
  const [liveStatValues, setLiveStatValues] = useState<Record<string, string>>({});
  const [userList, setUserList] = useState<AdminUser[]>([]);
  const autoIdxRef = React.useRef(0);

  // Fetch real platform stats from AdminStatsEngine
  const fetchStats = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/stats", { cache: "no-store" });
      if (!r.ok) return;
      const d = await r.json() as {
        users?: { total?: number; online?: number };
        business?: { paidMembers?: number; revenueToday?: number };
        rooms?: { active?: number };
      };
      setLiveStatValues({
        "Total Users":   String(d.users?.total   ?? "—"),
        "Online Now":    String(d.users?.online   ?? "—"),
        "Paid Members":  String(d.business?.paidMembers ?? "—"),
        "Revenue Today": d.business?.revenueToday != null ? `$${d.business.revenueToday.toFixed(0)}` : "—",
        "Live Now":      String(d.rooms?.active   ?? "—"),
        "Ad Revenue":    "—",
      });
    } catch { /* keep dashes */ }
  }, []);

  const addEvent = useCallback((level: KillLevel, msg: string, source = "system") => {
    setEvents((prev) => [makeEvent(level, msg, source), ...prev].slice(0, 80));
  }, []);

  // Auto-event feed: new event every 6 seconds cycling through 13 types
  useEffect(() => {
    const iv = setInterval(() => {
      const next = (autoIdxRef.current + 1) % AUTO_EVENTS.length;
      autoIdxRef.current = next;
      const [lvl, src, msg] = AUTO_EVENTS[next]!;
      setEvents((prev) => [makeEvent(lvl, msg, src), ...prev].slice(0, 80));
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  // Fetch real users from UserStore/Prisma
  const fetchUsers = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/users?limit=200", { credentials: "include", cache: "no-store" });
      if (r.ok) {
        const d = await r.json() as { users: AdminUser[] };
        if (d.users?.length) setUserList(d.users);
      }
    } catch { /* keep empty */ }
  }, []);

  // Fetch rooms from API
  const fetchRooms = useCallback(async () => {
    try {
      const r = await fetch("/api/admin/rooms", { headers: { "x-admin-key": "tmi-phase1-launch-2026" }, cache: "no-store" });
      if (r.ok) {
        const d = await r.json() as { rooms: ApiRoom[] };
        setApiRooms(d.rooms);
      }
    } catch { /* use seed fallback */ }
  }, []);

  const runScan = useCallback(async () => {
    setScanning(true);
    addEvent("info", "Scan initiated by Marcel", "system");
    try {
      const r = await fetch("/api/auth/session", { credentials: "include", cache: "no-store" });
      if (r.ok) {
        const d = await r.json() as { authenticated?: boolean };
        setGates((prev) => prev.map((g) => g.id === "auth" ? { ...g, status: d.authenticated ? "ok" : "warn" } : g));
        addEvent("info", d.authenticated ? "Auth: session valid" : "Auth: no active session", "auth");
      } else {
        setGates((prev) => prev.map((g) => g.id === "auth" ? { ...g, status: "error" } : g));
        addEvent("error", `Auth: route returned ${r.status}`, "auth");
      }
    } catch { addEvent("error", "Auth: fetch failed", "auth"); }
    try {
      const r = await fetch("/api/admin/health", { headers: { "x-admin-key": "tmi-phase1-launch-2026" }, cache: "no-store" });
      if (r.ok) {
        const d = await r.json() as HealthResponse;
        setGates((prev) => prev.map((g) => {
          if (g.id === "db")     return { ...g, status: d.checks?.db?.ok     ? "ok" : "error", latencyMs: d.checks?.db?.latencyMs,     detail: d.checks?.db?.detail };
          if (g.id === "stripe") return { ...g, status: d.checks?.stripe?.ok ? "ok" : "warn",  latencyMs: d.checks?.stripe?.latencyMs, detail: d.checks?.stripe?.detail };
          if (g.id === "video")  return { ...g, status: d.checks?.daily?.ok  ? "ok" : "warn",  latencyMs: d.checks?.daily?.latencyMs,  detail: d.checks?.daily?.detail };
          return g;
        }));
        addEvent("info", "Health scan complete", "health");
      }
    } catch { addEvent("warn", "Health scan failed — check admin key", "health"); }
    setLastScan(new Date());
    setScanning(false);
  }, [addEvent]);

  useEffect(() => {
    runScan();
    fetchRooms();
    fetchStats();
    fetchUsers();
    const iv1 = setInterval(runScan, 60_000);
    const iv2 = setInterval(fetchRooms, 30_000);
    const iv3 = setInterval(fetchStats, 15_000);
    const iv4 = setInterval(fetchUsers, 30_000);
    return () => { clearInterval(iv1); clearInterval(iv2); clearInterval(iv3); clearInterval(iv4); };
  }, [runScan, fetchRooms, fetchStats, fetchUsers]);

  const summonBot = (id: string) => {
    setBots((prev) => prev.map((b) => b.id === id ? { ...b, status: b.status === "OFFLINE" ? "ONLINE" : b.status } : b));
    const bot = bots.find((b) => b.id === id);
    if (bot) addEvent("info", `${bot.name} summoned — status: ${bot.status === "OFFLINE" ? "ONLINE" : "active"}`, "bots");
  };

  const issueCommand = () => {
    if (!taskInput.trim()) return;
    addEvent("info", `Command issued: "${taskInput.trim()}" — routed to Big Ace`, "system");
    setTaskInput("");
  };

  const displayRooms = apiRooms
    ? apiRooms.map((r) => ({ id: r.id, name: r.name, emoji: r.emoji, isLive: r.status === "live", watchers: r.watchers }))
    : ROOMS_SEED.map((r) => ({ ...r, watchers: undefined }));
  const liveCount = displayRooms.filter((r) => r.isLive).length;
  const onlineBots = bots.filter((b) => b.status === "ONLINE").length;
  const hasError = gates.some((g) => g.status === "error");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Exo+2:wght@300;400;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; }
        @keyframes mcBlink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes mcFlicker { 0%,93%,100%{opacity:1} 94%,99%{opacity:0.4} }
        @keyframes mcTicker { from{transform:translateX(110%)} to{transform:translateX(-110%)} }
        @keyframes radarSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes critBlink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes panicPulse { 0%,100%{background:${C.bg}} 50%{background:rgba(230,0,0,0.18)} }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: #030610; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, color: C.amber, fontFamily: "'Exo 2', sans-serif", fontSize: 11, animation: panicMode ? "panicPulse 0.8s ease-in-out infinite" : "none" }}>

        {/* ── HEADER ── */}
        <div style={{ background: C.panel, borderBottom: `1px solid ${panicMode ? C.red : C.border}`, padding: "7px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 900, color: panicMode ? "#FF0000" : C.red, textTransform: "uppercase", letterSpacing: ".08em", fontSize: 14, animation: "mcFlicker 4s ease-in-out infinite" }}>
            BerntoutGlobal — MISSION CONTROL
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <SystemClock />
            <StatusDot status="green" blink />
            <span style={{ fontSize: 8, color: C.green }}>SYSTEM ONLINE</span>
            {lastScan && <span style={{ fontSize: 8, color: C.dim }}>Last: {lastScan.toLocaleTimeString("en-US", { hour12: false })}</span>}
            <Btn onClick={runScan} disabled={scanning}>⚡ {scanning ? "SCANNING…" : "CHAIN PULSE"}</Btn>
            <Btn color={C.cyan} href="/admin/life-support">🔍 Life Support</Btn>
            <Btn color={C.red}>⚠ Approve Digest</Btn>
            <button
              onClick={() => { setPanicMode((p) => !p); addEvent(panicMode ? "info" : "crit", panicMode ? "Panic mode deactivated" : "⚠ PANIC MODE ACTIVATED — all rooms flagged", "system"); }}
              style={{ background: panicMode ? C.red : "transparent", border: `1px solid ${C.red}`, color: panicMode ? "#fff" : C.red, fontFamily: "'Exo 2', sans-serif", fontSize: 8, fontWeight: 900, cursor: "pointer", borderRadius: 4, padding: "4px 10px", letterSpacing: ".1em", textTransform: "uppercase", animation: panicMode ? "critBlink 0.6s ease-in-out infinite" : "none" }}
            >
              {panicMode ? "✦ PANIC ACTIVE" : "☢ PANIC"}
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, padding: "7px 8px 0" }}>
          {STAT_CARDS.map((s) => (
            <Panel key={s.label} style={{ padding: 7, textAlign: "center" as const }}>
              <div style={{ fontSize: 13, marginBottom: 2 }}>{s.icon}</div>
              <Lbl>{s.label}</Lbl>
              <Val>{liveStatValues[s.label] ?? s.value}</Val>
              <div style={{ fontSize: 7, color: s.deltaColor, marginTop: 1 }}>{s.delta}</div>
            </Panel>
          ))}
        </div>

        {/* ── LIVE TICKER ── */}
        <div style={{ overflow: "hidden", borderTop: `1px solid ${C.border}50`, borderBottom: `1px solid ${C.border}50`, height: 22, display: "flex", alignItems: "center", margin: "6px 0 0" }}>
          <div style={{ animation: "mcTicker 22s linear infinite", whiteSpace: "nowrap", fontSize: 8, color: C.gold, padding: "0 40px" }}>
            👑 Big KazhDog — Thunder Zone — NOW PLAYING &nbsp;&nbsp;&nbsp; 🤖 {onlineBots} bots online &nbsp;&nbsp;&nbsp; 🎤 {liveCount} rooms live &nbsp;&nbsp;&nbsp; 💰 Revenue: Stripe connected &nbsp;&nbsp;&nbsp; 📢 BidVertiser: verified &nbsp;&nbsp;&nbsp; 🔐 Auth: active &nbsp;&nbsp;&nbsp;
          </div>
        </div>

        {/* ── 3-COLUMN BODY ── */}
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 200px", gap: 7, padding: 8 }}>

          {/* ── LEFT RAIL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

            {/* Chain of Command */}
            <Panel style={{ padding: 8 }}>
              <Lbl>Chain of Command</Lbl>
              {[
                { name: "Marcel Dickens", role: "Owner / Authority", status: "green" as const, delay: 0 },
                { name: "Big Ace",        role: "Global Commander",  status: "green" as const, delay: 0.4 },
                { name: "Michael Charlie",role: "TMI Conductor",     status: "green" as const, delay: 0.8 },
              ].map((a) => (
                <div key={a.name} style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, padding: 4, background: "rgba(230,48,0,.06)", borderRadius: 4 }}>
                  <StatusDot status={a.status} blink />
                  <div>
                    <div style={{ fontSize: 9, color: C.gold, fontWeight: 600 }}>{a.name}</div>
                    <div style={{ fontSize: 6, color: C.dim }}>{a.role}</div>
                  </div>
                </div>
              ))}
            </Panel>

            {/* Bot Roster */}
            <Panel style={{ padding: 8 }}>
              <Lbl>Bot Roster & Summon</Lbl>
              <div style={{ marginTop: 6 }}>
                {bots.map((b) => <BotRow key={b.id} bot={b} onSummon={summonBot} />)}
              </div>
            </Panel>

            {/* Quick Actions */}
            <Panel style={{ padding: 8 }}>
              <Lbl>Quick Actions</Lbl>
              <div style={{ marginTop: 5, display: "flex", flexDirection: "column", gap: 3 }}>
                {[
                  { icon: "📧", label: "Send System Email",  color: C.border },
                  { icon: "⚡", label: "Restart All Bots",   color: C.border },
                  { icon: "📊", label: "Export Report",      color: C.border },
                  { icon: "📢", label: "Manage Ad Slots",    color: C.border },
                  { icon: "🚨", label: "Emergency Broadcast",color: C.red    },
                ].map((a) => (
                  <button key={a.label} style={{
                    background: "transparent", border: `1px solid ${a.color}`, color: C.amber,
                    fontFamily: "'Exo 2', sans-serif", fontSize: 8, fontWeight: 700, cursor: "pointer",
                    borderRadius: 4, padding: "4px 7px", textAlign: "left", transition: "all .15s",
                    letterSpacing: ".05em", textTransform: "uppercase",
                  }}>{a.icon} {a.label}</button>
                ))}
              </div>
            </Panel>

            {/* Agent command input */}
            <Panel style={{ padding: 8 }}>
              <Lbl>Issue Directive</Lbl>
              <input
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && issueCommand()}
                placeholder="Direct Big Ace or Michael Charlie..."
                style={{ width: "100%", marginTop: 5, background: C.card, border: `1px solid ${C.border}`, color: C.amber, fontFamily: "'Exo 2', sans-serif", fontSize: 9, outline: "none", borderRadius: 4, padding: "5px 8px", boxSizing: "border-box" }}
              />
              <button onClick={issueCommand} style={{ marginTop: 4, width: "100%", background: "transparent", border: `1px solid ${C.red}`, color: C.amber, fontFamily: "'Exo 2', sans-serif", fontSize: 8, fontWeight: 700, cursor: "pointer", borderRadius: 4, padding: "3px 7px", textTransform: "uppercase", letterSpacing: ".05em" }}>
                ⚡ ISSUE COMMAND
              </button>
            </Panel>
          </div>

          {/* ── CENTER ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

            {/* TV Screen Router */}
            <Panel style={{ padding: 7 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <Lbl>Monitor Wall — {liveCount} Live · 8 Rooms</Lbl>
                {apiRooms && <span style={{ fontSize: 7, color: C.green }}>● LIVE DATA</span>}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5 }}>
                {displayRooms.map((r) => (
                  <TvFrameTile key={r.id} room={{ id: r.id, name: r.name, emoji: r.emoji, isLive: panicMode ? true : r.isLive }} panicMode={panicMode} staticWatchers={r.watchers} />
                ))}
              </div>
            </Panel>

            {/* Admin tabs — Users / Content / Bots */}
            <Panel style={{ padding: 7 }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
                {(["USERS", "CONTENT", "BOTS"] as AdminTab[]).map((t) => (
                  <button key={t} onClick={() => setAdminTab(t)} style={{
                    flex: 1, padding: "3px 4px", background: adminTab === t ? "rgba(230,48,0,.18)" : "transparent",
                    borderBottom: `2px solid ${adminTab === t ? C.red : "transparent"}`,
                    border: `1px solid ${adminTab === t ? C.border : "transparent"}`,
                    color: adminTab === t ? C.gold : C.dim, fontFamily: "'Exo 2', sans-serif",
                    fontSize: 8, fontWeight: 700, cursor: "pointer", letterSpacing: ".06em", textTransform: "uppercase" as const,
                  }}>{t}</button>
                ))}
              </div>

              {adminTab === "USERS" && (
                <div>
                  <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users..."
                    style={{ width: "100%", background: C.card, border: `1px solid ${C.border}`, color: C.amber, fontFamily: "'Exo 2', sans-serif", fontSize: 9, outline: "none", borderRadius: 4, padding: "4px 7px", boxSizing: "border-box", marginBottom: 5 }} />
                  {userList.length === 0 && (
                    <div style={{ fontSize: 8, color: C.dim, padding: "6px 5px" }}>Loading users from database…</div>
                  )}
                  {userList
                    .filter((u) => {
                      const q = userSearch.toLowerCase();
                      return (u.displayName ?? u.email ?? "").toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
                    })
                    .slice(0, 40)
                    .map((u) => {
                      const display = u.displayName || u.email.split("@")[0] || u.id;
                      return (
                        <div key={u.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, padding: "3px 5px", background: "rgba(230,48,0,.07)", borderRadius: 3 }}>
                          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                            <StatusDot status="green" />
                            <div>
                              <div style={{ fontSize: 8 }}>{display}</div>
                              <div style={{ fontSize: 6, color: C.dim }}>{u.role} · {u.tier}</div>
                            </div>
                          </div>
                          <button style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.amber, fontSize: 6, padding: "1px 4px", borderRadius: 3, cursor: "pointer", fontFamily: "'Exo 2', sans-serif", fontWeight: 700 }}>Edit</button>
                        </div>
                      );
                    })}
                </div>
              )}

              {adminTab === "CONTENT" && (
                <div>
                  {[
                    { icon: "📰", label: "Magazine Issues", value: "12" },
                    { icon: "🎤", label: "Live Streams",    value: "14" },
                    { icon: "⚔️", label: "Battles",         value: "6"  },
                    { icon: "🎨", label: "NFT Listings",    value: "231"},
                    { icon: "🎵", label: "Beat Store",      value: "89" },
                    { icon: "📢", label: "Active Ads",      value: "22" },
                  ].map((c) => (
                    <div key={c.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, padding: "3px 5px", background: "rgba(230,48,0,.06)", borderRadius: 3 }}>
                      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                        <span>{c.icon}</span><span style={{ fontSize: 8 }}>{c.label}</span>
                      </div>
                      <Val size={9}>{c.value}</Val>
                    </div>
                  ))}
                </div>
              )}

              {adminTab === "BOTS" && (
                <div>
                  <Lbl>Bot Control Center</Lbl>
                  <div style={{ marginTop: 5 }}>
                    {bots.map((b) => <BotRow key={b.id} bot={b} onSummon={summonBot} />)}
                  </div>
                </div>
              )}
            </Panel>

            {/* Analytics bar chart */}
            <Panel style={{ padding: 7 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <Lbl>Artist Analytics & Revenue</Lbl>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 55, marginTop: 5 }}>
                    {[30,45,62,80,96,76,86].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 80 ? C.gold : h > 60 ? C.amber : C.orange, borderRadius: "2px 2px 0 0" }} />
                    ))}
                  </div>
                </div>
                <div>
                  <Lbl>Billboard Rankings</Lbl>
                  <div style={{ marginTop: 5 }}>
                    {[
                      { rank: 1, name: "Big KazhDog",      count: "👑 #1"   },
                      { rank: 2, name: "Chario Ace",       count: "📈 —"    },
                      { rank: 3, name: "BJM The Rapper",   count: "📈 —"    },
                      { rank: 4, name: "Jay Paul Beats",   count: "📈 —"    },
                      { rank: 5, name: "Big Ace",          count: "📈 —"    },
                    ].map((r) => (
                      <div key={r.rank} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                        <span style={{ fontSize: 7 }}>{r.rank}. {r.name}</span>
                        <span style={{ fontSize: 7, color: C.gold }}>{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>

            {/* Trust Killer Feed */}
            <TrustKillerFeed events={events} />
          </div>

          {/* ── RIGHT RAIL ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>

            {/* Platform Health */}
            <Panel style={{ padding: 8 }}>
              <Lbl>Platform Health</Lbl>
              <div style={{ marginTop: 6 }}>
                {gates.map((g) => <AnimatedGateRow key={g.id} gate={g} />)}
              </div>
            </Panel>

            {/* Security */}
            <Panel style={{ padding: 8 }}>
              <Lbl>Security Sentinel Wall</Lbl>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 9 }}>100 Sentinels</span>
                <RadarSweep />
              </div>
              <div style={{ fontSize: 8, color: C.green, marginBottom: 4 }}>● THREAT LEVEL: STABLE</div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 7, color: C.dim }}>Vulnerabilities</span><span style={{ fontSize: 8, color: C.gold, fontWeight: 700 }}>2 open</span></div>
              <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 7, color: C.dim }}>Active Alerts</span><span style={{ fontSize: 8, color: C.red, fontWeight: 700 }}>11+</span></div>
            </Panel>

            {/* Account Linker */}
            <Panel style={{ padding: 8 }}>
              <Lbl>Account Linker</Lbl>
              <div style={{ marginTop: 6 }}>
                {ACCOUNT_LINKS.map((a) => (
                  <div key={a.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 10 }}>{a.icon}</span>
                      <span style={{ fontSize: 8 }}>{a.label}</span>
                    </div>
                    <StatusDot status={a.status === "ok" ? "green" : a.status === "warn" ? "yellow" : "dim"} />
                  </div>
                ))}
              </div>
            </Panel>

            {/* Revenue */}
            <Panel style={{ padding: 8 }}>
              <Lbl>Revenue Breakdown</Lbl>
              <div style={{ marginTop: 6 }}>
                {[
                  { label: "Stripe Today",  value: "$4.1k", color: C.gold  },
                  { label: "Tips",          value: "$865",  color: C.green },
                  { label: "Ads Revenue",   value: "$520",  color: C.cyan  },
                  { label: "Tickets",       value: "$2.4k", color: C.gold  },
                ].map((r) => (
                  <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 7, color: C.dim }}>{r.label}</span>
                    <span style={{ fontSize: 9, color: r.color, fontWeight: 700, fontFamily: "'Orbitron', monospace" }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Nav links */}
            <Panel style={{ padding: 8 }}>
              <Lbl>Admin Navigation</Lbl>
              <div style={{ marginTop: 5 }}>
                {[
                  { label: "Life Support",  href: "/admin/life-support" },
                  { label: "Overseer",      href: "/admin/overseer"     },
                  { label: "Users",         href: "/admin/users"        },
                  { label: "Billing",       href: "/admin/billing"      },
                  { label: "Fan Theater",   href: "/fan/theater"        },
                  { label: "Artist Studio", href: "/performer/studio"   },
                  { label: "Home",          href: "/home/1"             },
                ].map((lk) => (
                  <a key={lk.href} href={lk.href} style={{ display: "block", fontSize: 9, color: C.dim, padding: "2px 0", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.cyan)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C.dim)}
                  >
                    › {lk.label}
                  </a>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {/* ── CRITICAL ALERT BADGE ── */}
      {hasError && (
        <div style={{
          position: "fixed", top: 70, right: 20, zIndex: 999,
          background: C.red, borderRadius: 6, padding: "4px 10px",
          fontSize: 9, fontWeight: 900, color: "#fff",
          letterSpacing: "0.08em", fontFamily: "'Orbitron', monospace",
          animation: "critBlink 1s ease-in-out infinite",
          boxShadow: `0 0 16px ${C.red}88`,
        }}>
          ⚠ SYSTEM ALERT — CHECK HEALTH GATES
        </div>
      )}
    </>
  );
}

// ─── Tiny button helper ───────────────────────────────────────────────────────
function Btn({ children, onClick, disabled, color, href }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  color?: string; href?: string;
}) {
  const style: React.CSSProperties = {
    background: "transparent", border: `1px solid ${color ?? "rgba(220,70,0,.5)"}`,
    color: color ?? "#FF8C00", fontFamily: "'Exo 2', sans-serif", fontSize: 8,
    fontWeight: 700, cursor: disabled ? "default" : "pointer", borderRadius: 4,
    padding: "4px 8px", transition: "all .15s", letterSpacing: ".05em",
    textTransform: "uppercase", textDecoration: "none", display: "inline-block",
    opacity: disabled ? 0.4 : 1,
  };
  if (href) return <a href={href} style={style}>{children}</a>;
  return <button style={style} onClick={onClick} disabled={disabled}>{children}</button>;
}
