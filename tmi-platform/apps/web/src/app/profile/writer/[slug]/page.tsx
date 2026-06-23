import Link from "next/link";
import ProfileShell from "@/components/profile/ProfileShell";
import UniversalMediaPanel from "@/components/media/UniversalMediaPanel";
import ArticleAnalyticsPanel from "@/components/writer/ArticleAnalyticsPanel";
import { seedWriterWall, getPublicItems } from "@/lib/writer/WriterWallEngine";
import { scoreWriter, getWriterTierLabel } from "@/lib/writer/WriterRankEngine";
import { getEarnedBadges } from "@/lib/writer/WriterBadgeSystem";

interface Props { params: { slug: string } }

function titleCase(slug: string) {
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function WriterProfilePage({ params }: Props) {
  const writer = {
    displayName: titleCase(params.slug),
    tagline: "Independent writer on The Musician's Index.",
    specialty: "Culture / Coverage",
    isVerified: false,
  };

  seedWriterWall(params.slug);
  const items  = getPublicItems(params.slug);
  const score  = scoreWriter(params.slug);
  const badges = getEarnedBadges(params.slug);
  const tierLabel = getWriterTierLabel(score.tier);

  return (
    <ProfileShell
      role="performer"
      displayName={writer.displayName}
      slug={params.slug}
      tagline={writer.tagline}
      isVerified={writer.isVerified}
    >
      {/* Tier + specialty */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 24 }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: `${score.tierColor}18`, border: `1px solid ${score.tierColor}44`,
          borderRadius: 20, padding: "4px 12px",
          fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", color: score.tierColor,
        }}>
          ✍️ {tierLabel.toUpperCase()}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          🎵 {writer.specialty}
        </div>
      </div>

      {/* Analytics summary */}
      <div style={{ marginBottom: 28 }}>
        <ArticleAnalyticsPanel items={items} compact />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>ACHIEVEMENTS</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {badges.map((b) => (
              <div key={b.id} title={b.description} style={{ background: `${b.color}18`, border: `1px solid ${b.color}44`, borderRadius: 20, padding: "5px 12px", fontSize: 10, color: b.color, fontWeight: 700 }}>
                {b.icon} {b.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href={`/profile/writer/${params.slug}/works`}
          style={{ padding: "10px 20px", background: "linear-gradient(135deg,#FF2DAA,#AA2DFF)", border: "none", borderRadius: 8, color: "#fff", fontSize: 11, fontWeight: 900, letterSpacing: "0.12em", textDecoration: "none" }}
        >
          📋 VIEW PORTFOLIO
        </Link>
        <Link
          href={`/messages?to=${params.slug}`}
          style={{ padding: "10px 20px", background: "rgba(255,45,170,0.08)", border: "1px solid rgba(255,45,170,0.25)", borderRadius: 8, color: "#FF2DAA", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textDecoration: "none" }}
        >
          💌 MESSAGE
        </Link>
        <Link
          href="/hub/writer/pitches"
          style={{ padding: "10px 20px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textDecoration: "none" }}
        >
          ✏️ PITCH AN ARTICLE
        </Link>
      </div>

      <UniversalMediaPanel
        slug={params.slug}
        displayName={writer.displayName}
        role="writer"
        accentColor="#FF2DAA"
      />
    </ProfileShell>
  );
}
