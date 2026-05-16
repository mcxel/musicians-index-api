'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Home2MonetizationRailProps {
  title?: string;
}

const MONETIZATION_MODULES = [
  { label: 'Earnings Dashboard', icon: '💰', href: '/earnings', color: '#00FF88', desc: 'Track tips, fan club, beat royalties' },
  { label: 'Wallet & Payouts', icon: '🏦', href: '/wallet', color: '#00FFFF', desc: 'Manage funds and withdrawals' },
  { label: 'Season Pass', icon: '👑', href: '/season-pass', color: '#FFD700', desc: 'Exclusive rewards & bonuses' },
  { label: 'Sponsor Deals', icon: '💼', href: '/sponsors', color: '#FF2DAA', desc: 'Featured brand partnerships' },
  { label: 'Marketplace', icon: '🛍️', href: '/store', color: '#AA2DFF', desc: 'Shop beats, merch, credits' },
];

export default function Home2MonetizationRail({ title = 'MONETIZATION HUB' }: Home2MonetizationRailProps) {
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
        {MONETIZATION_MODULES.map((mod, i) => (
          <motion.div
            key={mod.href}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link href={mod.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${mod.color}20`,
                  borderRadius: 10,
                  padding: '16px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `${mod.color}12`;
                  el.style.borderColor = mod.color + '40';
                  el.style.boxShadow = `0 0 12px ${mod.color}25`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.02)';
                  el.style.borderColor = mod.color + '20';
                  el.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{mod.icon}</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                  {mod.label}
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
                  {mod.desc}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
