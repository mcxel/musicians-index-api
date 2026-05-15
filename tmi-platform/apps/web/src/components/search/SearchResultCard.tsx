'use client';
import { ImageSlotWrapper } from '@/components/visual-enforcement';
// SearchResultCard.tsx — Single result row: avatar + name + type + meta
// Copilot wires: rendered by GlobalSearchBar and /search page results
// Proof: all result types render, LIVE badge shows on active rooms
export function SearchResultCard({ type, title, subtitle, href, isLive, imageUrl, viewerCount }: {
  type: 'artist'|'room'|'beat'|'venue'|'event'|'article';
  title: string; subtitle?: string; href: string;
  isLive?: boolean; imageUrl?: string; viewerCount?: number;
}) {
  return (
    <a href={href} className={`tmi-search-result tmi-search-result--${type}`}>
      {imageUrl && <ImageSlotWrapper imageId="img-prw2ur" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />}
      <div className="tmi-search-result__info">
        <span className="tmi-search-result__title">{title}</span>
        {subtitle && <span className="tmi-search-result__sub">{subtitle}</span>}
      </div>
      {isLive && <span className="tmi-live-badge" aria-label="Live now">● LIVE {viewerCount ? `· ${viewerCount}` : ''}</span>}
      <span className="tmi-search-result__type-tag">{type}</span>
    </a>
  );
}
