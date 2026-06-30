'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const C = { bg: '#07071a', panel: 'rgba(12,20,50,.9)', border: '#1a1a3a', accent: '#00FFFF', fuchsia: '#FF2DAA', gold: '#FFD700', purple: '#AA2DFF', green: '#00FF88', text: '#fff', dim: '#666' };

interface Session { authenticated: boolean; user: { id: string; email: string; displayName?: string } | null; role: string; tier: string; }
interface PromotedEvent { id: string; name: string; artist: string; status: 'live' | 'upcoming' | 'ended'; ticketsSold: number; revenue: number; }

export default function PromoterProfilePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [events, setEvents] = useState<PromotedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with fetch from canonical /api/hq/promoter endpoint
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then(r => r.json())
      .then((d: Session) => { setSession(d); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ background: C.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.dim }}>Loading…</div>;

  const name = session?.user?.displayName ?? 'Promoter';
  const tier = session?.tier ?? 'PRO';

  const TIER_COLORS: Record<string, string> = { DIAMOND: '#00FFFF', GOLD: '#FFD700', PLATINUM: '#E5E4E2', SILVER: '#C0C0C0', RUBY: '#CD7F32', PRO: '#AA2DFF', FREE: '#666' };
  const tierColor = TIER_COLORS[tier] ?? '#666';

  const totalEvents = events.length;
  const totalTicketsSold = events.reduce((sum, e) => sum + e.ticketsSold, 0);
  const totalRevenue = events.reduce((sum, e) => sum + e.revenue, 0);

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #050815, #0d0d3a)', borderBottom: `1px solid ${C.border}`, padding: '36px 28px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 70% 50%, rgba(170,45,255,0.08) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: `linear-gradient(135deg, ${C.purple}, ${C.fuchsia})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, boxShadow: `0 0 24px ${C.purple}44`, flexShrink: 0 }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 9, letterSpacing: '0.35em', color: C.purple, fontWeight: 800, marginBottom: 4 }}>PROMOTER DASHBOARD</div>
              <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: 1 }}>{name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: tierColor, fontWeight: 700, letterSpacing: 2 }}>{tier} PROMOTER</span>
              </div>
            </div>
          </div>
          <Link href="/events/create" style={{ background: C.purple, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 22px', fontWeight: 700, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Create Event
          </Link>
        </div>
      </div>

      <div style={{ padding: '24px 24px', maxWidth: 1200, margin: '0 auto' }}>
        {/* Analytics Widgets */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 24 }}>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, marginBottom: 8 }}>EVENTS MANAGED</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.accent }}>{totalEvents}</div>
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, marginBottom: 8 }}>TICKETS SOLD</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.fuchsia }}>{totalTicketsSold.toLocaleString()}</div>
            </div>
            <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ fontSize: 11, color: C.dim, letterSpacing: 1.5, marginBottom: 8 }}>TOTAL REVENUE</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: C.green }}>${totalRevenue.toLocaleString()}</div>
            </div>
        </div>

        {/* Event Management Widget */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', color: C.dim, fontWeight: 700, marginBottom: 12 }}>EVENT MANAGEMENT</div>
          <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: C.dim, letterSpacing: 1 }}>EVENT</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: C.dim, letterSpacing: 1 }}>ARTIST</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, color: C.dim, letterSpacing: 1 }}>STATUS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>TICKETS SOLD</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>REVENUE</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 11, color: C.dim, letterSpacing: 1 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px 16px', textAlign: 'center', color: C.dim, fontSize: 12 }}>
                      No events found.
                    </td>
                  </tr>
                ) : (
                  events.map((event, index) => (
                    <tr key={event.id} style={{ borderBottom: index < events.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{event.name}</td>
                      <td style={{ padding: '14px 16px', color: C.dim }}>{event.artist}</td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          background: event.status === 'live' ? C.green + '22' : event.status === 'upcoming' ? C.gold + '22' : C.dim + '22',
                          color: event.status === 'live' ? C.green : event.status === 'upcoming' ? C.gold : C.dim,
                          padding: '4px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase'
                        }}>{event.status}</span>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace' }}>{event.ticketsSold.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right', fontFamily: 'monospace', color: C.green }}>${event.revenue.toLocaleString()}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <Link href={`/events/${event.id}/manage`} style={{ color: C.accent, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Manage</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}