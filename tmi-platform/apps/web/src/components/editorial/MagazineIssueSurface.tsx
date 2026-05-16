"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { MagazineArticle } from "@/lib/magazine/magazineIssueData";
import { getCategoryAccent, getIssuePalette } from "./EditorialColorEngine";
import ArticlePollTile from "./ArticlePollTile";
import ArtistSpotlightTile from "./ArtistSpotlightTile";
import LawBubbleTile from "./LawBubbleTile";
import { SPONSOR_PLACEMENTS } from "@/lib/editorial/SponsorPlacementModel";
import { ADVERTISER_PLACEMENTS } from "@/lib/editorial/AdvertiserPlacementModel";

type MagazineIssueSurfaceProps = {
  article: MagazineArticle;
  issueNumber?: number;
  related: MagazineArticle[];
  variant?:
    | "full"
    | "cover-left"
    | "cover-right"
    | "article-left"
    | "article-right"
    | "sponsor-left"
    | "sponsor-right"
    | "spotlight-left"
    | "spotlight-right"
    | "polls-left"
    | "polls-right"
    | "archive-left"
    | "archive-right";
  pageNumber?: number;
};

// ── Canonical shard clip-path vocabulary ──────────────────────────────────────
const CL = {
  brokenPanel: "polygon(0 12%, 12% 0, 100% 0, 100% 84%, 88% 100%, 0 100%)",
  trapLeft:    "polygon(0 0, 100% 0, 86% 100%, 0 100%)",
  trapRight:   "polygon(10% 0, 100% 0, 100% 100%, 0 90%)",
  angledPanel: "polygon(0 0, 100% 8%, 94% 100%, 0 92%)",
  vertShard:   "polygon(0 0, 82% 0, 100% 100%, 18% 100%)",
  hexCut:      "polygon(10% 0, 88% 0, 100% 50%, 90% 100%, 12% 100%, 0 48%)",
  diagShard:   "polygon(0 10%, 100% 0, 90% 100%, 0 100%)",
  topBite:     "polygon(8% 0, 100% 0, 100% 100%, 0 100%, 0 10%)",
  bottomBite:  "polygon(0 0, 100% 0, 100% 88%, 92% 100%, 0 100%)",
  splitVert:   "polygon(0 0, 100% 6%, 100% 100%, 0 94%)",
  diagPromo:   "polygon(4% 0, 100% 0, 96% 100%, 0 100%)",
} as const;

function renderBodyBlock(block: MagazineArticle["blocks"][number], idx: number, accent: string) {
  if (block.type === "heading") {
    return (
      <h2 key={`h-${idx}`} style={{ margin: "14px 0 8px", fontSize: 18, lineHeight: 1.2, color: accent }}>
        {block.text}
      </h2>
    );
  }
  if (block.type === "pullquote") {
    return (
      <blockquote key={`q-${idx}`} style={{ margin: "10px 0", padding: "8px 10px", borderLeft: `3px solid ${accent}`, background: `${accent}1f`, fontStyle: "italic", color: "rgba(255,255,255,0.93)", fontSize: 13, lineHeight: 1.45 }}>
        {block.text}
      </blockquote>
    );
  }
  return (
    <p key={`p-${idx}`} style={{ margin: "0 0 10px", color: "rgba(255,255,255,0.85)", fontSize: 13, lineHeight: 1.56 }}>
      {block.text}
    </p>
  );
}

export default function MagazineIssueSurface({ article, issueNumber = 1, related, variant = "full", pageNumber }: MagazineIssueSurfaceProps) {
  const palette = getIssuePalette(issueNumber);
  const accent  = getCategoryAccent(issueNumber, article.category);
  const c0 = palette.colors[0];
  const c1 = palette.colors[1];
  const c2 = palette.colors[2];
  const c3 = palette.colors[3];

  // ── Real sponsor/advertiser data (no fake names) ──────────────────────────
  const sponsorRail = SPONSOR_PLACEMENTS.slice(0, 3);
  const adFooter    = ADVERTISER_PLACEMENTS[0] ?? null;

  // ── Story buckets ─────────────────────────────────────────────────────────
  const textCluster = [related[0] ?? article, related[1] ?? article, related[2] ?? article];
  const mixedRail   = [related[3] ?? article, related[4] ?? article, related[5] ?? article, related[6] ?? article];
  const relatedTail = related.slice(7, 11).length > 0 ? related.slice(7, 11) : related.slice(0, 4);

  // ── Article body snippet pager ────────────────────────────────────────────
  const snippetBlocks = useMemo(
    () => article.blocks.filter((b) => b.type === "paragraph" || b.type === "heading" || b.type === "pullquote"),
    [article.blocks],
  );
  const snippetWindows = useMemo(() => {
    if (snippetBlocks.length <= 3) return [snippetBlocks];
    const windows: Array<typeof snippetBlocks> = [];
    for (let i = 0; i < snippetBlocks.length; i += 3) windows.push(snippetBlocks.slice(i, i + 3));
    return windows.length > 0 ? windows : [snippetBlocks.slice(0, 3)];
  }, [snippetBlocks]);
  const [snippetIdx, setSnippetIdx] = useState(0);

  useEffect(() => { setSnippetIdx(0); }, [article.slug]);
  useEffect(() => {
    if (snippetWindows.length <= 1) return;
    const id = window.setInterval(() => setSnippetIdx((p) => (p + 1) % snippetWindows.length), 3800);
    return () => window.clearInterval(id);
  }, [snippetWindows.length]);

  const activeSnippets = snippetWindows[snippetIdx] ?? snippetWindows[0] ?? [];

  if (variant !== "full") {
    const articleLeftRelated = related[0] ?? article;
    const articleRightRelated = related.slice(1, 3);
    const archiveSet = related.slice(0, 4);
    const pageFrame = (children: React.ReactNode, options?: { accentColor?: string; clip?: string }) => (
      <div
        style={{
          minHeight: "100%",
          position: "relative",
          padding: "10px",
          background: "radial-gradient(circle at top left, rgba(255,255,255,0.16), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: 8, right: 12, fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.42)" }}>
          {pageNumber ? `p.${pageNumber}` : "issue"}
        </div>
        <div style={{ position: "relative", zIndex: 1, minHeight: "100%" }}>{children}</div>
      </div>
    );

    const renderVariant = () => {
      switch (variant) {
        case "cover-left":
          return pageFrame(
            <div style={{ display: "grid", gap: 14 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: accent, fontWeight: 900 }}>Issue {issueNumber}</div>
              <div style={{ fontSize: 40, lineHeight: 0.9, fontWeight: 900, color: "#201513" }}>The Musician&apos;s Index</div>
              <div style={{ clipPath: CL.hexCut, background: `linear-gradient(145deg, ${accent}28, rgba(9,10,18,0.78))`, border: `1px solid ${accent}62`, padding: "16px" }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: accent, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 8 }}>Contents</div>
                {[
                  "Cover Story",
                  "Article Spread",
                  "Sponsor Editorial",
                  "Artist Spotlight",
                  "Polls & Reviews",
                  "Archive",
                ].map((label, index) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.84)", padding: "4px 0" }}><span>{label}</span><span>{index + 2}</span></div>
                ))}
              </div>
              <div style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", alignSelf: "start", fontSize: 10, letterSpacing: "0.24em", textTransform: "uppercase", color: "rgba(255,255,255,0.54)" }}>Open Spread</div>
            </div>
          );
        case "cover-right":
          return pageFrame(
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ clipPath: CL.brokenPanel, background: `linear-gradient(145deg, ${accent}30, rgba(9,10,18,0.78))`, border: `1px solid ${accent}72`, padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, fontWeight: 900 }}>Cover</span>
                  <span style={{ fontSize: 48 }}>{article.icon}</span>
                </div>
                <div style={{ fontSize: 40, lineHeight: 0.96, fontWeight: 900, marginBottom: 10 }}>{article.title}</div>
                <div style={{ fontSize: 16, lineHeight: 1.32, color: "rgba(255,255,255,0.84)", marginBottom: 10 }}>{article.subtitle}</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 99, border: `1px solid ${accent}55`, color: accent }}>Cover Story</span>
                  <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 99, border: "1px solid rgba(255,255,255,0.28)", color: "rgba(255,255,255,0.8)" }}>Hero Spread</span>
                </div>
              </div>
            </div>
          );
        case "article-left":
          return pageFrame(
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ clipPath: CL.brokenPanel, background: `linear-gradient(145deg, ${accent}36, rgba(9,10,18,0.76))`, border: `1px solid ${accent}70`, padding: "16px" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                  <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 99, border: `1px solid ${accent}55`, color: accent, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 900 }}>{article.category}</span>
                  <span style={{ fontSize: 10, padding: "4px 8px", borderRadius: 99, border: `1px solid ${c2}55`, color: c2, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 900 }}>Sponsored</span>
                </div>
                <div style={{ fontSize: 38, lineHeight: 0.95, fontWeight: 900, marginBottom: 8 }}>{article.title}</div>
                <div style={{ fontSize: 16, lineHeight: 1.34, color: "rgba(255,255,255,0.84)", marginBottom: 10 }}>{article.subtitle}</div>
                <div style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.78)", marginBottom: 14 }}>{article.blocks.find((block) => block.type === "paragraph")?.text}</div>
                <Link href={`/magazine/article/${article.slug}`} style={{ textDecoration: "none", display: "inline-block", color: "#0a0a12", background: accent, padding: "8px 14px", clipPath: CL.diagPromo, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 900 }}>Article Route</Link>
              </div>
              <div style={{ clipPath: CL.diagPromo, background: `linear-gradient(135deg, ${c2}24, rgba(8,8,16,0.78))`, border: `1px solid ${c2}58`, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: c2, fontWeight: 900, marginBottom: 6 }}>Sponsor Note</div>
                <div style={{ fontSize: 14, lineHeight: 1.35, color: "rgba(255,255,255,0.85)" }}>{sponsorRail[0]?.headline ?? "Partner spotlight active."}</div>
              </div>
            </div>
          );
        case "article-right":
          return pageFrame(
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ clipPath: CL.trapLeft, background: `${palette.panelGradient}, linear-gradient(140deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))`, border: `1px solid ${accent}60`, padding: "14px 16px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: accent, fontWeight: 900, marginBottom: 8 }}>Body</div>
                {activeSnippets.map((block, index) => renderBodyBlock(block, index, accent))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 10 }}>
                <div style={{ clipPath: CL.vertShard, background: `linear-gradient(145deg, ${c3}24, rgba(8,8,16,0.82))`, border: `1px solid ${c3}58`, padding: "12px" }}>
                  <ArticlePollTile question="Who owns this issue cycle?" choices={[{ label: "Headline Star", percent: 44 }, { label: "New Challenger", percent: 31 }, { label: "Producer Collective", percent: 25 }]} accent={c3} />
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ clipPath: CL.hexCut, background: `linear-gradient(145deg, ${c0}24, rgba(8,8,16,0.82))`, border: `1px solid ${c0}58`, padding: "12px" }}>
                    <ArtistSpotlightTile artistName={article.author} blurb="Featured on issue board" statLabel="Fan Pulse" statValue="+18.4%" accent={c0} />
                  </div>
                  <div style={{ clipPath: CL.angledPanel, background: `linear-gradient(145deg, ${c2}20, rgba(8,8,16,0.84))`, border: `1px solid ${c2}58`, padding: "12px" }}>
                    <LawBubbleTile accent={c2} />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {articleRightRelated.map((item) => (
                  <Link key={item.slug} href={`/magazine/article/${item.slug}`} style={{ textDecoration: "none", clipPath: CL.diagShard, background: "rgba(8,8,16,0.78)", border: "1px solid rgba(255,255,255,0.18)", padding: "10px 12px", color: "#fff" }}>
                    <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: getCategoryAccent(issueNumber, item.category), fontWeight: 900, marginBottom: 4 }}>{item.category}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.25, fontWeight: 800 }}>{item.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          );
        case "sponsor-left":
          return pageFrame(
            <div style={{ display: "grid", gap: 10 }}>
              {sponsorRail.slice(0, 2).map((placement, index) => (
                <Link key={placement.id} href={placement.ctaRoute} style={{ textDecoration: "none", clipPath: index === 0 ? CL.hexCut : CL.diagPromo, background: `linear-gradient(145deg, ${placement.accentColor}22, rgba(8,8,16,0.8))`, border: `1px solid ${placement.accentColor}66`, padding: "16px 18px", color: "#fff" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: placement.accentColor, fontWeight: 900, marginBottom: 6 }}>{placement.sponsorName}</div>
                  <div style={{ fontSize: 22, lineHeight: 1.05, fontWeight: 900, marginBottom: 6 }}>{placement.headline}</div>
                  <div style={{ fontSize: 12, lineHeight: 1.42, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>{placement.body}</div>
                  <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: placement.accentColor, fontWeight: 800 }}>{placement.ctaLabel} →</div>
                </Link>
              ))}
            </div>
          );
        case "sponsor-right":
          return pageFrame(
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ clipPath: CL.brokenPanel, background: `linear-gradient(145deg, ${c1}24, rgba(8,8,16,0.8))`, border: `1px solid ${c1}60`, padding: "16px" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: c1, fontWeight: 900, marginBottom: 8 }}>Editorial Add-On</div>
                <div style={{ fontSize: 24, lineHeight: 1.02, fontWeight: 900, marginBottom: 8 }}>{articleLeftRelated.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.82)" }}>{articleLeftRelated.subtitle}</div>
              </div>
              <div style={{ clipPath: CL.diagPromo, background: `linear-gradient(145deg, ${c3}22, rgba(8,8,16,0.84))`, border: `1px solid ${c3}56`, padding: "12px 14px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: c3, fontWeight: 900, marginBottom: 6 }}>Merch + Video</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link href="/shop" style={{ textDecoration: "none", color: "#0a0a12", background: c3, padding: "8px 12px", fontSize: 10, fontWeight: 900, clipPath: CL.diagPromo }}>Open Merch</Link>
                  <Link href="/media" style={{ textDecoration: "none", color: "#fff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", padding: "8px 12px", fontSize: 10, fontWeight: 800, clipPath: CL.diagPromo }}>Watch Clip</Link>
                </div>
              </div>
            </div>
          );
        case "spotlight-left":
          return pageFrame(
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ clipPath: CL.hexCut, background: `linear-gradient(145deg, ${c0}2c, rgba(8,8,16,0.84))`, border: `1px solid ${c0}62`, padding: "16px" }}>
                <ArtistSpotlightTile artistName={article.author} blurb="Issue leader portrait board" statLabel="Live Reach" statValue="24.8K" accent={c0} />
              </div>
              <div style={{ clipPath: CL.trapRight, background: `linear-gradient(145deg, ${accent}22, rgba(8,8,16,0.82))`, border: `1px solid ${accent}56`, padding: "14px" }}>
                <div style={{ fontSize: 18, lineHeight: 1.2, fontWeight: 900, marginBottom: 6 }}>"{article.blocks.find((block) => block.type === "pullquote")?.text ?? article.subtitle}"</div>
                <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: accent, fontWeight: 800 }}>Quote Layer</div>
              </div>
            </div>
          );
        case "spotlight-right":
          return pageFrame(
            <div style={{ display: "grid", gap: 10 }}>
              {related.slice(0, 3).map((item, index) => (
                <Link key={item.slug} href={`/magazine/article/${item.slug}`} style={{ textDecoration: "none", clipPath: index % 2 === 0 ? CL.diagShard : CL.bottomBite, background: `linear-gradient(145deg, ${getCategoryAccent(issueNumber, item.category)}1e, rgba(8,8,16,0.82))`, border: `1px solid ${getCategoryAccent(issueNumber, item.category)}4c`, padding: "12px", color: "#fff" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: getCategoryAccent(issueNumber, item.category), fontWeight: 900, marginBottom: 4 }}>{item.category}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.18, fontWeight: 900 }}>{item.title}</div>
                </Link>
              ))}
            </div>
          );
        case "polls-left":
          return pageFrame(
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ clipPath: CL.vertShard, background: `linear-gradient(145deg, ${c3}24, rgba(8,8,16,0.84))`, border: `1px solid ${c3}60`, padding: "14px" }}>
                <ArticlePollTile question="Which block lands hardest?" choices={[{ label: "Hero", percent: 38 }, { label: "Spotlight", percent: 34 }, { label: "Review", percent: 28 }]} accent={c3} />
              </div>
              <div style={{ clipPath: CL.diagPromo, background: `linear-gradient(145deg, ${c1}24, rgba(8,8,16,0.82))`, border: `1px solid ${c1}56`, padding: "14px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: c1, fontWeight: 900, marginBottom: 6 }}>Review Marker</div>
                <div style={{ fontSize: 22, lineHeight: 1.02, fontWeight: 900 }}>{related[0]?.title ?? article.title}</div>
              </div>
            </div>
          );
        case "polls-right":
          return pageFrame(
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ clipPath: CL.angledPanel, background: `linear-gradient(145deg, ${c2}22, rgba(8,8,16,0.82))`, border: `1px solid ${c2}56`, padding: "14px" }}>
                <LawBubbleTile accent={c2} />
              </div>
              <div style={{ clipPath: CL.hexCut, background: `linear-gradient(145deg, ${accent}20, rgba(8,8,16,0.84))`, border: `1px solid ${accent}56`, padding: "14px" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, fontWeight: 900, marginBottom: 6 }}>Review CTA</div>
                <Link href="/magazine" style={{ textDecoration: "none", color: "#0a0a12", background: accent, padding: "8px 12px", fontSize: 10, fontWeight: 900, clipPath: CL.diagPromo, display: "inline-block" }}>Open Magazine</Link>
              </div>
            </div>
          );
        case "archive-left":
          return pageFrame(
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: accent, fontWeight: 900 }}>Archive</div>
              {archiveSet.map((item, index) => (
                <Link key={item.slug} href={`/magazine/article/${item.slug}`} style={{ textDecoration: "none", clipPath: index % 2 === 0 ? CL.trapLeft : CL.diagShard, background: "rgba(8,8,16,0.78)", border: "1px solid rgba(255,255,255,0.18)", padding: "10px 12px", color: "#fff" }}>
                  <div style={{ fontSize: 9, letterSpacing: "0.16em", textTransform: "uppercase", color: getCategoryAccent(issueNumber, item.category), fontWeight: 900, marginBottom: 4 }}>{item.category}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.2, fontWeight: 800 }}>{item.title}</div>
                </Link>
              ))}
            </div>
          );
        case "archive-right":
          return pageFrame(
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ clipPath: CL.brokenPanel, background: `linear-gradient(145deg, ${c0}20, rgba(8,8,16,0.82))`, border: `1px solid ${c0}56`, padding: "16px" }}>
                <div style={{ fontSize: 24, lineHeight: 1.02, fontWeight: 900, marginBottom: 8 }}>Next Page Stack</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: "rgba(255,255,255,0.82)", marginBottom: 12 }}>Continue flipping for sponsor takes, artist spotlight, polls, reviews, and archive callbacks.</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link href="/magazine" style={{ textDecoration: "none", color: "#0a0a12", background: c0, padding: "8px 12px", fontSize: 10, fontWeight: 900, clipPath: CL.diagPromo }}>Issue Board</Link>
                  <Link href="/home/1" style={{ textDecoration: "none", color: "#fff", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", padding: "8px 12px", fontSize: 10, fontWeight: 800, clipPath: CL.diagPromo }}>Home</Link>
                </div>
              </div>
            </div>
          );
      }
    };

    return renderVariant();
  }

  // ── Layer 2: micro confetti (22 pieces) ──────────────────────────────────
  const confetti = Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left:  3 + ((i * 13) % 94),
    top:   3 + ((i * 19) % 93),
    size:  4 + (i % 5) * 3,
    color: palette.confettiColors[i % palette.confettiColors.length] ?? "#fff",
    delay: `${(i % 7) * 0.35}s`,
    rot:   `${(i % 4) * 40}deg`,
  }));

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "20px 16px 52px",
        background: palette.boardGradient,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Layer 1: background glow blobs ── */}
      <div style={{ position: "absolute", left: "8%",  top: "4%",  width: 520, height: 380, borderRadius: "50%", background: `radial-gradient(ellipse at center, ${accent}1e, transparent 70%)`, filter: "blur(48px)", pointerEvents: "none", zIndex: 0 }} aria-hidden />
      <div style={{ position: "absolute", left: "62%", top: "18%", width: 580, height: 440, borderRadius: "50%", background: `radial-gradient(ellipse at center, ${c2}16, transparent 70%)`, filter: "blur(52px)", pointerEvents: "none", zIndex: 0 }} aria-hidden />
      <div style={{ position: "absolute", left: "30%", top: "56%", width: 460, height: 340, borderRadius: "50%", background: `radial-gradient(ellipse at center, ${c3}12, transparent 70%)`, filter: "blur(44px)", pointerEvents: "none", zIndex: 0 }} aria-hidden />

      {/* ── Layer 2: micro confetti ── */}
      {confetti.map((p) => (
        <span
          key={p.id}
          style={{ position: "absolute", left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: Math.max(3, p.size - 2), opacity: 0.26, borderRadius: 1, background: p.color, filter: "blur(0.3px)", transform: `rotate(${p.rot})`, animation: "floatDrift 7s ease-in-out infinite", animationDelay: p.delay, zIndex: 1 }}
          aria-hidden
        />
      ))}

      {/* ── Layer 3: diagonal score lines ── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none" }} aria-hidden>
        {[14, 38, 62, 84].map((pct, i) => (
          <div key={`ln-${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${pct}%`, height: 1, background: `linear-gradient(90deg, transparent, ${palette.confettiColors[i % palette.confettiColors.length]}16, transparent)`, transform: `rotate(${i % 2 === 0 ? "-0.4deg" : "0.3deg"})` }} />
        ))}
      </div>

      {/* ── Layers 4–6: content ── */}
      <div style={{ maxWidth: 1240, margin: "0 auto", position: "relative", zIndex: 5 }}>

        {/* Nav strip */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 10 }}>
          <Link href="/magazine" style={{ textDecoration: "none", color: "rgba(255,255,255,0.65)", fontSize: 8, letterSpacing: "0.22em", fontWeight: 800 }}>
            ← BACK TO MAGAZINE
          </Link>
          <div style={{ fontSize: 7, letterSpacing: "0.3em", textTransform: "uppercase", color: accent, fontWeight: 900 }}>
            {palette.name} · Editorial Issue Board
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* SECTION A — Hero Feature + SECTION B — Text Cluster     */}
        {/* ════════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "8fr 4fr", gap: 16, marginBottom: 18, alignItems: "stretch" }}>

          {/* A — Hero Feature shard */}
          <article
            style={{ clipPath: CL.brokenPanel, border: `1.5px solid ${accent}78`, background: `linear-gradient(145deg, ${accent}3c, rgba(9,10,18,0.70) 55%, rgba(255,255,255,0.09) 100%)`, padding: "30px 32px 38px", position: "relative", overflow: "hidden", transform: "rotate(-0.7deg)", minHeight: 340 }}
            className="tile-pulse"
          >
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(120deg, transparent 10%, rgba(255,255,255,0.16), transparent 48%)", transform: "translateX(-130%)", animation: "headlineFlicker 6s linear infinite", pointerEvents: "none" }} />
            <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <span style={{ fontSize: 7, letterSpacing: "0.3em", fontWeight: 900, textTransform: "uppercase", color: accent, padding: "3px 10px", border: `1px solid ${accent}55`, background: `${accent}14` }}>
                  Cover Story
                </span>
                <span style={{ fontSize: 52, lineHeight: "1" }}>{article.icon}</span>
              </div>
              <h1 style={{ margin: "0 0 14px", fontSize: "clamp(1.5rem, 3vw, 2.9rem)", lineHeight: 1.05, fontWeight: 900, letterSpacing: "-0.015em" }}>
                {article.title}
              </h1>
              <p style={{ margin: "0 0 18px", fontSize: 13, lineHeight: 1.58, color: "rgba(255,255,255,0.8)", maxWidth: 580 }}>
                {article.subtitle}
              </p>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.36)", letterSpacing: "0.16em", marginBottom: 22 }}>
                {article.author} · {article.publishedAt}
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: "auto" }}>
                <Link
                  href={`/magazine/article/${article.slug}`}
                  style={{ textDecoration: "none", display: "inline-block", color: "#07080f", background: accent, padding: "10px 22px", fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", clipPath: CL.diagPromo }}
                  className="video-button"
                >
                  OPEN STORY
                </Link>
                <span style={{ display: "inline-block", border: "1px solid rgba(255,255,255,0.28)", padding: "10px 18px", fontSize: 9, letterSpacing: "0.14em", fontWeight: 800, color: "rgba(255,255,255,0.78)", clipPath: CL.diagPromo, background: "rgba(255,255,255,0.06)" }}>
                  ▶ WATCH CLIP
                </span>
              </div>
            </div>
          </article>

          {/* B — Text Story Cluster (3 stacked shards, each different polygon) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {textCluster.map((story, i) => {
              const clip = i === 0 ? CL.trapRight : i === 1 ? CL.angledPanel : CL.bottomBite;
              const rot  = i === 0 ? "1.3deg" : i === 1 ? "-0.9deg" : "1.7deg";
              const minH = i === 0 ? 130 : i === 1 ? 110 : 120;
              const col  = i === 0 ? c1 : i === 1 ? c3 : c0;
              const pad  = i === 0 ? "16px 18px" : i === 1 ? "18px 22px" : "14px 16px";
              return (
                <article
                  key={`tc-${i}`}
                  style={{ clipPath: clip, border: `1px solid ${col}60`, background: `linear-gradient(148deg, ${col}24, rgba(8,8,16,0.84))`, padding: pad, display: "flex", flexDirection: "column", minHeight: minH, transform: `rotate(${rot})` }}
                  className="hover-glow"
                >
                  <div style={{ fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: col, fontWeight: 900, marginBottom: 6 }}>
                    {story.category}
                  </div>
                  <h3 style={{ margin: "0 0 7px", fontSize: 14, lineHeight: 1.15, fontWeight: 900 }}>{story.title}</h3>
                  <p style={{ margin: "0 0 8px", fontSize: 10, lineHeight: 1.45, color: "rgba(255,255,255,0.7)", flexGrow: 1 }}>{story.subtitle}</p>
                  <Link href={`/magazine/article/${story.slug}`} style={{ textDecoration: "none", color: col, fontSize: 8, fontWeight: 800, letterSpacing: "0.14em", marginTop: "auto" }}>
                    READ →
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════ */}
        {/* SECTION C — Mixed Story Rail    */}
        {/* ════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 18, alignItems: "end" }}>
          {mixedRail.map((story, i) => {
            const isImg  = i % 2 === 0;
            const col    = i === 0 ? c0 : i === 1 ? c1 : i === 2 ? c2 : c3;
            const clip   = i === 0 ? CL.trapLeft : i === 1 ? CL.diagShard : i === 2 ? CL.topBite : CL.trapRight;
            const minH   = i === 0 ? 240 : i === 1 ? 198 : i === 2 ? 260 : 182;
            const transY = i === 0 ? 0 : i === 1 ? 16 : i === 2 ? -8 : 24;
            const rot    = i % 2 === 0 ? "-0.6deg" : "0.8deg";
            return (
              <Link key={`mr-${i}`} href={`/magazine/article/${story.slug}`} style={{ textDecoration: "none", display: "block" }}>
                <article
                  style={{ clipPath: clip, border: `1px solid ${col}55`, background: isImg ? `linear-gradient(155deg, ${col}3c, rgba(255,255,255,0.1) 38%, rgba(8,8,16,0.78))` : `linear-gradient(150deg, rgba(8,8,16,0.9), ${col}1c)`, padding: `${16 + i * 4}px ${14 + i * 2}px`, minHeight: minH, transform: `translateY(${transY}px) rotate(${rot})`, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}
                  className="hover-glow"
                >
                  {isImg && (
                    <div style={{ fontSize: 40, position: "absolute", top: 14, right: 14, opacity: 0.5 }}>{story.icon}</div>
                  )}
                  <div style={{ fontSize: 7, letterSpacing: "0.22em", textTransform: "uppercase", color: col, fontWeight: 900, marginBottom: 8 }}>
                    {story.category}
                  </div>
                  <h3 style={{ margin: "0 0 8px", fontSize: 14, lineHeight: 1.15, fontWeight: 900, maxWidth: "86%" }}>{story.title}</h3>
                  <p style={{ margin: 0, fontSize: 10, lineHeight: 1.48, color: "rgba(255,255,255,0.68)", flexGrow: 1 }}>{story.subtitle}</p>
                  <span style={{ marginTop: 14, fontSize: 8, color: col, fontWeight: 800, letterSpacing: "0.12em" }}>
                    {isImg ? "VIEW →" : "READ →"}
                  </span>
                </article>
              </Link>
            );
          })}
        </div>

        {/* ══════════════════════════════════════════════════ */}
        {/* SECTION D — Sponsor Interrupt Rail (real data)    */}
        {/* ══════════════════════════════════════════════════ */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.34em", color: c2, textTransform: "uppercase", marginBottom: 12 }}>
            Partner Sponsors
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {sponsorRail.map((sp, i) => {
              const clip = i === 0 ? CL.splitVert : i === 1 ? CL.angledPanel : CL.diagPromo;
              const rot  = i === 0 ? "0.8deg" : i === 1 ? "-1.2deg" : "0.4deg";
              return (
                <Link key={sp.id} href={sp.ctaRoute} style={{ textDecoration: "none", display: "block" }}>
                  <div
                    style={{ clipPath: clip, border: `1.5px solid ${sp.accentColor}85`, background: `linear-gradient(140deg, ${sp.accentColor}2c, rgba(8,8,16,0.86) 65%)`, padding: `${20 + i * 4}px ${22 + i * 2}px`, boxShadow: `0 0 36px ${sp.accentColor}1e, inset 0 0 24px ${sp.accentColor}08`, transform: `rotate(${rot})`, position: "relative", overflow: "hidden", minHeight: 148 }}
                    className="sponsor-shimmer"
                  >
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${sp.accentColor}cc, transparent)`, pointerEvents: "none" }} />
                    <div style={{ fontSize: 7, letterSpacing: "0.32em", textTransform: "uppercase", color: sp.accentColor, fontWeight: 900, marginBottom: 8 }}>
                      {sp.sponsorName} · Partner
                    </div>
                    <div style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.12, marginBottom: 8, color: "#fff" }}>
                      {sp.headline}
                    </div>
                    {sp.body && (
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.62)", lineHeight: 1.48, marginBottom: 10 }}>{sp.body}</div>
                    )}
                    {sp.promoCode && (
                      <div style={{ display: "inline-block", padding: "3px 10px", border: `1px solid ${sp.accentColor}55`, background: `${sp.accentColor}16`, marginBottom: 10 }}>
                        <span style={{ fontSize: 8, fontWeight: 900, color: sp.accentColor, letterSpacing: "0.22em" }}>CODE: {sp.promoCode}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 9, fontWeight: 900, color: sp.accentColor, letterSpacing: "0.16em" }}>
                      {sp.ctaLabel} →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* SECTION E — Poll Rail + F — Spotlight + Law Bubble     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "5fr 4fr 3fr", gap: 14, marginBottom: 18, alignItems: "stretch" }}>

          {/* E — Fan Poll */}
          <div style={{ clipPath: CL.vertShard, border: `1px solid ${c3}72`, background: `linear-gradient(150deg, ${c3}24, rgba(7,8,14,0.9))`, padding: "20px 26px", transform: "rotate(-0.5deg)" }} className="hover-glow">
            <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.3em", color: c3, textTransform: "uppercase", marginBottom: 12 }}>
              Fan Poll
            </div>
            <ArticlePollTile
              question="Who owns this issue cycle?"
              choices={[
                { label: "Headline Star",        percent: 44 },
                { label: "New Challenger",        percent: 31 },
                { label: "Producer Collective",   percent: 25 },
              ]}
              accent={c3}
            />
          </div>

          {/* F — Artist Spotlight */}
          <div style={{ clipPath: CL.hexCut, border: `1px solid ${c0}74`, background: `linear-gradient(145deg, ${c0}2c, rgba(7,8,15,0.88))`, padding: "18px", transform: "rotate(1.1deg)" }} className="hover-glow">
            <ArtistSpotlightTile artistName={article.author} blurb="Featured on issue board" statLabel="Fan Pulse" statValue="+18.4%" accent={c0} />
          </div>

          {/* Law Bubble */}
          <div style={{ clipPath: CL.angledPanel, border: `1px solid ${c2}74`, background: `linear-gradient(145deg, ${c2}28, rgba(7,8,15,0.9))`, padding: "14px", transform: "rotate(-1.3deg)" }} className="hover-glow">
            <LawBubbleTile accent={c2} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════ */}
        {/* Article Body Shard + Related Stories Shards     */}
        {/* ════════════════════════════════════════════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "7fr 5fr", gap: 16, marginBottom: 18 }}>

          <article
            style={{ clipPath: CL.trapLeft, border: `1px solid ${accent}68`, background: `${palette.panelGradient}, linear-gradient(140deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))`, padding: "22px 26px", transform: "rotate(0.4deg)" }}
            className="hover-glow"
          >
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, marginBottom: 10 }}>Article Excerpts</div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.38)", marginBottom: 14, letterSpacing: "0.12em" }}>
              {article.author} · {article.publishedAt} · #{article.tags[0] ?? "issue"}
            </div>
            {activeSnippets.map((block, idx) => renderBodyBlock(block, idx, accent))}
            {snippetWindows.length > 1 && (
              <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                {snippetWindows.map((_, idx) => (
                  <button
                    key={`sw-${idx}`}
                    onClick={() => setSnippetIdx(idx)}
                    aria-label={`Snippet window ${idx + 1}`}
                    style={{ width: idx === snippetIdx ? 20 : 8, height: 6, borderRadius: 99, border: "none", background: idx === snippetIdx ? accent : "rgba(255,255,255,0.2)", cursor: "pointer", transition: "all 180ms ease", padding: 0 }}
                  />
                ))}
              </div>
            )}
          </article>

          {/* Related stories — shard format, no rectangles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: "0.3em", color: accent, textTransform: "uppercase", marginBottom: 4 }}>
              Related Stories
            </div>
            {relatedTail.map((item, i) => {
              const clip   = i === 0 ? CL.diagShard : i === 1 ? CL.trapRight : i === 2 ? CL.splitVert : CL.bottomBite;
              const col    = i === 0 ? c0 : i === 1 ? c1 : i === 2 ? c2 : c3;
              const rot    = i === 0 ? "-0.8deg" : i === 1 ? "1.2deg" : i === 2 ? "-0.4deg" : "0.9deg";
              const transY = i * 5;
              return (
                <Link key={`rel-${item.slug}-${i}`} href={`/magazine/article/${item.slug}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{ clipPath: clip, border: `1px solid ${col}52`, background: `linear-gradient(148deg, ${col}1c, rgba(8,8,14,0.82))`, padding: `${10 + i * 3}px ${14 + i * 2}px`, transform: `rotate(${rot}) translateY(${transY}px)` }}
                    className="hover-glow"
                  >
                    <div style={{ fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", color: col, fontWeight: 900, marginBottom: 4 }}>{item.category}</div>
                    <div style={{ fontSize: 12, lineHeight: 1.25, fontWeight: 800, marginBottom: 5, color: "#fff" }}>{item.title}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.58)", lineHeight: 1.42 }}>{item.subtitle}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Advertiser footer strip (real data) ── */}
        {adFooter && (
          <Link href={adFooter.ctaRoute} style={{ textDecoration: "none", display: "block", marginBottom: 24 }}>
            <div style={{ clipPath: CL.diagPromo, border: `1px solid ${adFooter.accentColor}48`, background: `linear-gradient(90deg, ${adFooter.accentColor}10, rgba(8,8,16,0.82))`, padding: "12px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ fontSize: 6, fontWeight: 700, color: "rgba(255,255,255,0.28)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
                  Advertisement · {adFooter.advertiserName}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "rgba(255,255,255,0.68)" }}>{adFooter.headline}</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 900, color: adFooter.accentColor, letterSpacing: "0.16em", whiteSpace: "nowrap" as const }}>
                {adFooter.ctaLabel} →
              </span>
            </div>
          </Link>
        )}

        {/* ── Issue nav ── */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <Link href="/magazine" style={{ textDecoration: "none", display: "inline-block", color: "#07080f", background: accent, padding: "11px 24px", fontSize: 9, fontWeight: 900, letterSpacing: "0.18em", clipPath: CL.diagPromo }}>
            OPEN ISSUE BOARD
          </Link>
          <Link href="/home/1" style={{ textDecoration: "none", display: "inline-block", color: "#fff", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.2)", padding: "11px 24px", fontSize: 9, fontWeight: 800, letterSpacing: "0.14em", clipPath: CL.diagPromo }}>
            BACK TO HOME
          </Link>
        </div>
      </div>

      <style jsx>{`
        .hover-glow {
          transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;
        }
        .hover-glow:hover {
          transform: translateY(-3px) scale(1.012);
          box-shadow: 0 0 32px rgba(255, 255, 255, 0.11);
          border-color: rgba(255, 255, 255, 0.46) !important;
        }
        .tile-pulse {
          animation: tilePulse 4.4s ease-in-out infinite;
        }
        .sponsor-shimmer {
          position: relative;
          overflow: hidden;
        }
        .sponsor-shimmer::after {
          content: "";
          position: absolute;
          top: -30%;
          left: -42%;
          width: 38%;
          height: 160%;
          transform: rotate(22deg);
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0),
            rgba(255, 255, 255, 0.32),
            rgba(255, 255, 255, 0)
          );
          animation: sponsorSweep 3.9s linear infinite;
          pointer-events: none;
        }
        .video-button {
          animation: videoGlow 2.8s ease-in-out infinite;
        }
        @keyframes tilePulse {
          0%, 100% { transform: translateY(0) rotate(-0.7deg); }
          50%       { transform: translateY(-3px) rotate(-0.7deg); }
        }
        @keyframes sponsorSweep {
          0%   { left: -45%; }
          100% { left: 125%; }
        }
        @keyframes videoGlow {
          0%, 100% { box-shadow: 0 0 0 rgba(255, 255, 255, 0.08); }
          50%       { box-shadow: 0 0 26px rgba(255, 255, 255, 0.22); }
        }
        @keyframes headlineFlicker {
          0%   { transform: translateX(-130%); opacity: 0; }
          14%  { opacity: 0.65; }
          35%  { opacity: 0.1; }
          100% { transform: translateX(140%); opacity: 0; }
        }
        @keyframes floatDrift {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-9px) rotate(10deg); }
        }
        @keyframes pollGrow {
          from { width: 0; }
        }
        @media (max-width: 900px) {
          .hover-glow,
          .tile-pulse,
          .sponsor-shimmer {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%) !important;
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}
