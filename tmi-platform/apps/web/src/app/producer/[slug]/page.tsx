import Link from "next/link";
import { resolveProfileIdentity } from "@/lib/profile/ProfileIdentityEngine";
import { getProfileInventory } from "@/lib/profile/ProfileInventoryEngine";
import { getPointBalance } from "@/lib/economy/PointWalletEngine";
import { addPoints } from "@/lib/economy/PointWalletEngine";

interface ProducerProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProducerProfilePage({ params }: ProducerProfilePageProps) {
  const { slug } = await params;
  const identity = resolveProfileIdentity(slug, "producer");
  const inventory = getProfileInventory(slug);

  if (getPointBalance(slug) === 0) {
    addPoints(slug, 50);
  }

  const balance = getPointBalance(slug);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "34px 18px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Link href="/producer/hub" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>← Producer Hub</Link>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", margin: "10px 0 6px" }}>{identity.displayName}</h1>
        <p style={{ color: "rgba(255,255,255,0.65)", marginTop: 0 }}>{identity.bio}</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}><Link href="/face-login" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>Camera</Link><Link href="/device-trust" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>Device</Link><Link href="/messages" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>Messages</Link><Link href="/friends" style={{ color: "#00FF88", textDecoration: "none", fontSize: 12 }}>Followers</Link><Link href="/articles" style={{ color: "#00FFFF", textDecoration: "none", fontSize: 12 }}>Articles</Link><Link href="/memories" style={{ color: "#FFD700", textDecoration: "none", fontSize: 12 }}>Memories</Link><Link href="/tickets" style={{ color: "#AA2DFF", textDecoration: "none", fontSize: 12 }}>Tickets</Link><Link href="/beats" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>Beats</Link><Link href="/live/lobby" style={{ color: "#00FF88", textDecoration: "none", fontSize: 12 }}>Rooms</Link></div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 18 }}>
          <div style={{ border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, padding: "10px 12px" }}>Points Wallet: {balance}</div>
          <div style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 10, padding: "10px 12px" }}>Badges: {inventory.badges.join(", ")}</div>
          <div style={{ border: "1px solid rgba(255,45,170,0.35)", borderRadius: 10, padding: "10px 12px" }}>Memories: {inventory.memories}</div>
        </div>
      </div>
    </main>
  );
}

