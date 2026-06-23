'use client';
import { motion } from 'framer-motion';

interface NewsItem {
  id: string;
  headline: string;
  timestamp?: string;
}

interface Home2NewsTickerRailProps {
  items?: NewsItem[];
  accentColor?: string;
}

const DEFAULT_NEWS_ITEMS: NewsItem[] = [
  { id: '1', headline: 'New collaboration between Marcus Bells and SZA announced', timestamp: '2m ago' },
  { id: '2', headline: 'Battle of the Bands semifinals heat up this Friday', timestamp: '45m ago' },
  { id: '3', headline: 'Producer Showcase: Top 5 beats from this week', timestamp: '3h ago' },
  { id: '4', headline: 'Monthly Idol auditions open for next season', timestamp: '6h ago' },
];

export default function Home2NewsTickerRail({
  items = DEFAULT_NEWS_ITEMS,
  accentColor = '#FFD700',
}: Home2NewsTickerRailProps) {
  return (
    <section
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '24px 24px 0',
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, ${accentColor}15, rgba(5,5,16,0.88))`,
          border: `1px solid ${accentColor}35`,
          borderRadius: 12,
          overflow: 'hidden',
          padding: '14px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', color: accentColor, textTransform: 'uppercase' }}>
            ⏱ LAST HOUR
          </div>
          <div style={{ fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            News · Updates · Trends
          </div>
        </div>

        {/* Scrolling ticker */}
        <div
          style={{
            overflow: 'hidden',
            position: 'relative',
            height: 28,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            transition={{
              duration: items.length * 4 + 8,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              display: 'flex',
              gap: 32,
              whiteSpace: 'nowrap',
            }}
          >
            {/* Duplicate items for seamless loop */}
            {[...items, ...items].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#fff',
                  paddingRight: 32,
                }}
              >
                <span style={{ color: accentColor, fontWeight: 800 }}>•</span>
                {item.headline}
              </div>
            ))}
          </motion.div>

          {/* Fade gradient overlay */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '40px',
              height: '100%',
              background: `linear-gradient(90deg, ${accentColor}15 0%, transparent 100%)`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: '40px',
              height: '100%',
              background: `linear-gradient(90deg, transparent 0%, ${accentColor}15 100%)`,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />
        </div>
      </div>
    </section>
  );
}
