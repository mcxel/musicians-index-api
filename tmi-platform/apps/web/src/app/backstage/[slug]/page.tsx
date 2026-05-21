import Link from "next/link";

interface Props { params: { slug: string } }

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function BackstagePage({ params }: Props) {
  const contentName = titleCase(params.slug);
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <Link href="/hub/fan" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← Fan Hub</Link>
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 8 }}>BACKSTAGE ACCESS</div>
          <h1 style={{ fontSize: "clamp(22px,4vw,36px)", fontWeight: 900, margin: "0 0 12px" }}>{contentName}</h1>
          <div style={{ background: "rgba(170,45,255,0.08)", border: "1px solid rgba(170,45,255,0.2)", borderRadius: 14, padding: "28px", marginTop: 20, textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, margin: "0 0 24px" }}>
              This exclusive backstage content is available to Season Pass holders.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/hub/fan" style={{ padding: "11px 24px", borderRadius: 8, background: "#AA2DFF", color: "#fff", fontWeight: 800, fontSize: 12, textDecoration: "none" }}>
                🎫 Get Season Pass
              </Link>
              <Link href="/live/stages" style={{ padding: "11px 24px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)", fontWeight: 700, fontSize: 12, textDecoration: "none" }}>
                Watch Live Instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
