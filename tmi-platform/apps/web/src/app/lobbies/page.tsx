import Link from "next/link";

const LOBBY_ROOMS = [
  { slug: "arena-east",       title: "Arena East",       mode: "arena",   count: 214, hot: true  },
  { slug: "vip-neon-lounge",  title: "VIP Neon Lounge",  mode: "lobby",   count: 87,  hot: false },
  { slug: "cypher-drop",      title: "Cypher Drop",      mode: "cypher",  count: 342, hot: true  },
  { slug: "producer-lab",     title: "Producer Lab",     mode: "producer",count: 56,  hot: false },
  { slug: "battle-zone",      title: "Battle Zone",      mode: "battle",  count: 189, hot: true  },
  { slug: "listening-party",  title: "Listening Party",  mode: "lobby",   count: 73,  hot: false },
  { slug: "monthly-idol",     title: "Monthly Idol",     mode: "gameshow",count: 5841,hot: true  },
  { slug: "test-room",        title: "Open Room",        mode: "lobby",   count: 12,  hot: false },
];

const MODE_COLORS: Record<string, { accent: string; glow: string; icon: string }> = {
  arena:    { accent: "#FF2DAA", glow: "rgba(255,45,170,0.35)",   icon: "🏟️" },
  lobby:    { accent: "#FFD700", glow: "rgba(255,215,0,0.3)",     icon: "🎪" },
  cypher:   { accent: "#00FFFF", glow: "rgba(0,255,255,0.3)",     icon: "🎤" },
  producer: { accent: "#AA2DFF", glow: "rgba(170,45,255,0.35)",   icon: "🎛️" },
  battle:   { accent: "#FF6600", glow: "rgba(255,102,0,0.3)",     icon: "⚔️" },
  gameshow: { accent: "#FFD700", glow: "rgba(255,215,0,0.4)",     icon: "🎬" },
};

export default function LobbiesPage() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 50% 80%, #0d0020 0%, #03020b 60%)",
      color: "#fff",
      fontFamily: "'Inter', system-ui, sans-serif",
      padding: "28px 24px 100px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 1200, margin: "0 auto 32px" }}>
        <p style={{ fontSize: 10, letterSpacing: "0.24em", color: "#FF2DAA", textTransform: "uppercase", fontWeight: 800, marginBottom: 8 }}>
          The Musician&apos;s Index
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 900, letterSpacing: "0.06em", margin: 0, textTransform: "uppercase", color: "#fff", textShadow: "0 0 30px rgba(255,45,170,0.5)" }}>
            Live Lobbies
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 14px", borderRadius: 999, background: "rgba(255,45,170,0.12)", border: "1px solid rgba(255,45,170,0.35)" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF2DAA", boxShadow: "0 0 6px #FF2DAA", display: "inline-block" }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "#FF2DAA" }}>LIVE NOW</span>
          </div>
        </div>
      </div>

      {/* Room grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {LOBBY_ROOMS.map((room) => {
          const colors = MODE_COLORS[room.mode] ?? MODE_COLORS.lobby!;
          return (
            <Link
              key={room.slug}
              href={`/lobbies/${room.slug}`}
              style={{ textDecoration: "none" }}
            >
              <div style={{
                position: "relative",
                borderRadius: 16,
                border: `1px solid ${colors.accent}44`,
                background: `linear-gradient(135deg, rgba(10,5,25,0.95), rgba(5,3,14,0.98))`,
                padding: "20px 20px 16px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 200ms ease, box-shadow 200ms ease",
                boxShadow: `0 0 24px ${colors.glow}, inset 0 0 20px rgba(0,0,0,0.4)`,
              }}>
                {/* Background glow blob */}
                <div style={{
                  position: "absolute", top: 0, right: 0, width: 120, height: 120,
                  background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
                  borderRadius: "50%", transform: "translate(30%, -30%)", pointerEvents: "none",
                }} />

                {/* Hot badge */}
                {room.hot && (
                  <div style={{
                    position: "absolute", top: 12, right: 12,
                    padding: "3px 9px", borderRadius: 999,
                    background: colors.accent + "22", border: `1px solid ${colors.accent}55`,
                    fontSize: 9, fontWeight: 900, letterSpacing: "0.14em",
                    color: colors.accent, textTransform: "uppercase",
                  }}>
                    🔥 HOT
                  </div>
                )}

                <div style={{ fontSize: 28, marginBottom: 10 }}>{colors.icon}</div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", color: colors.accent, textTransform: "uppercase", marginBottom: 6 }}>
                  {room.mode.toUpperCase()}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#fff", marginBottom: 12 }}>{room.title}</div>

                {/* Audience bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 2,
                      width: `${Math.min(100, (room.count / 6000) * 100)}%`,
                      background: `linear-gradient(to right, ${colors.accent}, ${colors.accent}88)`,
                      transition: "width 800ms ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)" }}>
                    {room.count.toLocaleString()} inside
                  </div>
                </div>

                {/* Enter CTA */}
                <div style={{
                  marginTop: 14, padding: "8px 14px", borderRadius: 8,
                  background: `${colors.accent}18`, border: `1px solid ${colors.accent}44`,
                  textAlign: "center", fontSize: 11, fontWeight: 900,
                  letterSpacing: "0.16em", color: colors.accent, textTransform: "uppercase",
                }}>
                  Enter Room →
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
