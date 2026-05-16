'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Home4SponsorToolsProps {
  title?: string;
}

const SPONSOR_TOOLS = [
  { label: 'Campaign Builder', icon: '🎨', href: '/sponsors/campaigns', desc: 'Create & launch campaigns', color: '#FFD700' },
  { label: 'Inventory Matrix', icon: '📊', href: '/sponsors/inventory', desc: 'Manage ad placements', color: '#FF2DAA' },
  { label: 'Analytics', icon: '📈', href: '/sponsors/analytics', desc: 'Track ROI & engagement', color: '#00FFFF' },
  { label: 'Premium Carousel', icon: '🎪', href: '/sponsors/carousel', desc: 'Featured sponsor rotations', color: '#AA2DFF' },
  { label: 'Deals & Offers', icon: '💼', href: '/sponsors/deals', desc: 'Manage promotional deals', color: '#00FF88' },
  { label: 'Performance', icon: '🎯', href: '/sponsors/performance', desc: 'Real-time metrics', color: '#FFD700' },
];

export default function Home4SponsorTools({ title = 'SPONSOR TOOLKIT' }: Home4SponsorToolsProps) {
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
        {SPONSOR_TOOLS.map((tool, i) => (
          <motion.div
            key={tool.href}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
          >
            <Link href={tool.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${tool.color}20`,
                  borderRadius: 10,
                  padding: '16px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `${tool.color}12`;
                  el.style.borderColor = tool.color + '40';
                  el.style.boxShadow = `0 0 12px ${tool.color}25`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.03)';
                  el.style.borderColor = tool.color + '20';
                  el.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: 24, display: 'block', marginBottom: 8 }}>{tool.icon}</span>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                  {tool.label}
                </div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.35)' }}>
                  {tool.desc}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
