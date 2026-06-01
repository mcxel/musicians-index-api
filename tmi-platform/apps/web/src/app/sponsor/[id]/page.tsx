import Link from "next/link";
import ProfileShell from "@/components/profile/ProfileShell";

interface Props {
  params: { id: string };
}

interface SeedSponsor {
  displayName: string;
  tagline: string;
  isVerified: boolean;
  industry: string;
  totalSpent: string;
  campaignsRun: number;
  artistsBacked: number;
  avgEngagement: string;
  activeCampaigns: number;
  badges: string[];
}

const SEED_SPONSORS: Record<string, SeedSponsor> = {
  "beats-by-tmx": {
    displayName: "Beats By TMX",
    tagline: "The official hardware partner of TMI Season 1. Powering creators worldwide.",
    isVerified: true,
    industry: "Music Tech",
    totalSpent: "$86K",
    campaignsRun: 14,
    artistsBacked: 42,
    avgEngagement: "9.1%",
    activeCampaigns: 3,
    badges: ["Season 1 Sponsor", "Verified Partner", "Top Spender"],
  },
  "soundcloud-official": {
    displayName: "SoundCloud Official",
    tagline: "Connecting music creators to their fans — sponsor of TMI's cypher circuit.",
    isVerified: true,
    industry: "Streaming",
    totalSpent: "$120K",
    campaignsRun: 22,
    artistsBacked: 80,
    avgEngagement: "11.4%",
    activeCampaigns: 5,
    badges: ["Platinum Sponsor", "Cypher Circuit", "Verified Partner"],
  },
};

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function seedSponsor(id: string): SeedSponsor {
  if (SEED_SPONSORS[id]) return SEED_SPONSORS[id]!;
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const industries = ["Music Tech", "Streaming", "Fashion", "Beverage", "Telecom", "Gaming"];
  return {
    displayName: titleCase(id),
    tagline: "Official sponsor on The Musician's Index.",
    isVerified: hash % 3 === 0,
    industry: industries[hash % industries.length]!,
    totalSpent: `$${((hash % 90) + 10)}K`,
    campaignsRun: (hash % 20) + 1,
    artistsBacked: (hash % 50) + 5,
    avgEngagement: `${(6 + (hash % 6)).toFixed(1)}%`,
    activeCampaigns: hash % 5,
    badges: hash % 2 === 0 ? ["Verified Partner"] : [],
  };
}

const GOLD   = "#FFD700";
const CYAN   = "#00FFFF";
const PURPLE = "#AA2DFF";
const PINK   = "#FF2DAA";

export default function SponsorDetailPage({ params }: Props) {
  const sponsor = seedSponsor(params.id);

  return (
    <ProfileShell
      role="sponsor"
      displayName={sponsor.displayName}
      slug={params.id}
      tagline={sponsor.tagline}
      isVerified={sponsor.isVerified}
    >
      {/* Industry chip */}
      <div style={{ marginBottom: 16 }}>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
          color: GOLD, background: "rgba(255,215,0,0.08)",
          border: "1px solid rgba(255,215,0,0.22)", borderRadius: 4, padding: "3px 10px",
        }}>
          {sponsor.industry}
        </span>
      </div>

      {/* Badges */}
      {sponsor.badges.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {sponsor.badges.map((b) => (
            <span key={b} style={{
              fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
              color: PURPLE, background: "rgba(170,45,255,0.08)",
              border: "1px solid rgba(170,45,255,0.22)", borderRadius: 4, padding: "2px 8px",
            }}>
              {b}
            </span>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
        {[
          { label: "Total Spent",     value: sponsor.totalSpent,           color: GOLD   },
          { label: "Campaigns Run",   value: sponsor.campaignsRun.toString(), color: CYAN },
          { label: "Artists Backed",  value: sponsor.artistsBacked.toString(), color: PURPLE },
          { label: "Avg Engagement",  value: sponsor.avgEngagement,         color: "#00FF88" },
          { label: "Active Now",      value: sponsor.activeCampaigns.toString(), color: PINK },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: "12px 10px", borderRadius: 10, textAlign: "center",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <Link
          href={`/messages/new?recipientId=${params.id}&name=${encodeURIComponent(sponsor.displayName)}`}
          style={{ padding: "9px 18px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: "rgba(255,215,0,0.1)", border: `1px solid ${GOLD}44`, color: GOLD, textDecoration: "none" }}
        >
          💼 Contact Sponsor
        </Link>
        <Link
          href="/sponsor/campaigns"
          style={{ padding: "9px 18px", borderRadius: 20, fontSize: 11, fontWeight: 800, background: "rgba(0,255,255,0.1)", border: `1px solid ${CYAN}44`, color: CYAN, textDecoration: "none" }}
        >
          🎯 View Campaigns
        </Link>
      </div>

      {/* Sponsor a show CTA */}
      <div style={{ padding: "16px 20px", borderRadius: 10, border: `1px solid ${GOLD}22`, background: `rgba(255,215,0,0.03)` }}>
        <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: GOLD, textTransform: "uppercase", margin: "0 0 8px" }}>
          Partner With This Sponsor
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>
          {sponsor.displayName} actively funds artist campaigns, battles, and live events on TMI.
        </p>
        <Link
          href={`/messages/new?recipientId=${params.id}&name=${encodeURIComponent(sponsor.displayName)}&subject=Partnership+Inquiry`}
          style={{
            fontSize: 8, fontWeight: 800, color: GOLD,
            letterSpacing: "0.12em", textTransform: "uppercase",
            textDecoration: "none", padding: "6px 16px",
            borderRadius: 6, border: `1px solid ${GOLD}40`, background: `${GOLD}0c`,
          }}
        >
          Request Partnership →
        </Link>
      </div>
    </ProfileShell>
  );
}
