'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';

interface Event { id: string; title: string; date: string; sold: number; capacity: number; revenue: number; }

export default function PromoterDashboard() {
  const router = useRouter();
  const [events] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { authenticated?: boolean }) => {
        if (!d.authenticated) router.replace('/auth');
        else setLoading(false);
      })
      .catch(() => router.replace('/auth'));
  }, [router]);

  if (loading) return null;

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '32px 24px', fontFamily: "'Inter', sans-serif" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid rgba(255,149,0,0.2)', paddingBottom: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: '#FF9500', fontWeight: 900, letterSpacing: '0.2em' }}>PROMOTER HUB</div>
              <h1 style={{ fontSize: 32, margin: 0, fontFamily: "'Bebas Neue', Impact, sans-serif" }}>EVENT MANAGEMENT</h1>
            </div>
            <button style={{ background: '#FF9500', color: '#000', border: 'none', padding: '10px 20px', fontWeight: 900, borderRadius: 6, cursor: 'pointer' }}>+ CREATE EVENT</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
            <div style={{ background: 'rgba(255,149,0,0.05)', border: '1px solid rgba(255,149,0,0.2)', padding: 20, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>Total Ticket Revenue</div>
              <div style={{ fontSize: 28, color: '#FF9500', fontWeight: 900 }}>${events.reduce((acc, e) => acc + e.revenue, 0).toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.2)', padding: 20, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>Tickets Sold</div>
              <div style={{ fontSize: 28, color: '#00FFFF', fontWeight: 900 }}>{events.reduce((acc, e) => acc + e.sold, 0).toLocaleString()}</div>
            </div>
            <div style={{ background: 'rgba(170,45,255,0.05)', border: '1px solid rgba(170,45,255,0.2)', padding: 20, borderRadius: 8 }}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 8 }}>Active Campaigns</div>
              <div style={{ fontSize: 28, color: '#AA2DFF', fontWeight: 900 }}>{events.length}</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 24 }}>
            <h2 style={{ fontSize: 16, marginTop: 0, marginBottom: 16, color: '#fff' }}>Your Events</h2>
            {events.map(ev => (
              <div key={ev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900 }}>{ev.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Date: {ev.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#00FF88' }}>{ev.sold} / {ev.capacity} Sold</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>${ev.revenue.toLocaleString()}</div>
                </div>
                <div>
                  <Link href={`/promoter/events/${ev.id}`} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>MANAGE</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}