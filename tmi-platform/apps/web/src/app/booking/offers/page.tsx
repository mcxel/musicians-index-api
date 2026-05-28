import Link from "next/link";

const OFFERS = [
  {
    id: "OFF-001",
    from: "Cypher Arena",
    to: "Nova Cipher",
    date: "May 25, 2026",
    value: "$2,500",
    status: "Awaiting Artist",
    accent: "#FFD700",
    detail: "Headline slot — 45 min set",
  },
  {
    id: "OFF-002",
    from: "The Vault NYC",
    to: "FlowState.J",
    date: "May 28, 2026",
    value: "$1,800",
    status: "Accepted",
    accent: "#00FF88",
    detail: "Opening act — 20 min set",
  },
  {
    id: "OFF-003",
    from: "TMI Stage ATL",
    to: "Ari Volt",
    date: "Jun 1, 2026",
    value: "$3,200",
    status: "Countered",
    accent: "#FF2DAA",
    detail: "Co-headline — 30 min set",
  },
  {
    id: "OFF-004",
    from: "Crown Stage NYC",
    to: "Yung Mako",
    date: "Jun 8, 2026",
    value: "$4,100",
    status: "Negotiating",
    accent: "#AA2DFF",
    detail: "Full production show — 60 min",
  },
];

export default function BookingOffersPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#060410", color: "#fff", fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <div style={{ padding: "32px 24px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/booking" style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← BOOKING</Link>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.2em", color: "#FFD700", textTransform: "uppercase", marginBottom: 8, marginTop: 10 }}>OFFER PIPELINE</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 8px" }}>My Offers</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>Track, counter, and accept live booking offers.</p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
          {OFFERS.map((offer) => (
            <div key={offer.id} style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${offer.accent}28`,
              borderRadius: 12,
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                    color: offer.accent, background: `${offer.accent}18`,
                    border: `1px solid ${offer.accent}30`, borderRadius: 4, padding: "2px 8px",
                  }}>
                    {offer.status.toUpperCase()}
                  </span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{offer.id}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>
                  {offer.from} → {offer.to}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {offer.date} · {offer.detail}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: "#FFD700" }}>{offer.value}</div>
                <Link
                  href="/booking/contracts"
                  style={{
                    padding: "8px 16px", borderRadius: 8,
                    background: `${offer.accent}14`, border: `1px solid ${offer.accent}30`,
                    color: offer.accent, fontSize: 11, fontWeight: 700,
                    textDecoration: "none", whiteSpace: "nowrap",
                  }}
                >
                  View Offer →
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/booking" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "#FFD700", color: "#060410", textDecoration: "none" }}>
            Booking Hub →
          </Link>
          <Link href="/booking/contracts" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Contracts
          </Link>
          <Link href="/booking/calendar" style={{ padding: "10px 22px", borderRadius: 24, fontSize: 12, fontWeight: 800, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>
            Calendar
          </Link>
        </div>
      </div>
    </main>
  );
}
