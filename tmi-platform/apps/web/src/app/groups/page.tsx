import Link from "next/link";

export const metadata = { title: "Groups | TMI", description: "Community groups and social spaces." };

const GROUPS = [
  { id: "memory-club", name: "Memory Club", summary: "Share highlights from lobbies and venues." },
  { id: "battle-watch", name: "Battle Watch", summary: "Live reactions and score predictions." },
  { id: "beat-lab", name: "Beat Lab", summary: "Producer swaps, snippets, and collab calls." },
  { id: "fan-frontrow", name: "Fan Front Row", summary: "Event planning and ticket circles." },
];

export default function GroupsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "40px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link href="/browse" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>← Browse</Link>
        <h1 style={{ fontSize: 32, margin: "20px 0 8px" }}>Groups</h1>
        <p style={{ color: "rgba(255,255,255,0.65)" }}>Community groups with real join routes and live group chat loops.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 24 }}>
          {GROUPS.map((group) => (
            <div key={group.id} style={{ border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: "14px 16px", background: "rgba(0,255,255,0.04)" }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>{group.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 10 }}>{group.summary}</div>
              <Link href={`/groups/${group.id}`} style={{ fontSize: 10, padding: "6px 12px", borderRadius: 6, border: "1px solid rgba(0,255,255,0.4)", background: "transparent", color: "#00FFFF", textDecoration: "none", display: "inline-block" }}>
                Join Group
              </Link>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/friends" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>Friends</Link>
          <Link href="/messages" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>Messages</Link>
          <Link href="/notifications" style={{ color: "#00FF88", textDecoration: "none", fontSize: 12 }}>Notifications</Link>
        </div>
      </div>
    </main>
  );
}
