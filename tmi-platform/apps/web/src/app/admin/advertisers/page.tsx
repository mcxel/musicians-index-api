import Link from "next/link";

const SEED_ADVERTISERS = [
  { id: "adv1", name: "NightMoves Creative", spend: "$14,200", campaigns: 3, status: "active", tier: "Gold" },
  { id: "adv2", name: "Urban Lens Co.", spend: "$8,400", campaigns: 2, status: "active", tier: "Silver" },
  { id: "adv3", name: "Frequency Labs", spend: "$3,100", campaigns: 1, status: "paused", tier: "Bronze" },
];

const TIER_COLOR: Record<string, string> = { Gold: "#FFD700", Silver: "#C0C0C0", Bronze: "#CD7F32" };

export default function AdminAdvertisersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, gap: 16, flexWrap: "wrap" as const }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 5, color: "#FFA500", fontWeight: 800, marginBottom: 4 }}>ADMIN · ADVERTISERS</div>
            <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: 0 }}>Advertiser Accounts</h1>
          </div>
          <Link href="/signup/advertiser" style={{ padding: "9px 18px", borderRadius: 8, background: "#FFA500", color: "#05060c", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>Add Advertiser</Link>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 80px 80px 80px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            <span>Name</span><span>Tier</span><span>Spend</span><span>Campaigns</span><span>Status</span><span>View</span>
          </div>
          {SEED_ADVERTISERS.map((a) => (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "1fr 100px 120px 80px 80px 80px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 13 }}>
              <span style={{ fontWeight: 700 }}>{a.name}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: TIER_COLOR[a.tier], letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{a.tier}</span>
              <span style={{ color: "#00FFFF", fontWeight: 800 }}>{a.spend}</span>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{a.campaigns}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: a.status === "active" ? "#22c55e" : "#FFD700", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{a.status}</span>
              <Link href={`/hub/advertiser`} style={{ fontSize: 10, color: "#FFA500", textDecoration: "none", fontWeight: 700 }}>View →</Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}