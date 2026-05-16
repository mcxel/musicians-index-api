import { articleSnippetRotationEngine } from "./ArticleSnippetRotationEngine";
import { magazineAdRotationEngine } from "./MagazineAdRotationEngine";
import { MAGAZINE_ISSUE_1 } from "./magazineIssueData";
import type { ArticleSnippet } from "./ArticleSnippetRotationEngine";
import type { AdSlot } from "./MagazineAdRotationEngine";

let _seeded = false;

export function seedMagazineRotationEngines(): void {
  if (_seeded) return;
  _seeded = true;

  // ── Seed article snippets from Issue 1 ────────────────────────────────────
  const snippets: ArticleSnippet[] = MAGAZINE_ISSUE_1.map((article, i) => ({
    articleId: article.slug,
    issueId: "issue-1",
    title: article.title,
    subtitle: article.subtitle,
    excerpt: article.blocks?.find((b: any) => b.type === "paragraph")?.text?.slice(0, 140) ?? article.subtitle ?? "",
    author: article.author,
    category: (article.category?.toLowerCase() ?? "music") as any,
    coverImageUrl: undefined,
    publishedAt: Date.now() - (10 - i) * 86_400_000,
    editorialScore: 70 + i * 3,
    clickCount: Math.floor(Math.random() * 200),
    impressionCount: 500 + Math.floor(Math.random() * 1000),
    tags: article.tags ?? [],
    href: `/magazine/article/${article.slug}`,
  }));

  articleSnippetRotationEngine.addSnippets(snippets);

  // ── Seed demo ad slots ────────────────────────────────────────────────────
  const today = new Date().toISOString().split("T")[0];
  const future = new Date(Date.now() + 30 * 86_400_000).toISOString().split("T")[0];

  const demoAds: { slot: AdSlot; sponsorName: string; alt: string }[] = [
    { slot: "sponsor-bar", sponsorName: "BeatForge Pro", alt: "BeatForge Pro — Professional Beat Production" },
    { slot: "sidebar", sponsorName: "Crown Studios", alt: "Crown Studios — Recording & Mixing" },
    { slot: "banner", sponsorName: "TMI Season Pass", alt: "Season Pass — All Access to TMI Shows" },
    { slot: "inline", sponsorName: "Wavetek Merch", alt: "Official Wavetek Merchandise" },
  ];

  for (const demo of demoAds) {
    magazineAdRotationEngine.addAd({
      sponsorId: `sponsor-${demo.sponsorName.toLowerCase().replace(/\s+/g, "-")}`,
      sponsorName: demo.sponsorName,
      slot: demo.slot,
      imageUrl: `/tmi-curated/sponsor-placeholder.jpg`,
      linkUrl: `/sponsors`,
      altText: demo.alt,
      maxImpressions: 10000,
      maxClicks: 500,
      status: "active",
      startDate: today,
      endDate: future,
      priority: 5,
      priceCentsPerImpression: 5,
    });
  }
}

export function getMagazineRotationSnippets(surface: "homepage" | "sidebar" = "sidebar", count = 3) {
  seedMagazineRotationEngines();
  return articleSnippetRotationEngine.getRotation(surface)?.snippets.slice(0, count) ?? [];
}

export function getMagazineAdSlots(issueId = "issue-1") {
  seedMagazineRotationEngines();
  return magazineAdRotationEngine.fillSlots(issueId);
}
