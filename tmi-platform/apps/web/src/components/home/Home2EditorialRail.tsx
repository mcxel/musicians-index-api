'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TripleImageCarousel from '@/lib/media/TripleImageCarousel';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';

interface Home2EditorialRailProps {
  title?: string;
  accentColor?: string;
}

const CATEGORY_META: Record<string, { icon: string; href: string; color: string }> = {
  feature:   { icon: '📰', href: '/articles?category=feature',   color: '#00FFFF' },
  interview: { icon: '🎤', href: '/articles?category=interview', color: '#FF2DAA' },
  editorial: { icon: '✍️', href: '/articles?category=editorial', color: '#FFD700' },
  review:    { icon: '⭐', href: '/articles?category=review',    color: '#AA2DFF' },
  news:      { icon: '📡', href: '/articles?category=news',      color: '#00FF88' },
};

// Build real editorial boards from magazine data — one card per category that has articles
const REAL_BOARDS = Object.entries(CATEGORY_META)
  .map(([cat, meta]) => {
    const articles = MAGAZINE_ISSUE_1.filter((a) => a.category === cat);
    const latest = articles[0];
    return {
      slug: cat,
      title: cat.charAt(0).toUpperCase() + cat.slice(1) + (cat === 'editorial' ? '' : cat === 'news' ? '' : 's'),
      subtitle: latest ? latest.title : null,
      icon: meta.icon,
      href: latest ? `/magazine/article/${latest.slug}` : meta.href,
      color: meta.color,
      count: articles.length,
    };
  })
  .filter((b) => b.count > 0);

const CAROUSEL_IMAGES = [
  '/tmi-curated/mag-35.jpg',
  '/tmi-curated/mag-42.jpg',
  '/tmi-curated/mag-50.jpg',
];

export default function Home2EditorialRail({
  title = 'EDITORIAL BOARDS',
  accentColor = '#00FFFF',
}: Home2EditorialRailProps) {
  if (REAL_BOARDS.length === 0) {
    return (
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: accentColor, fontWeight: 800, marginBottom: 16 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', padding: '20px 0' }}>No editorial content published yet.</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: accentColor, fontWeight: 800, marginBottom: 24 }}>
        {title}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {REAL_BOARDS.map((board, i) => (
          <motion.div
            key={board.slug}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={board.href}
              style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16, textDecoration: 'none', color: 'inherit' }}
            >
              <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${board.color}25` }}>
                <TripleImageCarousel images={CAROUSEL_IMAGES} intervalMs={4000} borderColor={board.color} />
              </div>

              <div
                style={{
                  background: `linear-gradient(135deg, ${board.color}10, rgba(5,5,16,0.92))`,
                  border: `1px solid ${board.color}15`,
                  borderRadius: 10,
                  padding: '16px 18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `${board.color}12`;
                  el.style.borderColor = board.color + '30';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `linear-gradient(135deg, ${board.color}10, rgba(5,5,16,0.92))`;
                  el.style.borderColor = board.color + '15';
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>{board.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{board.title}</div>
                    {board.subtitle && (
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.35 }}>
                        {board.subtitle.length > 80 ? board.subtitle.slice(0, 80) + '…' : board.subtitle}
                      </div>
                    )}
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
                      {board.count} {board.count === 1 ? 'article' : 'articles'}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 8, fontWeight: 700, color: board.color, letterSpacing: '0.1em' }}>
                  READ BOARD →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
