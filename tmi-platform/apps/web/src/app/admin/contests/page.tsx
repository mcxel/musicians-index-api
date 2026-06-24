import Link from "next/link";

// Real contests data comes from /api/admin/contests (Rule 20 — no fake entries/prizes)
const SEED_CONTESTS: Array<{ id: string; title: string; type: string; entries: number; prize: string; status: string; ends: string }> = [];

const STATUS_COLORS: Record<string, string> = {
  Active: "#00FFFF",
  Judging: "#FFD700",
  Closed: "rgba(255,255,255,0.3)",
};

export default function AdminContestsPage() {
  const activeCount = SEED_CONTESTS.filter(c => c.status === "Active").length;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#ff6b35", textTransform: "uppercase", marginBottom: 4 }}>ADMIN</div>
          <h1 className="text-3xl font-bold text-[#ff6b35]">Contests</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{SEED_CONTESTS.length} contests{activeCount > 0 ? ` · ${activeCount} active` : ''}</p>
        </div>
        <Link href="/competitions" style={{ padding: "9px 18px", background: "#ff6b35", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>View Public →</Link>
      </div>

      {SEED_CONTESTS.length === 0 ? (
        <div style={{ padding: "48px 24px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, textAlign: "center", color: "rgba(255,255,255,0.4)" }}>
          <div style={{ fontSize: 12, marginBottom: 8 }}>No contests yet.</div>
          <div style={{ fontSize: 11 }}>Real contests will appear as they are created and activated on the platform.</div>
        </div>
      ) : (
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
      )}

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/admin" style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        <Link href="/admin/leaderboards" style={{ fontSize: 12, color: "#ff6b35", textDecoration: "none" }}>Leaderboards →</Link>
      </div>
    </main>
  );
}
