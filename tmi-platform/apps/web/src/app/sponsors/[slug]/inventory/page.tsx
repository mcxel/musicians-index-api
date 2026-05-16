import Link from "next/link";

const INVENTORY_ITEMS = [
  { id: "inv-001", slot: "main-lobby-billboard", status: "active", impressions: "1.2M" },
  { id: "inv-002", slot: "cypher-room-rail", status: "active", impressions: "880K" },
  { id: "inv-003", slot: "venue-stage-overlay", status: "paused", impressions: "410K" },
];

export default function SponsorInventoryPage({ params }: { params: { slug: string } }) {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 40px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.96)", borderBottom: "1px solid rgba(14,165,233,0.3)", padding: "10px 20px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href={`/sponsors/${params.slug}`} style={{ color: "#38bdf8", fontSize: 10, textDecoration: "none", border: "1px solid rgba(56,189,248,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← HUB</Link>
        <strong style={{ color: "#38bdf8", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>INVENTORY</strong>
        <span style={{ color: "#64748b", fontSize: 10 }}>{params.slug}</span>
      </header>
      <div style={{ padding: "14px 20px", maxWidth: 760 }}>
        <div style={{ border: "1px solid rgba(148,163,184,0.3)", borderRadius: 12, overflow: "hidden" }}>
          {INVENTORY_ITEMS.map((item) => (
            <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr 0.8fr", gap: 10, padding: "10px 12px", borderBottom: "1px solid rgba(148,163,184,0.2)", fontSize: 12 }}>
              <span>{item.slot}</span>
              <span style={{ color: item.status === "active" ? "#22c55e" : "#f59e0b" }}>{item.status}</span>
              <span style={{ textAlign: "right", color: "#93c5fd" }}>{item.impressions}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
