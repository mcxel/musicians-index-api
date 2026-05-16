import Link from "next/link";

export default function TaxPolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 80px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.97)", borderBottom: "1px solid rgba(34,197,94,0.3)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href="/legal" style={{ color: "#86efac", fontSize: 10, textDecoration: "none", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← LEGAL</Link>
        <strong style={{ color: "#86efac", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>TAX RESPONSIBILITY POLICY</strong>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: "#86efac", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Tax Responsibility</h1>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Effective: January 1, 2026 · BernoutGlobal LLC / The Musician&apos;s Index (TMI)</p>
        </div>

        {[
          {
            heading: "1. Self-Reporting Obligation",
            body: [
              "All earnings received through TMI — including performance fees, tips, royalties, NFT proceeds, sponsor payments, and any other compensation — are your income as an independent contractor. You are solely responsible for self-reporting all such earnings to the appropriate tax authorities.",
              "TMI does not withhold federal, state, or local income taxes from payments made to contractors unless explicitly required by law or configured by agreement.",
            ],
          },
          {
            heading: "2. W-9 Requirement (US Contractors)",
            body: [
              "US-based contractors earning above applicable IRS thresholds must provide a valid W-9 form. TMI may issue 1099 forms as required by US tax law. You are responsible for the accuracy of your W-9 information.",
              "Non-US contractors may be required to provide equivalent tax documentation (e.g., W-8BEN) depending on jurisdiction and payment thresholds.",
            ],
          },
          {
            heading: "3. Self-Employment Tax",
            body: [
              "As an independent contractor, you are responsible for paying self-employment tax (Social Security and Medicare) on net earnings as required by applicable law. BernoutGlobal LLC does not contribute the employer's share of these taxes on your behalf.",
            ],
          },
          {
            heading: "4. State and Local Obligations",
            body: [
              "You are responsible for complying with all state and local tax obligations applicable to your jurisdiction, including business income taxes, sales taxes on digital goods (where applicable), and any performer-specific levies.",
            ],
          },
          {
            heading: "5. Platform Withholding",
            body: [
              "TMI reserves the right to withhold payments pending receipt of required tax documentation. In jurisdictions where backup withholding is required by law, TMI will withhold at the applicable rate.",
            ],
          },
        ].map(section => (
          <section key={section.heading} style={{ marginBottom: 20, background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.12)", borderRadius: 10, padding: "16px 20px" }}>
            <h2 style={{ color: "#86efac", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>{section.heading}</h2>
            {section.body.map((p, i) => <p key={i} style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.65, margin: "0 0 10px" }}>{p}</p>)}
          </section>
        ))}

        <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 10, padding: "14px 20px" }}>
          <div style={{ color: "#86efac", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>RELATED POLICIES</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["Contractor Policy", "/legal/contractor"], ["Content Rights", "/legal/content-rights"], ["Venue Policy", "/legal/venue-policy"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ color: "#94a3b8", fontSize: 11, textDecoration: "none", border: "1px solid #334155", borderRadius: 5, padding: "4px 12px" }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
