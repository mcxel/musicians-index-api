'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import { hostVoicePersonalityEngine } from '@/lib/hosts/HostVoicePersonalityEngine';
import FooterHUD from '@/components/hud/FooterHUD';

// ── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

interface BookingRequest {
  id: string;
  venueName: string;
  city: string;
  date: string;
  time: string;
  fee: number;
  status: BookingStatus;
  contact: string;
  notes: string;
  isVirtual?: boolean;
}

interface EarningRow {
  month: string;
  shows: number;
  gross: number;
}

// ── Static seed data ──────────────────────────────────────────────────────────

const BOOKINGS: BookingRequest[] = [
  { id: 'b1', venueName: 'CLUB APEX ATL',    city: 'Atlanta, GA',     date: '2026-06-07', time: '10:00 PM', fee: 1200, status: 'confirmed',  contact: 'apex@bookings.io',   notes: '90-min set. PA included.', isVirtual: false },
  { id: 'b2', venueName: 'THE SUMMIT NYC',   city: 'New York, NY',    date: '2026-06-14', time: '9:30 PM',  fee: 2500, status: 'pending',    contact: 'summit@venues.com',  notes: 'Needs setlist by June 1.', isVirtual: false },
  { id: 'b3', venueName: 'TMI VIRTUAL ARENA',city: 'Global WebRTC',   date: '2026-06-21', time: '11:00 PM', fee: 900,  status: 'confirmed',  contact: 'live@tmi.com',       notes: 'Virtual stage. Requires hardware check.', isVirtual: true },
  { id: 'b4', venueName: 'FREQUENCY LA',     city: 'Los Angeles, CA', date: '2026-05-31', time: '8:00 PM',  fee: 1800, status: 'completed',  contact: 'freq@laevents.com',  notes: 'Paid. Receipt sent.', isVirtual: false },
  { id: 'b5', venueName: 'CYPHER HALL MIA',  city: 'Miami, FL',       date: '2026-05-18', time: '9:00 PM',  fee: 600,  status: 'cancelled',  contact: 'cypher@miami.com',   notes: 'Venue closed due to flood.', isVirtual: false },
  { id: 'b6', venueName: 'PALACE STAGE HOU', city: 'Houston, TX',     date: '2026-07-04', time: '7:30 PM',  fee: 3200, status: 'pending',    contact: 'palace@houston.io',  notes: 'Holiday weekend — premium slot.', isVirtual: false },
];

const EARNINGS: EarningRow[] = [
  { month: 'MAR 2026', shows: 2, gross: 2100 },
  { month: 'APR 2026', shows: 3, gross: 3400 },
  { month: 'MAY 2026', shows: 4, gross: 4200 },
];

const STATUS_CONFIG: Record<BookingStatus, { color: string; label: string }> = {
  pending:   { color: '#FFD700', label: 'PENDING' },
  confirmed: { color: '#00C8FF', label: 'CONFIRMED' },
  cancelled: { color: '#FF4444', label: 'CANCELLED' },
  completed: { color: '#00C896', label: 'PAID ✓' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function ArtistBookingPage() {
  const [bookings, setBookings]   = useState<BookingRequest[]>(BOOKINGS);
  const [filter, setFilter]       = useState<BookingStatus | 'all'>('all');
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [camStream, setCamStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // New booking form state
  const [form, setForm] = useState({ venueName: '', city: '', date: '', time: '', fee: '', contact: '', notes: '' });

  const visible = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    totalFee:  bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + b.fee, 0),
  };

  function updateStatus(id: string, status: BookingStatus) {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  async function testWebRTC() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCamStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      const line = hostVoicePersonalityEngine.generateLine('system-host', 'contestant-enter', { name: 'Performer' });
      console.log(`[HOST]: ${line.text}`);
    } catch (err) {
      console.error("WebRTC Capture Error:", err);
      alert("Camera/Mic access denied. Check your WebKit/browser permissions.");
    }
  }

  function stopWebRTC() {
    if (camStream) {
      camStream.getTracks().forEach(t => t.stop());
      setCamStream(null);
    }
  }

  function generateVenueTickets(bookingId: string, venueName: string) {
    // Pipeline trigger for physical thermal/PDF ticket generation via Tmi Pdf's Folder logic
    window.open(`/api/pdf/generate-tickets?bookingId=${bookingId}&venue=${encodeURIComponent(venueName)}&format=thermal`, '_blank');
  }

  function handleSubmit() {
    if (!form.venueName || !form.date) return;
    const entry: BookingRequest = {
      id: `b${Date.now()}`,
      venueName: form.venueName,
      city: form.city,
      date: form.date,
      time: form.time || '9:00 PM',
      fee: parseFloat(form.fee) || 0,
      status: 'pending',
      contact: form.contact,
      notes: form.notes,
    };
    setBookings(prev => [entry, ...prev]);
    setForm({ venueName: '', city: '', date: '', time: '', fee: '', contact: '', notes: '' });
    setShowForm(false);
  }

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter',sans-serif", paddingBottom: 80 }}>

          {/* ── HEADER ── */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(0,200,255,0.06) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(0,200,255,0.12)',
            padding: '24px 32px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 8, letterSpacing: '0.3em', color: '#00C8FF', fontWeight: 900, marginBottom: 4, textTransform: 'uppercase' }}>
                ARTIST HUB
              </div>
              <h1 style={{ margin: 0, fontSize: 'clamp(20px,3vw,30px)', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.06em', color: '#00C8FF' }}>
                BOOKING DASHBOARD
              </h1>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <button type="button" onClick={() => setShowForm(v => !v)} style={{
                background: showForm ? 'transparent' : '#00C8FF',
                border: '1px solid #00C8FF',
                color: showForm ? '#00C8FF' : '#050510',
                padding: '8px 18px', fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', cursor: 'pointer', textTransform: 'uppercase',
              }}>
                {showForm ? '✕ CANCEL' : '+ ADD BOOKING'}
              </button>
              <Link href="/hub/artist" style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.1em' }}>← ARTIST HUB</Link>
            </div>
          </div>

          <div style={{ padding: '24px 32px 0' }}>

            {/* ── STATS BAR ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Pending Requests',  value: stats.pending,            color: '#FFD700' },
                { label: 'Confirmed Shows',   value: stats.confirmed,          color: '#00C8FF' },
                { label: 'Total Pipeline',    value: `$${stats.totalFee.toLocaleString()}`, color: '#AA2DFF' },
                { label: 'Bookings This Month', value: EARNINGS[2]!.shows,     color: '#FF2DAA' },
              ].map(s => (
                <div key={s.label} style={{ border: `1px solid ${s.color}22`, background: `${s.color}06`, padding: '14px 16px' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color, fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.04em' }}>{s.value}</div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* ── EARNINGS CHART ── */}
            <div style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)', padding: '16px 20px', marginBottom: 24 }}>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#00C8FF', marginBottom: 14, textTransform: 'uppercase' }}>
                EARNINGS — LAST 3 MONTHS
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 80 }}>
                {EARNINGS.map(e => {
                  const maxGross = Math.max(...EARNINGS.map(x => x.gross));
                  const h = Math.round((e.gross / maxGross) * 64);
                  return (
                    <div key={e.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 900, color: '#00C8FF' }}>${e.gross.toLocaleString()}</div>
                      <div style={{ width: '100%', height: h, background: 'linear-gradient(180deg,#00C8FF,#AA2DFF)', minHeight: 6 }} />
                      <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>{e.month}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── ADD BOOKING FORM ── */}
            {showForm && (
              <div style={{ border: '2px solid #00C8FF44', background: 'rgba(0,200,255,0.04)', padding: '20px 24px', marginBottom: 24 }}>
                <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#00C8FF', marginBottom: 16, textTransform: 'uppercase' }}>
                  NEW BOOKING REQUEST
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 10, marginBottom: 10 }}>
                  {[
                    { key: 'venueName', placeholder: 'Venue Name *', type: 'text' },
                    { key: 'city',      placeholder: 'City, State',   type: 'text' },
                    { key: 'date',      placeholder: 'Date',          type: 'date' },
                    { key: 'time',      placeholder: 'Time (e.g. 9:00 PM)', type: 'text' },
                    { key: 'fee',       placeholder: 'Booking Fee ($)', type: 'number' },
                    { key: 'contact',   placeholder: 'Contact email',  type: 'email' },
                  ].map(f => (
                    <input
                      key={f.key}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(form as Record<string,string>)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                        color: '#fff', padding: '9px 12px', fontSize: 11, fontFamily: "'Inter',sans-serif",
                        outline: 'none', width: '100%', boxSizing: 'border-box',
                      }}
                    />
                  ))}
                </div>
                <textarea
                  placeholder="Notes (optional)"
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={2}
                  style={{
                    width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                    color: '#fff', padding: '9px 12px', fontSize: 11, fontFamily: "'Inter',sans-serif",
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 12,
                  }}
                />
                <button type="button" onClick={handleSubmit} style={{
                  background: '#00C8FF', color: '#050510', border: 'none',
                  padding: '10px 28px', fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', cursor: 'pointer',
                  boxShadow: '0 0 20px rgba(0,200,255,0.4)',
                }}>
                  SUBMIT BOOKING →
                </button>
              </div>
            )}

            {/* ── FILTER TABS ── */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilter(f)}
                  style={{
                    background: filter === f ? (f === 'all' ? '#00C8FF' : STATUS_CONFIG[f as BookingStatus]?.color ?? '#00C8FF') : 'transparent',
                    border: `1px solid ${f === 'all' ? '#00C8FF55' : (STATUS_CONFIG[f as BookingStatus]?.color ?? '#00C8FF') + '55'}`,
                    color: filter === f ? '#050510' : 'rgba(255,255,255,0.6)',
                    padding: '5px 14px', fontSize: 8, fontWeight: 900, letterSpacing: '0.15em', cursor: 'pointer', textTransform: 'uppercase',
                  }}
                >
                  {f === 'all' ? `ALL (${bookings.length})` : `${STATUS_CONFIG[f as BookingStatus]?.label} (${bookings.filter(b => b.status === f).length})`}
                </button>
              ))}
            </div>

            {/* ── BOOKINGS LIST ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {visible.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
                  No bookings in this category.
                </div>
              )}
              {visible.map(b => {
                const sc = STATUS_CONFIG[b.status];
                const isOpen = expanded === b.id;
                return (
                  <div key={b.id} style={{ border: `1px solid ${sc.color}22`, background: `${sc.color}04` }}>
                    <div
                      style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexWrap: 'wrap' }}
                      onClick={() => setExpanded(isOpen ? null : b.id)}
                    >
                      {/* Status badge */}
                      <div style={{
                        padding: '3px 9px', fontSize: 7, fontWeight: 900, letterSpacing: '0.18em',
                        background: `${sc.color}18`, border: `1px solid ${sc.color}44`, color: sc.color,
                        textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}>
                        {sc.label}
                      </div>

                      {/* Venue info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {b.venueName}
                        </div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                          {b.city} · {new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {b.time}
                        </div>
                      </div>

                      {/* Fee */}
                      <div style={{ fontSize: 16, fontWeight: 900, color: sc.color, fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        ${b.fee.toLocaleString()}
                      </div>

                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{isOpen ? '▲' : '▼'}</div>
                    </div>

                    {/* Expanded detail */}
                    {isOpen && (
                      <div style={{ padding: '0 18px 16px', borderTop: `1px solid ${sc.color}15` }}>
                        <div style={{ paddingTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, marginBottom: 14 }}>
                          <div>
                            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 3, textTransform: 'uppercase' }}>Contact</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{b.contact || '—'}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', marginBottom: 3, textTransform: 'uppercase' }}>Notes</div>
                            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{b.notes || '—'}</div>
                          </div>
                        </div>

                        {/* WebRTC & Brick-and-Mortar Ticket Controls */}
                        {b.status === 'confirmed' && (
                          <div style={{ marginBottom: 16, padding: '14px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6 }}>
                            <div style={{ fontSize: 9, color: '#FFD700', letterSpacing: '0.15em', marginBottom: 10, fontWeight: 900 }}>PRODUCTION CONTROLS</div>
                            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                              {!b.isVirtual ? (
                                <button type="button" onClick={() => generateVenueTickets(b.id, b.venueName)} style={{ background: '#FF2DAA', color: '#fff', border: 'none', padding: '8px 14px', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 4 }}>
                                  🖨️ PRINT VENUE TICKETS (PDF)
                                </button>
                              ) : (
                                <button type="button" onClick={camStream ? stopWebRTC : testWebRTC} style={{ background: camStream ? '#FF4444' : '#00FF88', color: '#000', border: 'none', padding: '8px 14px', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', cursor: 'pointer', borderRadius: 4 }}>
                                  {camStream ? '⏹ STOP HARDWARE TEST' : '🎥 TEST WEBRTC HARDWARE'}
                                </button>
                              )}
                            </div>
                            {camStream && b.isVirtual && (
                              <div style={{ marginTop: 14 }}>
                                <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', maxWidth: 320, border: '2px solid #00FF88', borderRadius: 8, background: '#000' }} />
                                <div style={{ fontSize: 9, color: '#00FF88', marginTop: 6, letterSpacing: '0.1em' }}>● HARDWARE SYNCED & ACTIVE</div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        {b.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => updateStatus(b.id, 'confirmed')} style={{
                              background: '#00C8FF', color: '#050510', border: 'none',
                              padding: '7px 18px', fontSize: 8, fontWeight: 900, letterSpacing: '0.14em', cursor: 'pointer',
                            }}>
                              ✓ CONFIRM
                            </button>
                            <button type="button" onClick={() => updateStatus(b.id, 'cancelled')} style={{
                              background: 'transparent', border: '1px solid #FF444444', color: '#FF4444',
                              padding: '7px 18px', fontSize: 8, fontWeight: 900, letterSpacing: '0.14em', cursor: 'pointer',
                            }}>
                              ✕ DECLINE
                            </button>
                          </div>
                        )}
                        {b.status === 'confirmed' && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button type="button" onClick={() => updateStatus(b.id, 'completed')} style={{
                              background: '#00C89622', border: '1px solid #00C89644', color: '#00C896',
                              padding: '7px 18px', fontSize: 8, fontWeight: 900, letterSpacing: '0.14em', cursor: 'pointer',
                            }}>
                              MARK PAID ✓
                            </button>
                            <button type="button" onClick={() => updateStatus(b.id, 'cancelled')} style={{
                              background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.35)',
                              padding: '7px 18px', fontSize: 8, fontWeight: 900, letterSpacing: '0.14em', cursor: 'pointer',
                            }}>
                              CANCEL
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* ── BOTTOM CTA ── */}
            <div style={{ marginTop: 32, border: '1px solid rgba(255,45,170,0.2)', background: 'rgba(255,45,170,0.04)', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#FF2DAA', fontFamily: "'Bebas Neue','Impact',sans-serif", letterSpacing: '0.06em' }}>GET YOUR MUSIC IN FRONT OF VENUES</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginTop: 2 }}>CHALLENGE YOUR SONG · WIN EXPOSURE · ATTRACT BOOKERS</div>
              </div>
              <Link href="/challenges/create" style={{
                background: '#FF2DAA', color: '#fff', textDecoration: 'none',
                padding: '10px 22px', fontSize: 9, fontWeight: 900, letterSpacing: '0.14em',
                boxShadow: '0 0 18px rgba(255,45,170,0.4)',
              }}>
                CHALLENGE YOUR SONG →
              </Link>
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
