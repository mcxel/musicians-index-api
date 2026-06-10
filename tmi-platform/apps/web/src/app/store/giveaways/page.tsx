'use client';

import React, { useState, useEffect } from 'react';

const SPONSOR_PRIZES = [
  { id: 'g1', sponsor: 'TMI Pro Audio', title: 'Studio Monitor Headphones', type: 'Physical', cost: 15000, img: '🎧', available: 5 },
  { id: 'g3', sponsor: 'BerntoutGlobal', title: '1-Month Diamond Upgrade', type: 'Digital', cost: 8000, img: '💎', available: 100 },
];

export default function SponsorGiveawayPage() {
  const [claiming, setClaiming] = useState<string | null>(null);
  const [claimResult, setClaimResult] = useState<{ id: string; ok: boolean; msg: string } | null>(null);
  const [userXp, setUserXp] = useState(0);

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { authenticated?: boolean; user?: { fanPoints?: number } }) => {
        if (d.authenticated && d.user) setUserXp(d.user.fanPoints ?? 0);
      })
      .catch(() => null);
  }, []);

  const handleClaim = async (id: string, cost: number) => {
    if (userXp < cost) { setClaimResult({ id, ok: false, msg: 'Not enough XP to claim this prize.' }); return; }
    setClaiming(id);
    try {
      const res = await fetch('/api/giveaway/sponsor', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prizeId: id }),
        credentials: 'include',
      });
      const data = await res.json() as { ok?: boolean; message?: string };
      setClaimResult({ id, ok: !!data.ok, msg: data.message ?? (data.ok ? 'Claim submitted! Check your email for fulfillment details.' : 'Claim failed — try again.') });
    } catch {
      setClaimResult({ id, ok: false, msg: 'Network error — try again.' });
    } finally {
      setClaiming(null);
    }
  };

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '40px 24px', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,215,0,0.2)', paddingBottom: 20, marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.3em', color: '#FFD700', fontWeight: 900, marginBottom: 8, textTransform: 'uppercase' }}>TMI Rewards Network</div>
            <h1 style={{ fontSize: 36, margin: 0, fontFamily: 'var(--font-orbitron, Impact)', letterSpacing: '0.05em' }}>SPONSOR <span style={{ color: '#00FFFF' }}>SURPRISES</span></h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 8, fontSize: 13 }}>Claim exclusive physical and digital prizes using your earned Live Stream XP.</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Your Balance</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: '#00FF88' }}>{userXp.toLocaleString()} XP</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {SPONSOR_PRIZES.map(prize => (
            <div key={prize.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,215,0,0.2)', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 10, fontWeight: 900, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{prize.sponsor}</span>
                <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(0,255,255,0.1)', color: '#00FFFF', fontWeight: 700 }}>{prize.type}</span>
              </div>
              <div style={{ fontSize: 64, textAlign: 'center', marginBottom: 16 }}>{prize.img}</div>
              <h2 style={{ fontSize: 18, fontWeight: 900, margin: '0 0 8px', color: '#fff', textAlign: 'center' }}>{prize.title}</h2>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: 20 }}>{prize.available} remaining worldwide</div>
              
              {claimResult?.id === prize.id && (
                <div style={{ marginBottom: 10, padding: '8px 12px', borderRadius: 6, background: claimResult.ok ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,68,0.1)', border: `1px solid ${claimResult.ok ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'}`, color: claimResult.ok ? '#00FF88' : '#FF4444', fontSize: 11, textAlign: 'center' }}>{claimResult.msg}</div>
              )}
              <button onClick={() => handleClaim(prize.id, prize.cost)} disabled={claiming === prize.id || userXp < prize.cost} style={{ marginTop: 'auto', width: '100%', background: userXp >= prize.cost ? 'linear-gradient(90deg, #FFD700, #FF9500)' : 'rgba(255,255,255,0.1)', color: userXp >= prize.cost ? '#050510' : 'rgba(255,255,255,0.3)', border: 'none', padding: '12px', borderRadius: 8, fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', cursor: userXp >= prize.cost ? 'pointer' : 'not-allowed' }}>
                {claiming === prize.id ? 'SUBMITTING CLAIM…' : `CLAIM • ${prize.cost.toLocaleString()} XP`}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}