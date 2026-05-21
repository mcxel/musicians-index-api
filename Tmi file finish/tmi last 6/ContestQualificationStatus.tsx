/**
 * ContestQualificationStatus.tsx
 * Repo: apps/web/src/components/contest/ContestQualificationStatus.tsx
 * Action: CREATE | Wave: W2
 */
'use client';
import { CheckCircle, Target, AlertCircle } from 'lucide-react';

interface ContestQualificationStatusProps {
  localSponsors: number;
  majorSponsors: number;
  entryStatus?: string;
  compact?: boolean;
}

export function ContestQualificationStatus({ localSponsors, majorSponsors, entryStatus, compact = false }: ContestQualificationStatusProps) {
  const localOk = localSponsors >= 10;
  const majorOk = majorSponsors >= 10;
  const qualified = localOk && majorOk;

  if (compact) {
    return (
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, background: qualified ? 'rgba(0,200,83,.1)' : 'rgba(255,107,26,.08)', border: `1px solid ${qualified ? 'rgba(0,200,83,.3)' : 'rgba(255,107,26,.2)'}` }}>
        {qualified ? <CheckCircle size={14} color="#00c853" /> : <Target size={14} color="#ff6b1a" />}
        <span style={{ fontSize: 12, fontWeight: 700, color: qualified ? '#00c853' : '#ff6b1a' }}>
          {qualified ? 'Qualified' : `${localSponsors + majorSponsors}/20 sponsors`}
        </span>
      </div>
    );
  }

  return (
    <div style={{ background: '#0d1117', border: `1px solid ${qualified ? 'rgba(0,200,83,.2)' : 'rgba(255,107,26,.15)'}`, borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        {qualified
          ? <CheckCircle size={20} color="#00c853" />
          : <AlertCircle size={20} color="#ff6b1a" />}
        <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
          {qualified ? 'Qualified to Compete' : 'Not Yet Qualified'}
        </span>
        {entryStatus && (
          <span style={{ marginLeft: 'auto', fontSize: 11, padding: '3px 10px', borderRadius: 10, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.5)', fontWeight: 600 }}>
            {entryStatus}
          </span>
        )}
      </div>

      {[
        { label: 'Local Sponsors', current: localSponsors, required: 10, ok: localOk },
        { label: 'Major Sponsors', current: majorSponsors, required: 10, ok: majorOk },
      ].map(req => (
        <div key={req.label} style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {req.ok ? <CheckCircle size={13} color="#00c853" /> : <Target size={13} color="rgba(255,255,255,.4)" />}
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.7)' }}>{req.label}</span>
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: req.ok ? '#00c853' : '#fff' }}>
              {req.current}/{req.required}
            </span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((req.current / req.required) * 100, 100)}%`, height: '100%', background: req.ok ? '#00c853' : 'linear-gradient(90deg,#ff6b1a,#ffd700)', borderRadius: 3, transition: 'width .5s' }} />
          </div>
        </div>
      ))}

      {!qualified && (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 8 }}>
          Need {Math.max(0, 10 - localSponsors)} more local + {Math.max(0, 10 - majorSponsors)} more major sponsors to qualify.
        </p>
      )}
    </div>
  );
}
export default ContestQualificationStatus;
