'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import SectionTitle from '@/components/ui/SectionTitle';

type Event = {
  id: string;
  title: string;
  slug?: string | null;
  venue?: string | null;
  city?: string | null;
  startDate?: string | null;
  type?: string | null;
  ticketUrl?: string | null;
  price?: number | null;
  soldOut?: boolean;
};

const STUB_EVENTS: Event[] = [
  { id: '1', title: 'TMI Cypher Arena — Season Opener', venue: 'Virtual Stage', city: 'Online', startDate: '2026-04-12', type: 'CYPHER', price: 0 },
  { id: '2', title: 'Crown Night Live', venue: 'The Main Stage', city: 'Atlanta, GA', startDate: '2026-04-20', type: 'LIVE SHOW', price: 25 },
  { id: '3', title: 'Stream & Win Radio Launch Party', venue: 'Club TMI', city: 'Los Angeles, CA', startDate: '2026-05-01', type: 'PARTY', price: 15 },
  { id: '4', title: 'Producer Summit 2026', venue: 'Convention Center', city: 'New York, NY', startDate: '2026-05-14', type: 'SUMMIT', price: 75 },
  { id: '5', title: 'Freestyle Friday — Open Cypher', venue: 'Virtual Stage', city: 'Online', startDate: '2026-04-17', type: 'CYPHER', price: 0 },
  { id: '6', title: 'TMI Awards Show', venue: 'Grand Arena', city: 'Miami, FL', startDate: '2026-06-20', type: 'AWARDS', price: 50, soldOut: true },
];

const TYPE_COLORS: Record<string, string> = {
  CYPHER: '#AA2DFF', 'LIVE SHOW': '#FF2DAA', PARTY: '#00FFFF', SUMMIT: '#FFD700', AWARDS: '#FF2DAA',
};

const TYPE_FILTERS = ['ALL', 'CYPHER', 'LIVE SHOW', 'PARTY', 'SUMMIT', 'AWARDS'];

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>(STUB_EVENTS);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/homepage/events?limit=24')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length) setEvents(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? events : events.filter((e) => e.type === filter);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }}>
          {/* Hero */}
          <div style={{ background: 'linear-gradient(160deg, #0a0020 0%, #050510 60%)', padding: '64px 32px 48px', borderBottom: '1px solid #AA2DFF33' }}>
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div style={{ fontSize: 11, letterSpacing: 4, color: '#AA2DFF', textTransform: 'uppercase', marginBottom: 12 }}>EVENTS &amp; SHOWS</div>
              <h1 style={{ fontSize: 52, fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>EVENTS</h1>
              <p style={{ color: '#aaa', fontSize: 16, maxWidth: 480 }}>Cyphers, live shows, summits, and award nights — find your next event.</p>
            </motion.div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 32 }}>
              {TYPE_FILTERS.map((t) => (
                <button key={t} onClick={() => setFilter(t)} style={{ padding: '6px 16px', borderRadius: 20, border: `1px solid ${filter === t ? '#AA2DFF' : '#333'}`, background: filter === t ? '#AA2DFF22' : 'transparent', color: filter === t ? '#AA2DFF' : '#888', fontSize: 11, letterSpacing: 2, cursor: 'pointer', fontWeight: 700 }}>{t}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: '48px 32px 0' }}>
            <SectionTitle title="UPCOMING EVENTS" accent="purple" />
            {loading && <div style={{ color: '#555', padding: '40px 0' }}>Loading events…</div>}
            <AnimatePresence mode="popLayout">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
                {filtered.map((ev, i) => {
                  const accent = TYPE_COLORS[ev.type ?? ''] ?? '#00FFFF';
                  const date = ev.startDate ? new Date(ev.startDate) : null;
                  return (
                    <motion.div key={ev.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ delay: i * 0.04 }} style={{ background: '#0a0a1a', border: `1px solid #1a1a2e`, borderLeft: `3px solid ${accent}`, borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
                      {/* Date block */}
                      <div style={{ minWidth: 56, textAlign: 'center', background: '#0d0d20', borderRadius: 8, padding: '8px 6px' }}>
                        <div style={{ fontSize: 20, fontWeight: 900, color: accent, lineHeight: 1 }}>{date ? date.getDate() : '--'}</div>
                        <div style={{ fontSize: 10, color: '#888', letterSpacing: 1, textTransform: 'uppercase' }}>{date ? date.toLocaleString('default', { month: 'short' }) : ''}</div>
                      </div>
                      {/* Info */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 10, letterSpacing: 2, color: accent, marginBottom: 4, fontWeight: 700 }}>{ev.type}</div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>{ev.title}</div>
                        <div style={{ color: '#666', fontSize: 13 }}>{[ev.venue, ev.city].filter(Boolean).join(' · ')}</div>
                      </div>
                      {/* Ticket */}
                      <div style={{ textAlign: 'right' }}>
                        {ev.soldOut ? (
                          <div style={{ color: '#555', fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>SOLD OUT</div>
                        ) : (
                          <>
                            <div style={{ color: '#fff', fontWeight: 900, fontSize: 18, marginBottom: 8 }}>{ev.price === 0 ? 'FREE' : ev.price ? `$${ev.price}` : 'TBA'}</div>
                            <Link href={ev.ticketUrl ?? `/events/${ev.id}`} style={{ background: accent, color: '#000', fontWeight: 800, fontSize: 11, letterSpacing: 2, padding: '8px 16px', borderRadius: 6, textDecoration: 'none' }}>TICKETS</Link>
                          </>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
