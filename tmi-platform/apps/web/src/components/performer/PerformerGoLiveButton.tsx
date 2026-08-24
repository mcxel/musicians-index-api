'use client';
import { useCallback, useState } from 'react';
import { triggerCanonicalGoLive } from '@/lib/dock/presentInstantGoLiveInPlace';

interface Props {
  performerSlug: string;
}

export default function PerformerGoLiveButton({ performerSlug }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoLive = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    const result = await triggerCanonicalGoLive({
      role: 'PERFORMER',
      preferredExperience: 'live',
      publishSession: true,
    });
    if (!result.ok && result.error) {
      setError(result.error);
      setLoading(false);
    }
    // Off-hub: triggerCanonicalGoLive navigates to hub — keep loading state.
    if (result.ok && result.roomId) setLoading(false);
  }, [loading, performerSlug]);

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
      <button
        type="button"
        onClick={() => void handleGoLive()}
        disabled={loading}
        style={{
          display: 'inline-block',
          padding: '10px 22px',
          fontSize: 9,
          fontWeight: 900,
          letterSpacing: '0.12em',
          color: '#050510',
          background: loading ? 'rgba(255,45,170,0.5)' : '#FF2DAA',
          borderRadius: 7,
          border: 'none',
          cursor: loading ? 'default' : 'pointer',
        }}
      >
        {loading ? '⏳ GOING LIVE…' : '🔴 GO LIVE NOW'}
      </button>
      {error ? (
        <span style={{ fontSize: 9, color: '#FF6666', maxWidth: 220 }}>{error}</span>
      ) : null}
    </div>
  );
}
