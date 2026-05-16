"use client";

import { ImageSlotWrapper } from '@/components/visual-enforcement';
/**
 * ArtistArticleTemplateMixer
 *
 * Renders an artist/performer article with the correct magazine template
 * based on article category. Pulls from the article registry.
 *
 * Templates:
 *   - feature: full-width hero + bio + stats
 *   - battle: side-by-side dual cards
 *   - cypher: vertical stack with bars
 *   - interview: transcript layout
 *   - showcase: portfolio grid
 *   - news: compact news card
 */

import Link from "next/link";
import MagazineShellSystem from "./MagazineShellSystem";

export type ArticleCategory =
  | "feature"
  | "battle"
  | "cypher"
  | "interview"
  | "showcase"
  | "news";

export type ArtistArticleData = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  artistImage?: string;
  rank?: number;
  category: ArticleCategory;
  excerpt: string;
  publishedAt?: string;
  href: string;
  tags?: string[];
};

export type ArtistArticleTemplateMixerProps = {
  article: ArtistArticleData;
  spotlit?: boolean;
  crownActive?: boolean;
  showConfetti?: boolean;
  "data-testid"?: string;
};

export default function ArtistArticleTemplateMixer({
  article,
  spotlit = false,
  crownActive = false,
  showConfetti = false,
  "data-testid": testId,
}: ArtistArticleTemplateMixerProps) {
  const content = (
    <div className="artist-article-template relative">
      {/* Artist image */}
      {article.artistImage && (
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <ImageSlotWrapper imageId="img-21bf2r" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        </div>
      )}
      <div className="p-2">
        <span className="article-category-tag mb-1 inline-block rounded bg-purple-700/80 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
          {article.category}
        </span>
        <h3 className="line-clamp-2 text-sm font-bold text-white">{article.title}</h3>
        <p className="mt-0.5 line-clamp-2 text-xs text-white/60">{article.excerpt}</p>
        {article.publishedAt && (
          <p className="mt-1 text-[10px] text-white/40">{article.publishedAt}</p>
        )}
        {article.tags && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <MagazineShellSystem
      rank={article.rank}
      artistId={article.artistId}
      artistName={article.artistName}
      href={article.href}
      spotlit={spotlit}
      crownActive={crownActive}
      showConfetti={showConfetti}
      confettiCount={14}
      className="artist-article-template-mixer"
      data-testid={testId ?? `artist-article-${article.id}`}
    >
      {content}
    </MagazineShellSystem>
  );
}
