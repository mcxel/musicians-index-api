/**
 * SponsorCuePanel.tsx
 * Repo: apps/web/src/components/host/SponsorCuePanel.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { Zap } from 'lucide-react';

interface Sponsor { id: string; name: string; tier: string; tierType: 'local' | 'major'; }
interface SponsorCuePanelProps { sponsors?: Sponsor[]; onFireCue?: (sponsorId: string) => void; }

const TIER_COLORS: Record<string, string> = {
  'local-bronze': '#cd7f32', 'local-silver': '#c0c0c0', 'local-gold': '#ffd700',
  'major-bronze': '#cd7f32', 'major-silver': '#c0c0c0', 'major-gold': '#ffd700', 'title': '#00e5ff',
};

export function SponsorCuePanel({ sponsors = [], onFireCue }: SponsorCuePanelProps) {
  return (
    <div style={{ background: '#0a0d14', border: '1px solid rgba(0,229,255,.2)', borderRadius: 12, padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#00e5ff', marginBottom: 14 }}>Sponsor Cues</div>
      {sponsors.length === 0 ? (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>No sponsors to cue yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sponsors.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,.03)', borderRadius: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: TIER_COLORS[s.tier] ?? '#fff', flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: '#fff' }}>{s.name}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>{s.tierType}</span>
              <button onClick={() => onFireCue?.(s.id)} style={{ padding: '5px 12px', background: 'rgba(0,229,255,.1)', border: '1px solid rgba(0,229,255,.3)', borderRadius: 6, color: '#00e5ff', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={11} /> Fire
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default SponsorCuePanel;
