'use client';
import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSmartRoom } from '@/lib/rooms/SmartRoomRouter';

interface Props {
  performerSlug: string;
}

export default function PerformerGoLiveButton({ performerSlug }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoLive = useCallback(() => {
    setLoading(true);
    const roomId = getSmartRoom();
    const sessionId = `perf-${performerSlug}-${Date.now()}`;
    router.push(
      `/live/rooms/${roomId}?performer=${encodeURIComponent(performerSlug)}&sid=${encodeURIComponent(sessionId)}`,
    );
  }, [performerSlug, router]);

  return (
    <button
      onClick={handleGoLive}
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
      {loading ? '⏳ ROUTING...' : '🔴 GO LIVE NOW'}
    </button>
  );
}
