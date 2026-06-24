'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MAGAZINE_ISSUE_1 } from '@/lib/magazine/magazineIssueData';

interface Home2PremieresRailProps {
  title?: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  review:    '#AA2DFF',
  feature:   '#00FFFF',
  interview: '#FF2DAA',
  editorial: '#FFD700',
  news:      '#00FF88',
};

const CATEGORY_ICON: Record<string, string> = {
  review:    '⭐',
  feature:   '📰',
  interview: '🎤',
  editorial: '✍️',
  news:      '📡',
};

// Real premieres — latest review + feature articles from the magazine
const REAL_PREMIERES = MAGAZINE_ISSUE_1
  .filter((a) => a.category === 'review' || a.category === 'feature')
  .slice(0, 3)
  .map((article) => ({
    title: article.title,
    date: new Date(article.publishedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }),
    href: `/magazine/article/${article.slug}`,
    color: CATEGORY_COLOR[article.category] ?? '#00FFFF',
    icon: CATEGORY_ICON[article.category] ?? '📰',
  }));

export default function Home2PremieresRail({ title = 'PREMIERES' }: Home2PremieresRailProps) {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: 24 }}>
        {title}
      </div>

      {REAL_PREMIERES.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {REAL_PREMIERES.map((premiere, i) => (
            <motion.div
              key={premiere.href}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={premiere.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${premiere.color}20`,
                  borderRadius: 10,
                  padding: '16px 18px',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `${premiere.color}12`;
                  el.style.borderColor = premiere.color + '40';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.02)';
                  el.style.borderColor = premiere.color + '20';
                }}
              >
                <span style={{ fontSize: 22 }}>{premiere.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3, lineHeight: 1.3 }}>
                    {premiere.title}
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>Published {premiere.date}</div>
                </div>
                <div style={{ fontSize: 8, fontWeight: 700, color: premiere.color, background: `${premiere.color}18`, padding: '4px 10px', borderRadius: 4, flexShrink: 0 }}>
                  READ →
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', padding: '20px 0' }}>
          No premieres published yet. Check back soon.
        </div>
      )}

      <Link href="/magazine" style={{ display: 'inline-block', marginTop: 16, fontSize: 9, fontWeight: 800, color: '#FF2DAA', textDecoration: 'none' }}>
        Browse All Issues →
      </Link>
    </div>
  );
}
