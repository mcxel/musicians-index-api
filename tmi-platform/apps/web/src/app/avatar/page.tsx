'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import SectionTitle from '@/components/ui/SectionTitle';

const AVATAR_MODULES = [
  { href: '/avatar/create', emoji: '🧬', label: 'CREATE', sub: 'Build your bobblehead', accent: '#FF2DAA' },
  { href: '/avatar/editor', emoji: '✏️', label: 'EDITOR', sub: 'Customize appearance', accent: '#00FFFF' },
  { href: '/avatar/inventory', emoji: '🎒', label: 'INVENTORY', sub: 'Your owned items', accent: '#AA2DFF' },
  { href: '/avatar/shop', emoji: '🛍️', label: 'SHOP', sub: 'Buy props & clothing', accent: '#FFD700' },
  { href: '/avatar/emotes', emoji: '💃', label: 'EMOTES', sub: 'Dances & reactions', accent: '#FF2DAA' },
  { href: '/avatar/props', emoji: '🎤', label: 'PROPS', sub: 'Mics, instruments & more', accent: '#00FFFF' },
  { href: '/avatar/clothing', emoji: '👕', label: 'CLOTHING', sub: 'Fits, hats, shoes', accent: '#AA2DFF' },
  { href: '/avatar/backgrounds', emoji: '🌆', label: 'BACKGROUNDS', sub: 'Stage scenes', accent: '#FFD700' },
];

export default function AvatarHubPage() {
  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
          {/* Hero */}
          <div style={{ background: 'linear-gradient(160deg, #1a0528 0%, #050510 60%)', padding: '64px 32px 48px', borderBottom: '1px solid #AA2DFF33' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#AA2DFF', textTransform: 'uppercase', marginBottom: 12 }}>AVATAR SYSTEM</div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>AVATAR CENTER</h1>
              <p style={{ color: '#aaa', fontSize: 16, maxWidth: 520 }}>Create your animated bobblehead, outfit it with props and clothing, and show up on stage your way.</p>
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <Link href="/avatar/create" style={{ background: '#AA2DFF', color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: 2, padding: '12px 28px', borderRadius: 8, textDecoration: 'none' }}>CREATE AVATAR →</Link>
                <Link href="/avatar/shop" style={{ background: 'transparent', color: '#AA2DFF', fontWeight: 800, fontSize: 13, letterSpacing: 2, padding: '12px 28px', borderRadius: 8, border: '1px solid #AA2DFF', textDecoration: 'none' }}>SHOP</Link>
              </div>
            </motion.div>
          </div>

          <div style={{ padding: '48px 32px 0' }}>
            <SectionTitle title="AVATAR MODULES" accent="purple" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 18, marginTop: 24 }}>
              {AVATAR_MODULES.map((mod, i) => (
                <motion.div key={mod.href} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <Link href={mod.href} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#0a0a1a', border: `1px solid #1a1a2e`, borderTop: `2px solid ${mod.accent}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>{mod.emoji}</div>
                      <div style={{ color: mod.accent, fontWeight: 800, fontSize: 13, letterSpacing: 2, marginBottom: 6 }}>{mod.label}</div>
                      <div style={{ color: '#666', fontSize: 12 }}>{mod.sub}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
