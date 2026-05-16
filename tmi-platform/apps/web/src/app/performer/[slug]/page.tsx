import Link from "next/link";
import { resolveProfileIdentity } from "@/lib/profile/ProfileIdentityEngine";
import { resolveProfileMedia } from "@/lib/profile/ProfileMediaResolver";
import { getProfileInventory } from "@/lib/profile/ProfileInventoryEngine";
import { getProfileSocialSummary } from "@/lib/profile/ProfileSocialResolver";

interface PerformerProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PerformerProfilePage({ params }: PerformerProfilePageProps) {
  const { slug } = await params;
  const identity = resolveProfileIdentity(slug, "performer");
  const media = resolveProfileMedia({ fallbackStill: "/artists/artist-01.png" });
  const inventory = getProfileInventory(slug);
  const social = getProfileSocialSummary(slug);

  return (
    <main style={{ minHeight: "100vh", background: "#050510", color: "#fff", padding: "34px 18px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Link href="/hub/performer" style={{ color: "#FF2DAA", textDecoration: "none", fontSize: 12 }}>← Performer Hub</Link>
        <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.8rem)", margin: "10px 0 6px" }}>{identity.displayName}</h1>
        <p style={{ color: "rgba(255,255,255,0.65)", marginTop: 0 }}>{identity.bio}</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 18 }}>
          <div style={{ border: "1px solid rgba(255,45,170,0.35)", borderRadius: 10, padding: "10px 12px" }}>Media Priority: {media.sourceType}</div>
          <div style={{ border: "1px solid rgba(0,255,255,0.35)", borderRadius: 10, padding: "10px 12px" }}>Followers: {social.followers}</div>
          <div style={{ border: "1px solid rgba(255,215,0,0.35)", borderRadius: 10, padding: "10px 12px" }}>Trophies: {inventory.trophies.length}</div>
        </div>

        <div style={{ marginTop: 18, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "14px 16px" }}><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><Link href="/face-login" style={{ color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>Camera</Link><Link href="/device-trust" style={{ color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>Device</Link><Link href="/messages" style={{ color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>Messages</Link><Link href="/friends" style={{ color: "#00FF88", textDecoration: "none", fontWeight: 700 }}>Followers</Link><Link href="/memories" style={{ color: "#00FFFF", textDecoration: "none", fontWeight: 700 }}>Memories</Link><Link href="/tickets" style={{ color: "#FFD700", textDecoration: "none", fontWeight: 700 }}>Tickets</Link><Link href="/beats" style={{ color: "#AA2DFF", textDecoration: "none", fontWeight: 700 }}>Beats</Link><Link href="/live/lobby" style={{ color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>Rooms</Link></div>
          <Link href={`/articles/performer/${slug}`} style={{ color: "#FF2DAA", textDecoration: "none", fontWeight: 700 }}>
            Open performer article route
          </Link>
        </div>
      </div>
    </main>
  );
}

