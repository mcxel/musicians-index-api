'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TripleImageCarousel from '@/lib/media/TripleImageCarousel';

interface Home1EditorialBeltProps {
  title?: string;
  accentColor?: string;
}

const SAMPLE_ARTICLES = [
  { title: 'How to Win Your First TMI Contest', slug: 'how-to-win-first-contest', icon: '🏆' },
  { title: 'Top 10 Producers to Watch 2026', slug: 'top-10-producers', icon: '🎛️' },
  { title: 'Interview: KRYPT on His Latest Release', slug: 'interview-krypt', icon: '🎤' },
  { title: 'Studio Recap: Neon Vibe Session Vol.3', slug: 'studio-recap-vol3', icon: '🎧' },
];

export default function Home1EditorialBelt({
  title = 'EDITORIAL BELT',
  accentColor = '#FF2DAA',
}: Home1EditorialBeltProps) {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: accentColor, fontWeight: 800, marginBottom: 24 }}>
        {title}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {SAMPLE_ARTICLES.map((article, i) => (
          <motion.div
            key={article.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href={`/magazine/article/${article.slug}`}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${accentColor}25`,
                  borderRadius: 10,
                  padding: 14,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.06)';
                  el.style.borderColor = accentColor + '40';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.03)';
                  el.style.borderColor = accentColor + '25';
                }}
              >
                <span style={{ fontSize: 24 }}>{article.icon}</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', lineHeight: 1.3 }}>
                  {article.title}
                </div>
                <div style={{ marginTop: 'auto' }}>
                  <div
                    style={{
                      fontSize: 8,
                      fontWeight: 700,
                      color: accentColor,
                      letterSpacing: '0.1em',
                    }}
                  >
                    READ →
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
