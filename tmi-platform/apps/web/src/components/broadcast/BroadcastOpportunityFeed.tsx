"use client";

import { useEffect, useState } from 'react';

// BroadcastOpportunityFeed — fills idle wall space with real platform
// opportunities (Rule 12 tier 2: internal platform promotion). Every entry
// routes to a real destination — no fake events, no fabricated counts.
const OPPORTUNITIES: Array<{ icon: string; label: string; desc: string; href: string }> = [
  { icon: '🎤', label: 'Go Live',              desc: 'Start a broadcast and claim the wall',      href: '/live/go' },
  { icon: '⚔️', label: 'Enter a Battle',        desc: 'Head-to-head on the main stage',            href: '/battles' },
  { icon: '🎵', label: 'Submit Your Music',     desc: 'Get into rotation and editorial review',    href: '/submit' },
  { icon: '📰', label: 'Read the Magazine',     desc: 'News, battles, and editorials',             href: '/home/2' },
  { icon: '🎥', label: 'Browse Live Rooms',     desc: 'See every open room in the lobby',          href: '/live/lobby' },
  { icon: '🏆', label: 'Check the Rankings',    desc: 'Who holds the crown right now',             href: '/rankings' },
  { icon: '🤝', label: 'Sponsor an Artist',     desc: 'Fund prizes and back rising talent',        href: '/sponsors/advertise' },
];

export function BroadcastOpportunityFeed({ rotateMs = 6000 }: { rotateMs?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % OPPORTUNITIES.length);
    }, rotateMs);
    return () => window.clearInterval(timer);
  }, [rotateMs]);

  const current = OPPORTUNITIES[index]!;

  return (
    <a
      href={current.href}
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        borderRadius: 12,
        border: '1px solid rgba(0,255,255,0.35)',
        background: 'linear-gradient(120deg, rgba(0,255,255,0.08), rgba(170,45,255,0.08))',
        padding: '12px 14px',
      }}
    >
      <span style={{ fontSize: 22 }}>{current.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', color: 'rgba(0,255,255,0.8)', marginBottom: 2 }}>
          OPPORTUNITY
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{current.label}</div>
        <div style={{ fontSize: 11, color: 'rgba(235,235,255,0.6)' }}>{current.desc}</div>
      </div>
      <span style={{ color: '#00FFFF', fontSize: 16 }}>›</span>
    </a>
  );
}

export default BroadcastOpportunityFeed;
