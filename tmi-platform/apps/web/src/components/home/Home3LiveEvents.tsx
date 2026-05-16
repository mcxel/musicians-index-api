'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Home3LiveEventsProps {
  title?: string;
}

const LIVE_EVENTS = [
  { title: 'World Premieres', desc: 'Brand new releases going live', icon: '🌍', href: '/premieres', color: '#FF2DAA' },
  { title: 'Event Calendar', desc: 'Schedule of upcoming performances', icon: '📅', href: '/calendar', color: '#FFD700' },
  { title: 'Cypher Arena', desc: 'Live freestyle battles (Mon 8PM)', icon: '🎤', href: '/cypher/arena', color: '#AA2DFF' },
  { title: 'Stream & Win', desc: 'Compete for prizes in real-time', icon: '🏆', href: '/stream-rewards', color: '#00FF88' },
];

export default function Home3LiveEvents({ title = 'LIVE & EVENTS' }: Home3LiveEventsProps) {
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
        {LIVE_EVENTS.map((event, i) => (
          <motion.div
            key={event.href}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={event.href} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${event.color}25`,
                  borderRadius: 10,
                  padding: '20px 18px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.background = `${event.color}12`;
                  el.style.borderColor = event.color + '40';
                  el.style.boxShadow = `0 0 15px ${event.color}20`;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.background = 'rgba(255,255,255,0.03)';
                  el.style.borderColor = event.color + '25';
                  el.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: 28, display: 'block', marginBottom: 10 }}>{event.icon}</span>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  {event.title}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 12 }}>
                  {event.desc}
                </div>
                <div
                  style={{
                    fontSize: 8,
                    fontWeight: 800,
                    color: event.color,
                    letterSpacing: '0.1em',
                  }}
                >
                  EXPLORE →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
