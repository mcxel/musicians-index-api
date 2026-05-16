import Link from "next/link";

export default function ContentRightsPolicyPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", padding: "0 0 80px" }}>
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(2,6,23,0.97)", borderBottom: "1px solid rgba(0,255,255,0.3)", padding: "10px 24px", display: "flex", alignItems: "center", gap: 12, backdropFilter: "blur(8px)" }}>
        <Link href="/legal" style={{ color: "#00FFFF", fontSize: 10, textDecoration: "none", border: "1px solid rgba(0,255,255,0.35)", borderRadius: 5, padding: "3px 9px", fontWeight: 700 }}>← LEGAL</Link>
        <strong style={{ color: "#00FFFF", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase" }}>CONTENT RIGHTS & LIABILITY</strong>
      </header>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ color: "#00FFFF", fontSize: 22, fontWeight: 800, margin: "0 0 8px" }}>Rights &amp; Usage Liability</h1>
          <p style={{ color: "#64748b", fontSize: 12, margin: 0 }}>Effective: January 1, 2026 · BernoutGlobal LLC / The Musician&apos;s Index (TMI)</p>
        </div>

        {[
          {
            heading: "1. Performer Content Ownership",
            body: [
              "You retain ownership of original content you create and perform on TMI unless you have explicitly assigned those rights in a separate written agreement. This includes original compositions, lyrics, recordings, and performances.",
              "By performing on TMI, you grant BernoutGlobal LLC a limited, non-exclusive license to stream, broadcast, archive, and promote your performances within the platform and in platform marketing materials.",
            ],
          },
          {
            heading: "2. Third-Party Content Responsibility",
            body: [
              "You are solely responsible for ensuring you have the necessary rights, licenses, and permissions for all content you perform or stream on TMI. This includes but is not limited to: samples and interpolations; beats, instrumentals, and production elements created by third parties; cover songs and arrangements of copyrighted works; licensed media including video, images, and sound effects; and any other third-party intellectual property.",
            ],
          },
          {
            heading: "3. Platform Liability Shield",
            body: [
              "BernoutGlobal LLC and TMI are not responsible for copyright infringement, rights violations, or unauthorized use of protected material by performers, artists, or hosts. All liability for such violations rests entirely with the performing party.",
              "If a rights holder submits a valid DMCA takedown or equivalent notice, TMI will act in accordance with applicable law. Repeat infringers may have their accounts suspended or terminated.",
            ],
          },
          {
            heading: "4. Indemnification",
            body: [
              "You agree to indemnify, defend, and hold harmless BernoutGlobal LLC, TMI, their officers, directors, employees, and agents from any claims, damages, losses, liabilities, costs, or expenses (including reasonable attorneys' fees) arising from your use of third-party content without proper authorization.",
            ],
          },
          {
            heading: "5. DMCA Compliance",
            body: [
              "TMI complies with the Digital Millennium Copyright Act. Rights holders who believe their content is being used without authorization may submit takedown notices to BernoutGlobal LLC. Performers who receive takedown notices will be notified and given opportunity to dispute if applicable.",
            ],
          },
        ].map(section => (
          <section key={section.heading} style={{ marginBottom: 20, background: "rgba(0,255,255,0.03)", border: "1px solid rgba(0,255,255,0.12)", borderRadius: 10, padding: "16px 20px" }}>
            <h2 style={{ color: "#00FFFF", fontSize: 14, fontWeight: 700, margin: "0 0 10px" }}>{section.heading}</h2>
            {section.body.map((p, i) => <p key={i} style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.65, margin: "0 0 10px" }}>{p}</p>)}
          </section>
        ))}

        <div style={{ background: "rgba(0,255,255,0.05)", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 10, padding: "14px 20px" }}>
          <div style={{ color: "#00FFFF", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>RELATED POLICIES</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["Contractor Policy", "/legal/contractor"], ["Tax Policy", "/legal/tax-policy"], ["Venue Policy", "/legal/venue-policy"]].map(([label, href]) => (
              <Link key={href} href={href} style={{ color: "#94a3b8", fontSize: 11, textDecoration: "none", border: "1px solid #334155", borderRadius: 5, padding: "4px 12px" }}>{label}</Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
