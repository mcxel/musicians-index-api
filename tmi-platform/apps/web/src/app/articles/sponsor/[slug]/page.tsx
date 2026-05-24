import EditorialMagazineShell from "@/components/editorial/EditorialMagazineShell";
import EditorialPageFrame from "@/components/editorial/EditorialPageFrame";
import { getEditorialArticleBySlug } from "@/lib/editorial/NewsArticleModel";
import { injectAds } from "@/lib/editorial/editorialAdInjector";
import { articleToProfileRoute, categoryToSectionLabel } from "@/lib/editorial/editorialRoutingResolver";
import { resolveTemplate } from "@/lib/editorial/editorialPageEngine";
import Link from "next/link";

interface Props {
  params: { slug: string };
}

function SponsorFallback({ slug }: { slug: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏆</div>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#AA2DFF", fontWeight: 800, marginBottom: 12 }}>SPONSOR FEATURE</div>
      <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.8rem)", fontWeight: 900, marginBottom: 12 }}>Story Loading Into The Magazine</h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 440, lineHeight: 1.7, marginBottom: 28 }}>
        The sponsor feature for <strong style={{ color: "#AA2DFF" }}>{slug}</strong> is being prepared for the current issue.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/sponsors" style={{ padding: "10px 20px", background: "#AA2DFF", color: "#fff", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>SPONSOR HUB</Link>
        <Link href="/magazine" style={{ padding: "10px 20px", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>MAGAZINE</Link>
        <Link href="/join" style={{ padding: "10px 20px", background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>JOIN TMI</Link>
      </div>
    </div>
  );
}

export default function SponsorArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "sponsor") return <SponsorFallback slug={params.slug} />;

  const accentColor = "#AA2DFF";
  const ads = injectAds(article.sponsorPlacementIds, article.advertiserPlacementIds);
  const profileRoute = articleToProfileRoute("sponsor", article.relatedSponsorSlug);
  const template = resolveTemplate(article.category, article.templateType);

  return (
    <EditorialMagazineShell
      accentColor={accentColor}
      sectionLabel={categoryToSectionLabel("sponsor")}
      backRoute="/sponsors"
      backLabel="← Sponsors"
      category="sponsor"
    >
      <EditorialPageFrame
        article={article}
        templateType={template}
        accentColor={accentColor}
        profileRoute={profileRoute}
        ads={ads}
      />
    </EditorialMagazineShell>
  );
}
