import Link from "next/link";

const SEED_TOP_ARTISTS = [
  { rank: 1,  name: "BXRN OUT",    points: 9_840, badge: "🏆", change: "+12" },
  { rank: 2,  name: "LXRD WAVE",   points: 8_210, badge: "🥈", change: "+5"  },
  { rank: 3,  name: "CYPHA GOD",   points: 7_650, badge: "🥉", change: "+8"  },
  { rank: 4,  name: "INK PRIEST",  points: 6_320, badge: "🔥", change: "-1"  },
  { rank: 5,  name: "MELO BOSS",   points: 5_900, badge: "⚡", change: "+3"  },
  { rank: 6,  name: "TRAPXMELO",   points: 5_100, badge: "💎", change: "0"   },
  { rank: 7,  name: "DUSKWAVE",    points: 4_880, badge: "🎵", change: "+2"  },
  { rank: 8,  name: "KXNG FLOW",   points: 4_210, badge: "👑", change: "-2"  },
  { rank: 9,  name: "SUNRIZE",     points: 3_750, badge: "🌅", change: "+6"  },
  { rank: 10, name: "BEATSMITH",   points: 3_100, badge: "🎹", change: "+1"  },
];

const CATEGORIES = ["Top Artists", "Top Fans", "Top Sponsors", "Battle Winners"];

export default function AdminLeaderboardsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 4 }}>ADMIN</div>
        <h1 className="text-3xl font-bold text-[#ff6b35]">Leaderboards</h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Platform-wide rankings across all categories</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {CATEGORIES.map((cat, i) => (
          <span key={cat} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: i === 0 ? "rgba(255,107,53,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${i === 0 ? "#ff6b35" : "rgba(255,255,255,0.1)"}`, color: i === 0 ? "#ff6b35" : "rgba(255,255,255,0.5)", cursor: "pointer" }}>{cat}</span>
        ))}
      </div>

      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, overflow: "hidden" }}>
        {SEED_TOP_ARTISTS.map((a, idx) => (
          <div key={a.rank} style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px", borderBottom: idx < SEED_TOP_ARTISTS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <div style={{ width: 28, textAlign: "center", fontSize: 15 }}>{a.badge}</div>
            <div style={{ width: 24, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.3)" }}>#{a.rank}</div>
            <div style={{ flex: 1, fontSize: 13, fontWeight: 700 }}>{a.name}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#00FFFF" }}>{a.points.toLocaleString()} pts</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: a.change.startsWith("+") ? "#00FFAA" : a.change.startsWith("-") ? "#FF4444" : "rgba(255,255,255,0.3)", minWidth: 32, textAlign: "right" }}>{a.change}</div>
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
