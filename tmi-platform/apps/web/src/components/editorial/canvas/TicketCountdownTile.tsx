'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TicketCountdownTileProps {
  eventName: string;
  venue: string;
  dateLabel: string;
  seatsRemaining: number;
  ticketPrice: string;
  accentColor: string;
  ticketHref?: string;
}

function pad(n: number) { return String(n).padStart(2, '0'); }

export default function TicketCountdownTile({
  eventName, venue, dateLabel, seatsRemaining, ticketPrice, accentColor, ticketHref = '/tickets',
}: TicketCountdownTileProps) {
  const [timeLeft, setTimeLeft] = useState({ h: 23, m: 47, s: 12 });

  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const GOLD   = '#FFD700';
  const accent = accentColor;
  const urgency = seatsRemaining <= 5;

  return (
    <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
      <div style={{
        borderRadius: 14,
        border: `1px solid ${urgency ? '#FF4D4D' : GOLD}40`,
        background: `linear-gradient(135deg, ${urgency ? 'rgba(255,77,77,0.06)' : 'rgba(255,215,0,0.06)'} 0%, rgba(5,6,12,0.7) 100%)`,
        padding: '20px 24px',
        clipPath: 'polygon(3% 0, 100% 0, 100% 100%, 0 100%, 0 3%)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap',
      }}>
        {/* Left — event info */}
        <div>
          <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: '0.22em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 6 }}>
            Upcoming Event
          </div>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.01em' }}>{eventName}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>{venue} · {dateLabel}</div>
          {urgency && (
            <div style={{ fontSize: 9, fontWeight: 900, color: '#FF4D4D', letterSpacing: '0.16em', textTransform: 'uppercase', marginTop: 6 }}>
              ⚠ Only {seatsRemaining} seats left
            </div>
          )}
        </div>

        {/* Center — countdown */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[{ v: timeLeft.h, l: 'HRS' }, { v: timeLeft.m, l: 'MIN' }, { v: timeLeft.s, l: 'SEC' }].map(({ v, l }, i) => (
            <div key={l}>
              {i > 0 && <span style={{ fontSize: 18, fontWeight: 900, color: 'rgba(255,255,255,0.2)', marginRight: 8 }}>:</span>}
              <div style={{ textAlign: 'center', display: 'inline-block' }}>
                <div style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 900, color: GOLD, textShadow: '0 0 12px rgba(255,215,0,0.5)', lineHeight: 1 }}>
                  {pad(v)}
                </div>
                <div style={{ fontSize: 6, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginTop: 3 }}>
                  {l}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right — buy CTA */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 900, color: GOLD, marginBottom: 6 }}>{ticketPrice}</div>
          <Link href={ticketHref} style={{
            display: 'block', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em',
            background: `linear-gradient(135deg, ${GOLD}, #FFA500)`,
            color: '#000', borderRadius: 8, padding: '10px 20px',
            textDecoration: 'none', textTransform: 'uppercase',
            boxShadow: '0 0 20px rgba(255,215,0,0.4)',
          }}>
            Get Tickets
          </Link>
          {!urgency && (
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', marginTop: 6 }}>
              {seatsRemaining} seats remaining
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
