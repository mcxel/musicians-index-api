/**
 * MagazineLayout.tsx
 * Purpose: Horizontal page-turn magazine navigation, insertion algorithm, spread/rail/card layouts.
 * Placement: apps/web/src/components/magazine/MagazineLayout.tsx
 * Depends on: tmi-theme.css, SponsorTile
 */

'use client';

import { ImageSlotWrapper } from '@/components/visual-enforcement/ImageSlotWrapper';

import React, { useState, useRef, useCallback, useEffect } from 'react';

export type PageType =
  | 'ARTIST_PROFILE'
  | 'ARTICLE'
  | 'EVENT_RECAP'
  | 'BATTLE_RESULTS'
  | 'SPONSOR_INSERT'
  | 'MINI_FACT'
  | 'MEMBER_TILE'
  | 'PAGE_TEASER'
  | 'COVER'
  | 'HOME';

export interface MagazinePage {
  id: string;
  type: PageType;
  pageNumber: number;
  title?: string;
  content?: React.ReactNode;
  coverImageUrl?: string;
  artistName?: string;
  rankingNumber?: number;
  sponsorName?: string;
  sponsorLogoUrl?: string;
  fact?: string;
  teaserText?: string;
  teaserTargetPage?: number;
}

interface MagazineLayoutProps {
  pages: MagazinePage[];
  initialPage?: number;
  isHome?: boolean;         // Home uses vertical scroll; everything else uses horizontal turn
  onPageChange?: (page: MagazinePage) => void;
  className?: string;
}

export const MagazineLayout: React.FC<MagazineLayoutProps> = ({
  pages,
  initialPage = 0,
  isHome = false,
  onPageChange,
  className = '',
}) => {
  const [currentIdx, setCurrentIdx] = useState(initialPage);
  const [flipping, setFlipping] = useState<'left' | 'right' | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPage = pages[currentIdx];

  const goToPage = useCallback((idx: number, direction: 'left' | 'right') => {
    if (idx < 0 || idx >= pages.length) return;
    setFlipping(direction);
    setTimeout(() => {
      setCurrentIdx(idx);
      setFlipping(null);
      onPageChange?.(pages[idx]);
    }, 350);
  }, [pages, onPageChange]);

  const prevPage = () => goToPage(currentIdx - 1, 'right');
  const nextPage = () => goToPage(currentIdx + 1, 'left');

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (isHome) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextPage();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevPage();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIdx, isHome]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null || isHome) return;
    const delta = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) nextPage();
      else prevPage();
    }
    setTouchStart(null);
  };

  if (isHome) {
    return (
      <div
        className={`ml-home ${className}`}
        style={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }}
      >
        {currentPage?.content}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .ml-root {
          position: relative;
          width: 100%;
          height: 100%;
          background: #0b0b1e;
          overflow: hidden;
          user-select: none;
        }
        .ml-page {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(15,12,35,0.98) 0%, rgba(11,11,30,1) 100%);
          transition: transform 0.35s ease, opacity 0.35s ease;
          transform-origin: left center;
        }
        .ml-page--flip-left {
          animation: ml-flip-out-left 0.35s ease forwards;
        }
        .ml-page--flip-right {
          animation: ml-flip-out-right 0.35s ease forwards;
        }
        .ml-page--entering-left {
          animation: ml-flip-in-left 0.35s ease forwards;
        }
        .ml-page--entering-right {
          animation: ml-flip-in-right 0.35s ease forwards;
        }
        .ml-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s;
          color: rgba(255,255,255,0.6);
          font-size: 18px;
        }
        .ml-nav-btn:hover { background: rgba(255,45,170,0.15); border-color: rgba(255,45,170,0.4); color: #FF2DAA; }
        .ml-nav-btn:disabled { opacity: 0.2; cursor: default; pointer-events: none; }
        .ml-nav-prev { left: 12px; }
        .ml-nav-next { right: 12px; }
        .ml-page-indicator {
          position: absolute;
          bottom: 14px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 5px;
          z-index: 10;
        }
        .ml-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          transition: all 0.2s;
          cursor: pointer;
        }
        .ml-dot--active {
          background: #FF2DAA;
          box-shadow: 0 0 6px #FF2DAA;
          width: 16px;
          border-radius: 3px;
        }
        .ml-page-num {
          position: absolute;
          bottom: 14px;
          right: 20px;
          font-family: 'Courier New', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1px;
          z-index: 10;
        }
        .ml-content-area {
          position: absolute;
          inset: 0;
          padding: 24px 64px;
          overflow-y: auto;
          scrollbar-width: none;
        }
        .ml-content-area::-webkit-scrollbar { display: none; }

        /* Page type styles */
        .ml-cover {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          background: radial-gradient(ellipse at center, rgba(255,45,170,0.12) 0%, transparent 70%);
          text-align: center;
        }
        .ml-cover-title {
          font-family: 'Courier New', monospace;
          font-size: 36px;
          font-weight: 700;
          color: #FF2DAA;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-shadow: 0 0 20px rgba(255,45,170,0.5);
          margin-bottom: 8px;
        }
        .ml-article-hero {
          width: 100%;
          height: 200px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 16px;
        }
        .ml-article-ranking {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,215,0,0.1);
          border: 1px solid rgba(255,215,0,0.3);
          border-radius: 6px;
          padding: 4px 10px;
          font-family: 'Courier New', monospace;
          font-size: 11px;
          color: #FFD700;
          letter-spacing: 1px;
          margin-bottom: 10px;
        }
        .ml-article-title {
          font-size: 22px;
          font-weight: 700;
          color: #FFFFFF;
          line-height: 1.3;
          margin-bottom: 8px;
        }
        .ml-fact-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          padding: 40px;
        }
        .ml-fact-icon { font-size: 64px; margin-bottom: 20px; }
        .ml-fact-text {
          font-size: 20px;
          color: rgba(255,255,255,0.8);
          line-height: 1.5;
          max-width: 400px;
          font-style: italic;
        }
        .ml-teaser {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          text-align: center;
          gap: 12px;
          cursor: pointer;
        }
        .ml-teaser-text {
          font-size: 18px;
          color: rgba(255,255,255,0.7);
          line-height: 1.4;
        }
        .ml-teaser-cta {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          color: #FF2DAA;
          letter-spacing: 2px;
          text-transform: uppercase;
          animation: ml-arrow-bounce 1s infinite;
        }

        @keyframes ml-flip-out-left {
          0% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
          100% { transform: perspective(1200px) rotateY(-90deg); opacity: 0; }
        }
        @keyframes ml-flip-out-right {
          0% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
          100% { transform: perspective(1200px) rotateY(90deg); opacity: 0; }
        }
        @keyframes ml-flip-in-left {
          0% { transform: perspective(1200px) rotateY(90deg); opacity: 0; }
          100% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
        }
        @keyframes ml-flip-in-right {
          0% { transform: perspective(1200px) rotateY(-90deg); opacity: 0; }
          100% { transform: perspective(1200px) rotateY(0deg); opacity: 1; }
        }
        @keyframes ml-arrow-bounce {
          0%,100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
      `}</style>

      <div
        ref={containerRef}
        className={`ml-root ${className}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Current Page */}
        <div className={`ml-page ${flipping ? `ml-page--flip-${flipping}` : ''}`}>
          <div className="ml-content-area">
            <PageRenderer page={currentPage} />
          </div>
        </div>

        {/* Navigation */}
        <button
          className="ml-nav-btn ml-nav-prev"
          onClick={prevPage}
          disabled={currentIdx === 0}
        >
          ‹
        </button>
        <button
          className="ml-nav-btn ml-nav-next"
          onClick={nextPage}
          disabled={currentIdx === pages.length - 1}
        >
          ›
        </button>

        {/* Page Dots (show max 7 around current) */}
        <div className="ml-page-indicator">
          {getVisibleDots(currentIdx, pages.length).map(({ idx, type }) => (
            <div
              key={idx}
              className={`ml-dot ${idx === currentIdx ? 'ml-dot--active' : ''}`}
              style={type === 'ellipsis' ? { width: 4, height: 4, opacity: 0.3 } : {}}
              onClick={() => idx !== currentIdx && goToPage(idx, idx > currentIdx ? 'left' : 'right')}
              title={type !== 'ellipsis' ? `Page ${idx + 1}` : '...'}
            />
          ))}
        </div>

        <div className="ml-page-num">
          {currentIdx + 1} / {pages.length}
        </div>
      </div>
    </>
  );
};

// Page renderer based on type
const PageRenderer: React.FC<{ page: MagazinePage }> = ({ page }) => {
  if (!page) return null;

  if (page.type === 'COVER') {
    return (
      <div className="ml-cover">
        {page.coverImageUrl && (
          <ImageSlotWrapper imageId="img-l7xzud" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        )}
        <div className="ml-cover-title">THE MUSICIAN'S<br />INDEX</div>
        <div style={{ fontFamily: 'Courier New, monospace', fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, marginTop: 8 }}>
          THE MAGAZINE
        </div>
      </div>
    );
  }

  if (page.type === 'MINI_FACT') {
    return (
      <div className="ml-fact-card">
        <div className="ml-fact-icon">💡</div>
        <div className="ml-fact-text">"{page.fact}"</div>
      </div>
    );
  }

  if (page.type === 'PAGE_TEASER') {
    return (
      <div className="ml-teaser">
        <div style={{ fontSize: 40 }}>📖</div>
        <div className="ml-teaser-text">{page.teaserText}</div>
        <div className="ml-teaser-cta">On Page {page.teaserTargetPage} →</div>
      </div>
    );
  }

  if (page.type === 'ARTICLE' || page.type === 'ARTIST_PROFILE') {
    return (
      <div>
        {page.rankingNumber && (
          <div className="ml-article-ranking">#{page.rankingNumber} · {page.artistName}</div>
        )}
        {page.coverImageUrl && (
          <ImageSlotWrapper imageId="img-ydo09n" roomId="runtime-surface" priority="normal" className="ml-article-hero" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
        )}
        <div className="ml-article-title">{page.title}</div>
        {page.content}
      </div>
    );
  }

  if (page.type === 'SPONSOR_INSERT') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center', padding: 32 }}>
          {page.sponsorLogoUrl
            ? <ImageSlotWrapper imageId="img-b5mu59" roomId="runtime-surface" priority="normal" className="w-full h-full object-cover" altText="Content image" containerStyle={{ width: '100%', height: '100%' }} />
            : <div style={{ fontSize: 64, marginBottom: 16 }}>🏢</div>
          }
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 20, fontWeight: 700, color: '#FFD700', letterSpacing: 2, textTransform: 'uppercase' }}>
            {page.sponsorName}
          </div>
          <div style={{ fontFamily: 'Courier New, monospace', fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.3)', marginTop: 8, textTransform: 'uppercase' }}>
            Advertisement
          </div>
        </div>
      </div>
    );
  }

  return <div style={{ padding: 20 }}>{page.content}</div>;
};

// Utility: get visible dots around current page
function getVisibleDots(current: number, total: number): { idx: number; type: 'dot' | 'ellipsis' }[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => ({ idx: i, type: 'dot' as const }));
  const dots: { idx: number; type: 'dot' | 'ellipsis' }[] = [];
  // Always show first, last, and 2 around current
  const show = new Set([0, total - 1, current, current - 1, current + 1, current - 2, current + 2]);
  let lastAdded = -1;
  for (let i = 0; i < total; i++) {
    if (show.has(i)) {
      if (lastAdded !== -1 && i - lastAdded > 1) dots.push({ idx: -1, type: 'ellipsis' });
      dots.push({ idx: i, type: 'dot' });
      lastAdded = i;
    }
  }
  return dots;
}

export default MagazineLayout;
