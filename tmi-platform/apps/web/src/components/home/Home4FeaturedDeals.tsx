'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Home4FeaturedDealsProps {
  title?: string;
}

const FEATURED_DEALS = [
  { name: 'Summer Music Festival 2026', budget: '$50K', icon: '🎪', color: '#FFD700', audience: '500K+ reach' },
  { name: 'Neon Nights Music Series', budget: '$25K', icon: '🎧', color: '#00FFFF', audience: '200K+ reach' },
  { name: 'Urban Underground Challenge', budget: '$15K', icon: '🏆', color: '#FF2DAA', audience: '150K+ reach' },
];

export default function Home4FeaturedDeals({ title = 'FEATURED DEALS' }: Home4FeaturedDealsProps) {
  return (
    <div
      style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '40px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.4)', fontWeight: 800, marginBottom: 24 }}>
        {title}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {FEATURED_DEALS.map((deal, i) => (
          <motion.div
            key={deal.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href="/sponsors/deals"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                background: 'rgba(255,255,255,0.02)',
                border: `1px solid ${deal.color}20`,
                borderRadius: 10,
                padding: '16px 18px',
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = `${deal.color}12`;
                el.style.borderColor = deal.color + '40';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = 'rgba(255,255,255,0.02)';
                el.style.borderColor = deal.color + '20';
              }}
            >
              <span style={{ fontSize: 22 }}>{deal.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                  {deal.name}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                  {deal.audience}
                </div>
              </div>
              <div
                style={{
                  textAlign: 'right',
                  fontSize: 11,
                  fontWeight: 800,
                  color: deal.color,
                }}
              >
                {deal.budget}
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <Link
        href="/sponsors/deals"
        style={{
          display: 'inline-block',
          marginTop: 16,
          fontSize: 9,
          fontWeight: 800,
          color: '#FFD700',
          textDecoration: 'none',
        }}
      >
        See All Opportunities →
      </Link>
    </div>
  );
}
