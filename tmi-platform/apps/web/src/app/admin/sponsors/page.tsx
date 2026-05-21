import Link from "next/link";

const SEED_SPONSORS = [
  { id: "sp1", name: "Prime Wave Media", spend: "$28,400", rooms: 12, tier: "Gold", status: "active" },
  { id: "sp2", name: "Neon Arena Group", spend: "$16,200", rooms: 7, tier: "Silver", status: "active" },
  { id: "sp3", name: "Brand Voltage LLC", spend: "$5,900", rooms: 3, tier: "Bronze", status: "pending" },
];

const TIER_COLOR: Record<string, string> = { Gold: "#FFD700", Silver: "#C0C0C0", Bronze: "#CD7F32" };

export default function AdminSponsorsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" as const }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFD700", fontWeight: 800, marginBottom: 4 }}>ADMIN · SPONSORS</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>Sponsor Accounts</h1>
          </div>
          <Link href="/signup/sponsor" style={{ padding: "9px 18px", borderRadius: 8, background: "#FFD700", color: "#05060c", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>Add Sponsor</Link>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 80px 80px 80px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            <span>Name</span><span>Tier</span><span>Total Spend</span><span>Rooms</span><span>Status</span><span>View</span>
          </div>
          {SEED_SPONSORS.map((s) => (
            <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 80px 80px 80px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 13 }}>
              <span style={{ fontWeight: 700 }}>{s.name}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: TIER_COLOR[s.tier], letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{s.tier}</span>
              <span style={{ color: "#FFD700", fontWeight: 800 }}>{s.spend}</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{s.rooms}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: s.status === "active" ? "#22c55e" : "#FFD700", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{s.status}</span>
              <Link href="/hub/sponsor" style={{ fontSize: 10, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>View →</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}