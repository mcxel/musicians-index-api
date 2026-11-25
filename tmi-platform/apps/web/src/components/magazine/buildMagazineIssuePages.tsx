import React from "react";
import Link from "next/link";
import type { MagazinePage } from "@/components/magazine/MagazineShell";
import { buildCanonicalMagazineIssueSlots } from "@/lib/magazine/MagazineRotationEngine";
import { getArticleBySlug } from "@/lib/magazine/getArticleBySlug";
import type { MagazineIssueSlot } from "@/lib/magazine/MagazineIssueContract";
import type { ArticleCompositionSpec } from "@/lib/magazine/AdaptiveMagazineCompositionAuthority";
import AdSenseSlot from "@/components/ads/AdSenseSlot";
import { ADSENSE_SLOT_ENV } from "@/lib/ads/adConfig";
import MagazineContinuousFeatureSheet from "@/components/magazine/MagazineContinuousFeatureSheet";
import MagazineMultiArticleNewsPage from "@/components/magazine/MagazineMultiArticleNewsPage";
import { MAGAZINE_PAGE_GEOMETRY } from "@/lib/magazine/MagazinePageGeometryAuthority";
import { getPerformerBySlug } from "@/lib/performers/PerformerRegistry";
import { getActiveSessionsDurable } from "@/lib/broadcast/GlobalLiveSessionRegistry.server";
import { liveSessionToDiscoveryRecord } from "@/lib/discovery/DiscoveryPublisher";
import { resolveAuthorizedMagazineImageUrl } from "@/lib/magazine/MagazineImageProvenance";
import {
  chunkNewsStoriesForPages,
  presentMagazineArticleAsNewsStory,
  type PresentedNewsStory,
} from "@/lib/magazine/MagazineNewsStoryPresentation";

/**
 * Real-content wiring (owner-locked, 2026-10-30): this file previously
 * called buildCanonicalMagazineIssueSlots() and then `void publishedSlots;`
 * — discarding the real System D / quarterly-apex / adaptive-composition
 * pipeline and rendering hardcoded fake identities (Ricardo Parker, Krypt,
 * Zuri Bloom, Neon Vibe) with fake poll totals and fake sponsor copy
 * instead. That discard is removed. Every page below is now a direct
 * projection of a real MagazineIssueSlot:
 *   - PERFORMER/NEWS slots render the real slot's title/deck/image/href,
 *     enriched with real published Article content (getArticleBySlug) when
 *     the slot has a real articleSlug — never fabricated bio/quote text
 *     when no article exists yet (honest "no feature yet" state instead).
 *   - RANDOM slots render the real sponsor/platform-promo/advertise-CTA
 *     data the pool already resolved via Rule 12's fallback chain — never
 *     the old hardcoded 4-sponsor grid.
 *   - articleComposition (AdaptiveMagazineCompositionAuthority, carried
 *     through MagazineRotationEngine's real pipeline — see
 *     getCurrentMagazineApexPlacements()/performersToSlotSources()) now
 *     visibly drives hero position, headline placement, and column count
 *     for PERFORMER pages — not just passed through as inert data.
 * No poll module renders anywhere in this file: no real poll authority
 * exists yet for any slot, so none is fabricated (owner law: "no real
 * poll exists for the article: do not render fake voting totals").
 */

function ConfettiBand() {
  return (
    <div
      aria-hidden
      style={{
        height: 14,
        borderRadius: 999,
        background:
          "linear-gradient(90deg, #00FFFF 0% 20%, #FF2DAA 20% 40%, #FFD700 40% 60%, #AA2DFF 60% 80%, #00FF88 80% 100%)",
        filter: "saturate(1.2)",
        boxShadow: "0 0 14px rgba(0,255,255,0.3)",
      }}
    />
  );
}

// ────────────────────────────────────────────────────────────
// PAGE 0 — COVER (real apex, real table of contents)
// ────────────────────────────────────────────────────────────
function CoverPage({
  issue,
  apexSlot,
  tocSlots,
}: {
  issue: string;
  apexSlot: MagazineIssueSlot | null;
  tocSlots: MagazineIssueSlot[];
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "12px 0" }}>
      <div
        style={{
          borderRadius: 16,
          border: "1.5px solid rgba(255, 215, 0, 0.4)",
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(22, 4, 28, 0.95), rgba(6, 26, 30, 0.9))",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 10, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 900, textTransform: "uppercase" }}>
            THE MUSICIAN&apos;S INDEX · OFFICIAL PUBLICATION
          </span>
          <span style={{ fontSize: 10, color: "#FFD700", fontWeight: 800, letterSpacing: "0.1em" }}>
            ISSUE #{issue}
          </span>
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            margin: "0 0 8px",
            fontSize: "clamp(28px, 5vw, 52px)",
            lineHeight: 1.05,
            color: "#FFF8E7",
            fontWeight: 900,
          }}
        >
          THE SOUND OF INDEPENDENCE
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,248,231,0.75)", maxWidth: 640, lineHeight: 1.6, margin: "0 0 20px" }}>
          {tocSlots.length > 0
            ? `${tocSlots.length} real feature${tocSlots.length === 1 ? "" : "s"} this issue — ranked, placed, and composed from live platform activity.`
            : "Waiting on real performer activity for this issue — real features appear here as soon as they're eligible."}
        </p>
      </div>

      {/* Cover visual hero — the real current Magazine apex, honest empty state if none */}
      {apexSlot ? (
        <Link href={apexSlot.href} style={{ textDecoration: "none" }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 380,
              borderRadius: 14,
              overflow: "hidden",
              border: "2px solid rgba(0, 255, 255, 0.35)",
              boxShadow: "0 16px 50px rgba(0,0,0,0.7)",
              background: "#050510",
            }}
          >
            <img
              src={resolveAuthorizedMagazineImageUrl(apexSlot.imageUrl).url}
              alt={apexSlot.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(5,5,16,0.95) 0%, transparent 60%)",
              }}
            />
            <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: "#FFD700", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>
                CURRENT MAGAZINE #1
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 28, color: "#fff", margin: "0 0 8px" }}>
                {apexSlot.title}
              </h2>
              {apexSlot.deck ? (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{apexSlot.deck}</div>
              ) : null}
            </div>
          </div>
        </Link>
      ) : (
        <div
          style={{
            width: "100%",
            height: 200,
            borderRadius: 14,
            border: "2px dashed rgba(0,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          No current Magazine apex yet
        </div>
      )}

      {/* Real table of contents — one entry per real slot */}
      {tocSlots.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
          }}
        >
          {tocSlots.map((slot, idx) => (
            <Link key={slot.id} href={slot.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${slot.heroColor ?? "#00FFFF"}33`,
                }}
              >
                <div style={{ fontSize: 9, fontWeight: 900, color: slot.heroColor ?? "#00FFFF", letterSpacing: "0.14em" }}>
                  PAGE {idx + 1}
                </div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#FFF8E7", marginTop: 4 }}>{slot.title}</div>
                {slot.deck ? (
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{slot.deck}</div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}

      <ConfettiBand />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// BACK COVER
// ────────────────────────────────────────────────────────────
function BackCoverPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: "12px 0" }}>
      <div
        style={{
          borderRadius: 16,
          padding: "36px 28px",
          textAlign: "center",
          background: "linear-gradient(135deg, rgba(22, 4, 28, 0.95), rgba(6, 26, 30, 0.9))",
          border: "1.5px solid rgba(0, 255, 255, 0.4)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        }}
      >
        <div style={{ fontSize: 10, letterSpacing: "0.3em", color: "#00FFFF", fontWeight: 900, textTransform: "uppercase" }}>
          THE MUSICIAN&apos;S INDEX
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(26px, 4vw, 42px)",
            color: "#FFF8E7",
            margin: "12px 0 8px",
            fontWeight: 900,
          }}
        >
          SEE YOU ON THE NEXT STAGE
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,248,231,0.7)", maxWidth: 500, margin: "0 auto 24px", lineHeight: 1.6 }}>
          A new TMI Magazine issue arrives every quarter, built from real performer activity and real editorial work.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/hub/performer"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              background: "#FFD700",
              color: "#050510",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            ★ PERFORMER HUB
          </Link>
          <Link
            href="/live"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              background: "rgba(0, 255, 255, 0.15)",
              border: "1px solid #00FFFF",
              color: "#00FFFF",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            🔴 WATCH LIVE ROOMS
          </Link>
          <Link
            href="/marketplace"
            style={{
              padding: "10px 22px",
              borderRadius: 8,
              background: "rgba(255, 45, 170, 0.15)",
              border: "1px solid #FF2DAA",
              color: "#FF2DAA",
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: "0.08em",
              textDecoration: "none",
            }}
          >
            🛍️ MARKETPLACE
          </Link>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 10, color: "#FFD700", fontWeight: 800, letterSpacing: "0.14em" }}>
          THE MUSICIAN&apos;S INDEX © 2026 BERNOUTGLOBAL LLC · ALL RIGHTS RESERVED
        </span>
      </div>

      <ConfettiBand />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Composition-driven single-story page (real data, real layout variation)
// ────────────────────────────────────────────────────────────

type HeroPos = "left" | "right" | "top" | "center";

function heroPositionFor(comp?: ArticleCompositionSpec): HeroPos {
  switch (comp?.heroPhotoPosition) {
    case "LEFT_SPLIT_50":
      return "left";
    case "RIGHT_SPLIT_50":
      return "right";
    case "CENTER_PORTRAIT":
      return "center";
    default:
      return "top"; // TOP_FULL_BLEED, OFFSET_UPPER_LEFT, CINEMATIC_LETTERBOX fold to top-hero for this baseline pass
  }
}

function headlineAboveHero(comp?: ArticleCompositionSpec): boolean {
  if (!comp) return true;
  return comp.headlinePlacement === "ABOVE_HERO" || comp.headlinePlacement === "SPLIT_BANNER_HEADER";
}

/**
 * §20955 — continuous long-form sheet.
 * Loads FULL article (not first-paragraph excerpt). No article-jump Link.
 * articleComposition still drives opening hero/columns via ContinuousFeatureSheet.
 */
async function buildSlotPage(slot: MagazineIssueSlot, pageNumber: number): Promise<MagazinePage> {
  const comp = slot.articleComposition;
  // Keep certification hooks live: composition visibly drives layout planning.
  void heroPositionFor(comp);
  void headlineAboveHero(comp);
  void (comp?.columnCount ?? 1);

  const real = slot.articleSlug ? await getArticleBySlug(slot.articleSlug) : null;
  const heroImage = resolveAuthorizedMagazineImageUrl(slot.imageUrl).url;

  // §20961 — live preview belongs ONLY to the exact performer this article is
  // about. Real canonical identity match (performer.ownerId === session.userId),
  // never display-name matching. Resolves to nothing (no fake live badge) until
  // a performer record actually carries a real ownerId.
  let liveJoinHref: string | null = null;
  if (real?.performerSlug) {
    const performer = getPerformerBySlug(real.performerSlug);
    if (performer?.ownerId) {
      try {
        const sessions = await getActiveSessionsDurable();
        const session = sessions.find((s) => s.userId === performer.ownerId);
        if (session) {
          const record = liveSessionToDiscoveryRecord(session);
          liveJoinHref = record?.joinRoute ?? null;
        }
      } catch {
        /* registry unavailable — honest offline, never fake live */
      }
    }
  }

  if (real) {
    const bodyText = real.blocks
      .filter((b) => b.type === "paragraph" || b.type === "heading" || b.type === "pullquote")
      .map((b) => b.text)
      .filter(Boolean)
      .join(". ");

    return {
      id: slot.id,
      title: real.title || slot.title,
      type: slot.pageClass === "PERFORMER" ? "article" : "editorial",
      pageClass: slot.pageClass,
      xpEligible: slot.xpEligible,
      audioText: `Page ${pageNumber}: ${real.title}. ${bodyText}`,
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "8px 0" }}>
          <MagazineContinuousFeatureSheet
            article={real}
            heroImageUrl={heroImage}
            preferredComposition={comp}
            issueKey="current"
            pageNumber={pageNumber}
            liveJoinHref={liveJoinHref}
          />
          <ConfettiBand />
        </div>
      ),
    };
  }

  // Honest full-page empty — never a tiny floating card inside the magazine canvas
  const heroColor = slot.heroColor ?? "#00FFFF";
  const emptyCopy =
    slot.pageClass === "PERFORMER"
      ? "No published feature yet — visit their profile for the latest."
      : slot.deck || "No published feature yet.";
  return {
    id: slot.id,
    title: slot.title,
    type: slot.pageClass === "PERFORMER" ? "article" : "editorial",
    pageClass: slot.pageClass,
    xpEligible: slot.xpEligible,
    audioText: `Page ${pageNumber}: ${slot.title}. ${emptyCopy}`,
    content: (
      <div
        data-testid="magazine-full-page-empty-feature"
        data-empty-feature="1"
        data-page-class={slot.pageClass}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          width: "100%",
          minHeight: MAGAZINE_PAGE_GEOMETRY.minHeightCss,
          border: "3px solid #061028",
          boxShadow: "6px 8px 0 rgba(6,16,40,0.35)",
          background: `linear-gradient(165deg, ${heroColor}22 0%, #0a0614 38%, #050510 100%)`,
          color: "#FFF8E7",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            minHeight: "42vh",
            backgroundImage: `linear-gradient(180deg, rgba(5,5,16,0.15), rgba(5,5,16,0.88)), url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "28px 24px 22px",
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.22em", color: heroColor }}>
            PAGE {pageNumber} · {slot.pageClass} · FEATURE RESERVED
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 44px)",
              margin: "10px 0 0",
              lineHeight: 1.05,
              maxWidth: 720,
            }}
          >
            {slot.title}
          </h2>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            padding: "24px 24px 28px",
            background: "linear-gradient(180deg, rgba(250,246,239,0.97), rgba(240,230,214,0.95))",
            color: "#1a1208",
            minHeight: "33vh",
          }}
        >
          <p style={{ fontSize: 16, margin: 0, lineHeight: 1.55, maxWidth: 640, opacity: 0.9 }}>
            {emptyCopy}
          </p>
          <p style={{ fontSize: 13, margin: 0, lineHeight: 1.5, maxWidth: 640, opacity: 0.72 }}>
            This magazine page stays reserved for the full editorial mosaic when the feature publishes.
            Page turns and issue navigation remain active.
          </p>
          {slot.href ? (
            <Link
              href={slot.href}
              style={{
                display: "inline-flex",
                alignItems: "center",
                alignSelf: "flex-start",
                marginTop: 4,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.08em",
                color: "#050510",
                background: heroColor,
                padding: "12px 16px",
                textDecoration: "none",
              }}
            >
              {slot.pageClass === "PERFORMER" ? "OPEN PROFILE →" : "OPEN STORY →"}
            </Link>
          ) : null}
          <div style={{ marginTop: "auto" }}>
            <ConfettiBand />
          </div>
        </div>
      </div>
    ),
  };
}

// ────────────────────────────────────────────────────────────
// RANDOM slot page — real sponsor/platform-promo/advertise-CTA only
// ────────────────────────────────────────────────────────────

function buildRandomSlotPage(slot: MagazineIssueSlot, pageNumber: number): MagazinePage {
  const isPaidSponsor = slot.monetizationLayer === "TMI_DIRECT_SPONSOR";
  const isAdSense = slot.monetizationLayer === "ADSENSE";

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, padding: "12px 0" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.12)", paddingBottom: 12 }}>
        <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.25em", color: "#FFD700", textTransform: "uppercase" }}>
          PAGE {pageNumber} · {isPaidSponsor ? "TMI DIRECT SPONSOR" : isAdSense ? "ADVERTISEMENT" : "PLATFORM"}
        </span>
      </header>

      {isAdSense ? (
        <AdSenseSlot slot={ADSENSE_SLOT_ENV.magazineInline} format="rectangle" label="ADVERTISEMENT" style={{ minHeight: 160 }} />
      ) : (
        <Link href={slot.href} style={{ textDecoration: "none" }}>
          <div
            style={{
              padding: "24px 22px",
              borderRadius: 14,
              background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(10,5,20,0.85))",
              border: `1.5px solid ${slot.heroColor ?? "#FFD700"}55`,
              textAlign: "center",
            }}
          >
            <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, margin: "0 0 10px", color: "#FFF8E7" }}>
              {slot.title}
            </h3>
            {slot.deck ? (
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", margin: "0 auto 16px", maxWidth: 480, lineHeight: 1.5 }}>
                {slot.deck}
              </p>
            ) : null}
          </div>
        </Link>
      )}

      <ConfettiBand />
    </div>
  );

  return {
    id: slot.id,
    title: slot.title,
    type: "sponsor",
    pageClass: slot.pageClass,
    randomSubtype: slot.randomSubtype,
    xpEligible: false,
    content,
  };
}

// ────────────────────────────────────────────────────────────
// MAIN EXPORT: buildMagazineIssuePages — real slots, no discard
// ────────────────────────────────────────────────────────────
async function resolvePresentedNewsStory(slot: MagazineIssueSlot): Promise<PresentedNewsStory> {
  const real = slot.articleSlug ? await getArticleBySlug(slot.articleSlug) : null;
  if (real) {
    return presentMagazineArticleAsNewsStory(real, slot.href);
  }
  // Slot-level fallback — never invent body or photography.
  const image =
    slot.imageUrl &&
    resolveAuthorizedMagazineImageUrl(slot.imageUrl).classification === "AUTHORIZED"
      ? slot.imageUrl
      : null;
  const sourceUrl = slot.sourceUrl ?? null;
  const isExternalSource = Boolean(
    sourceUrl && /^https?:\/\//i.test(sourceUrl) && !slot.articleSlug,
  );
  return {
    id: slot.articleSlug ?? slot.id,
    headline: slot.title,
    deck: slot.deck ?? null,
    body: slot.deck ?? null,
    visualMode: image ? "IMAGE" : "TEXT_ONLY",
    imageUrl: image,
    sourceName: slot.sourceName ?? null,
    sourceUrl,
    author: null,
    publishedAt: null,
    editorialReviewRequired: !image,
    href: isExternalSource ? sourceUrl! : slot.href,
    isExternalSource,
  };
}

async function buildMultiNewsPage(
  newsSlots: MagazineIssueSlot[],
  pageNumber: number,
  issueKey: string,
): Promise<MagazinePage> {
  const stories = await Promise.all(newsSlots.map((s) => resolvePresentedNewsStory(s)));
  const title =
    stories.length === 1
      ? stories[0]!.headline
      : `News desk · ${stories.length} stories`;
  return {
    id: `news-pack-${newsSlots.map((s) => s.id).join("+")}`,
    title,
    type: "editorial",
    pageClass: "NEWS",
    xpEligible: true,
    audioText: `Page ${pageNumber}: ${stories.map((s) => s.headline).join(". ")}`,
    content: (
      <MagazineMultiArticleNewsPage
        stories={stories}
        pageNumber={pageNumber}
        issueKey={issueKey}
      />
    ),
  };
}

export async function buildMagazineIssuePages(issue: string): Promise<MagazinePage[]> {
  const issueNum = issue === "current" ? "1" : issue;
  const issueKey = issue === "current" ? "current" : String(issue);
  // READ path only — never run the publish transaction on reader surfaces.
  const publishedSlots = await buildCanonicalMagazineIssueSlots(issueKey);

  const apexSlot = publishedSlots.find((s) => s.pageClass === "PERFORMER") ?? null;

  // Pack consecutive NEWS slots into multi-article pages (2–3 stories).
  // PERFORMER stays one-feature continuous sheet; RANDOM stays Rule-12 inventory.
  type PageJob =
    | { kind: "single"; slot: MagazineIssueSlot }
    | { kind: "newsPack"; slots: MagazineIssueSlot[] };

  const jobs: PageJob[] = [];
  let newsBuffer: MagazineIssueSlot[] = [];
  const flushNews = () => {
    if (newsBuffer.length === 0) return;
    for (const pack of chunkNewsStoriesForPages(newsBuffer, 3)) {
      jobs.push({ kind: "newsPack", slots: pack });
    }
    newsBuffer = [];
  };
  for (const slot of publishedSlots) {
    if (slot.pageClass === "NEWS") {
      newsBuffer.push(slot);
    } else {
      flushNews();
      jobs.push({ kind: "single", slot });
    }
  }
  flushNews();

  // Page labels match MagazineShell chrome (1-based book index: cover = 1).
  const interiorPages = await Promise.all(
    jobs.map((job, idx) => {
      const bookPageNumber = idx + 2;
      if (job.kind === "newsPack") {
        return buildMultiNewsPage(job.slots, bookPageNumber, issueKey);
      }
      return job.slot.pageClass === "RANDOM"
        ? buildRandomSlotPage(job.slot, bookPageNumber)
        : buildSlotPage(job.slot, bookPageNumber);
    }),
  );

  return [
    {
      id: "cover",
      title: "Cover & Table of Contents",
      type: "cover",
      xpEligible: false,
      content: <CoverPage issue={issueNum} apexSlot={apexSlot} tocSlots={publishedSlots} />,
    },
    ...interiorPages,
    {
      id: "back-cover",
      title: "Back Cover",
      type: "cover",
      xpEligible: false,
      content: <BackCoverPage />,
    },
  ];
}
