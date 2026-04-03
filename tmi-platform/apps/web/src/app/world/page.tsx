"use client";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/layout/HUDFrame';
import FooterHUD from '@/components/layout/FooterHUD';

const PORTALS = [
  {
    id: 'map',
    label: 'WORLD MAP',
    desc: 'Explore all zones in the TMI universe',
    icon: '🗺️',
    color: '#00FFFF',
    href: '/world/map',
    online: 1420,
  },
  {
    id: 'dance-party',
    label: 'WORLD DANCE PARTY',
    desc: '24/7 global dance floor — anyone can join',
    icon: '💃',
    color: '#FF2DAA',
    href: '/world/dance-party',
    online: 384,
  },
  {
    id: 'concert',
    label: 'MAIN CONCERT HALL',
    desc: 'Live performances from headliner artists',
    icon: '🎤',
    color: '#AA2DFF',
    href: '/world/concert',
    online: 892,
  },
  {
    id: 'premiere',
    label: 'WORLD PREMIERE',
    desc: 'Exclusive drop events, NFT reveals, and releases',
    icon: '🌟',
    color: '#FFD700',
    href: '/world/premiere',
    online: 217,
  },
];

export default function WorldPage() {
  const router = useRouter();
  const totalOnline = PORTALS.reduce((n, p) => n + p.online, 0);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', padding: '28px 20px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{ fontSize: 11, letterSpacing: 4, color: '#333', marginBottom: 8 }}
            >
              ● {totalOnline.toLocaleString()} PEOPLE IN THE WORLD RIGHT NOW
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: -24 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 36, fontWeight: 900, letterSpacing: 6, color: '#fff', margin: 0 }}
            >
              THE WORLD
            </motion.h1>
            <p style={{ color: '#555', fontSize: 14, marginTop: 8, letterSpacing: 2 }}>
              CHOOSE YOUR DESTINATION
            </p>
          </div>

          {/* Portal grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 20, maxWidth: 860, margin: '0 auto 40px',
          }}>
            {PORTALS.map((portal, i) => (
              <motion.div
                key={portal.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.04, y: -6 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(portal.href)}
                style={{
                  background: `linear-gradient(145deg, ${portal.color}18, #050510)`,
                  border: `1px solid ${portal.color}44`,
                  borderRadius: 16, padding: 24, cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Glow corner */}
                <div style={{
                  position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                  borderRadius: '50%', background: portal.color, opacity: 0.08, filter: 'blur(20px)',
                }} />

                <div style={{ fontSize: 40, marginBottom: 14 }}>{portal.icon}</div>
                <h3 style={{ color: portal.color, fontSize: 16, fontWeight: 800, letterSpacing: 3, margin: '0 0 8px' }}>
                  {portal.label}
                </h3>
                <p style={{ color: '#555', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>
                  {portal.desc}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#333', fontSize: 11 }}>
                    <span style={{ color: '#00FF88' }}>●</span> {portal.online.toLocaleString()} online
                  </span>
                  <span style={{ color: portal.color, fontSize: 12, fontWeight: 700, letterSpacing: 2 }}>
                    ENTER →
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom nav */}
          <div style={{ textAlign: 'center', display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'ROOMS', href: '/rooms/lobby', color: '#554' },
              { label: 'GAMES', href: '/games', color: '#554' },
              { label: 'STORE', href: '/store', color: '#554' },
              { label: 'MY BUBBLE', href: '/bubble-builder', color: '#554' },
            ].map(item => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => router.push(item.href)}
                style={{
                  padding: '8px 20px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid #1a1a1a', borderRadius: 8, color: '#444',
                  fontSize: 11, letterSpacing: 2, cursor: 'pointer',
                }}
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
