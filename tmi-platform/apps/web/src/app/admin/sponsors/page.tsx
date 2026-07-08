import Link from "next/link";
import { listActiveSponsorZones } from "@/lib/commerce/SponsorRegistry";

const TIER_COLOR: Record<string, string> = { Gold: "#FFD700", Silver: "#C0C0C0", RUBY: "#AA2DFF" };

function tierFromPrice(price?: number): string {
  if (!price) return "Standard";
  if (price >= 500) return "Gold";
  if (price >= 200) return "Silver";
  return "RUBY";
}

export default function AdminSponsorsPage() {
  const activeZones = listActiveSponsorZones();
  const sponsors = Object.entries(activeZones).map(([zone, s]) => ({
    id: s.sponsorId,
    name: s.name,
    zone,
    tier: tierFromPrice(undefined),
    status: "active" as const,
  }));

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
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" as const }}>
            <Link href="/admin/sponsor-zones" style={{ padding: "9px 18px", borderRadius: 8, border: "1px solid rgba(255,215,0,0.35)", color: "#FFD700", fontSize: 12, fontWeight: 800, textDecoration: "none", background: "rgba(255,215,0,0.08)" }}>Manage Ad Zones</Link>
            <Link href="/signup/sponsor" style={{ padding: "9px 18px", borderRadius: 8, background: "#FFD700", color: "#05060c", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>Add Sponsor</Link>
          </div>
        </div>

        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 12 }}>
          Ad delivery is controlled in{" "}
          <Link href="/admin/sponsor-zones" style={{ color: "#FFD700", textDecoration: "none" }}>
            /admin/sponsor-zones
          </Link>
          . This page tracks active sponsor zone placements.
        </div>

        {sponsors.length === 0 ? (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "48px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 16 }}>🏆</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>No active sponsors yet</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 24 }}>
              Sponsors appear here once they purchase a placement zone via{" "}
              <Link href="/sponsors/advertise" style={{ color: "#FFD700", textDecoration: "none" }}>/sponsors/advertise</Link>
              {" "}or are manually added via{" "}
              <Link href="/admin/sponsor-zones" style={{ color: "#FFD700", textDecoration: "none" }}>Manage Ad Zones</Link>.
            </div>
            <Link href="/sponsors/advertise" style={{ padding: "10px 24px", borderRadius: 8, background: "#FFD700", color: "#05060c", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>
              View Sponsor Packages →
            </Link>
          </div>
        ) : (
          <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 80px 80px 80px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
              <span>Name</span><span>Zone</span><span>Tier</span><span>Status</span><span>View</span>
            </div>
            {sponsors.map((s) => (
              <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr 140px 80px 80px 80px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 13 }}>
                <span style={{ fontWeight: 700 }}>{s.name}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", wordBreak: "break-all" }}>{s.zone}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: TIER_COLOR[s.tier] ?? "#fff", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{s.tier}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#22c55e", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>{s.status}</span>
                <Link href={`/hub/sponsor`} style={{ fontSize: 10, color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>View →</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
