"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import RoomContainer, { useRoom } from "@/components/room/RoomContainer";
import WidgetSlot from "@/components/room/WidgetSlot";
import { usePresenceEngine } from "@/lib/live/presenceEngine";
import TrackUploadPanel from "@/components/music/TrackUploadPanel";
import MemoryWall from "@/components/profile/MemoryWall";
import TieredAdSlot from "@/components/ads/TieredAdSlot";
import ArtifactWall from "@/components/artifacts/ArtifactWall";
import VenueLobbyWall from "@/components/live/VenueLobbyWall";
import IntermissionAdPlayer from "@/components/ads/IntermissionAdPlayer";

// ── Monitor surface ───────────────────────────────────────────────────────────

function Monitor({ title, icon, children, accentColor, style }: {
  title: string; icon: string; children: React.ReactNode;
  accentColor?: string; style?: React.CSSProperties;
}) {
  const { accentColor: roomColor } = useRoom();
  const color = accentColor ?? roomColor;
  return (
    <div style={{
      border: `1px solid ${color}33`,
      borderRadius: 14,
      background: "rgba(5,5,18,0.85)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      ...style,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "10px 14px",
        borderBottom: `1px solid ${color}22`,
        background: "rgba(255,255,255,0.02)",
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

// ── Main Stage Monitor ────────────────────────────────────────────────────────

function StageMonitor({ onIntermission }: { onIntermission: (v: boolean) => void }) {
  const { accentColor } = useRoom();
  const presence = usePresenceEngine("fan-theater");
  const [isIntermission, setIsIntermission] = useState(false);

  const toggleIntermission = () => {
    const next = !isIntermission;
    setIsIntermission(next);
    onIntermission(next);
  };

  return (
    <Monitor title="Main Stage" icon="🎭" accentColor={accentColor}>
      {/* Stage screen */}
      <div style={{
        width: "100%", aspectRatio: "16/9", borderRadius: 10,
        background: `linear-gradient(135deg, #0a0020 0%, #020210 100%)`,
        border: `1px solid ${accentColor}33`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        position: "relative", overflow: "hidden", marginBottom: 12,
      }}>
        {[0, 1, 2].map((i) => (
          <motion.div key={i}
            animate={{ opacity: [0.1, 0.3, 0.1], rotate: [i * 30, i * 30 + 5, i * 30] }}
            transition={{ repeat: Infinity, duration: 3 + i, ease: "easeInOut" }}
            style={{
              position: "absolute", top: 0, left: "50%",
              width: 2, height: "60%",
              background: `linear-gradient(180deg, ${accentColor}88, transparent)`,
              transformOrigin: "top center",
              transform: `translateX(-50%) rotate(${(i - 1) * 25}deg)`,
            }}
          />
        ))}
        {isIntermission ? (
          <div style={{ textAlign: "center", zIndex: 1 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>⏸</div>
            <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 900, letterSpacing: "0.2em" }}>INTERMISSION</div>
          </div>
        ) : (
          <>
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              style={{ fontSize: 32, zIndex: 1 }}>🎤</motion.div>
            <div style={{ fontSize: 10, color: accentColor, fontWeight: 800, letterSpacing: "0.15em", zIndex: 1, marginTop: 8 }}>LIVE NOW</div>
          </>
        )}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "25%",
          background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.8))",
          display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, paddingBottom: 4,
        }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ width: 8, height: 14 + (i % 3) * 4, borderRadius: "50% 50% 0 0", background: "rgba(255,255,255,0.12)" }} />
          ))}
        </div>
      </div>

      {/* Presence strip */}
      <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
        {[
          { label: "Watching", value: presence.watching, color: accentColor },
          { label: "Active",   value: presence.active,   color: "#22c55e"  },
          { label: "Bots",     value: presence.bots,     color: "#6b7280"  },
        ].map((s) => (
          <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Intermission / Rooms */}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={toggleIntermission} style={{
          flex: 1, padding: "6px 0", borderRadius: 7, fontSize: 9, fontWeight: 800,
          cursor: "pointer", letterSpacing: "0.08em",
          background: isIntermission ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${isIntermission ? "rgba(245,158,11,0.35)" : "rgba(255,255,255,0.1)"}`,
          color: isIntermission ? "#f59e0b" : "rgba(255,255,255,0.4)",
        }}>
          {isIntermission ? "▶ RESUME SHOW" : "⏸ INTERMISSION"}
        </button>
        <a href="/rooms/world-concert" style={{
          flex: 1, padding: "6px 0", borderRadius: 7, fontSize: 9, fontWeight: 800,
          background: `${accentColor}18`, border: `1px solid ${accentColor}44`,
          color: accentColor, textDecoration: "none", textAlign: "center", letterSpacing: "0.08em",
        }}>CONCERT HALL ›</a>
      </div>

      {presence.joinedRecently.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.35)", display: "flex", gap: 4, flexWrap: "wrap" }}>
          {presence.joinedRecently.slice(0, 4).map((n) => (
            <span key={n} style={{ background: "rgba(255,255,255,0.05)", padding: "2px 7px", borderRadius: 8 }}>{n}</span>
          ))}
          <span style={{ color: "rgba(255,255,255,0.2)" }}>just joined</span>
        </div>
      )}
    </Monitor>
  );
}

// ── Discovery Monitor ─────────────────────────────────────────────────────────

const DISCOVERY_ROOMS = [
  { id: "cypher",            name: "Nova Cipher — Live Cypher",  viewers: 412,  type: "Cypher",    hot: true,  href: "/rooms/cypher"            },
  { id: "world-dance-party", name: "World Dance Party",          viewers: 880,  type: "DJ Stream",  hot: true,  href: "/rooms/world-dance-party" },
  { id: "battle",            name: "Battle Arena #4",            viewers: 231,  type: "Battle",    hot: false, href: "/rooms/battle/battle4"    },
  { id: "monday-stage",      name: "Monday Night Stage",         viewers: 615,  type: "Concert",   hot: true,  href: "/rooms/monday-stage"      },
  { id: "dirty-dozens",      name: "Dirty Dozens",               viewers: 184,  type: "Game",      hot: false, href: "/rooms/dirty-dozens"      },
];

function DiscoveryMonitor() {
  const { accentColor } = useRoom();
  return (
    <Monitor title="Discovery" icon="🔭" accentColor={accentColor}>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}>Live Now</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {DISCOVERY_ROOMS.map((r) => (
          <a key={r.id} href={r.href} style={{
            textDecoration: "none", display: "flex", alignItems: "center", gap: 10,
            padding: "7px 10px", borderRadius: 8,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
          }}>
            {r.hot
              ? <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
              : <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e2e8f0" }}>{r.name}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{r.type}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: accentColor }}>{r.viewers}</div>
          </a>
        ))}
      </div>
      <div style={{ marginTop: 10 }}>
        <a href="/rooms" style={{ fontSize: 10, color: accentColor, textDecoration: "none", fontWeight: 700, letterSpacing: "0.08em" }}>VIEW ALL LIVE ›</a>
      </div>
    </Monitor>
  );
}

// ── Playlist Monitor ──────────────────────────────────────────────────────────

function PlaylistMonitor() {
  const { accentColor } = useRoom();
  return (
    <Monitor title="Playlist" icon="🎵" accentColor={accentColor}>
      <TrackUploadPanel accent={accentColor} />
      <div style={{ marginTop: 10 }}>
        <TrackUploadPanel accent="#FF2DAA" />
      </div>
    </Monitor>
  );
}

// ── Fan Dock ──────────────────────────────────────────────────────────────────

function FanDock({ accentColor }: { accentColor: string }) {
  const [lastReaction, setLastReaction] = useState<string | null>(null);
  const react = (emoji: string) => {
    setLastReaction(emoji);
    setTimeout(() => setLastReaction(null), 1500);
  };
  return (
    <div style={{
      position: "sticky", bottom: 0, left: 0, right: 0,
      borderTop: `1px solid ${accentColor}33`,
      background: "rgba(2,2,9,0.95)",
      backdropFilter: "blur(12px)",
      padding: "10px 20px",
      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      zIndex: 50,
    }}>
      <a href="/rooms/world-dance-party" style={{
        padding: "8px 18px", borderRadius: 8, fontSize: 11, fontWeight: 800,
        background: `${accentColor}22`, border: `1px solid ${accentColor}44`,
        color: accentColor, textDecoration: "none", letterSpacing: "0.08em",
      }}>▶ JOIN STAGE</a>
      {["💎","🔥","❤️","🙌","⚡","🎶","💰"].map((e) => (
        <motion.button key={e} whileTap={{ scale: 1.4 }} onClick={() => react(e)} style={{
          fontSize: 20, background: "none", border: "none", cursor: "pointer", padding: 0,
        }}>{e}</motion.button>
      ))}
      {lastReaction && (
        <motion.div initial={{ y: 0, opacity: 1 }} animate={{ y: -40, opacity: 0 }} transition={{ duration: 1.2 }}
          style={{ position: "absolute", bottom: 60, left: "50%", fontSize: 24, pointerEvents: "none" }}>
          {lastReaction}
        </motion.div>
      )}
      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <a href="/fan/dashboard" style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>Dashboard</a>
        <a href="/profile/fan/me"  style={{ fontSize: 10, color: accentColor, textDecoration: "none" }}>My Profile ›</a>
      </div>
    </div>
  );
}

// ── Inner layout ──────────────────────────────────────────────────────────────

function FanTheaterInner() {
  const { accentColor, title } = useRoom();
  const [isIntermission, setIsIntermission] = useState(false);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <a href="/fan/dashboard" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none", letterSpacing: "0.12em" }}>← DASHBOARD</a>
        <div style={{ fontSize: 14, fontWeight: 900, color: accentColor, letterSpacing: "0.08em" }}>{title}</div>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e" }} />
        <span style={{ fontSize: 9, color: "#22c55e", fontWeight: 800, letterSpacing: "0.12em" }}>LIVE</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          <a href="/rooms/cypher"            style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>CYPHER</a>
          <a href="/rooms/world-dance-party" style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>DANCE PARTY</a>
          <a href="/rooms/monday-stage"      style={{ fontSize: 9, color: accentColor, textDecoration: "none", fontWeight: 700 }}>MONDAY STAGE ›</a>
        </div>
      </div>

      {/* Leaderboard ad — free users */}
      <div style={{ padding: "0 20px 12px" }}>
        <TieredAdSlot tier="free" placement="leaderboard" height={60} />
      </div>

      {/* Monitor grid */}
      <div style={{ flex: 1, padding: "0 20px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "auto auto", gap: 14 }}>
        <WidgetSlot name="stage" style={{ gridRow: "1 / 3", position: "relative" }}>
          <StageMonitor onIntermission={setIsIntermission} />
          <IntermissionAdPlayer
            isActive={isIntermission}
            userTier="free"
            onClose={() => setIsIntermission(false)}
            accentColor={accentColor}
            performerName="The Artist"
            returnInSeconds={300}
          />
        </WidgetSlot>

        <WidgetSlot name="discovery">
          <DiscoveryMonitor />
        </WidgetSlot>

        <TieredAdSlot tier="free" placement="in-content" height={60} style={{ gridColumn: "2" }} />

        <WidgetSlot name="playlist">
          <PlaylistMonitor />
        </WidgetSlot>
      </div>

      {/* Venue Lobby Wall — expandable audience with chevron */}
      <div style={{ padding: "0 20px 16px" }}>
        <WidgetSlot name="audience-lobby">
          <VenueLobbyWall
            roomId="fan-theater"
            accentColor={accentColor}
            userTier="free"
            defaultSize="sm"
            view="fan"
          />
        </WidgetSlot>
      </div>

      {/* Artifact Wall */}
      <div style={{ padding: "0 20px 16px" }}>
        <WidgetSlot name="artifacts">
          <ArtifactWall role="fan" userPoints={324} accentColor={accentColor} title="Your Playlists" />
        </WidgetSlot>
      </div>

      {/* Memory Wall */}
      <div style={{ padding: "0 20px 16px" }}>
        <WidgetSlot name="memory">
          <MemoryWall userId="me" isOwner={true} accent={accentColor} />
        </WidgetSlot>
      </div>

      {/* Footer ad before dock */}
      <div style={{ padding: "0 20px 8px" }}>
        <TieredAdSlot tier="free" placement="footer-banner" height={50} />
      </div>

      <FanDock accentColor={accentColor} />
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FanTheaterPage() {
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
          ENTERING THEATER…
        </motion.div>
      </div>
    );
  }

  return (
    <RoomContainer roomId="fan-theater" title="FAN THEATER" roomType="watch" accentColor="#00FFFF">
      <FanTheaterInner />
    </RoomContainer>
  );
}
