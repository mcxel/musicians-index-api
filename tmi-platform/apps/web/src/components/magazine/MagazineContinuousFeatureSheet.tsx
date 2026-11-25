"use client";

/**
 * MagazineContinuousFeatureSheet — §20955 continuous long-form editorial sheet.
 * Full writer body + distributed images + bio + conversation region inline.
 * NO article jump. Height = content. Tall canvas mixes art languages (§20976–77).
 */

import React from "react";
import Link from "next/link";
import type { MagazineArticle } from "@/lib/magazine/magazineIssueData";
import type { ArticleCompositionSpec } from "@/lib/magazine/AdaptiveMagazineCompositionAuthority";
import {
  planContinuousLongFormComposition,
  type EditorialMovement,
  type DistributedImage,
} from "@/lib/magazine/MagazineContinuousLongFormCompositionPolicy";
import { ARCHETYPES } from "@/lib/magazine/MagazineDesignEngine";
import { resolveSheetPalette } from "@/lib/magazine/MagazineFullCrayonBoxColorPolicy";
import MagazineMemphisMotifLayer, {
  resolveMemphisVariant,
} from "@/components/magazine/MagazineMemphisMotifLayer";
import CommunityWallBoard from "@/components/communityWall/CommunityWallBoard";
import MagazineExtendedHybridReel from "@/components/magazine/MagazineExtendedHybridReel";
import SafeMagazineImage from "@/components/magazine/SafeMagazineImage";
import { resolveExtendedReelPlacement } from "@/lib/magazine/MagazineExtendedReelPlacementAuthority";
import { useContentTranslationView } from "@/lib/translation/useContentTranslationView";
import { LANGUAGE_NAMES, type SupportedLanguage } from "@/lib/translation/TmiTranslationAuthority";

/**
 * §20981 — ONE canonical article, per-reader language VIEW via the existing
 * TmiTranslationAuthority (reused, not duplicated — see useContentTranslationView).
 * Never forks the article: translation is a display-only overlay on the same
 * contentId. Falls back to the original text on LOADING/FAILED/no-selection.
 */
function TranslatableText({
  contentId,
  text,
  targetLanguage,
  as: Tag = "span",
  style,
}: {
  contentId: string;
  text: string;
  targetLanguage: SupportedLanguage | null;
  as?: "span" | "p" | "h2" | "h3" | "blockquote";
  style?: React.CSSProperties;
}) {
  const view = useContentTranslationView({
    contentId,
    originalText: text,
    surface: "MAGAZINE_ARTICLE",
    targetLanguage: targetLanguage ?? undefined,
  });
  const translateRef = React.useRef(view.translate);
  translateRef.current = view.translate;
  React.useEffect(() => {
    if (targetLanguage) void translateRef.current();
  }, [targetLanguage, contentId]);
  const dir = targetLanguage ? view.textDirection : "ltr";
  return React.createElement(Tag, { style, dir }, targetLanguage ? view.displayText : text);
}

const FIELD_BG: Record<EditorialMovement["colorField"], string> = {
  sunshine: "linear-gradient(155deg, #FFE566 0%, #FFD100 50%, #FF8A00 100%)",
  cream: "linear-gradient(160deg, #faf6ef 0%, #f0e6d6 100%)",
  cyan: "linear-gradient(155deg, #B8F7FF 0%, #00E5FF 55%, #5B7CFF 100%)",
  magenta: "linear-gradient(155deg, #FFD6EC 0%, #FF6B9D 50%, #AA2DFF 100%)",
  white: "linear-gradient(160deg, #ffffff 0%, #f4f6f8 100%)",
  jewel: "linear-gradient(155deg, #FFE0F5 0%, #E9D5FF 40%, #C084FC 100%)",
  quiet: "linear-gradient(160deg, #fffef8 0%, #f5efe4 100%)",
};

const FIELD_INK: Record<EditorialMovement["colorField"], string> = {
  sunshine: "#1a0a00",
  cream: "#1a1208",
  cyan: "#061028",
  magenta: "#2a0430",
  white: "#0f172a",
  jewel: "#2a0648",
  quiet: "#1a1208",
};

function PhotoFrame({
  image,
  accent,
}: {
  image: DistributedImage;
  accent: string;
}) {
  const h =
    image.scale === "HERO" ? 320 : image.scale === "LARGE" ? 240 : image.scale === "MEDIUM" ? 180 : 120;
  const rotate =
    image.role === "DIAGONAL_SUPPORT" || image.role === "COLLAGE_B"
      ? "rotate(-2.4deg)"
      : image.role === "COLLAGE_A"
        ? "rotate(1.8deg)"
        : "none";
  const clip =
    image.role === "DIAGONAL_SUPPORT"
      ? "polygon(8% 0, 100% 0, 92% 100%, 0 100%)"
      : undefined;

  return (
    <figure
      style={{
        margin: 0,
        transform: rotate,
        width: "100%",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: h,
          overflow: "hidden",
          border: `3px solid #061028`,
          boxShadow: `4px 5px 0 ${accent}`,
          clipPath: clip,
          background: "#061028",
        }}
      >
        <SafeMagazineImage
          src={image.url}
          alt={image.caption || "Editorial photography"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {image.caption ? (
        <figcaption
          style={{
            marginTop: 6,
            fontSize: 10,
            fontStyle: "italic",
            opacity: 0.75,
          }}
        >
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function MovementBlock({
  movement,
  article,
  accent,
  targetLanguage,
  issueKey,
  pageNumber,
}: {
  movement: EditorialMovement;
  article: MagazineArticle;
  accent: string;
  targetLanguage: SupportedLanguage | null;
  issueKey: string;
  pageNumber?: number;
}) {
  const ink = FIELD_INK[movement.colorField];
  const bg = FIELD_BG[movement.colorField];
  const showMemphis =
    movement.artLanguage === "MEMPHIS_POP" ||
    movement.artLanguage === "GIANT_HERO" ||
    movement.kind === "VISUAL_INTERRUPTION";

  if (movement.kind === "CONVERSATION") {
    const reel = resolveExtendedReelPlacement({
      issueKey,
      pageNumber,
      articleSlug: article.slug,
      performerSlug: article.performerSlug,
    });
    return (
      <section
        data-movement={movement.kind}
        data-art={movement.artLanguage}
        data-global-community="0"
        data-extended-reel-mode={reel.mode}
        data-extended-reel-position={reel.positionId}
        style={{
          position: "relative",
          padding: "20px 16px",
          background: bg,
          color: ink,
          borderTop: "3px solid #061028",
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.18em", marginBottom: 8 }}>
          ARTICLE CONVERSATION · {article.slug}
        </div>
        <p style={{ fontSize: 11, margin: "0 0 10px", opacity: 0.75, lineHeight: 1.45 }}>
          Article-scoped thread only — does not auto-publish to Community Gossip or Happy Days.
        </p>
        <CommunityWallBoard
          channel="COMMUNITY_GOSSIP"
          togetherMode={false}
          composerEnabled={false}
          notes={[]}
          onNotesChange={() => {}}
          data-testid={`article-conversation-${article.slug}`}
          viewerLanguage={targetLanguage ?? undefined}
        />
        {/*
          Owner 2026-11-12: extended footer is hybrid AdSense + TMI inventory.
          Gossip / Happy Days appear only on occasional deterministic pages —
          never both glued to every article footer.
        */}
        <MagazineExtendedHybridReel placement={reel} accent={accent} />
      </section>
    );
  }

  if (movement.kind === "BIO_CONTEXT") {
    return (
      <section
        data-movement={movement.kind}
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: movement.images.length ? "minmax(140px, 32%) 1fr" : "1fr",
          gap: 16,
          padding: "22px 18px",
          background: bg,
          color: ink,
          borderTop: "2px dashed rgba(6,16,40,0.25)",
        }}
      >
        {movement.images[0] ? <PhotoFrame image={movement.images[0]} accent={accent} /> : null}
        <div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.16em", color: accent }}>
            {article.performerSlug ? "PERFORMER CONTEXT" : "EDITORIAL CONTEXT"}
          </div>
          <h3 style={{ margin: "6px 0 8px", fontSize: 18, fontFamily: "'Impact', 'Arial Black', sans-serif" }}>
            {article.performerSlug?.replace(/-/g, " ").toUpperCase() || article.author}
          </h3>
          {article.groupMembers?.length ? (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.55 }}>
              {article.groupMembers.map((m) => (
                <li key={m.name}>
                  <strong>{m.name}</strong> — {m.role}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6 }}>
              {article.subtitle}
            </p>
          )}
          {article.performerSlug ? (
            <Link
              href={`/performers/${article.performerSlug}`}
              style={{
                display: "inline-block",
                marginTop: 12,
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.12em",
                color: "#050510",
                background: accent,
                padding: "8px 12px",
                textDecoration: "none",
                border: "2px solid #061028",
              }}
            >
              OPEN PROFILE →
            </Link>
          ) : null}
        </div>
      </section>
    );
  }

  if (movement.kind === "PULL_QUOTE") {
    const q = movement.blocks[0]?.text ?? "";
    return (
      <section
        data-movement={movement.kind}
        style={{
          position: "relative",
          padding: "28px 22px",
          background: bg,
          color: ink,
          overflow: "hidden",
        }}
      >
        {showMemphis ? <MagazineMemphisMotifLayer variant="gossip" opacity={0.35} /> : null}
        <TranslatableText
          contentId={movement.id}
          text={q}
          targetLanguage={targetLanguage}
          as="blockquote"
          style={{
            position: "relative",
            zIndex: 2,
            margin: 0,
            fontSize: "clamp(18px, 3vw, 28px)",
            fontWeight: 900,
            lineHeight: 1.25,
            fontFamily: "'Georgia', serif",
            fontStyle: "italic",
          }}
        />
      </section>
    );
  }

  if (movement.kind === "OPENING_HERO" || movement.kind === "VISUAL_INTERRUPTION") {
    const img = movement.images[0];
    return (
      <section
        data-movement={movement.kind}
        data-art={movement.artLanguage}
        style={{
          position: "relative",
          padding: movement.kind === "OPENING_HERO" ? "18px 16px 22px" : "14px 16px",
          background: bg,
          color: ink,
          overflow: "hidden",
        }}
      >
        {showMemphis ? (
          <MagazineMemphisMotifLayer
            variant={resolveMemphisVariant(movement.colorField === "sunshine" ? "sunshine" : "electric")}
            opacity={0.4}
          />
        ) : null}
        <div style={{ position: "relative", zIndex: 2 }}>
          {movement.kind === "OPENING_HERO" ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                {article.category} · {movement.artLanguage.replace(/_/g, " ")}
              </div>
              <TranslatableText
                contentId={`${article.slug}-title`}
                text={article.title}
                targetLanguage={targetLanguage}
                as="h2"
                style={{
                  margin: "6px 0 4px",
                  fontSize: "clamp(22px, 4vw, 36px)",
                  fontFamily: "'Impact', 'Arial Black', sans-serif",
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                }}
              />
              <TranslatableText
                contentId={`${article.slug}-subtitle`}
                text={article.subtitle}
                targetLanguage={targetLanguage}
                as="p"
                style={{ margin: 0, fontSize: 13, opacity: 0.85 }}
              />
              <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>
                BY{" "}
                {article.isSystemSource ? (
                  // §20982 — a real SYSTEM_NEWSROOM submission. No writer page
                  // exists for an automated source; never construct a dead link.
                  <span>{article.author}</span>
                ) : (
                  <Link
                    href={`/magazine/writers/${article.writerSlug || article.author.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`}
                    style={{ color: "inherit", textDecoration: "underline" }}
                  >
                    {article.author}
                  </Link>
                )}{" "}
                · {article.publishedAt}
              </div>
            </div>
          ) : null}
          {img ? <PhotoFrame image={img} accent={accent} /> : null}
        </div>
      </section>
    );
  }

  if (movement.kind === "CLOSING") {
    return (
      <section
        data-movement={movement.kind}
        style={{
          position: "relative",
          padding: "16px 16px 20px",
          background: bg,
          color: ink,
          borderTop: "1px solid rgba(6,16,40,0.18)",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", marginBottom: 8, color: accent }}>
          SOURCES
        </div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, lineHeight: 1.7, opacity: 0.85 }}>
          {movement.blocks.map((b, i) => (
            <li key={i}>
              <a href={b.text} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
                {b.text}
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (movement.kind === "MEDIA_SPOT" && movement.media) {
    const { media } = movement;
    return (
      <section
        data-movement={movement.kind}
        data-media-kind={media.kind}
        data-media-has-video={media.videoUrl ? "1" : "0"}
        data-media-has-song={media.song ? "1" : "0"}
        style={{
          position: "relative",
          padding: "18px 16px",
          background: bg,
          color: ink,
          overflow: "hidden",
        }}
      >
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: "0.16em", marginBottom: 10, color: accent }}>
          {media.videoUrl ? (media.kind === "intro_video" ? "INTRO CLIP" : "MOTION POSTER") : "FEATURED TRACK"}
        </div>
        {media.videoUrl ? (
          <video
            src={media.videoUrl}
            poster={media.posterUrl}
            autoPlay
            loop
            muted
            playsInline
            style={{
              width: "100%",
              maxHeight: 420,
              objectFit: "cover",
              border: "3px solid #061028",
              boxShadow: `4px 5px 0 ${accent}`,
              background: "#061028",
            }}
          />
        ) : null}
        {media.song ? (
          <div style={{ marginTop: media.videoUrl ? 12 : 0 }}>
            <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6 }}>{media.song.title}</div>
            <audio
              src={media.song.audioUrl}
              controls
              style={{ width: "100%" }}
            />
          </div>
        ) : null}
      </section>
    );
  }

  if (movement.kind === "PHOTO_PAIR_COLLAGE" || movement.kind === "TRIANGULAR_CASCADE") {
    return (
      <section
        data-movement={movement.kind}
        style={{
          display: "grid",
          gridTemplateColumns: movement.images.length > 1 ? "1fr 1fr" : "1fr",
          gap: 12,
          padding: "16px",
          background: bg,
          color: ink,
        }}
      >
        {movement.images.map((img) => (
          <PhotoFrame key={img.url + img.role} image={img} accent={accent} />
        ))}
      </section>
    );
  }

  // STORY_COLUMNS / DEEP_COPY — text with optional side portrait
  const sideFirst =
    movement.artLanguage === "SPLIT_LEFT" || movement.images[0]?.role === "SIDE_PORTRAIT";
  return (
    <section
      data-movement={movement.kind}
      data-art={movement.artLanguage}
      style={{
        display: "grid",
        gridTemplateColumns: movement.images.length ? "minmax(140px, 38%) 1fr" : "1fr",
        gap: 16,
        padding: "20px 18px",
        background: bg,
        color: ink,
        direction: sideFirst ? "ltr" : "ltr",
      }}
    >
      {movement.images[0] && sideFirst ? <PhotoFrame image={movement.images[0]} accent={accent} /> : null}
      <div
        style={{
          columnCount: movement.kind === "DEEP_COPY" ? 2 : 1,
          columnGap: 18,
          fontSize: 13,
          lineHeight: 1.65,
        }}
      >
        {targetLanguage ? (
          // Translated as one flowing unit — heading/paragraph split is an
          // honest tradeoff of a real, working first translation pass (the
          // original-language reading experience below is unaffected).
          <TranslatableText
            contentId={movement.id}
            text={movement.blocks.map((b) => b.text).filter(Boolean).join("\n\n")}
            targetLanguage={targetLanguage}
            as="p"
            style={{ margin: 0, whiteSpace: "pre-line" }}
          />
        ) : (
          movement.blocks.map((b, i) =>
            b.type === "heading" ? (
              <h3
                key={i}
                style={{
                  columnSpan: "all",
                  fontSize: 16,
                  fontWeight: 900,
                  margin: "0 0 10px",
                  fontFamily: "'Impact', 'Arial Black', sans-serif",
                  textTransform: "uppercase",
                }}
              >
                {b.text}
              </h3>
            ) : (
              <p key={i} style={{ margin: "0 0 12px" }}>
                {b.text}
              </p>
            ),
          )
        )}
      </div>
      {movement.images[0] && !sideFirst ? <PhotoFrame image={movement.images[0]} accent={accent} /> : null}
    </section>
  );
}

export type MagazineContinuousFeatureSheetProps = {
  article: MagazineArticle;
  heroImageUrl?: string;
  preferredComposition?: ArticleCompositionSpec | null;
  spotlight?: boolean;
  issueKey?: string;
  pageNumber?: number;
  /**
   * §20961 — real join route when (and only when) this exact performer has
   * a real active live session (canonical identity match, resolved server-side
   * in buildMagazineIssuePages). Null/undefined → no badge at all, never an
   * empty "offline" rectangle.
   */
  liveJoinHref?: string | null;
  /**
   * §20984 — ONE canonical article composition authority consumed by both
   * presentation shells. "PAGE_SLOT" = issue-page flip-through framing
   * (bordered sheet + page header bar). "OVERLAY" = hosted inside
   * MagazineArticleFocusOverlay's own modal chrome — no duplicate border/
   * page-number bar, content reads full-bleed inside the overlay's scroll area.
   */
  variant?: "PAGE_SLOT" | "OVERLAY";
};

export default function MagazineContinuousFeatureSheet({
  article,
  heroImageUrl,
  preferredComposition,
  spotlight,
  issueKey = "current",
  pageNumber,
  liveJoinHref,
  variant = "PAGE_SLOT",
}: MagazineContinuousFeatureSheetProps) {
  // §20981 — reader-controlled language VIEW over this ONE canonical article.
  // Never forks content; null = ORIGINAL. Not tied to geolocation/country.
  const [targetLanguage, setTargetLanguage] = React.useState<SupportedLanguage | null>(null);
  const plan = planContinuousLongFormComposition({
    article,
    heroImageUrl,
    preferredComposition,
    spotlight,
    issueKey,
  });

  const storyKind =
    plan.section === "NEWS"
      ? "NEWS"
      : plan.section === "PERFORMER"
        ? "PERFORMER_FEATURE"
        : "EDITORIAL";
  const palette = resolveSheetPalette({
    storyKind: storyKind as "NEWS" | "PERFORMER_FEATURE" | "EDITORIAL",
  });
  const sheet = ARCHETYPES[palette.archetype];
  const accent = article.heroColor || sheet.accentColor;

  const isOverlay = variant === "OVERLAY";

  return (
    <article
      data-testid="magazine-continuous-feature-sheet"
      data-variant={variant}
      data-article-slug={article.slug}
      data-image-count={plan.imageCount}
      data-spotlight-hero={plan.spotlightHero ? "1" : "0"}
      data-article-jump="0"
      data-full-article-inline="1"
      data-content-driven-height="1"
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        border: isOverlay ? "none" : "3px solid #061028",
        boxShadow: isOverlay ? "none" : "6px 8px 0 rgba(6,16,40,0.35)",
        borderRadius: isOverlay ? 14 : 0,
        background: sheet.leftPageBg,
        color: sheet.inkColor,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          background: "#061028",
          color: "#FFE566",
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: "0.16em",
        }}
      >
        <span>
          {isOverlay ? "FULL ARTICLE" : pageNumber ? `PAGE ${pageNumber} · ` : ""}
          {isOverlay ? "" : `CONTINUOUS FEATURE · ${plan.imageCount} IMAGE${plan.imageCount === 1 ? "" : "S"}`}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {liveJoinHref ? (
            <Link
              href={liveJoinHref}
              data-testid="magazine-performer-live-join"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                color: "#FF2DAA",
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#FF2DAA",
                  boxShadow: "0 0 6px #FF2DAA",
                }}
              />
              LIVE NOW · JOIN LIVE
            </Link>
          ) : null}
          <span>{plan.openingComposition.label}</span>
        </span>
      </div>

      <div
        data-testid="magazine-language-selector"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          background: "rgba(6,16,40,0.06)",
          borderBottom: "1px solid rgba(6,16,40,0.12)",
          fontSize: 9,
          color: sheet.inkColor,
        }}
      >
        <span style={{ fontWeight: 900, letterSpacing: "0.1em", opacity: 0.6 }}>READ IN:</span>
        <select
          value={targetLanguage ?? "original"}
          onChange={(e) =>
            setTargetLanguage(e.target.value === "original" ? null : (e.target.value as SupportedLanguage))
          }
          style={{
            fontSize: 9,
            fontWeight: 800,
            padding: "3px 6px",
            borderRadius: 4,
            border: "1px solid rgba(6,16,40,0.25)",
            background: "#fff",
            color: "#061028",
          }}
        >
          <option value="original">Original</option>
          {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {plan.movements.map((m) => (
        <MovementBlock
          key={m.id}
          movement={m}
          article={article}
          accent={accent}
          targetLanguage={targetLanguage}
          issueKey={issueKey}
          pageNumber={pageNumber}
        />
      ))}
    </article>
  );
}
