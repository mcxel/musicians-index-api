"use client";

/**
 * MagazineMultiArticleNewsPage — 2–4 independently readable news containers
 * on one magazine page. Real image when authorized; otherwise styled TEXT_ONLY
 * container (never fake photography / mag-* / placeholder-as-photo).
 */

import React, { useState } from "react";
import Link from "next/link";
import {
  resolveExternalArticleUrl,
  type PresentedNewsStory,
} from "@/lib/magazine/MagazineNewsStoryPresentation";
import MagazineExtendedHybridReel from "@/components/magazine/MagazineExtendedHybridReel";
import { resolveExtendedReelPlacement } from "@/lib/magazine/MagazineExtendedReelPlacementAuthority";
import SafeMagazineImage from "@/components/magazine/SafeMagazineImage";

type Props = {
  stories: PresentedNewsStory[];
  pageNumber: number;
  issueKey?: string;
};

function TextOnlySurface({ story }: { story: PresentedNewsStory }) {
  return (
    <div
      data-testid="news-story-text-only"
      data-visual-mode="TEXT_ONLY"
      style={{
        minHeight: 120,
        borderRadius: 8,
        padding: "14px 14px 12px",
        background:
          "linear-gradient(145deg, #1a0a2e 0%, #0a1628 45%, #061028 100%)",
        border: "2px solid rgba(0,229,255,0.35)",
        color: "#FFF8E7",
      }}
    >
      <div
        style={{
          fontSize: 8,
          fontWeight: 900,
          letterSpacing: "0.16em",
          color: "#00E5FF",
          marginBottom: 8,
        }}
      >
        NEWS BRIEF · NO AUTHORIZED IMAGE
      </div>
      <h3
        style={{
          margin: 0,
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 16,
          lineHeight: 1.25,
        }}
      >
        {story.headline}
      </h3>
    </div>
  );
}

function StoryCard({
  story,
  featured,
}: {
  story: PresentedNewsStory;
  featured: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const preview =
    story.body?.slice(0, featured ? 420 : 180) ??
    story.deck ??
    "";
  const canExpand = Boolean(story.body && story.body.length > (featured ? 420 : 180));

  return (
    <article
      data-testid={`magazine-news-story-${story.id}`}
      data-visual-mode={story.visualMode}
      data-editorial-review={story.editorialReviewRequired ? "1" : "0"}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: featured ? 12 : 10,
        background: "#faf6ef",
        color: "#1a1208",
        border: "2px solid #061028",
        boxShadow: featured ? "4px 5px 0 #00E5FF" : "3px 3px 0 #FF2DAA55",
        borderRadius: 6,
        minHeight: featured ? 220 : 160,
      }}
    >
      {story.visualMode === "IMAGE" && story.imageUrl ? (
        <div
          style={{
            position: "relative",
            width: "100%",
            height: featured ? 160 : 96,
            overflow: "hidden",
            border: "2px solid #061028",
            borderRadius: 4,
            background: "#061028",
          }}
        >
          <SafeMagazineImage
            src={story.imageUrl}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : (
        <TextOnlySurface story={story} />
      )}

      <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: "0.12em", opacity: 0.65 }}>
        {story.sourceName ?? "TMI MAGAZINE"}
        {story.publishedAt ? ` · ${story.publishedAt.slice(0, 10)}` : ""}
        {story.author ? ` · ${story.author}` : ""}
      </div>

      {story.visualMode === "IMAGE" ? (
        <h3
          style={{
            margin: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: featured ? 20 : 15,
            lineHeight: 1.2,
          }}
        >
          {story.headline}
        </h3>
      ) : null}

      <p
        style={{
          margin: 0,
          fontSize: featured ? 13 : 12,
          lineHeight: 1.5,
          opacity: 0.88,
          whiteSpace: "pre-wrap",
        }}
      >
        {expanded ? story.body : preview}
        {!expanded && canExpand ? "…" : ""}
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto" }}>
        {canExpand ? (
          <button
            type="button"
            data-testid={`news-expand-${story.id}`}
            onClick={() => setExpanded((v) => !v)}
            style={{
              fontSize: 9,
              fontWeight: 900,
              letterSpacing: "0.1em",
              border: "2px solid #061028",
              background: "#FFE566",
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            {expanded ? "COLLAPSE" : "READ MORE ON PAGE"}
          </button>
        ) : null}
        {(() => {
          const externalUrl = resolveExternalArticleUrl(story);
          const ctaStyle = {
            fontSize: 9,
            fontWeight: 900,
            letterSpacing: "0.1em",
            color: "#050510",
            background: "#00E5FF",
            padding: "6px 10px",
            textDecoration: "none",
            border: "2px solid #061028",
          } as const;
          if (externalUrl) {
            return (
              <a
                href={externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`news-source-link-${story.id}`}
                data-external-source="1"
                aria-label="Read full article on original source (opens in new tab)"
                style={ctaStyle}
              >
                READ FULL ARTICLE — ORIGINAL SOURCE ↗
              </a>
            );
          }
          return (
            <Link
              href={story.href}
              data-testid={`news-source-link-${story.id}`}
              data-external-source="0"
              style={ctaStyle}
            >
              OPEN STORY →
            </Link>
          );
        })()}
      </div>
    </article>
  );
}

export default function MagazineMultiArticleNewsPage({
  stories,
  pageNumber,
  issueKey = "current",
}: Props) {
  const featured = stories[0];
  const rest = stories.slice(1);
  const reel = resolveExtendedReelPlacement({
    issueKey,
    pageNumber,
    articleSlug: featured?.id ?? `news-page-${pageNumber}`,
    performerSlug: null,
  });

  const gridCols =
    stories.length === 1
      ? "1fr"
      : stories.length === 2
        ? "1fr 1fr"
        : "minmax(0, 1.35fr) minmax(0, 1fr)";

  return (
    <section
      data-testid="magazine-multi-article-news-page"
      data-story-count={stories.length}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: "10px 4px 8px",
        width: "100%",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          borderBottom: "2px solid #061028",
          paddingBottom: 6,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: "0.2em",
            color: "#00E5FF",
          }}
        >
          THE MUSICIAN&apos;S INDEX · NEWS · PAGE {pageNumber}
        </span>
        <span style={{ fontSize: 9, fontWeight: 800, opacity: 0.7 }}>
          {stories.length} STORIES
        </span>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: 12,
          alignItems: "stretch",
        }}
      >
        {featured ? <StoryCard story={featured} featured /> : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rest.map((s) => (
            <StoryCard key={s.id} story={s} featured={false} />
          ))}
        </div>
      </div>

      <MagazineExtendedHybridReel placement={reel} accent="#00E5FF" />
    </section>
  );
}
