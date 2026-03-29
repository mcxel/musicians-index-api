/**
 * SponsorProgressCard.tsx
 * Repo: apps/web/src/components/contest/SponsorProgressCard.tsx
 * Action: CREATE | Wave: W2
 * Source: Split from Drop 2 ContestComponents.tsx
 * Dependencies: lucide-react (Zap)
 */
'use client';
import { Zap } from 'lucide-react';

interface SponsorProgressCardProps {
  localSponsors: number;
  majorSponsors: number;
  compact?: boolean;
  onInvite?: () => void;
}

export function SponsorProgressCard({ localSponsors, majorSponsors, compact = false, onInvite }: SponsorProgressCardProps) {
  const total = localSponsors + majorSponsors;
  const pct = Math.min((total / 20) * 100, 100);

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'rgba(255,107,26,.06)', border: '1px solid rgba(255,107,26,.2)', borderRadius: 10, color: '#fff' }}>
        <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,.08)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#ff6b1a,#ffd700)', borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#ff6b1a', whiteSpace: 'nowrap' }}>{total}/20</span>
      </div>
    );
  }

  return (
    <div style={{ background: '#0d1117', border: '1px solid rgba(255,107,26,.2)', borderRadius: 12, padding: 20, color: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Sponsor Progress</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: '#ff6b1a' }}>
          {total}<span style={{ fontSize: 14, color: 'rgba(255,255,255,.4)' }}>/20</span>
        </span>
      </div>

      <div style={{ height: 6, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden', marginBottom: 14 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg,#ff6b1a,#ffd700)', borderRadius: 3, boxShadow: '0 0 8px rgba(255,107,26,.5)', transition: 'width .5s' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: onInvite ? 16 : 0 }}>
        {[['Local Sponsors', localSponsors, 10, '#00e5ff'], ['Major Sponsors', majorSponsors, 10, '#ffd700']].map(([l, v, r, c]) => (
          <div key={String(l)} style={{ background: 'rgba(255,255,255,.03)', borderRadius: 8, padding: '10px 12px' }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 4 }}>{l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: String(c) }}>{v}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.3)' }}>/{r}</span>
            </div>
          </div>
        ))}
      </div>

      {onInvite && (
        <button onClick={onInvite} style={{ width: '100%', padding: '10px', background: 'linear-gradient(135deg,#ff6b1a,#ff8c42)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Zap size={15} /> Invite Sponsors
        </button>
      )}
    </div>
  );
}

export default SponsorProgressCard;
