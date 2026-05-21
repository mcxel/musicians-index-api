import Link from "next/link";

const EXPERIMENTS = [
  { id: "ex1", name: "Homepage Hero A/B", variants: ["Control (current)", "Cinematic loop"], traffic: "50/50", status: "running", winner: null },
  { id: "ex2", name: "Fan Hub XP Banner", variants: ["None", "Streak badge"], traffic: "80/20", status: "concluded", winner: "Streak badge (+12% CTR)" },
  { id: "ex3", name: "Ticket CTA Color", variants: ["Green", "Gold"], traffic: "50/50", status: "running", winner: null },
];

export default function AdminExperimentsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#AA2DFF", fontWeight: 800, marginBottom: 4 }}>ADMIN · EXPERIMENTS</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 28px" }}>A/B Experiments</h1>
        <div style={{ display: "grid", gap: 12 }}>
          {EXPERIMENTS.map((e) => (
            <div key={e.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(170,45,255,0.15)", borderRadius: 12, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12, gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{e.name}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Split: {e.traffic}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: e.status === "running" ? "#22c55e" : "#94a3b8", background: e.status === "running" ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 6 }}>{e.status}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: e.winner ? 10 : 0 }}>
                {e.variants.map((v) => (<span key={v} style={{ fontSize: 11, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", color: "rgba(255,255,255,0.7)" }}>{v}</span>))}
              </div>
              {e.winner && <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700 }}>✓ Winner: {e.winner}</div>}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}