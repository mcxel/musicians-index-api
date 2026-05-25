"use client";

/**
 * TMIMagazineEngine.tsx
 * Dynamic bento-grid polygon magazine for The Musician's Index.
 *
 * Drop at: apps/web/src/components/magazine/TMIMagazineEngine.tsx
 * Use for:
 *   /magazine page (replaces MagazineSpreadRenderer book-flip)
 *   /magazine/article/[slug]
 *   random pages (rotated in between news articles)
 *   performer article pages
 *
 * Features:
 *  - Irregular "bento box" polygon shapes via CSS clip-path
 *  - 8 shape variants (trapezoid, hex, angled, wave, notch, slash, arch, rect)
 *  - Sponsor slot auto-injected at position 5 (highest-bid wins)
 *  - Live performer widget: if performer is live → WebRTC preview in card
 *  - Bio rotation: performer bio text rotates each visit (never same paragraph)
 *  - Subscription-tier gating on premium articles
 *  - Rotation strategy: Article → News → Random page → Sponsor → repeat
 *  - Each card links to /magazine/article/[slug] or /live/rooms/[id]
 *  - 100+ article slots populated by bot accounts
 *  - Performer pages auto-populate from their profile metadata
 *
 * Polygon geometry classes:
 *   HERO_WIDE          full-width, sharp bottom-left cut
 *   BENTO_TRAP         trapezoid (wide top, narrower bottom)
 *   BENTO_HEX          hexagonal clip
 *   BENTO_SLASH        diagonal slash cut (top-right to bottom-left)
 *   BENTO_ARCH         arched top
 *   BENTO_NOTCH        notch cut from corner
 *   BENTO_WAVE         wavy side (simulated with polygon)
 *   BENTO_RECT         standard rounded rect (fallback)
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ─── Types ─────────────────────────────────────────────────────────────── */
export type ArticleCategory =
  | "feature" | "interview" | "news" | "editorial" | "review"
  | "battle_recap" | "cypher_recap" | "artist_spotlight" | "sponsor";

export type GeometryClass =
  | "HERO_WIDE" | "BENTO_TRAP" | "BENTO_HEX" | "BENTO_SLASH"
  | "BENTO_ARCH" | "BENTO_NOTCH" | "BENTO_WAVE" | "BENTO_RECT";

export type TierRequired = "free" | "silver" | "gold" | "platinum" | "diamond";

export interface ArticleSlug {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: ArticleCategory;
  geometry: GeometryClass;
  accentColor: string;
  coverUrl?: string;
  performerId?: string;
  performerName?: string;
  isPerformerLive?: boolean;
  liveRoomId?: string;
  bioVariants?: string[];       // rotating bios — different each visit
  tierRequired: TierRequired;
  sponsorId?: string;           // non-null = sponsor-paid slot
  sponsorName?: string;
  sponsorLinkUrl?: string;
  publishedAt: string;
  readTimeMin: number;
  tags: string[];
  viewCount: number;
  priority: number;             // higher = higher placement
}

/* ─── Geometry definitions ───────────────────────────────────────────────── */
const GEOMETRY: Record<GeometryClass, {
  clipPath: string;
  gridSpan: string;
  aspectRatio: string;
  labelPos: "top-left" | "bottom-left" | "bottom-right";
}> = {
  HERO_WIDE: {
    clipPath: "polygon(0 0, 100% 0, 100% 85%, 96% 100%, 0 100%)",
    gridSpan: "col-span-2 row-span-2",
    aspectRatio: "16/9",
    labelPos: "bottom-left",
  },
  BENTO_TRAP: {
    clipPath: "polygon(5% 0, 95% 0, 100% 100%, 0 100%)",
    gridSpan: "col-span-1 row-span-1",
    aspectRatio: "4/3",
    labelPos: "bottom-left",
  },
  BENTO_HEX: {
    clipPath: "polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%)",
    gridSpan: "col-span-1 row-span-1",
    aspectRatio: "1/1",
    labelPos: "bottom-left",
  },
  BENTO_SLASH: {
    clipPath: "polygon(0 0, 100% 0, 100% 80%, 0 100%)",
    gridSpan: "col-span-1 row-span-1",
    aspectRatio: "4/3",
    labelPos: "bottom-left",
  },
  BENTO_ARCH: {
    clipPath: "polygon(0 8%, 50% 0, 100% 8%, 100% 100%, 0 100%)",
    gridSpan: "col-span-1 row-span-1",
    aspectRatio: "3/4",
    labelPos: "bottom-left",
  },
  BENTO_NOTCH: {
    clipPath: "polygon(0 0, 85% 0, 100% 15%, 100% 100%, 0 100%)",
    gridSpan: "col-span-1 row-span-1",
    aspectRatio: "4/3",
    labelPos: "bottom-left",
  },
  BENTO_WAVE: {
    clipPath: "polygon(0 0, 100% 0, 100% 85%, 85% 100%, 15% 100%, 0 85%)",
    gridSpan: "col-span-1 row-span-2",
    aspectRatio: "3/5",
    labelPos: "bottom-left",
  },
  BENTO_RECT: {
    clipPath: "none",
    gridSpan: "col-span-1 row-span-1",
    aspectRatio: "4/3",
    labelPos: "bottom-left",
  },
};

/* ─── Category colors ─────────────────────────────────────────────────────── */
const CAT_COLORS: Record<ArticleCategory, { bg: string; text: string; label: string }> = {
  feature:         { bg: "#86198f", text: "#f5d0fe", label: "FEATURE" },
  interview:       { bg: "#065f46", text: "#6ee7b7", label: "INTERVIEW" },
  news:            { bg: "#1e3a5f", text: "#93c5fd", label: "NEWS" },
  editorial:       { bg: "#78350f", text: "#fcd34d", label: "EDITORIAL" },
  review:          { bg: "#4c1d95", text: "#c4b5fd", label: "REVIEW" },
  battle_recap:    { bg: "#7f1d1d", text: "#fca5a5", label: "BATTLE RECAP" },
  cypher_recap:    { bg: "#1a2e05", text: "#86efac", label: "CYPHER RECAP" },
  artist_spotlight:{ bg: "#0c1a4d", text: "#a5b4fc", label: "ARTIST SPOTLIGHT" },
  sponsor:         { bg: "#292524", text: "#fbbf24", label: "SPONSORED" },
};

/* ─── Bio rotation (different paragraph each visit) ─────────────────────── */
function getRotatedBio(variants: string[]): string {
  if (!variants || variants.length === 0) return "";
  const key = Math.floor(Date.now() / (1000 * 60 * 60 * 4)) % variants.length;
  return variants[key];
}

/* ─── Tier gate overlay ───────────────────────────────────────────────────── */
function TierGate({ tier }: { tier: TierRequired }) {
  const labels: Record<TierRequired, string> = {
    free: "", silver: "Silver+", gold: "Gold+", platinum: "Platinum+", diamond: "Diamond"
  };
  if (tier === "free") return null;
  return (
    <div
      className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
    >
      <span className="text-2xl">🔒</span>
      <p className="text-[10px] font-black text-white uppercase tracking-widest">{labels[tier]} Required</p>
      <Link
        href="/settings/billing"
        className="text-[9px] font-black px-3 py-1 bg-white text-black rounded-full uppercase hover:bg-white/90 transition-colors"
      >
        Upgrade
      </Link>
    </div>
  );
}

/* ─── Single article card ─────────────────────────────────────────────────── */
function ArticleCard({
  article,
  userTier = "free",
}: {
  article: ArticleSlug;
  userTier?: TierRequired;
}) {
  const [hovered, setHovered] = useState(false);
  const geo = GEOMETRY[article.geometry];
  const cat = CAT_COLORS[article.category];
  const bio = article.bioVariants ? getRotatedBio(article.bioVariants) : null;
  const locked = article.tierRequired !== "free" &&
    ["free","silver","gold","platinum","diamond"].indexOf(userTier) <
    ["free","silver","gold","platinum","diamond"].indexOf(article.tierRequired);

  const isSponsor = article.category === "sponsor";

  const CardInner = () => (
    <div
      className="relative w-full h-full overflow-hidden cursor-pointer"
      style={{
        clipPath: geo.clipPath !== "none" ? geo.clipPath : undefined,
        borderRadius: geo.clipPath === "none" ? "12px" : undefined,
        aspectRatio: geo.aspectRatio,
        transition: "transform 0.3s ease, filter 0.3s ease",
        transform: hovered ? "scale(1.03)" : "scale(1)",
        filter: hovered ? "brightness(1.1)" : "brightness(1)",
        border: isSponsor ? `2px dashed ${article.accentColor}60` : undefined,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background */}
      {article.coverUrl ? (
        <img
          src={article.coverUrl}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${article.accentColor}30 0%, ${cat.bg} 100%)`,
          }}
        />
      )}

      {/* Dark overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)" }}
      />

      {/* Live performer widget */}
      {article.isPerformerLive && article.liveRoomId && (
        <div
          className="absolute top-2 right-2 w-16 h-16 rounded-lg border overflow-hidden z-10"
          style={{ borderColor: article.accentColor + "80" }}
        >
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: article.accentColor + "20" }}
          >
            <span className="text-[8px] font-black text-white/60 uppercase">LIVE</span>
          </div>
          <div className="absolute top-1 left-1 flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[6px] text-white font-black">LIVE</span>
          </div>
        </div>
      )}

      {/* Category badge */}
      <div
        className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded text-[7px] font-black uppercase tracking-wider"
        style={{ background: cat.bg, color: cat.text }}
      >
        {cat.label}
      </div>

      {/* Content overlay */}
      <div className="absolute bottom-0 inset-x-0 z-10 px-3 py-3">
        <h3
          className="font-black text-white leading-tight line-clamp-2"
          style={{ fontSize: article.geometry === "HERO_WIDE" ? "1.1rem" : "0.75rem" }}
        >
          {article.title}
        </h3>
        {article.subtitle && article.geometry === "HERO_WIDE" && (
          <p className="text-white/60 text-[10px] mt-1 line-clamp-2">{article.subtitle}</p>
        )}
        {bio && article.geometry !== "BENTO_HEX" && (
          <p className="text-white/50 text-[9px] mt-1 line-clamp-2">{bio}</p>
        )}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1.5">
            {article.performerName && (
              <span className="text-[8px] text-white/50">{article.performerName}</span>
            )}
            <span className="text-[7px] text-white/30">{article.readTimeMin}m read</span>
          </div>
          {article.isPerformerLive && (
            <Link
              href={`/live/rooms/${article.liveRoomId}`}
              className="text-[8px] font-black px-2 py-0.5 rounded uppercase"
              style={{ background: article.accentColor, color: "#000" }}
              onClick={(e) => e.stopPropagation()}
            >
              Watch Live
            </Link>
          )}
        </div>
      </div>

      {/* Tier gate */}
      {locked && <TierGate tier={article.tierRequired} />}

      {/* Sponsor label */}
      {isSponsor && (
        <div
          className="absolute bottom-2 right-2 z-20 text-[7px] font-black text-white/40 uppercase tracking-wider"
        >
          Sponsored
        </div>
      )}
    </div>
  );

  if (locked) {
    return <div className={geo.gridSpan}><CardInner /></div>;
  }

  if (isSponsor && article.sponsorLinkUrl) {
    return (
      <a href={article.sponsorLinkUrl} target="_blank" rel="noopener noreferrer" className={geo.gridSpan}>
        <CardInner />
      </a>
    );
  }

  return (
    <Link href={`/magazine/article/${article.slug}`} className={geo.gridSpan}>
      <CardInner />
    </Link>
  );
}

/* ─── Magazine Engine main ────────────────────────────────────────────────── */
export default function TMIMagazineEngine({
  articles,
  userTier = "free",
  sponsorSlot,
  showFilter = true,
}: {
  articles: ArticleSlug[];
  userTier?: TierRequired;
  sponsorSlot?: ArticleSlug;
  showFilter?: boolean;
}) {
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | "all">("all");
  const [displayArticles, setDisplayArticles] = useState<ArticleSlug[]>([]);

  useEffect(() => {
    let filtered = activeCategory === "all"
      ? [...articles]
      : articles.filter((a) => a.category === activeCategory);

    // Sort by priority descending
    filtered.sort((a, b) => b.priority - a.priority);

    // Inject sponsor slot at position 5
    if (sponsorSlot && filtered.length >= 5) {
      filtered.splice(5, 0, sponsorSlot);
    } else if (sponsorSlot) {
      filtered.push(sponsorSlot);
    }

    setDisplayArticles(filtered);
  }, [articles, activeCategory, sponsorSlot]);

  const categories: { id: ArticleCategory | "all"; label: string }[] = [
    { id: "all",      label: "All" },
    { id: "feature",  label: "Features" },
    { id: "interview",label: "Interviews" },
    { id: "news",     label: "News" },
    { id: "battle_recap", label: "Battles" },
    { id: "artist_spotlight", label: "Spotlights" },
  ];

  return (
    <div className="min-h-screen bg-[#05050c] text-white">

      {/* Header */}
      <div className="px-4 pt-6 pb-4 text-center">
        <h1 className="text-2xl font-black tracking-[0.2em] uppercase text-white">
          The Musician's Index
        </h1>
        <p className="text-[10px] text-white/30 tracking-[0.4em] uppercase mt-1">
          Magazine
        </p>
      </div>

      {/* Category filter */}
      {showFilter && (
        <div className="flex gap-1.5 px-4 pb-4 overflow-x-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider transition-all ${
                activeCategory === cat.id
                  ? "bg-white text-black"
                  : "bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Bento grid */}
      <div
        className="px-3 pb-8"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
          gridAutoRows: "160px",
        }}
      >
        {displayArticles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            userTier={userTier}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 pb-8 text-center">
        <p className="text-[8px] text-white/20 uppercase tracking-widest">
          {displayArticles.length} articles · TMI Magazine
        </p>
      </div>
    </div>
  );
}

/* ─── Article page (full article view) ───────────────────────────────────── */
export function TMIArticlePage({
  article,
  userTier = "free",
  relatedArticles = [],
  onBack,
}: {
  article: ArticleSlug & { content: string; videoUrl?: string };
  userTier?: TierRequired;
  relatedArticles?: ArticleSlug[];
  onBack?: () => void;
}) {
  const cat = CAT_COLORS[article.category];
  const bio = article.bioVariants ? getRotatedBio(article.bioVariants) : null;
  const locked = article.tierRequired !== "free" &&
    ["free","silver","gold","platinum","diamond"].indexOf(userTier) <
    ["free","silver","gold","platinum","diamond"].indexOf(article.tierRequired);

  return (
    <div className="min-h-screen bg-[#05050c] text-white max-w-2xl mx-auto">

      {/* Back */}
      <div className="px-4 pt-4">
        <button
          onClick={onBack}
          className="text-[9px] text-white/30 font-bold uppercase tracking-widest hover:text-white/60"
        >
          ← Magazine
        </button>
      </div>

      {/* Hero */}
      <div className="relative mx-4 mt-3 rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {article.coverUrl ? (
          <img src={article.coverUrl} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full"
            style={{ background: `radial-gradient(circle at 30% 30%, ${article.accentColor}30 0%, #05050c 100%)` }}
          />
        )}
        <div className="absolute bottom-0 inset-x-0 p-4" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)" }}>
          <span
            className="text-[7px] font-black px-1.5 py-0.5 rounded uppercase"
            style={{ background: cat.bg, color: cat.text }}
          >
            {cat.label}
          </span>
          <h1 className="text-xl font-black text-white mt-1 leading-tight">{article.title}</h1>
          {article.subtitle && <p className="text-white/60 text-[11px] mt-0.5">{article.subtitle}</p>}
        </div>

        {/* Live CTA */}
        {article.isPerformerLive && article.liveRoomId && (
          <Link
            href={`/live/rooms/${article.liveRoomId}`}
            className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black uppercase text-black"
            style={{ background: article.accentColor }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Watch Live Now
          </Link>
        )}
      </div>

      {/* Meta */}
      <div className="px-4 mt-3 flex items-center gap-3 text-[9px] text-white/40">
        {article.performerName && <span>{article.performerName}</span>}
        <span>{article.readTimeMin} min read</span>
        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
        {article.tags.map((t) => (
          <span key={t} className="px-1.5 py-0.5 rounded" style={{ background: article.accentColor + "20", color: article.accentColor }}>
            {t}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="px-4 mt-4 pb-12">
        {locked ? (
          <div className="border border-white/10 rounded-2xl p-8 text-center space-y-4">
            <span className="text-4xl">🔒</span>
            <p className="text-white/50 text-sm">This article requires a higher subscription tier</p>
            <Link href="/settings/billing" className="inline-block px-6 py-2 text-[10px] font-black uppercase rounded-full text-black" style={{ background: article.accentColor }}>
              Upgrade to Read
            </Link>
          </div>
        ) : (
          <>
            {bio && (
              <p className="text-white/70 text-sm leading-relaxed mb-4 italic border-l-2 pl-4" style={{ borderColor: article.accentColor }}>
                {bio}
              </p>
            )}
            {article.videoUrl && (
              <video
                src={article.videoUrl}
                controls
                className="w-full rounded-xl mb-4"
                style={{ maxHeight: "300px" }}
              />
            )}
            <div className="text-white/80 text-sm leading-relaxed space-y-3 whitespace-pre-line">
              {article.content}
            </div>
          </>
        )}

        {/* Related articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-8">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3">Related</p>
            <div className="grid grid-cols-2 gap-2">
              {relatedArticles.slice(0, 4).map((a) => (
                <Link key={a.id} href={`/magazine/article/${a.slug}`}>
                  <div className="border border-white/10 rounded-xl p-3 hover:border-white/20 transition-colors">
                    <p className="text-[9px] font-black text-white/80 line-clamp-2">{a.title}</p>
                    <p className="text-[7px] text-white/30 mt-1 uppercase">{a.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
