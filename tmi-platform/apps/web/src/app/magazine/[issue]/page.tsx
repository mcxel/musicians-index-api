import MagazineShell, { type MagazinePage } from "@/components/magazine/MagazineShell";
import { MAGAZINE_ISSUE_1, type MagazineArticle } from "@/lib/magazine/magazineIssueData";
import Link from "next/link";

export function generateStaticParams() {
  return [{ issue: "1" }];
}

const CATEGORY_LABEL: Record<string, string> = {
  feature:   "FEATURE",
  interview: "INTERVIEW",
  review:    "REVIEW",
  news:      "NEWS",
  editorial: "EDITORIAL",
};

const CATEGORY_COLOR: Record<string, string> = {
  feature:   "#FF2DAA",
  interview: "#00FFFF",
  review:    "#AA2DFF",
  news:      "#FFD700",
  editorial: "#00FF88",
};

function ArticlePage({ article }: { article: MagazineArticle }) {
  const color = CATEGORY_COLOR[article.category] ?? "#00FFFF";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <span style={{ fontSize: 36, lineHeight: 1, flexShrink: 0 }}>{article.icon}</span>
        <div>
          <span style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.14em", color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 3, padding: "2px 6px" }}>
            {CATEGORY_LABEL[article.category]}
          </span>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>
            {article.author} — {article.publishedAt}
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: "clamp(14px, 2vw, 18px)", fontWeight: 900, lineHeight: 1.2, margin: 0, color: "#fff" }}>
        {article.title}
      </h2>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, margin: 0 }}>
        {article.subtitle}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {article.blocks.slice(0, 4).map((block, i) => {
          if (block.type === "heading") {
            return (
              <h3 key={i} style={{ fontSize: 12, fontWeight: 800, color, margin: 0, lineHeight: 1.3 }}>
                {block.text}
              </h3>
            );
          }
          if (block.type === "pullquote") {
            return (
              <blockquote key={i} style={{
                borderLeft: `3px solid ${color}`,
                paddingLeft: 12,
                margin: 0,
                fontStyle: "italic",
                fontSize: 12,
                color: "rgba(255,255,255,0.7)",
                lineHeight: 1.5,
              }}>
                {block.text}
              </blockquote>
            );
          }
          return (
            <p key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: 0 }}>
              {block.text}
            </p>
          );
        })}
      </div>

      <Link
        href={`/magazine/article/${article.slug}`}
        style={{
          alignSelf: "flex-start",
          fontSize: 8, fontWeight: 800, letterSpacing: "0.12em",
          color, border: `1px solid ${color}40`,
          borderRadius: 6, padding: "6px 14px",
          textDecoration: "none",
          marginTop: 8,
        }}
      >
        READ FULL ARTICLE →
      </Link>
    </div>
  );
}

function CoverPage({ issue }: { issue: string }) {
  const featured = MAGAZINE_ISSUE_1.slice(0, 3);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "8px 0", height: "100%" }}>
      <div style={{ textAlign: "center", padding: "20px 0 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize: 7, letterSpacing: "0.5em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>
          BERNTOUTGLOBAL XXL PRESENTS
        </div>
        <h1 style={{ fontSize: "clamp(22px, 4vw, 36px)", fontWeight: 900, letterSpacing: -1, lineHeight: 1, margin: "0 0 6px" }}>
          THE MUSICIAN&apos;S<br />INDEX
        </h1>
        <div style={{ fontSize: 9, letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", marginBottom: 14 }}>
          ISSUE {issue} — APRIL 2026
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg, rgba(255,45,170,0.15), rgba(170,45,255,0.15))",
          border: "1px solid rgba(255,45,170,0.3)", borderRadius: 8, padding: "8px 18px",
        }}>
          <span style={{ fontSize: 18 }}>👑</span>
          <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", letterSpacing: "0.08em" }}>CROWN SEASON</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ fontSize: 7, letterSpacing: "0.2em", color: "rgba(255,255,255,0.3)", fontWeight: 800 }}>
          IN THIS ISSUE
        </div>
        {featured.map((a, i) => (
          <div key={a.slug} style={{
            display: "flex", gap: 10, alignItems: "center",
            padding: "10px 12px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8,
          }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.title}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{a.author}</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>p.{i + 3}</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", letterSpacing: "0.15em" }}>
          USE ARROW KEYS OR SWIPE TO TURN PAGES
        </div>
      </div>
    </div>
  );
}

function TocPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 7, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 800, marginBottom: 4 }}>CONTENTS</div>
      <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0, lineHeight: 1 }}>Issue 1<br /><span style={{ fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}>April 2026</span></h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
        {MAGAZINE_ISSUE_1.map((a, i) => {
          const color = CATEGORY_COLOR[a.category];
          return (
            <div key={a.slug} style={{
              display: "flex", gap: 10, alignItems: "center",
              padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: "rgba(255,255,255,0.2)", minWidth: 18 }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontSize: 11, color: "#fff", flex: 1, lineHeight: 1.3 }}>{a.title}</span>
              <span style={{ fontSize: 7, fontWeight: 700, color, background: `${color}12`, border: `1px solid ${color}25`, borderRadius: 3, padding: "1px 5px", flexShrink: 0 }}>
                {CATEGORY_LABEL[a.category]}
              </span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>p.{i + 3}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SponsorPage({ name, desc, color, icon, cta }: {
  name: string; desc: string; color: string; icon: string; cta: string;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 20, textAlign: "center", padding: "20px 16px", height: "100%",
    }}>
      <span style={{ fontSize: 52 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 8, letterSpacing: "0.2em", color, fontWeight: 800, marginBottom: 8 }}>PRESENTED BY</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 8 }}>{name}</div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 260, margin: "0 auto" }}>{desc}</p>
      </div>
      <Link
        href="/sponsors"
        style={{
          padding: "10px 24px", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
          color: "#050510", background: color, borderRadius: 8, textDecoration: "none",
        }}
      >
        {cta}
      </Link>
    </div>
  );
}

function BackCover() {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 20, textAlign: "center", padding: "20px 16px", height: "100%",
    }}>
      <div>
        <div style={{ fontSize: 7, letterSpacing: "0.5em", color: "#FF2DAA", fontWeight: 800, marginBottom: 10 }}>BERNTOUTGLOBAL XXL</div>
        <h2 style={{ fontSize: 28, fontWeight: 900, margin: "0 0 6px", letterSpacing: -1 }}>THE MUSICIAN&apos;S<br />INDEX</h2>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}>NEXT ISSUE — MAY 2026</div>
      </div>
      <div style={{ fontSize: 48 }}>🔲</div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em" }}>SCAN TO SUBSCRIBE</div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/magazine" style={{ fontSize: 9, fontWeight: 700, color: "#00FFFF", border: "1px solid rgba(0,255,255,0.3)", borderRadius: 6, padding: "7px 16px", textDecoration: "none" }}>
          ALL ISSUES
        </Link>
        <Link href="/" style={{ fontSize: 9, fontWeight: 700, color: "#FF2DAA", border: "1px solid rgba(255,45,170,0.3)", borderRadius: 6, padding: "7px 16px", textDecoration: "none" }}>
          TMI HOME
        </Link>
      </div>
    </div>
  );
}

// Page layout:
//  0  Cover
//  1  TOC
//  2  Article 1
//  3  Article 2
//  4  Article 3
//  5  Article 4
//  6  Article 5
//  7  Sponsor 1 (PrimeWave)
//  8  Article 6
//  9  Article 7
//  10 Article 8
//  11 Article 9
//  12 Article 10
//  13 Sponsor 2 (BeatLink)
//  14 Back Cover
const SPONSORS = [
  {
    id: "sponsor-primewave",
    name: "PrimeWave Audio",
    desc: "Official TMI sound partner — powering every live room, every stage, every session.",
    color: "#00FFFF",
    icon: "🎙️",
    cta: "VISIT PRIMEWAVE →",
  },
  {
    id: "sponsor-beatlink",
    name: "BeatLink Studio",
    desc: "Thousands of licensed beats from the world's best independent producers — exclusive to TMI.",
    color: "#FFD700",
    icon: "🎛️",
    cta: "BROWSE BEATS →",
  },
];

function buildPages(issue: string): MagazinePage[] {
  const articles = MAGAZINE_ISSUE_1;

  const pages: MagazinePage[] = [
    // 0 — Cover
    {
      id: "cover",
      title: "Cover",
      type: "cover",
      content: <CoverPage issue={issue} />,
    },
    // 1 — TOC
    {
      id: "toc",
      title: "Contents",
      type: "editorial",
      content: <TocPage />,
    },
    // 2-6 — Articles 1-5
    ...articles.slice(0, 5).map((a): MagazinePage => ({
      id: `article-${a.slug}`,
      title: a.title,
      type: a.category === "interview" ? "interview" : "article",
      content: <ArticlePage article={a} />,
    })),
    // 7 — Sponsor 1
    {
      id: SPONSORS[0].id,
      title: SPONSORS[0].name,
      type: "sponsor",
      content: <SponsorPage {...SPONSORS[0]} />,
    },
    // 8-12 — Articles 6-10
    ...articles.slice(5).map((a): MagazinePage => ({
      id: `article-${a.slug}`,
      title: a.title,
      type: a.category === "interview" ? "interview" : "article",
      content: <ArticlePage article={a} />,
    })),
    // 13 — Sponsor 2
    {
      id: SPONSORS[1].id,
      title: SPONSORS[1].name,
      type: "sponsor",
      content: <SponsorPage {...SPONSORS[1]} />,
    },
    // 14 — Back cover
    {
      id: "back-cover",
      title: "Back Cover",
      type: "cover",
      content: <BackCover />,
    },
  ];

  return pages;
}

export default function MagazineIssuePage({ params }: { params: { issue: string } }) {
  const pages = buildPages(params.issue);
  return <MagazineShell pages={pages} issue={params.issue} issueTitle="The Musician's Index" />;
}
