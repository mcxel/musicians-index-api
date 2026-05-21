import Link from "next/link";

interface Props { params: { slug: string } }

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function RewardRedeemPage({ params }: Props) {
  const rewardName = titleCase(params.slug);
  return (
    <main style={{ minHeight: "100vh", background: "#05060c", color: "#fff", padding: "40px 24px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <Link href="/rewards" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>← All Rewards</Link>
        <div style={{ marginTop: 20, background: "rgba(255,215,0,0.06)", border: "1px solid rgba(255,215,0,0.2)", borderRadius: 16, padding: "32px 28px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
          <div style={{ fontSize: 10, letterSpacing: 4, color: "#FFD700", fontWeight: 800, marginBottom: 8 }}>REWARD</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 12px" }}>{rewardName}</h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 28px" }}>
            Redeem this reward using your TMI Points. Connect your account to proceed.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/hub/fan" style={{
              padding: "12px 28px", borderRadius: 8, background: "#FFD700", color: "#05060c",
              fontWeight: 800, fontSize: 13, textDecoration: "none",
            }}>
              Redeem Now
            </Link>
            <Link href="/rewards" style={{
              padding: "12px 28px", borderRadius: 8, background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)",
              fontWeight: 700, fontSize: 13, textDecoration: "none",
            }}>
              Browse All Rewards
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
