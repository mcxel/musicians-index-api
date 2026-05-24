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

function AdvertiserFallback({ slug }: { slug: string }) {
  return (
    <div style={{ minHeight: "100vh", background: "#050510", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📣</div>
      <div style={{ fontSize: 10, letterSpacing: 4, color: "#00E5FF", fontWeight: 800, marginBottom: 12 }}>ADVERTISER FEATURE</div>
      <h1 style={{ fontSize: "clamp(1.2rem,3vw,1.8rem)", fontWeight: 900, marginBottom: 12 }}>Story Loading Into The Magazine</h1>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", maxWidth: 440, lineHeight: 1.7, marginBottom: 28 }}>
        The advertiser feature for <strong style={{ color: "#00E5FF" }}>{slug}</strong> is being prepared for the current issue.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/advertisers" style={{ padding: "10px 20px", background: "#00E5FF", color: "#050510", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>ADVERTISER HUB</Link>
        <Link href="/magazine" style={{ padding: "10px 20px", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>MAGAZINE</Link>
        <Link href="/join" style={{ padding: "10px 20px", background: "#FF2DAA", color: "#fff", fontWeight: 800, fontSize: 11, borderRadius: 8, textDecoration: "none" }}>JOIN TMI</Link>
      </div>
    </div>
  );
}

export default function AdArticlePage({ params }: Props) {
  const article = getEditorialArticleBySlug(params.slug);
  if (!article || article.category !== "advertiser") return <AdvertiserFallback slug={params.slug} />;

  const accentColor = "#00E5FF";
  const ads = injectAds(article.sponsorPlacementIds, article.advertiserPlacementIds);
  const profileRoute = articleToProfileRoute("advertiser", article.relatedAdvertiserSlug);
  const template = resolveTemplate(article.category, article.templateType);

  return (
    <EditorialMagazineShell
      accentColor={accentColor}
      sectionLabel={categoryToSectionLabel("advertiser")}
      backRoute="/advertisers"
      backLabel="← Advertisers"
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
