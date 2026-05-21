/**
 * ContestEntryCard.tsx
 * Repo: apps/web/src/components/contest/ContestEntryCard.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { ChevronRight, Trophy, Users, Star } from 'lucide-react';

interface ContestEntryCardProps {
  entryId: string;
  artistName: string;
  artistAvatar?: string;
  category: string;
  status: 'pending' | 'qualified' | 'competing' | 'eliminated' | 'winner';
  localSponsors: number;
  majorSponsors: number;
  votes?: number;
  rank?: number;
  onView?: (entryId: string) => void;
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: 'rgba(255,255,255,.06)',   color: 'rgba(255,255,255,.5)',  label: 'Pending' },
  qualified:  { bg: 'rgba(0,200,83,.1)',        color: '#00c853',               label: 'Qualified' },
  competing:  { bg: 'rgba(0,229,255,.1)',        color: '#00e5ff',               label: 'Competing' },
  eliminated: { bg: 'rgba(255,82,82,.1)',        color: '#ff5252',               label: 'Eliminated' },
  winner:     { bg: 'rgba(255,215,0,.1)',        color: '#ffd700',               label: 'Winner 🏆' },
};

export function ContestEntryCard({ entryId, artistName, artistAvatar, category, status, localSponsors, majorSponsors, votes, rank, onView }: ContestEntryCardProps) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  const totalSponsors = localSponsors + majorSponsors;
  const isQualified = localSponsors >= 10 && majorSponsors >= 10;

  return (
    <div style={{ background: '#0d1117', border: `1px solid ${status === 'winner' ? 'rgba(255,215,0,.3)' : 'rgba(255,255,255,.07)'}`, borderRadius: 12, padding: 20, position: 'relative', overflow: 'hidden' }}>
      {status === 'winner' && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#ffd700,#ff6b1a)' }} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Rank */}
        {rank && (
          <div style={{ fontSize: 18, fontWeight: 900, color: rank <= 3 ? '#ffd700' : 'rgba(255,255,255,.3)', minWidth: 30, textAlign: 'center' }}>
            #{rank}
          </div>
        )}

        {/* Avatar */}
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,107,26,.1)', border: '2px solid rgba(255,107,26,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#ff6b1a', flexShrink: 0, overflow: 'hidden' }}>
          {artistAvatar ? <img src={artistAvatar} alt={artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : artistName[0]}
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{artistName}</span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: s.bg, color: s.color, fontWeight: 700 }}>{s.label}</span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>{category}</div>
        </div>

        {/* Action */}
        {onView && (
          <button onClick={() => onView(entryId)} style={{ padding: '8px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 8, color: 'rgba(255,255,255,.6)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer' }}>
            View <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.05)' }}>
        {[
          { label: 'Local', value: `${localSponsors}/10`, icon: <Users size={12} />, ok: localSponsors >= 10 },
          { label: 'Major', value: `${majorSponsors}/10`, icon: <Trophy size={12} />, ok: majorSponsors >= 10 },
          { label: votes !== undefined ? 'Votes' : 'Total Sponsors', value: votes !== undefined ? votes.toLocaleString() : `${totalSponsors}/20`, icon: <Star size={12} />, ok: votes !== undefined ? votes > 0 : isQualified },
        ].map(stat => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: stat.ok ? '#00c853' : 'rgba(255,255,255,.3)', marginBottom: 3, fontSize: 11 }}>
              {stat.icon}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: stat.ok ? '#fff' : 'rgba(255,255,255,.5)' }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ContestEntryCard;
