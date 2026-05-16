'use client';
import { useState } from 'react';
import Link from 'next/link';

const XP_TIERS = [
  { label: 'Listener', min: 0, max: 999, color: 'rgba(255,255,255,0.4)' },
  { label: 'Fan', min: 1000, max: 4999, color: '#00FF88' },
  { label: 'Supporter', min: 5000, max: 14999, color: '#00FFFF' },
  { label: 'Superfan', min: 15000, max: 39999, color: '#FF2DAA' },
  { label: 'Champion', min: 40000, max: 99999, color: '#ffd700' },
  { label: 'Crown', min: 100000, max: Infinity, color: '#ff6b1a' },
];

const XP_ACTIONS = [
  { action: 'Attend a live event', xp: '+250 XP' },
  { action: 'Purchase a beat license', xp: '+500 XP' },
  { action: 'Vote in a contest', xp: '+100 XP' },
  { action: 'Share an artist profile', xp: '+50 XP' },
  { action: 'Buy a ticket', xp: '+150 XP' },
  { action: 'Subscribe (monthly)', xp: '+1,000 XP' },
];

export default function XPLadderPage() {
  const [userXP] = useState(0);

  const currentTier = [...XP_TIERS].reverse().find((t) => userXP >= t.min) ?? XP_TIERS[0];
  const nextTier = XP_TIERS[XP_TIERS.indexOf(currentTier) + 1];
  const progress = nextTier ? ((userXP - currentTier.min) / (nextTier.min - currentTier.min)) * 100 : 100;

  return (
    <main style={{ background: '#050510', minHeight: '100vh', padding: '60px 24px', fontFamily: 'inherit' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/" style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 10px' }}>
            ← Home
          </Link>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 900, color: '#00FF88', letterSpacing: '-0.02em', marginBottom: 8 }}>
          XP Ladder
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 40 }}>
          Earn XP by participating in TMI — climb tiers, unlock perks, and gain Crown status.
        </p>

        {/* Current status */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${currentTier.color}44`, borderRadius: 14, padding: '24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Current Tier</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: currentTier.color }}>{currentTier.label}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff' }}>{userXP.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Total XP</div>
            </div>
          </div>
          {nextTier && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                <span>{currentTier.label}</span>
                <span>{nextTier.label} at {nextTier.min.toLocaleString()} XP</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 99, height: 8, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(progress, 100)}%`, height: '100%', background: currentTier.color, borderRadius: 99, transition: 'width 0.5s' }} />
              </div>
            </>
          )}
        </div>

        {/* Tiers */}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>All Tiers</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 40 }}>
          {XP_TIERS.map((tier) => (
            <div key={tier.label} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '12px 18px',
              background: userXP >= tier.min ? `${tier.color}08` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${userXP >= tier.min ? `${tier.color}33` : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 10,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: tier.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color: userXP >= tier.min ? tier.color : 'rgba(255,255,255,0.35)' }}>{tier.label}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>{tier.min.toLocaleString()}+ XP</span>
            </div>
          ))}
        </div>

        {/* How to earn */}
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>How to Earn XP</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {XP_ACTIONS.map((item) => (
            <div key={item.action} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 13, color: '#fff', marginBottom: 4 }}>{item.action}</div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#00FF88' }}>{item.xp}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
