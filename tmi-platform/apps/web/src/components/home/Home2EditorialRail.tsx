'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TripleImageCarousel from '@/lib/media/TripleImageCarousel';

interface Home2EditorialRailProps {
  title?: string;
  accentColor?: string;
}

const SAMPLE_BOARDS = [
  { title: 'This Week in Hip-Hop', subtitle: 'Top trending tracks & news', icon: '🎤', slug: 'hip-hop-weekly' },
  { title: 'Producer Spotlight', subtitle: 'Featured beat makers this month', icon: '🎛️', slug: 'producer-spotlight' },
  { title: 'Live Desk', subtitle: 'What went down at venues worldwide', icon: '🎭', slug: 'live-desk' },
  { title: 'Venue Intelligence', subtitle: 'Capacity, events, booking trends', icon: '🏟️', slug: 'venue-intel' },
];

const SAMPLE_IMAGES = [
  '/tmi-curated/mag-35.jpg',
  '/tmi-curated/mag-42.jpg',
  '/tmi-curated/mag-50.jpg',
];

export default function Home2EditorialRail({
  title = 'TOP BOARDS',
  accentColor = '#00FFFF',
}: Home2EditorialRailProps) {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 24px',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: accentColor, fontWeight: 800, marginBottom: 24 }}>
        {title}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {SAMPLE_BOARDS.map((board, i) => (
          <motion.div
            key={board.slug}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              href={`/news/${board.slug}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '200px 1fr',
                gap: 16,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <div
                style={{
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: `1px solid ${accentColor}25`,
                }}
              >
                <TripleImageCarousel
                  images={SAMPLE_IMAGES}
                  intervalMs={4000}
                  borderColor={accentColor}
                />
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${accentColor}15`,
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
                  el.style.background = `${accentColor}12`;
                  el.style.borderColor = accentColor + '30';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.03)';
                  el.style.borderColor = accentColor + '15';
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>{board.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                      {board.title}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                      {board.subtitle}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    color: accentColor,
                    letterSpacing: '0.1em',
                  }}
                >
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
