import Link from "next/link";

const SEED_EVENTS = [
  { id: "ev1", action: "user.suspend", actor: "admin@tmi.live", target: "user:xr-fan-42", ts: "2026-05-20 14:32:01", severity: "high" },
  { id: "ev2", action: "campaign.activate", actor: "sponsor@primemedia", target: "campaign:sp-3", ts: "2026-05-20 13:18:55", severity: "info" },
  { id: "ev3", action: "room.force-close", actor: "admin@tmi.live", target: "room:cypher-arena", ts: "2026-05-20 12:04:22", severity: "warn" },
  { id: "ev4", action: "nft.mint", actor: "nova-cipher", target: "nft:season1-card-7", ts: "2026-05-20 11:45:10", severity: "info" },
  { id: "ev5", action: "payout.issued", actor: "system", target: "performer:ari-volt", ts: "2026-05-20 10:30:00", severity: "info" },
];

const SEV_COLOR: Record<string, string> = { high: "#ef4444", warn: "#FFD700", info: "#22c55e" };

export default function AdminAuditPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "32px 24px 80px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ marginBottom: 28 }}>
          <Link href="/admin" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Admin</Link>
        </div>
        <div style={{ fontSize: 10, letterSpacing: 5, color: "#ef4444", fontWeight: 800, marginBottom: 4 }}>ADMIN · AUDIT LOG</div>
        <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 28px" }}>Audit Log</h1>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 80px", padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            <span>Timestamp</span><span>Action / Actor</span><span>Target</span><span>Severity</span>
          </div>
          {SEED_EVENTS.map((ev) => (
            <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 80px", padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center", fontSize: 12 }}>
              <span style={{ color: "rgba(255,255,255,0.35)", fontFamily: "monospace", fontSize: 11 }}>{ev.ts}</span>
              <div><div style={{ fontWeight: 700 }}>{ev.action}</div><div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{ev.actor}</div></div>
              <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, fontFamily: "monospace" }}>{ev.target}</span>
              <span style={{ fontSize: 9, fontWeight: 800, color: SEV_COLOR[ev.severity], letterSpacing: "0.1em", textTransform: "uppercase" }}>{ev.severity}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}