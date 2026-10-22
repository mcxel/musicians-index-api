'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { POINT_PACKS } from '@/lib/points/PointPackCatalog';

const PACK_COLORS: Record<string, string> = {
  points_099: '#00FFFF',
  points_199: '#00FFFF',
  points_499: '#FF2DAA',
  points_999: '#FFD700',
  points_1999: '#FFD700',
};

const HOW_TO_EARN = [
  { icon: '📖', action: 'Read an article', credits: '+5 cr' },
  { icon: '🗳️', action: 'Vote in a battle', credits: '+3 cr' },
  { icon: '🎤', action: 'Join a live stage', credits: '+10 cr' },
  { icon: '💬', action: 'Send a message', credits: '+2 cr' },
  { icon: '🔑', action: 'Daily login', credits: '+25 cr' },
];

export default function CreditsPage() {
  // Rule 20 fix (2026-10-04): this page previously showed a fabricated
  // balance sourced from a client-side-only fake economy hook (browser
  // storage, not a database). Reads the real Wallet.fanCredits balance via
  // the canonical authority instead.
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceState, setBalanceState] = useState<'loading' | 'ready' | 'signed_out' | 'unavailable'>('loading');

  useEffect(() => {
    fetch('/api/points/balance', { credentials: 'include', cache: 'no-store' })
      .then((r) => {
        if (r.status === 401) { setBalanceState('signed_out'); return null; }
        if (!r.ok) throw new Error('balance fetch failed');
        return r.json();
      })
      .then((d: { platformPoints?: number } | null) => {
        if (d && typeof d.platformPoints === 'number') {
          setBalance(d.platformPoints);
          setBalanceState('ready');
        }
      })
      .catch(() => setBalanceState('unavailable'));
  }, []);

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', paddingBottom: 80 }}>
      <section style={{ textAlign: 'center', padding: '56px 24px 40px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.4em', color: '#FFD700', fontWeight: 800, marginBottom: 10 }}>TM CREDITS</div>
        <h1 style={{ fontSize: 'clamp(1.6rem,4vw,2.8rem)', fontWeight: 900, marginBottom: 12 }}>Buy Credits</h1>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', maxWidth: 440, margin: '0 auto' }}>
          Spend TM Credits in the shop on emotes, avatar props, skins, and exclusive drops.
        </p>
        <div style={{ display: 'inline-flex', gap: 8, marginTop: 18, padding: '10px 20px', background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.15)', borderRadius: 30 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Current balance:</span>
          <span style={{ fontSize: 11, color: '#00FF88', fontWeight: 800 }}>
            {balanceState === 'ready' && balance !== null ? `${balance.toLocaleString()} TM Credits`
              : balanceState === 'loading' ? 'Loading…'
              : balanceState === 'signed_out' ? 'Sign in to view'
              : 'Unavailable'}
          </span>
        </div>
      </section>

      <section style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>
        {POINT_PACKS.map((pack) => {
          const color = PACK_COLORS[pack.sku] ?? '#00FFFF';
          const isBestValue = pack.sku === 'points_1999';
          return (
            <div key={pack.sku} style={{ position: 'relative', background: isBestValue ? `${color}08` : 'rgba(255,255,255,0.02)', border: `1px solid ${color}${isBestValue ? '40' : '20'}`, borderRadius: 16, padding: '28px 22px 22px' }}>
              {isBestValue && (
                <div style={{ position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', background: color, color: '#050510', fontSize: 7, fontWeight: 900, letterSpacing: '0.15em', padding: '3px 12px', borderRadius: 20 }}>BEST VALUE</div>
              )}
              <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.08em', marginBottom: 6 }}>{pack.name.toUpperCase()}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 34, fontWeight: 900, color: '#fff' }}>${(pack.priceCents / 100).toFixed(2)}</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 900, color, marginBottom: 20 }}>
                {pack.points.toLocaleString()} credits
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', margin: '0 0 22px' }}>{pack.blurb}</p>
              <Link
                href={`/api/stripe/checkout?packSku=${pack.sku}`}
                style={{ display: 'block', textAlign: 'center', padding: '11px', fontSize: 9, fontWeight: 900, letterSpacing: '0.12em', color: isBestValue ? '#050510' : color, background: isBestValue ? color : 'transparent', border: `1px solid ${color}`, borderRadius: 8, textDecoration: 'none' }}
              >
                BUY {pack.points.toLocaleString()} CREDITS →
              </Link>
            </div>
          );
        })}
      </section>

      <section style={{ maxWidth: 600, margin: '48px auto 0', padding: '0 24px' }}>
        <div style={{ fontSize: 9, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: 16 }}>OR EARN FREE CREDITS</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 10 }}>
          {HOW_TO_EARN.map(item => (
            <div key={item.action} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{item.action}</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#00FF88' }}>{item.credits}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ textAlign: 'center', marginTop: 40 }}>
        <Link href="/shop" style={{ fontSize: 10, color: '#00FFFF', textDecoration: 'none' }}>Spend your credits in the shop →</Link>
      </section>
    </main>
  );
}
