import Link from "next/link";

const SEED_GAMES = [
  { id: "deal-or-feud",    title: "Deal or Feud",      sessions: 34, active: 3, room: "/rooms/deal-or-feud",    color: "#FF2DAA" },
  { id: "name-that-tune",  title: "Name That Tune",     sessions: 51, active: 1, room: "/rooms/name-that-tune",  color: "#00FFFF" },
  { id: "lyric-fill",      title: "Lyric Fill",         sessions: 28, active: 0, room: "/rooms/lyric-fill",      color: "#FFD700" },
  { id: "cover-art-zoom",  title: "Cover Art Zoom",     sessions: 19, active: 2, room: "/rooms/cover-art-zoom",  color: "#A855F7" },
  { id: "dj-mix-off",      title: "DJ Mix-Off",         sessions: 12, active: 1, room: "/rooms/dj-mix-off",      color: "#ff6b35" },
  { id: "trivia",          title: "Music Trivia",        sessions: 67, active: 5, room: "/rooms/trivia",          color: "#00FFFF" },
];

export default function AdminGamesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 4 }}>ADMIN</div>
        <h1 className="text-3xl font-bold text-[#ff6b35]">Games</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
          {SEED_GAMES.reduce((a, g) => a + g.active, 0)} active sessions across {SEED_GAMES.length} game types
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 12 }}>
        {SEED_GAMES.map((g) => (
          <div key={g.id} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${g.color}28`, borderRadius: 14, padding: "20px" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: g.color, marginBottom: 12 }}>{g.title}</div>
            <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{g.sessions}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>total sessions</div>
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 900, color: g.active > 0 ? "#00FFFF" : "rgba(255,255,255,0.2)" }}>{g.active}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>active now</div>
              </div>
            </div>
            <Link href={g.room} style={{ fontSize: 11, color: g.color, textDecoration: "none", fontWeight: 700 }}>Open Room →</Link>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        <Link href="/admin/contests" style={{ fontSize: 12, color: "#ff6b35", textDecoration: "none" }}>Contests →</Link>
      </div>
    </main>
  );
}
