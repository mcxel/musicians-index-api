'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { sponsorContestPool } from '@/lib/competition/SponsorContestPool';

const DEMO_SPONSORS = [
  {
    id: 'spon-beats-pro',   name: 'BeatsPro Studio',   category: 'major' as const,
    logo: '🎛️', prize: '$500', color: '#00FFFF',
    offerings: [{ type: 'rewards' as const, name: 'Studio Time', value: 500, quantity: 3, description: '2hr studio session' }],
    prizePool: 500, activeContests: [],
  },
  {
    id: 'spon-vibe-gear',   name: 'Vibe Gear Co',      category: 'local' as const,
    logo: '🎧', prize: '$200', color: '#FF2DAA',
    offerings: [{ type: 'merch' as const, name: 'Headphone Bundle', value: 200, quantity: 5, description: 'Pro headphones + merch' }],
    prizePool: 200, activeContests: [],
  },
  {
    id: 'spon-chain-drops',  name: 'Chain Drops NYC',  category: 'major' as const,
    logo: '💎', prize: '$750', color: '#FFD700',
    offerings: [{ type: 'product' as const, name: 'Custom Chain', value: 750, quantity: 1, description: 'Custom gold chain' }],
    prizePool: 750, activeContests: [],
  },
  {
    id: 'spon-track-vault',  name: 'TrackVault',       category: 'local' as const,
    logo: '🎵', prize: '$150', color: '#AA2DFF',
    offerings: [{ type: 'rewards' as const, name: 'Distribution Credit', value: 150, quantity: 10, description: '1-year distro credit' }],
    prizePool: 150, activeContests: [],
  },
];

interface SponsorBattleOverlayProps {
  battleId:   string;
  accentColor?: string;
  compact?:   boolean;
}

export default function SponsorBattleOverlay({ battleId, accentColor = '#FFD700', compact = false }: SponsorBattleOverlayProps) {
  const seeded = useRef(false);
  const [tick, setTick]   = useState(0);
  const [boosted, setBoosted] = useState(false);

  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    DEMO_SPONSORS.forEach((s) => {
      const existing = sponsorContestPool.getAllSponsors().find(x => x.id === s.id);
      if (!existing) {
        if (s.category === 'major') sponsorContestPool.addMajorSponsor(s);
        else sponsorContestPool.addLocalSponsor(s);
      }
      sponsorContestPool.registerForContest(s.id, battleId);
    });
  }, [battleId]);

  // Poll server for real sponsors paid via Stripe, hydrate client pool
  useEffect(() => {
    async function fetchAndHydrate() {
      try {
        const res = await fetch(`/api/sponsor/attach?battleId=${encodeURIComponent(battleId)}`);
        if (!res.ok) return;
        const data = await res.json() as { sponsors?: { id:string; name:string; category:'local'|'major'; logo?:string; prizePool:number; offerings: typeof DEMO_SPONSORS[0]['offerings']; activeContests:string[] }[] };
        if (!data.sponsors) return;
        let changed = false;
        data.sponsors.forEach(s => {
          const existing = sponsorContestPool.getAllSponsors().find(x => x.id === s.id);
          if (!existing) {
            const full = { ...s, logo: s.logo ?? '🤝', color: '#FFD700' };
            if (s.category === 'major') sponsorContestPool.addMajorSponsor(full);
            else sponsorContestPool.addLocalSponsor(full);
            sponsorContestPool.registerForContest(s.id, battleId);
            changed = true;
          }
        });
        if (changed) setTick(t => t + 1);
      } catch { /* silent */ }
    }
    fetchAndHydrate();
    const id = setInterval(fetchAndHydrate, 30_000);
    return () => clearInterval(id);
  }, [battleId]);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 4000);
    return () => clearInterval(id);
  }, []);

  const sponsors = sponsorContestPool.getContestSponsors(battleId);
  const totalPool = sponsors.reduce((sum, s) => sum + s.prizePool, 0);
  const activeSponsor = sponsors[tick % Math.max(sponsors.length, 1)];

  if (sponsors.length === 0) return null;

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: `${accentColor}10`, border: `1px solid ${accentColor}25`, borderRadius: 8 }}>
        <span style={{ fontSize: 14 }}>{activeSponsor?.logo ?? '🤝'}</span>
        <div>
          <div style={{ fontSize: 9, fontWeight: 800, color: accentColor, letterSpacing: '0.1em' }}>SPONSORED</div>
          <div style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>{activeSponsor?.name}</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 900, color: '#00FF88' }}>${totalPool.toLocaleString()} POOL</div>
      </div>
    );
  }

  return (
    <div style={{ background: 'rgba(5,5,16,0.95)', border: `1px solid ${accentColor}30`, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
      {/* Prize pool banner */}
      <div style={{ background: `linear-gradient(90deg, ${accentColor}18, rgba(5,5,16,0.9))`, borderBottom: `1px solid ${accentColor}20`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: accentColor }}>🤝 SPONSOR PRIZE POOL</span>
          <span style={{ fontSize: 13, fontWeight: 900, color: '#00FF88' }}>${totalPool.toLocaleString()}</span>
        </div>
        <Link href="/sponsor/battles" style={{ fontSize: 9, fontWeight: 800, color: accentColor, border: `1px solid ${accentColor}40`, padding: '3px 10px', borderRadius: 4, textDecoration: 'none', letterSpacing: '0.08em' }}>
          + SPONSOR BATTLE
        </Link>
      </div>

      {/* Rotating sponsor strip */}
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {sponsors.map((s, i) => (
          <div key={s.id}
            style={{ minWidth: 160, padding: '12px 14px', borderRight: '1px solid rgba(255,255,255,0.06)', background: i === tick % sponsors.length ? `${(s as typeof DEMO_SPONSORS[0]).color ?? accentColor}10` : 'transparent', transition: 'background 0.4s', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ fontSize: 18 }}>{(s as typeof DEMO_SPONSORS[0]).logo ?? '🤝'}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{s.name}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>{s.category.toUpperCase()} SPONSOR</div>
              </div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 900, color: '#FFD700' }}>${s.prizePool}</div>
            {s.offerings[0] && (
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{s.offerings[0].name}</div>
            )}
          </div>
        ))}

        {/* Add sponsor CTA slot */}
        <div style={{ minWidth: 150, padding: '12px 14px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: 20 }}>➕</span>
          <Link href="/sponsor/battles" style={{ fontSize: 9, fontWeight: 800, color: accentColor, textDecoration: 'none', letterSpacing: '0.06em', textAlign: 'center' }}>
            BECOME A SPONSOR
          </Link>
          <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>From $50/battle</div>
        </div>
      </div>

      {/* Winner reward preview */}
      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', fontWeight: 700 }}>WINNER GETS:</div>
        {sponsors.slice(0, 3).map((s) => (
          s.offerings[0] && (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 12 }}>{(s as typeof DEMO_SPONSORS[0]).logo ?? '🎁'}</span>
              <span style={{ fontSize: 10, color: '#fff', fontWeight: 700 }}>{s.offerings[0].name}</span>
            </div>
          )
        ))}
        {!boosted && (
          <button
            onClick={() => setBoosted(true)}
            style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 800, color: '#00FF88', border: '1px solid rgba(0,255,136,0.3)', background: 'rgba(0,255,136,0.1)', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', letterSpacing: '0.08em' }}>
            BOOST PRIZE +$10
          </button>
        )}
        {boosted && <span style={{ marginLeft: 'auto', fontSize: 9, color: '#00FF88', fontWeight: 800 }}>✓ BOOSTED</span>}
      </div>
    </div>
  );
}
