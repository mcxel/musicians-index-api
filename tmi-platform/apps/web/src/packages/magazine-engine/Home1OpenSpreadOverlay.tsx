"use client";

import { ImageSlotWrapper } from '@/components/visual-enforcement';
/**
 * Home1OpenSpreadOverlay
 *
 * The "open magazine spread" overlay that appears when a user clicks
 * into a featured article from Home1 — shows the inner spread layout.
 * Sits above the regular page content.
 */

import Link from "next/link";
import MagazinePromoMessageRotator from "./MagazinePromoMessageRotator";

export type SpreadArticle = {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  coverImage?: string;
  category: "feature" | "battle" | "cypher" | "news" | "interview" | "showcase";
  href: string;
};

export type Home1OpenSpreadOverlayProps = {
  articles: SpreadArticle[];
  isOpen: boolean;
  onClose?: () => void;
  "data-testid"?: string;
};

const CATEGORY_COLOR: Record<string, string> = {
  feature: "bg-purple-700",
  battle: "bg-red-700",
  cypher: "bg-cyan-700",
  news: "bg-slate-700",
  interview: "bg-emerald-700",
  showcase: "bg-orange-600",
};

export default function Home1OpenSpreadOverlay({
  articles,
  isOpen,
  onClose,
  "data-testid": testId,
}: Home1OpenSpreadOverlayProps) {
  if (!isOpen) return null;

  return (
    <div
      className="home1-spread-overlay fixed inset-0 z-50 flex flex-col overflow-auto bg-black/92 p-4"
      data-testid={testId ?? "home1-open-spread-overlay"}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white">
            The Musician's Index — Open Spread
          </h2>
          <MagazinePromoMessageRotator
            intervalMs={5000}
            showIcon
            showRoute={false}
            variant="badge"
          />
        </div>
        <button
          onClick={onClose}
          className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-bold text-white hover:bg-white/20"
          data-testid="spread-close-button"
        >
          ✕ Close
        </button>
      </div>

      {/* Article grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {articles.map((article) => (
          <Link
            key={article.id}
            href={article.href}
            className="home1-spread-article group relative overflow-hidden rounded-lg bg-white/5 p-3 transition hover:bg-white/10"
            data-testid={`spread-article-${article.id}`}
          >
            {article.coverImage && (
              <div className="mb-2 aspect-video w-full overflow-hidden rounded">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <ImageSlotWrapper imageId="img-96kqri" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
              </div>
            )}
            <span
              className={`mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-white ${CATEGORY_COLOR[article.category] ?? "bg-slate-700"}`}
            >
              {article.category.toUpperCase()}
            </span>
            <h3 className="line-clamp-2 text-sm font-bold text-white group-hover:text-cyan-300">
              {article.title}
            </h3>
            <p className="mt-0.5 text-xs text-white/60">{article.artistName}</p>
          </Link>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-4 flex justify-center gap-3">
        <Link
          href="/magazine"
          className="rounded-full bg-purple-600 px-6 py-2 text-sm font-bold text-white hover:bg-purple-500"
          data-testid="spread-magazine-link"
        >
          Full Magazine
        </Link>
        <Link
          href="/cypher"
          className="rounded-full bg-cyan-600 px-6 py-2 text-sm font-bold text-white hover:bg-cyan-500"
          data-testid="spread-cypher-link"
        >
          Cypher Arena
        </Link>
      </div>
    </div>
  );
}
