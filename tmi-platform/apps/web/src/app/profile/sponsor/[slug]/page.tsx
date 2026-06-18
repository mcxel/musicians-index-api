import ProfileShell from "@/components/profile/ProfileShell";
import UniversalMediaPanel from "@/components/media/UniversalMediaPanel";
import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";
import { profileToArticleRoute } from "@/lib/editorial/editorialRoutingResolver";
import { getSponsorPlacementsByZone } from "@/lib/editorial/SponsorPlacementModel";
import { getAdSlotForZone } from "@/lib/commerce/SponsorRegistry";
import DiscoveryRail from "@/components/discovery/DiscoveryRail";
import Link from "next/link";
import MemoryWall from "@/components/media/MemoryWall";

interface Props {
  params: { slug: string };
}

interface SeedSponsor {
  displayName: string;
  tagline: string;
  isVerified: boolean;
}

const SEED_SPONSORS: Record<string, SeedSponsor> = {
  "soundwave-audio": {
    displayName: "SoundWave Audio",
    tagline: "Tier 3 TMI Sponsor · $10,000 Beat Vault Prize Pool · Season 1 Official Partner",
    isVerified: true,
  },
  "beatmarket": {
    displayName: "BeatMarket",
    tagline: "TMI partner — $2,500 weekly cash prize for top battle performers",
    isVerified: true,
  },
  "tmi-official": {
    displayName: "TMI Official",
    tagline: "The Musician's Index official account — Season 1 standings and news",
    isVerified: true,
  },
};

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function seedSponsor(slug: string): SeedSponsor {
  if (SEED_SPONSORS[slug]) return SEED_SPONSORS[slug]!;
  return {
    displayName: titleCase(slug),
    tagline: "Official sponsor on The Musician's Index — supporting independent artists worldwide.",
    isVerified: false,
  };
}

function findArticleRoute(sponsorSlug: string): string | undefined {
  const article = EDITORIAL_ARTICLES.find(
    (a) => a.category === "sponsor" && a.relatedSponsorSlug === sponsorSlug
  );
  return article ? profileToArticleRoute("sponsor", article.slug) : undefined;
}

export default function SponsorProfilePage({ params }: Props) {
  const sponsor = seedSponsor(params.slug);

  const articleRoute = findArticleRoute(params.slug);
  // Rule 12: No Empty Inventory
  const sponsorAd = getAdSlotForZone(`sponsor-profile-${params.slug}`);
  const placements = getSponsorPlacementsByZone("mid-article")
    .concat(getSponsorPlacementsByZone("side-rail"))
    .concat(getSponsorPlacementsByZone("full-page"))
    .filter((p) => p.sponsorSlug === params.slug);

  return (
    <ProfileShell
      role="sponsor"
      displayName={sponsor.displayName}
      slug={params.slug}
      tagline={sponsor.tagline}
      isVerified={sponsor.isVerified}
      articleRoute={articleRoute}
    >
      {/* Active placements */}
      {placements.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.28em", color: "#AA2DFF", textTransform: "uppercase", margin: "0 0 12px" }}>
            Active Placements
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {placements.map((p) => (
              <div
                key={p.id}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: `1px solid ${p.accentColor}28`,
                  background: `${p.accentColor}06`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "#fff", margin: 0 }}>{p.headline}</p>
                  {p.body && (
                    <p style={{ fontSize: 8, color: "rgba(255,255,255,0.4)", margin: 0 }}>{p.body}</p>
                  )}
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <span style={{ fontSize: 7, fontWeight: 900, color: p.accentColor, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    {p.zone}
                  </span>
                  <br />
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)" }}>Tier {p.tier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sponsor CTA */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 10,
          border: "1px solid rgba(170,45,255,0.18)",
          background: "rgba(170,45,255,0.05)",
        }}
      >
        <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "#AA2DFF", textTransform: "uppercase", margin: "0 0 8px" }}>
          Sponsor Inquiry
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>
          Interested in a TMI sponsorship? Connect with our partnerships team.
        </p>
        <Link
          href="/contact?subject=sponsorship"
          style={{
            fontSize: 8,
            fontWeight: 800,
            color: "#AA2DFF",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid #AA2DFF40",
            background: "#AA2DFF0c",
          }}
        >
          Get in Touch →
        </Link>
      </div>

      <UniversalMediaPanel
        slug={params.slug}
        displayName={sponsor.displayName}
        role="sponsor"
        accentColor="#FFD700"
      />

      <div style={{ padding: "0 24px 16px" }}>
        <MemoryWall accentColor="#AA2DFF" title={`${sponsor.displayName} — Memory Wall`} entityId={params.slug} entityType="sponsor" />
      </div>

      {/* Rule 12: No Empty Inventory — platform promo if no paid sponsor in slot */}
      {sponsorAd.type === 'platform' && sponsorAd.platformPromo && (
        <div style={{ padding: "0 24px 16px" }}>
          <div style={{ background: `${sponsorAd.platformPromo.accentColor}0a`, border: `1px solid ${sponsorAd.platformPromo.accentColor}33`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: sponsorAd.platformPromo.accentColor }}>{sponsorAd.platformPromo.headline}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{sponsorAd.platformPromo.body}</div>
            </div>
            <Link href={sponsorAd.platformPromo.ctaHref} style={{ padding: "7px 16px", background: sponsorAd.platformPromo.accentColor, borderRadius: 7, fontSize: 9, fontWeight: 900, color: "#050310", textDecoration: "none", flexShrink: 0 }}>
              {sponsorAd.platformPromo.ctaLabel}
            </Link>
          </div>
        </div>
      )}
      {sponsorAd.type === 'advertise-cta' && (
        <div style={{ padding: "0 24px 12px", textAlign: "center" }}>
          <Link href="/sponsors/advertise" style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textDecoration: "none", letterSpacing: "0.08em", fontWeight: 700 }}>
            ADVERTISE ON TMI · FROM $25
          </Link>
        </div>
      )}

      {/* Rule 6: Discovery Rails — sponsor profile keeps users in content graph */}
      <div style={{ padding: "0 0 60px" }}>
        <DiscoveryRail type="performers" accentColor="#00E5FF" label="FEATURED ARTISTS" />
        <DiscoveryRail type="articles" accentColor="#AA2DFF" label="PRESS & FEATURES" />
        <DiscoveryRail type="liveRooms" accentColor="#E63000" label="LIVE NOW" />
        <DiscoveryRail type="sponsors" exclude={params.slug} accentColor="#FFD700" label="OTHER SPONSORS" />
      </div>
    </ProfileShell>
  );
}
