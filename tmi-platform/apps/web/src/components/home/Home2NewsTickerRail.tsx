'use client';
import { motion } from 'framer-motion';
import { getRecentArticles, type MagazineArticle } from '@/lib/magazine/magazineIssueData';

interface NewsItem {
  id: string;
  headline: string;
  timestamp?: string;
  slug?: string;
}

interface Home2NewsTickerRailProps {
  items?: NewsItem[];
  accentColor?: string;
}

function convertArticleToNewsItem(article: MagazineArticle): NewsItem {
  const publishDate = new Date(article.publishedAt);
  const now = new Date();
  const diffMs = now.getTime() - publishDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let timestamp = '';
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      timestamp = `${diffMins}m ago`;
    } else {
      timestamp = `${diffHours}h ago`;
    }
  } else if (diffDays === 1) {
    timestamp = '1d ago';
  } else {
    timestamp = `${diffDays}d ago`;
  }

  return {
    id: article.slug,
    headline: article.title,
    timestamp,
    slug: article.slug,
  };
}

function getTickerItems(): NewsItem[] {
  const recentArticles = getRecentArticles(4);
  if (recentArticles.length === 0) {
    return [];
  }
  return recentArticles.map(convertArticleToNewsItem);
}

export default function Home2NewsTickerRail({
  items,
  accentColor = '#FFD700',
}: Home2NewsTickerRailProps) {
  const tickerItems = items ?? getTickerItems();
  const tickerItems = items ?? getTickerItems();

  if (tickerItems.length === 0) {
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
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
            No new stories in the last hour. Check back soon.
          </div>
        </div>
      </section>
    );
  }

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
              duration: tickerItems.length * 4 + 8,
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
            {[...tickerItems, ...tickerItems].map((item, idx) => (
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
