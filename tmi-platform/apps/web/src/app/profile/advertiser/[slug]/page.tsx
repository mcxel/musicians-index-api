import { notFound } from "next/navigation";
import ProfileShell from "@/components/profile/ProfileShell";
import { EDITORIAL_ARTICLES } from "@/lib/editorial/NewsArticleModel";
import { profileToArticleRoute } from "@/lib/editorial/editorialRoutingResolver";
import { getAdvertiserPlacementsByZone } from "@/lib/editorial/AdvertiserPlacementModel";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

interface SeedAdvertiser {
  displayName: string;
  tagline: string;
  isVerified: boolean;
}

const SEED_ADVERTISERS: Record<string, SeedAdvertiser> = {
  "beatmarket": {
    displayName: "BeatMarket",
    tagline: "12,000+ beats · $2,500 weekly prize for top TMI battle performers",
    isVerified: true,
  },
};

function findArticleRoute(advertiserSlug: string): string | undefined {
  const article = EDITORIAL_ARTICLES.find(
    (a) => a.category === "advertiser" && a.relatedAdvertiserSlug === advertiserSlug
  );
  return article ? profileToArticleRoute("advertiser", article.slug) : undefined;
}

export default function AdvertiserProfilePage({ params }: Props) {
  const advertiser = SEED_ADVERTISERS[params.slug];
  if (!advertiser) notFound();

  const articleRoute = findArticleRoute(params.slug);
  const placements = getAdvertiserPlacementsByZone("footer-strip")
    .concat(getAdvertiserPlacementsByZone("top-banner"))
    .filter((p) => p.advertiserSlug === params.slug);

  return (
    <ProfileShell
      role="advertiser"
      displayName={advertiser.displayName}
      slug={params.slug}
      tagline={advertiser.tagline}
      isVerified={advertiser.isVerified}
      articleRoute={articleRoute}
    >
      {/* Active placements */}
      {placements.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.28em", color: "#00E5FF", textTransform: "uppercase", margin: "0 0 12px" }}>
            Active Ad Placements
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
                <span
                  style={{
                    fontSize: 7,
                    fontWeight: 900,
                    color: p.accentColor,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    flexShrink: 0,
                  }}
                >
                  {p.zone}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Advertiser CTA */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: 10,
          border: "1px solid rgba(0,229,255,0.15)",
          background: "rgba(0,229,255,0.04)",
        }}
      >
        <p style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", color: "#00E5FF", textTransform: "uppercase", margin: "0 0 8px" }}>
          Advertiser Inquiry
        </p>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>
          Place your brand inside TMI editorial. Reach 100k+ music creators.
        </p>
        <Link
          href="/contact?subject=advertising"
          style={{
            fontSize: 8,
            fontWeight: 800,
            color: "#00E5FF",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            textDecoration: "none",
            padding: "6px 16px",
            borderRadius: 6,
            border: "1px solid #00E5FF40",
            background: "#00E5FF0c",
          }}
        >
          Advertise with TMI →
        </Link>
      </div>
    </ProfileShell>
  );
}
