'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Home1CoverCompressionLayer() {
  const navItems = [
    { label: 'Read Magazine', href: '/magazine', icon: '📰' },
    { label: 'Live World', href: '/live', icon: '🔴' },
    { label: 'Play Games', href: '/games', icon: '🎮' },
    { label: 'Marketplace', href: '/store', icon: '🛍️' },
    { label: 'About Us', href: '/about', icon: 'ℹ️' },
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(180deg, #1a0528 0%, #050510 100%)',
        borderBottom: '1px solid rgba(255,215,0,0.2)',
        padding: '24px 32px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#FFD700', fontWeight: 800, marginBottom: 16 }}>
          TMI HOME
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {navItems.map((item, i) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={item.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 16px',
                  borderRadius: 20,
                  background: 'rgba(255,215,0,0.08)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  color: '#FFD700',
                  textDecoration: 'none',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  const el = e.target as HTMLElement;
                  el.style.background = 'rgba(255,215,0,0.15)';
                  el.style.boxShadow = '0 0 10px rgba(255,215,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  const el = e.target as HTMLElement;
                  el.style.background = 'rgba(255,215,0,0.08)';
                  el.style.boxShadow = 'none';
                }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
