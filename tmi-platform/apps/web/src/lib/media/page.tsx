'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface VenueBooking {
  id: string;
  artistName: string;
  genre: string;
  date: string;
  time: string;
  offerFee: number;
  status: BookingStatus;
  notes: string;
}

const VENUE_BOOKINGS: VenueBooking[] = [
  { id: 'vb1', artistName: 'Lani Flame', genre: 'R&B', date: '2026-06-07', time: '10:00 PM', offerFee: 1500, status: 'pending', notes: 'Headline slot request' },
  { id: 'vb2', artistName: 'Big Ace', genre: 'Hip-Hop', date: '2026-06-14', time: '9:30 PM', offerFee: 3000, status: 'confirmed', notes: 'Sold out expected' },
  { id: 'vb3', artistName: 'DJ Blend', genre: 'EDM', date: '2026-06-21', time: '11:00 PM', offerFee: 1200, status: 'confirmed', notes: 'Late night set' },
];

export default function VenueBookingPage() {
  const [bookings, setBookings] = useState<VenueBooking[]>(VENUE_BOOKINGS);
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all');

  const visible = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  function updateStatus(id: string, status: BookingStatus) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  function generateTickets(bookingId: string, artistName: string) {
    window.open(`/api/pdf/generate-tickets?bookingId=${bookingId}&artist=${encodeURIComponent(artistName)}&format=thermal`, '_blank');
  }

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter',sans-serif", paddingBottom: 80 }}>
          <div style={{
            background: 'linear-gradient(180deg, rgba(255,149,0,0.06) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(255,149,0,0.12)',
            padding: '24px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#FF9500', fontWeight: 900, marginBottom: 4, textTransform: 'uppercase' }}>
                VENUE HUB
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(20px,3vw,30px)', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.06em', color: '#FF9500' }}>
                BOOKING & TICKETING
              </h1>
            </div>
            <Link href="/hub/venue" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.1em' }}>← VENUE HUB</Link>
          </div>

          <div style={{ padding: '24px 32px 0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16, marginBottom: 24 }}>
              <div style={{ border: '1px solid rgba(255,149,0,0.2)', background: 'rgba(255,149,0,0.05)', padding: '16px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#FF9500', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.04em' }}>
                  {bookings.filter(b => b.status === 'pending').length}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>Pending Requests</div>
              </div>
              <div style={{ border: '1px solid rgba(0,200,255,0.2)', background: 'rgba(0,200,255,0.05)', padding: '16px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#00C8FF', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.04em' }}>
                  {bookings.filter(b => b.status === 'confirmed').length}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>Confirmed Shows</div>
              </div>
              <div style={{ border: '1px solid rgba(170,45,255,0.2)', background: 'rgba(170,45,255,0.05)', padding: '16px 20px', borderRadius: 8 }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#AA2DFF', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.04em' }}>
                  ${bookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + b.offerFee, 0).toLocaleString()}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 4 }}>Committed Payouts</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? '#FF9500' : 'transparent',
                    border: `1px solid ${filter === f ? '#FF9500' : 'rgba(255,149,0,0.3)'}`,
                    color: filter === f ? '#050510' : 'rgba(255,255,255,0.6)',
                    padding: '6px 16px', fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase', borderRadius: 4
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {visible.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>No bookings found.</div>
              )}
              {visible.map(b => (
                <div key={b.id} style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '16px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{b.artistName}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                        <span style={{ color: '#FF9500', fontWeight: 700 }}>{b.genre}</span> &nbsp;|&nbsp; {b.date} @ {b.time}
                      </div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{b.notes}</div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <div style={{ fontSize: 20, fontWeight: 900, color: '#FF9500', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.04em' }}>
                        ${b.offerFee.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>Artist Fee</div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 900, color: b.status === 'confirmed' ? '#00C8FF' : b.status === 'pending' ? '#FFD700' : '#888', letterSpacing: '0.1em', textTransform: 'uppercase', marginRight: 'auto' }}>
                      STATUS: {b.status}
                    </div>
                    
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ background: '#00C8FF', color: '#000', border: 'none', padding: '6px 14px', fontSize: 10, fontWeight: 900, borderRadius: 4, cursor: 'pointer' }}>APPROVE</button>
                        <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ background: 'transparent', color: '#FF4444', border: '1px solid #FF4444', padding: '6px 14px', fontSize: 10, fontWeight: 900, borderRadius: 4, cursor: 'pointer' }}>DECLINE</button>
                      </>
                    )}
                    
                    {b.status === 'confirmed' && (
                      <>
                        <button onClick={() => generateTickets(b.id, b.artistName)} style={{ background: '#FF2DAA', color: '#fff', border: 'none', padding: '6px 14px', fontSize: 10, fontWeight: 900, borderRadius: 4, cursor: 'pointer' }}>🖨️ PRINT TICKETS</button>
                        <button onClick={() => updateStatus(b.id, 'completed')} style={{ background: '#00FF88', color: '#000', border: 'none', padding: '6px 14px', fontSize: 10, fontWeight: 900, borderRadius: 4, cursor: 'pointer' }}>MARK PAID</button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}