import { Suspense } from "react";
import { MAGAZINE_ISSUE_1 } from "@/lib/magazine/magazineIssueData";
import MagazineSpreadRenderer from "@/components/editorial/MagazineSpreadRenderer";
import MagazineArticleRotationRail from "@/components/editorial/MagazineArticleRotationRail";

export const metadata = {
  title: "The Musician's Index Magazine | TMI",
  description: "Features, interviews, reviews, and news from the forefront of the music industry. Powered by TMI.",
  openGraph: {
    title: "TMI Magazine — Issue 1",
    description: "The Musician's Index: the magazine arm of the TMI platform.",
    type: "website",
  },
};

export default function MagazinePage() {
  const coverArticle = MAGAZINE_ISSUE_1[0];
  const relatedArticles = MAGAZINE_ISSUE_1.slice(1);

  if (!coverArticle) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", minHeight: "100vh", background: "#050510" }}>
      <Suspense fallback={<div style={{ background: "#050510", minHeight: "100vh" }} />}>
        <MagazineSpreadRenderer article={coverArticle} related={relatedArticles} issueNumber={1} initialSpread={0} />
      </Suspense>
      <aside style={{ borderLeft: "1px solid rgba(255,255,255,0.06)", padding: "28px 18px", background: "#060414" }}>
        <Suspense fallback={<div />}>
          <MagazineArticleRotationRail surface="sidebar" count={5} title="THIS ISSUE" />
        </Suspense>
      </aside>
    </div>
  );
}
