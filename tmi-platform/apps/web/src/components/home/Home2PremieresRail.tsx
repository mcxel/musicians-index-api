'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Home2PremieresRailProps {
  title?: string;
}

const SAMPLE_PREMIERES = [
  { title: 'New Album: WaveTek — "Neon Nights Vol. 4"', date: 'April 28, 2026', color: '#00FFFF', icon: '🎵' },
  { title: 'Documentary Premiere: The Rise of Afrobeats on TMI', date: 'May 5, 2026', color: '#00FF88', icon: '🎬' },
  { title: 'Live: Electronic Festival Showcase', date: 'May 12, 2026', color: '#AA2DFF', icon: '🎧' },
];

export default function Home2PremieresRail({ title = 'PREMIERES' }: Home2PremieresRailProps) {
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
        {SAMPLE_PREMIERES.map((premiere, i) => (
          <motion.div
            key={premiere.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              href="/premieres"
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
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 3 }}>
                  {premiere.title}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                  {premiere.date}
                </div>
              </div>
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: premiere.color,
                  background: `${premiere.color}18`,
                  padding: '4px 10px',
                  borderRadius: 4,
                }}
              >
                WATCH
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <Link
        href="/premieres"
        style={{
          display: 'inline-block',
          marginTop: 16,
          fontSize: 9,
          fontWeight: 800,
          color: '#FF2DAA',
          textDecoration: 'none',
        }}
      >
        See Calendar →
      </Link>
    </div>
  );
}
