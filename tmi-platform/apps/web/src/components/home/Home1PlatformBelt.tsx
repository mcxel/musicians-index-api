'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Home1PlatformBeltProps {
  title?: string;
}

const PLATFORM_LINKS = [
  { label: 'Store', icon: '🛍️', href: '/store', description: 'Buy beats, credits, merch', color: '#FF2DAA' },
  { label: 'Booking', icon: '🎭', href: '/booking', description: 'Book artists, venues, bands', color: '#00FFFF' },
  { label: 'Achievements', icon: '🏆', href: '/achievements', description: 'Badges, milestones, rewards', color: '#FFD700' },
  { label: 'Sponsors', icon: '💼', href: '/sponsors', description: 'Featured campaigns & deals', color: '#AA2DFF' },
];

export default function Home1PlatformBelt({ title = 'PLATFORM' }: Home1PlatformBeltProps) {
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {PLATFORM_LINKS.map((link, i) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={link.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${link.color}25`,
                  borderRadius: 10,
                  padding: '18px 16px',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `${link.color}12`;
                  el.style.borderColor = link.color + '40';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.03)';
                  el.style.borderColor = link.color + '25';
                }}
              >
                <span style={{ fontSize: 24 }}>{link.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    {link.label}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
                    {link.description}
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
