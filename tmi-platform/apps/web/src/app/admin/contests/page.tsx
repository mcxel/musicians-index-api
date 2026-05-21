import Link from "next/link";

const SEED_CONTESTS = [
  { id: "cypher-001", title: "Spring Cypher 2026", type: "Cypher", entries: 142, prize: "$500", status: "Active", ends: "May 30" },
  { id: "beat-battle-22", title: "Beat Battle Vol. 22", type: "Beat Battle", entries: 87, prize: "$300", status: "Active", ends: "May 25" },
  { id: "rap-god-q2", title: "Rap God Q2 Challenge", type: "Lyric", entries: 210, prize: "$750", status: "Active", ends: "Jun 15" },
  { id: "freestyle-friday", title: "Freestyle Friday #44", type: "Freestyle", entries: 63, prize: "$200", status: "Judging", ends: "May 19" },
  { id: "cover-art-may", title: "Cover Art Contest May", type: "Visual", entries: 38, prize: "$150", status: "Closed", ends: "May 10" },
];

const STATUS_COLORS: Record<string, string> = {
  Active: "#00FFFF",
  Judging: "#FFD700",
  Closed: "rgba(255,255,255,0.3)",
};

export default function AdminContestsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 4 }}>ADMIN</div>
          <h1 className="text-3xl font-bold text-[#ff6b35]">Contests</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{SEED_CONTESTS.length} contests · {SEED_CONTESTS.filter(c => c.status === "Active").length} active</p>
        </div>
        <Link href="/competitions" style={{ padding: "9px 18px", background: "#ff6b35", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>View Public →</Link>
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        {SEED_CONTESTS.map((c) => (
          <div key={c.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{c.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.type} · Ends {c.ends}</div>
            </div>
            <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#00FFFF" }}>{c.entries}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>entries</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#FFD700" }}>{c.prize}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>prize</div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[c.status] ?? "rgba(255,255,255,0.3)", padding: "3px 10px", border: `1px solid ${STATUS_COLORS[c.status] ?? "rgba(255,255,255,0.1)"}`, borderRadius: 20 }}>{c.status}</div>
              <Link href={`/competitions/${c.id}`} style={{ fontSize: 11, color: "#00FFFF", textDecoration: "none" }}>View →</Link>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        <Link href="/admin/leaderboards" style={{ fontSize: 12, color: "#ff6b35", textDecoration: "none" }}>Leaderboards →</Link>
      </div>
    </main>
  );
}
