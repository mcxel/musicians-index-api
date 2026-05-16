'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Home1DiscoveryBeltProps {
  title?: string;
}

const GENRES = [
  { label: 'Hip Hop', href: '/genres/hip-hop', icon: '🎤', color: '#FF2DAA', trending: true },
  { label: 'Rock', href: '/genres/rock', icon: '🎸', color: '#00FFFF', trending: false },
  { label: 'Pop', href: '/genres/pop', icon: '⭐', color: '#FFD700', trending: true },
  { label: 'Jazz', href: '/genres/jazz', icon: '🎷', color: '#AA2DFF', trending: false },
  { label: 'R&B', href: '/genres/rnb', icon: '🎵', color: '#00FF88', trending: false },
  { label: 'Electronic', href: '/genres/electronic', icon: '🎛️', color: '#00FFFF', trending: true },
];

export default function Home1DiscoveryBelt({ title = 'DISCOVER BY GENRE' }: Home1DiscoveryBeltProps) {
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {GENRES.map((genre, i) => (
          <motion.div
            key={genre.href}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
          >
            <Link href={genre.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${genre.color}20`,
                  borderRadius: 10,
                  padding: '16px 12px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `${genre.color}15`;
                  el.style.borderColor = genre.color + '40';
                  el.style.boxShadow = `0 0 12px ${genre.color}30`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.02)';
                  el.style.borderColor = genre.color + '20';
                  el.style.boxShadow = 'none';
                }}
              >
                {genre.trending && (
                  <div
                    style={{
                      position: 'absolute',
                      top: -8,
                      right: 8,
                      fontSize: 9,
                      color: '#FFD700',
                      fontWeight: 700,
                      background: 'rgba(255,215,0,0.2)',
                      padding: '2px 6px',
                      borderRadius: 10,
                    }}
                  >
                    🔥
                  </div>
                )}
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{genre.icon}</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: genre.color }}>
                  {genre.label}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
