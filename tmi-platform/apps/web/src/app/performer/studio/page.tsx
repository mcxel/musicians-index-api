"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import RoomContainer, { useRoom } from "@/components/room/RoomContainer";
import WidgetSlot from "@/components/room/WidgetSlot";
import MediaMonitor from "@/components/video/MediaMonitor";
import { usePresenceEngine } from "@/lib/live/presenceEngine";
import { STRIPE_PRODUCTS } from "@/lib/stripe/products";
import { activatePhase1Bots } from "@/lib/bots/Phase1BotActivator";
import ArtifactWall from "@/components/artifacts/ArtifactWall";
import VenueLobbyWall from "@/components/live/VenueLobbyWall";
import IntermissionAdPlayer from "@/components/ads/IntermissionAdPlayer";
import TieredAdSlot from "@/components/ads/TieredAdSlot";
import PerformanceModeSelector, { type PerformanceMode } from "@/components/room/PerformanceModeSelector";

// ── Performer Welcome Banner ──────────────────────────────────────────────────

function PerformerWelcome({ onDismiss }: { onDismiss: () => void }) {
  const { accentColor } = useRoom();
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      style={{
        margin: "0 20px 12px",
        padding: "14px 18px",
        borderRadius: 12,
        background: `linear-gradient(135deg, ${accentColor}14 0%, rgba(0,255,136,0.06) 100%)`,
        border: `1px solid ${accentColor}33`,
        display: "flex", alignItems: "center", gap: 16,
      }}
    >
      <div style={{ fontSize: 28, flexShrink: 0 }}>🎤</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: accentColor, letterSpacing: "0.04em", marginBottom: 3 }}>
          Welcome to your Promotion Hub
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
          We thank you for joining. We are ready to take you and your music global.
          We appreciate you — <span style={{ color: accentColor, fontWeight: 700 }}>we grow together.</span>
        </div>
      </div>
      <button onClick={onDismiss}
        style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", fontSize: 16, cursor: "pointer", flexShrink: 0 }}>
        ×
      </button>
    </motion.div>
  );
}

// ── Monitor ───────────────────────────────────────────────────────────────────

function Monitor({ title, icon, children, accentColor, style }: {
  title: string; icon: string; children: React.ReactNode;
  accentColor?: string; style?: React.CSSProperties;
}) {
  const { accentColor: roomColor } = useRoom();
  const color = accentColor ?? roomColor;
  return (
    <div style={{
      border: `1px solid ${color}33`, borderRadius: 14,
      background: "rgba(5,5,18,0.85)", overflow: "hidden",
      display: "flex", flexDirection: "column", ...style,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        borderBottom: `1px solid ${color}22`, background: "rgba(255,255,255,0.02)",
      }}>
        <span style={{ fontSize: 14 }}>{icon}</span>
        <span style={{ fontSize: 10, fontWeight: 900, color, letterSpacing: "0.14em", textTransform: "uppercase" }}>{title}</span>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 2 }}
          style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: color }} />
      </div>
      <div style={{ flex: 1, padding: 12, overflowY: "auto" }}>{children}</div>
    </div>
  );
}

// ── Primary Broadcast Monitor ─────────────────────────────────────────────────

function BroadcastMonitor({ isLive, mode, onToggleLive }: {
  isLive: boolean;
  mode: PerformanceMode;
  onToggleLive: () => void;
}) {
  const { accentColor } = useRoom();
  const [cameraActive, setCameraActive] = useState(false);
  const [audioLevel, setAudioLevel]     = useState(0);
  const audioRef = useRef<MediaStream | null>(null);

  // Audio meter (visual VU)
  useEffect(() => {
    if (!cameraActive) { setAudioLevel(0); return; }
    let raf: number;
    const tick = () => {
      setAudioLevel(Math.random() * 70 + 20);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [cameraActive]);

  const modeColor = mode === "private" ? "#6b7280" : mode === "community" ? "#60a5fa" : accentColor;

  return (
    <Monitor title="Broadcast Feed" icon="📹" accentColor={accentColor} style={{ minHeight: 300 }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 10, overflow: "hidden", background: "#050510", marginBottom: 10 }}>
        {cameraActive ? (
          <MediaMonitor mode="self-view" isActive={cameraActive} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ fontSize: 32 }}>📷</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Camera standby</div>
          </div>
        )}
        {/* Status badges */}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 6 }}>
          {isLive && (
            <div style={{ fontSize: 9, fontWeight: 900, color: "#fff", background: "#ef4444", padding: "2px 8px", borderRadius: 6, letterSpacing: "0.1em" }}>
              ● LIVE
            </div>
          )}
          {cameraActive && (
            <div style={{ fontSize: 9, fontWeight: 800, color: accentColor, background: `${accentColor}22`, border: `1px solid ${accentColor}44`, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.1em" }}>
              CAM ON
            </div>
          )}
          <div style={{ fontSize: 9, fontWeight: 800, color: modeColor, background: `${modeColor}22`, border: `1px solid ${modeColor}44`, padding: "2px 8px", borderRadius: 6, letterSpacing: "0.1em" }}>
            {mode.toUpperCase()}
          </div>
        </div>

        {/* Audio VU bar */}
        {cameraActive && (
          <div style={{ position: "absolute", bottom: 8, right: 8, display: "flex", gap: 1.5, alignItems: "flex-end" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                width: 3,
                height: Math.max(3, (audioLevel / 100) * 20 * (0.5 + Math.random() * 0.5)),
                background: audioLevel > 70 ? "#ef4444" : accentColor,
                borderRadius: 1, transition: "height 0.08s",
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setCameraActive(!cameraActive)}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.08em",
            background: cameraActive ? "rgba(239,68,68,0.15)" : `${accentColor}22`,
            border: `1px solid ${cameraActive ? "rgba(239,68,68,0.35)" : accentColor + "44"}`,
            color: cameraActive ? "#fca5a5" : accentColor,
          }}
        >
          {cameraActive ? "⏹ STOP CAM" : "▶ START CAM"}
        </button>
        <button onClick={onToggleLive} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 800,
          cursor: "pointer", letterSpacing: "0.08em", textAlign: "center",
          background: isLive ? "rgba(239,68,68,0.2)" : `rgba(34,197,94,0.15)`,
          border: `1px solid ${isLive ? "rgba(239,68,68,0.35)" : "rgba(34,197,94,0.35)"}`,
          color: isLive ? "#fca5a5" : "#86efac",
        }}>
          {isLive ? "END STREAM" : "GO LIVE ›"}
        </button>
      </div>

      {/* Sound check notice */}
      {!cameraActive && (
        <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 7, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
          🎤 Camera off · Audio capture ready once you start cam
        </div>
      )}
    </Monitor>
  );
}

// ── Audience Radar ────────────────────────────────────────────────────────────

function AudienceRadar({ mode }: { mode: import("@/lib/live/presenceEngine").PresenceMode }) {
  const { accentColor } = useRoom();
  const presence = usePresenceEngine("broadcast-studio", 8000, mode);
  const [events, setEvents] = useState<{ id: number; text: string; type: "join" | "tip" | "follow" }[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    const names = ["Nova Fan", "CityBeat", "Aria", "Jay Flow", "Suki"];
    const actions = [
      { text: `${names[counterRef.current % names.length]} joined`, type: "join" as const },
      { text: `${names[(counterRef.current + 2) % names.length]} sent a $5 tip`, type: "tip" as const },
      { text: `${names[(counterRef.current + 1) % names.length]} followed you`, type: "follow" as const },
    ];
    const id = setInterval(() => {
      const action = actions[counterRef.current % actions.length]!;
      counterRef.current++;
      setEvents((prev) => [{ id: Date.now(), ...action }, ...prev.slice(0, 8)]);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <Monitor title="Audience Radar" icon="📡" accentColor={accentColor}>
      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: accentColor }}>{presence.watching}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Watching</div>
        </div>
        <div style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#22c55e" }}>{presence.peak}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Peak</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <AnimatePresence initial={false}>
          {events.map((e) => (
            <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              style={{
                fontSize: 11, padding: "5px 8px", borderRadius: 7, display: "flex", alignItems: "center", gap: 6,
                background: e.type === "tip" ? "rgba(245,158,11,0.1)" : e.type === "follow" ? "rgba(170,45,255,0.1)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${e.type === "tip" ? "rgba(245,158,11,0.2)" : e.type === "follow" ? "rgba(170,45,255,0.15)" : "rgba(255,255,255,0.06)"}`,
              }}>
              <span>{e.type === "tip" ? "💰" : e.type === "follow" ? "👤" : "🟢"}</span>
              <span style={{ color: "rgba(255,255,255,0.7)" }}>{e.text}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Monitor>
  );
}

// ── Revenue Monitor ───────────────────────────────────────────────────────────

function RevenueMonitor() {
  const { accentColor } = useRoom();
  const lines = [
    { label: "Tips today",       value: "$0.00",                                                               color: "#f59e0b" },
    { label: "Subscriptions",    value: `$${(STRIPE_PRODUCTS.PERFORMER_SILVER_MONTHLY.price / 100).toFixed(2)}/mo`, color: "#22c55e" },
    { label: "Beat sales",       value: "$0.00",                                                               color: "#818cf8" },
    { label: "Bookings pending", value: "0",                                                                   color: "#60a5fa" },
    { label: "Meet & Greet",     value: `$${(STRIPE_PRODUCTS.MEET_GREET.price / 100).toFixed(2)} ea`,          color: "#f472b6" },
    { label: "Shoutouts",        value: `$${(STRIPE_PRODUCTS.SHOUTOUT.price / 100).toFixed(2)} ea`,            color: "#a78bfa" },
  ];
  return (
    <Monitor title="Revenue" icon="💰" accentColor={accentColor}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {lines.map((l) => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", borderRadius: 7, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: l.color }} />
            <span style={{ flex: 1, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{l.label}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: l.color }}>{l.value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <a href="/admin/conductor/economy" style={{ fontSize: 10, color: accentColor, textDecoration: "none", fontWeight: 700, letterSpacing: "0.08em" }}>FULL REPORT ›</a>
      </div>
    </Monitor>
  );
}

// ── Booking Monitor ───────────────────────────────────────────────────────────

function BookingMonitor() {
  const { accentColor } = useRoom();
  return (
    <Monitor title="Bookings" icon="📋" accentColor={accentColor}>
      <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, textAlign: "center", marginTop: 12, marginBottom: 12 }}>
        No pending booking requests.
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <a href="/booking" style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 10, fontWeight: 800, background: `${accentColor}12`, border: `1px solid ${accentColor}33`, color: accentColor, textDecoration: "none", textAlign: "center", letterSpacing: "0.08em" }}>
          BOOKING PAGE ›
        </a>
        <a href="/tickets/create" style={{ flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 10, fontWeight: 800, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)", textDecoration: "none", textAlign: "center", letterSpacing: "0.08em" }}>
          CREATE EVENT
        </a>
      </div>
    </Monitor>
  );
}

// ── Sponsor Monitor ───────────────────────────────────────────────────────────

function SponsorMonitor() {
  const { accentColor } = useRoom();
  const slots = [
    { label: "Local Slot 1",  status: "open", color: "#22c55e" },
    { label: "Local Slot 2",  status: "open", color: "#22c55e" },
    { label: "Major Slot 1",  status: "open", color: "#f59e0b" },
  ];
  return (
    <Monitor title="Sponsors" icon="🤝" accentColor={accentColor}>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
        {slots.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
            <span style={{ flex: 1, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{s.label}</span>
            <span style={{ fontSize: 9, fontWeight: 800, color: s.color, letterSpacing: "0.1em" }}>OPEN</span>
          </div>
        ))}
      </div>
      <a href="/sponsors" style={{ fontSize: 10, color: accentColor, textDecoration: "none", fontWeight: 700, letterSpacing: "0.08em" }}>FIND SPONSORS ›</a>
    </Monitor>
  );
}

// ── Bot activity rail ─────────────────────────────────────────────────────────

function BotRail({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div style={{
      padding: "8px 14px", background: "rgba(0,255,136,0.04)",
      borderTop: "1px solid rgba(0,255,136,0.1)",
      display: "flex", gap: 10, overflowX: "auto", flexWrap: "nowrap",
    }}>
      {messages.slice(-4).map((m, i) => (
        <div key={i} style={{ fontSize: 10, color: "rgba(0,255,136,0.7)", whiteSpace: "nowrap", flexShrink: 0 }}>
          🤖 {m}
        </div>
      ))}
    </div>
  );
}

// ── Inner layout ──────────────────────────────────────────────────────────────

function StudioInner() {
  const { accentColor, roomId, title } = useRoom();
  const [isLive,       setIsLive]       = useState(false);
  const [botMessages,  setBotMessages]  = useState<string[]>([]);
  const [showWelcome,  setShowWelcome]  = useState(true);
  const [perfMode,     setPerfMode]     = useState<PerformanceMode>("private");
  const [showModePanel, setShowModePanel] = useState(false);
  const [isIntermission, setIsIntermission] = useState(false);

  useEffect(() => {
    const cleanup = activatePhase1Bots(roomId, "performer-session", {
      onWelcome:  (text) => setBotMessages((p) => [...p, text]),
      onBotChat:  (name, text) => setBotMessages((p) => [...p, `${name}: ${text}`]),
      onBotHype:  (name) => setBotMessages((p) => [...p, `${name} hyped the room`]),
      onBotTip:   (name) => setBotMessages((p) => [...p, `${name} sent a tip`]),
      onDiag: () => {},
    });
    return cleanup;
  }, [roomId]);

  const toggleLive = () => {
    if (!isLive && perfMode === "private") {
      setPerfMode("performance");
    }
    setIsLive(!isLive);
  };

  const modeColor = perfMode === "private" ? "#6b7280" : perfMode === "community" ? "#60a5fa" : accentColor;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${accentColor}22` }}>
        <a href="/artists/dashboard" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.12em" }}>← DASHBOARD</a>
        <div style={{ fontSize: 14, fontWeight: 900, color: accentColor, letterSpacing: "0.08em" }}>{title}</div>

        {/* Mode selector compact */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowModePanel(!showModePanel)} style={{
            padding: "5px 12px", borderRadius: 7, fontSize: 9, fontWeight: 800,
            cursor: "pointer", letterSpacing: "0.08em",
            background: `${modeColor}18`, border: `1px solid ${modeColor}44`,
            color: modeColor,
          }}>
            {perfMode === "private" ? "🔒" : perfMode === "community" ? "👥" : "🎭"} {perfMode.toUpperCase()} ▾
          </button>
          <AnimatePresence>
            {showModePanel && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 200, width: 280 }}
              >
                <PerformanceModeSelector
                  mode={perfMode}
                  onChange={(m) => { setPerfMode(m); setShowModePanel(false); }}
                  accentColor={accentColor}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Intermission toggle */}
        <button onClick={() => setIsIntermission(!isIntermission)} style={{
          padding: "5px 12px", borderRadius: 7, fontSize: 9, fontWeight: 800,
          cursor: "pointer", letterSpacing: "0.08em",
          background: isIntermission ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isIntermission ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.1)"}`,
          color: isIntermission ? "#f59e0b" : "rgba(255,255,255,0.4)",
        }}>
          {isIntermission ? "▶ RESUME" : "⏸ BREAK"}
        </button>

        <button onClick={toggleLive} style={{
          marginLeft: "auto", padding: "7px 18px", borderRadius: 8, fontSize: 10, fontWeight: 900,
          cursor: "pointer", letterSpacing: "0.1em",
          background: isLive ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.15)",
          border: `1px solid ${isLive ? "rgba(239,68,68,0.4)" : "rgba(34,197,94,0.35)"}`,
          color: isLive ? "#fca5a5" : "#86efac",
        }}>
          {isLive ? "● LIVE — END" : "▶ GO LIVE"}
        </button>
        <a href="/admin/mission-control" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>MISSION CONTROL ›</a>
      </div>

      {/* Bot rail */}
      <BotRail messages={botMessages} />

      {/* Welcome banner */}
      <AnimatePresence>
        {showWelcome && <PerformerWelcome onDismiss={() => setShowWelcome(false)} />}
      </AnimatePresence>

      {/* Monitor grid */}
      <div style={{ flex: 1, padding: "16px 20px", display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gridTemplateRows: "auto auto", gap: 12 }}>
        <WidgetSlot name="stage" style={{ gridRow: "1 / 3", position: "relative" }}>
          <BroadcastMonitor isLive={isLive} mode={perfMode} onToggleLive={toggleLive} />
          {/* Intermission ad overlay on broadcast monitor for performers */}
          <IntermissionAdPlayer
            isActive={isIntermission && isLive}
            userTier="diamond"
            onClose={() => setIsIntermission(false)}
            accentColor={accentColor}
            performerName="You"
            returnInSeconds={180}
          />
        </WidgetSlot>

        <WidgetSlot name="radar">
          <AudienceRadar mode={perfMode} />
        </WidgetSlot>

        <WidgetSlot name="revenue">
          <RevenueMonitor />
        </WidgetSlot>

        <WidgetSlot name="booking">
          <BookingMonitor />
        </WidgetSlot>

        <WidgetSlot name="sponsor">
          <SponsorMonitor />
        </WidgetSlot>
      </div>

      {/* Audience lobby — performer view, shows who's watching */}
      <div style={{ padding: "0 20px 16px" }}>
        <VenueLobbyWall
          roomId="broadcast-studio"
          accentColor={accentColor}
          userTier="diamond"
          defaultSize="sm"
          view="performer"
        />
      </div>

      {/* Sponsor ad slot — visible to performer for awareness of what fans see */}
      {isLive && (
        <div style={{ padding: "0 20px 10px" }}>
          <TieredAdSlot tier="free" placement="in-content" height={50} />
          <div style={{ marginTop: 4, fontSize: 9, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
            Preview of what free fans see during your stream
          </div>
        </div>
      )}

      {/* Artifact Vault */}
      <div style={{ padding: "0 20px 24px" }}>
        <ArtifactWall role="performer" userPoints={567} accentColor={accentColor} title="Artifact Vault" />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BroadcastStudioPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.authenticated) { router.replace("/auth"); return; }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, [router]);

  if (!ready) {
    return (
      <div style={{ minHeight: "100vh", background: "#020209", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.15em" }}>
          LOADING STUDIO…
        </motion.div>
      </div>
    );
  }

  return (
    <RoomContainer roomId="broadcast-studio" title="BROADCAST STUDIO" roomType="arena" accentColor="#AA2DFF">
      <StudioInner />
    </RoomContainer>
  );
}
