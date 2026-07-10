import Link from "next/link";

export const metadata = { title: "Disclaimer — TMI Platform" };

export default function DisclaimerPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 80px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.97)", borderBottom: "1px solid rgba(255,215,0,0.3)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href="/legal" style={{ color: "#FFD700", fontSize: 10, textDecoration: "none", border: "1px solid rgba(255,215,0,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← LEGAL</Link>
        <strong style={{ color: "#FFD700", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>DISCLAIMER</strong>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: "#FFD700", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Platform Disclaimer</h1>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>BernoutGlobal LLC / The Musician&apos;s Index (TMI)</p>
        </div>

        {[
          {
            heading: "1. Minimum Age Requirement",
            body: [
              "You must be at least 16 years of age to create an account or otherwise participate on TMI. Certain features, rooms, and interactions may carry additional age requirements or require parental/guardian consent, as noted at the point of access.",
            ],
          },
          {
            heading: "2. TMI's Role as Promoter",
            body: [
              "TMI operates as a promotional platform for artists and performers, not as a purchaser or licensor of music for its own use. TMI does not pay artists a fee to play or feature their songs.",
              "By submitting or performing music on TMI, an artist authorizes TMI to showcase, stream, and promote that music within the platform — on radio rotation, live rooms, battles, cyphers, the magazine, and discovery surfaces — in exchange for the exposure, audience growth, and monetization opportunities the platform provides (memberships, tips, ticketing, bookings, sponsorships, and other supported revenue tools).",
              "This is a promotional relationship: TMI helps artists gain exposure and earn money through the platform's features, rather than paying a licensing fee for the music itself.",
            ],
          },
          {
            heading: "3. No Guarantee of Outcomes",
            body: [
              "Rankings, rotation placement, audience size, and earnings depend on real platform activity and are never guaranteed. TMI does not promise a specific level of exposure, streams, bookings, or income to any artist, performer, venue, sponsor, or advertiser.",
            ],
          },
          {
            heading: "4. Content Responsibility",
            body: [
              "As with all TMI agreements, artists and performers remain responsible for ensuring they hold the necessary rights to any content they upload or perform. See the Content Rights & Liability policy for full detail.",
            ],
          },
        ].map((section) => (
          <section key={section.heading} style={{ marginBottom: 20, background: "rgba(255,215,0,0.03)", border: "1px solid rgba(255,215,0,0.14)", borderRadius: 10, padding: "16px 20px" }}>
            <h2 style={{ color: "#FFD700", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>{section.heading}</h2>
            {section.body.map((p, i) => (
              <p key={i} style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.65, margin: "0 0 10px" }}>{p}</p>
            ))}
          </section>
        ))}

        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10, padding: "14px 20px", marginBottom: 20 }}>
          <p style={{ color: "#94a3b8", fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            This page reflects TMI&apos;s current operating policy in plain language. It has not yet been reviewed by an attorney and is not a substitute for a formal Terms of Service or Promoter Agreement — those require legal counsel before they can be treated as binding.
          </p>
        </div>

        <div style={{ background: "rgba(255,215,0,0.05)", border: "1px solid rgba(255,215,0,0.3)", borderRadius: 10, padding: "14px 20px" }}>
          <div style={{ color: "#FFD700", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>RELATED POLICIES</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["Content Rights", "/legal/content-rights"], ["Contractor Policy", "/legal/contractor"], ["Tax Policy", "/legal/tax-policy"], ["Venue Policy", "/legal/venue-policy"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ color: "#94a3b8", fontSize: 11, textDecoration: "none", border: "1px solid #334155", borderRadius: 5, padding: "4px 12px" }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
