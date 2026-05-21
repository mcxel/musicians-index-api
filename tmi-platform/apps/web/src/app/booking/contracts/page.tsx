import Link from "next/link";

const CONTRACTS = [
  { id: "BC-001", artist: "Nova Cipher",  venue: "Cypher Arena",  date: "May 25, 2026", status: "Confirmed",  value: "$2,500", accent: "#22c55e" },
  { id: "BC-002", artist: "FlowState.J", venue: "The Vault NYC", date: "May 28, 2026", status: "Pending",    value: "$1,800", accent: "#f59e0b" },
  { id: "BC-003", artist: "Ari Volt",    venue: "TMI Stage ATL", date: "Jun 1, 2026",  status: "Draft",     value: "$3,200", accent: "#94a3b8" },
];

export default function BookingContractsPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/booking" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← BOOKING</Link>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#00FFFF", textTransform: "uppercase", marginBottom: 8, marginTop: 10 }}>CONTRACTS</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>Booking Contracts</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>Review, sign, and track all artist booking agreements.</p>
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {CONTRACTS.map((c) => (
            <div key={c.id} style={{
              background: "rgba(255,255,255,0.03)", border: `1px solid ${c.accent}28`,
              borderRadius: 12, padding: "18px 20px",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
            }}>
              <div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", color: c.accent, background: `${c.accent}18`, border: `1px solid ${c.accent}30`, borderRadius: 4, padding: "2px 8px" }}>{c.status.toUpperCase()}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{c.id}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{c.artist} → {c.venue}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{c.date} · {c.value}</div>
              </div>
              <Link href="/support" style={{ padding: "8px 16px", borderRadius: 8, background: `${c.accent}14`, border: `1px solid ${c.accent}30`, color: c.accent, fontSize: 11, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                View Contract →
              </Link>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link href="/booking" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#00FFFF", color: "#060410", textDecoration: "none" }}>All Bookings →</Link>
          <Link href="/booking/calendar" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Calendar</Link>
        </div>
      </div>
    </main>
  );
}
