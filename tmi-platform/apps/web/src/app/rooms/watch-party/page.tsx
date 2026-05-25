'use client';

import { useState } from 'react';
import Link from 'next/link';
import LobbyTheaterShell from '@/components/lobbies/LobbyTheaterShell';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';

// ── Venue options ─────────────────────────────────────────────────────────────

interface Venue {
  slug: string;
  name: string;
  genre: string;
  emoji: string;
  viewers: number;
  accentColor: string;
  status: 'live' | 'starting' | 'upcoming';
}

const VENUES: Venue[] = [
  { slug: 'watch-party',       name: 'THE MAIN STAGE',     genre: 'Hip-Hop · R&B',    emoji: '🎤', viewers: 1847, accentColor: '#FF2DAA', status: 'live' },
  { slug: 'listening-party',   name: 'LISTENING PARTY',    genre: 'New Releases',     emoji: '🎧', viewers: 612,  accentColor: '#AA2DFF', status: 'live' },
  { slug: 'world-premiere',    name: 'WORLD PREMIERE',     genre: 'Exclusive Drop',   emoji: '🌍', viewers: 3210, accentColor: '#FFD700', status: 'live' },
  { slug: 'live-concert',      name: 'LIVE CONCERT HALL',  genre: 'Soul · Gospel',    emoji: '🎶', viewers: 924,  accentColor: '#00C8FF', status: 'starting' },
  { slug: 'radio-station',     name: 'TMI RADIO',          genre: 'All Genres',       emoji: '📻', viewers: 410,  accentColor: '#FF9500', status: 'live' },
  { slug: 'world-dance-party', name: 'WORLD DANCE PARTY',  genre: 'EDM · Afrobeats',  emoji: '💃', viewers: 738,  accentColor: '#00E5C8', status: 'upcoming' },
];

const STATUS_CONFIG = {
  live:     { color: '#FF2DAA', label: '● LIVE' },
  starting: { color: '#FFD700', label: '⏳ STARTING' },
  upcoming: { color: '#555',    label: '○ UPCOMING' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function WatchPartyPage() {
  const [activeSlug, setActiveSlug] = useState<string>('watch-party');
  const activeVenue = VENUES.find(v => v.slug === activeSlug) ?? VENUES[0]!;

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter',sans-serif" }}>

          {/* ── HEADER ── */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(255,45,170,0.06) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(255,45,170,0.12)',
            padding: '20px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#FF2DAA', fontWeight: 900, marginBottom: 4, textTransform: 'uppercase' }}>
                LIVE NOW
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(20px,3vw,30px)', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.06em', color: '#FF2DAA' }}>
                WATCH PARTY — {activeVenue.name}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,45,170,0.1)', border: '1px solid rgba(255,45,170,0.3)',
                padding: '5px 14px', fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', color: '#FF2DAA',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FF2DAA', boxShadow: '0 0 8px #FF2DAA', display: 'inline-block' }} />
                {activeVenue.viewers.toLocaleString()} WATCHING
              </div>
              <Link href="/rooms" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.1em' }}>← ALL ROOMS</Link>
            </div>
          </div>

          {/* ── VENUE PICKER ── */}
          <div style={{
            background: 'rgba(0,0,0,0.4)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            padding: '0 32px',
            overflowX: 'auto',
          }}>
            <div style={{ display: 'flex', gap: 0, minWidth: 'max-content' }}>
              {VENUES.map(v => {
                const sc = STATUS_CONFIG[v.status];
                const isActive = v.slug === activeSlug;
                return (
                  <button
                    key={v.slug}
                    type="button"
                    onClick={() => setActiveSlug(v.slug)}
                    style={{
                      background: isActive ? `${v.accentColor}12` : 'transparent',
                      border: 'none',
                      borderBottom: isActive ? `2px solid ${v.accentColor}` : '2px solid transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.4)',
                      padding: '12px 20px',
                      cursor: 'pointer',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                      transition: 'all 0.2s',
                      minWidth: 120,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{v.emoji}</span>
                    <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{v.name}</span>
                    <span style={{ fontSize: 7, color: sc.color, fontWeight: 900, letterSpacing: '0.12em' }}>{sc.label}</span>
                    <span style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)' }}>{v.viewers >= 1000 ? `${(v.viewers / 1000).toFixed(1)}k` : v.viewers} viewers</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── THEATER SHELL ── */}
          <div style={{ position: 'relative' }}>
            <LobbyTheaterShell slug={activeSlug} mode="room" />
          </div>

          {/* ── GENRE / EVENT QUICK LINKS ── */}
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.01)',
          }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.35)', marginBottom: 14, textTransform: 'uppercase' }}>
              MORE EVENTS
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { href: '/events/game-night',    label: '🎮 GAME NIGHT',      color: '#FFD700' },
                { href: '/rooms/cypher',         label: '🎤 CYPHER ARENA',    color: '#AA2DFF' },
                { href: '/rooms/live-concert',   label: '🎶 LIVE CONCERT',    color: '#FF2DAA' },
                { href: '/challenges/create',    label: '⚔️ CHALLENGE SONG',  color: '#00C8FF' },
                { href: '/rooms/world-premiere', label: '🌍 WORLD PREMIERE',  color: '#FFD700' },
                { href: '/events',               label: '📅 ALL EVENTS',      color: 'rgba(255,255,255,0.3)' },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  border: `1px solid ${l.color}33`,
                  background: `${l.color}08`,
                  color: l.color,
                  padding: '7px 14px', fontSize: 8, fontWeight: 900,
                  letterSpacing: '0.12em', textDecoration: 'none', textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
