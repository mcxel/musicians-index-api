import Link from "next/link";

export default function VenuePolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 80px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.97)", borderBottom: "1px solid rgba(249,115,22,0.3)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href="/legal" style={{ color: "#fb923c", fontSize: 10, textDecoration: "none", border: "1px solid rgba(249,115,22,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← LEGAL</Link>
        <strong style={{ color: "#fb923c", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>VENUE FEE & COMPLIANCE POLICY</strong>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: "#fb923c", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Venue Fee Responsibility</h1>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Effective: January 1, 2026 · BernoutGlobal LLC / The Musician&apos;s Index (TMI)</p>
        </div>

        {[
          {
            heading: "1. Fee Disclosure Obligation",
            body: [
              "Venue operators are required to disclose all applicable fees to performers, artists, and ticket purchasers prior to any engagement. This includes: ticket fees and service charges collected at point of sale; performance fees, stage fees, and sound/equipment fees; any revenue splits or percentage-based venue charges; and any local or regional compliance levies.",
              "Failure to disclose fees prior to an engagement may result in account suspension and forfeiture of platform access.",
            ],
          },
          {
            heading: "2. Ticket Fee Responsibility",
            body: [
              "Venue operators are responsible for accurately setting and disclosing ticket prices, service fees, and any dynamic pricing adjustments. TMI's ticketing infrastructure displays fees at checkout — it is the venue operator's responsibility to configure these accurately.",
              "Any refund obligations arising from event cancellation, postponement, or quality failures rest with the venue operator, not with BernoutGlobal LLC.",
            ],
          },
          {
            heading: "3. Local Venue Compliance",
            body: [
              "Venue operators are solely responsible for compliance with all applicable local, state, and federal regulations governing venue operation, including: occupancy limits and safety codes; alcohol licensing where applicable; ADA accessibility requirements; noise ordinances and curfews; and entertainment licensing and permit requirements.",
              "BernoutGlobal LLC and TMI are not responsible for venue operator failures to comply with applicable regulations.",
            ],
          },
          {
            heading: "4. Performance Fee Disputes",
            body: [
              "Disputes between venue operators and performers regarding performance fees, payment timing, or payment amounts are the responsibility of the parties involved. TMI provides infrastructure and may offer dispute facilitation tools, but does not adjudicate payment disputes or guarantee payment collection.",
            ],
          },
          {
            heading: "5. Platform Fee",
            body: [
              "TMI charges a platform service fee on transactions processed through the platform. This fee is disclosed at the time of account setup and is subject to change with notice. All other venue-specific fees are set by and are the responsibility of the venue operator.",
            ],
          },
        ].map(section => (
          <section key={section.heading} style={{ marginBottom: 20, background: "rgba(249,115,22,0.04)", border: "1px solid rgba(249,115,22,0.12)", borderRadius: 10, padding: "16px 20px" }}>
            <h2 style={{ color: "#fb923c", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>{section.heading}</h2>
            {section.body.map((p, i) => <p key={i} style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.65, margin: "0 0 10px" }}>{p}</p>)}
          </section>
        ))}

        <div style={{ background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.3)", borderRadius: 10, padding: "14px 20px" }}>
          <div style={{ color: "#fb923c", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>RELATED POLICIES</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["Contractor Policy", "/legal/contractor"], ["Tax Policy", "/legal/tax-policy"], ["Content Rights", "/legal/content-rights"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ color: "#94a3b8", fontSize: 11, textDecoration: "none", border: "1px solid #334155", borderRadius: 5, padding: "4px 12px" }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
