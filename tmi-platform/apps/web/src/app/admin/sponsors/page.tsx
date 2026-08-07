import Link from "next/link";

/** Rule 20: no seed sponsor vanity spend — honest empty until Stripe/sponsor registry feed. */
export default function AdminSponsorsPage() {
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
          <Link href="/signup/sponsor" style={{ padding: "9px 18px", borderRadius: 8, background: "#FFD700", color: "#05060c", fontSize: 12, fontWeight: 800, textDecoration: "none" }}>Add Sponsor</Link>
        </div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "28px 22px", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>
            No sponsor accounts loaded yet. Paid sponsors appear here when registered.
          </p>
          <Link href="/sponsors/advertise" style={{ fontSize: 12, color: "#FFD700", fontWeight: 700, textDecoration: "none" }}>
            Advertise / sponsor CTA →
          </Link>
        </div>
      </div>
    </main>
  );
}
