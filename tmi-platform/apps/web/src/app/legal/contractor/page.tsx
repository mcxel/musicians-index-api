import Link from "next/link";

export default function ContractorPolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 80px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.97)", borderBottom: "1px solid rgba(251,191,36,0.3)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href="/legal" style={{ color: "#fcd34d", fontSize: 10, textDecoration: "none", border: "1px solid rgba(251,191,36,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← LEGAL</Link>
        <strong style={{ color: "#fcd34d", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>INDEPENDENT CONTRACTOR POLICY</strong>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: "#fcd34d", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Independent Contractor Status</h1>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Effective: January 1, 2026 · BernoutGlobal LLC / The Musician&apos;s Index (TMI)</p>
        </div>

        {[
          {
            heading: "1. Contractor Classification",
            body: [
              "All performers, artists, hosts, and venue operators who use the TMI platform operate as independent contractors. They are not employees, agents, or partners of BernoutGlobal LLC or The Musician's Index (TMI).",
              "As an independent contractor, you retain full control over: the acceptance or rejection of performance opportunities; the pricing of your services where platform pricing controls do not apply; ownership of content you create, unless content rights are explicitly assigned in a separate agreement; and your own schedule, methods, and means of performance.",
            ],
          },
          {
            heading: "2. No Employment Relationship",
            body: [
              "Nothing in these terms or in your use of the TMI platform creates an employment relationship. BernoutGlobal LLC does not provide benefits, workers' compensation, unemployment insurance, or any other employment protections to contractors.",
              "You are solely responsible for providing your own equipment, tools, and resources necessary to perform your services.",
            ],
          },
          {
            heading: "3. Platform Role",
            body: [
              "TMI operates as a marketplace and infrastructure provider — not as an employer or booking agent. The platform facilitates connections between artists, performers, venues, fans, sponsors, and advertisers. Engagements booked or facilitated through TMI do not constitute employment by BernoutGlobal LLC.",
            ],
          },
          {
            heading: "4. Compliance",
            body: [
              "You are responsible for complying with all applicable laws governing your independent contractor status, including business licensing requirements, local labor laws, and professional regulations applicable to your jurisdiction.",
            ],
          },
        ].map(section => (
          <section key={section.heading} style={{ marginBottom: 24, background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)", borderRadius: 10, padding: "16px 20px" }}>
            <h2 style={{ color: "#fde68a", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>{section.heading}</h2>
            {section.body.map((p, i) => <p key={i} style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.65, margin: "0 0 10px" }}>{p}</p>)}
          </section>
        ))}

        <div style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 10, padding: "14px 20px" }}>
          <div style={{ color: "#fcd34d", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>RELATED POLICIES</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["Tax Policy", "/legal/tax-policy"], ["Content Rights", "/legal/content-rights"], ["Venue Policy", "/legal/venue-policy"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ color: "#94a3b8", fontSize: 11, textDecoration: "none", border: "1px solid #334155", borderRadius: 5, padding: "4px 12px" }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
