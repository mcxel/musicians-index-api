'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function NewVideoRoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteId = searchParams?.get('inviteId');
  const inviteName = searchParams?.get('name');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copyDone, setCopyDone] = useState(false);

  async function createRoom() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/video/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to create room');
        return;
      }

      const joinUrl = `/video/rooms/${data.roomId}?roomUrl=${encodeURIComponent(data.roomUrl)}&token=${encodeURIComponent(data.token)}`;
      setInviteLink(`${window.location.origin}/video/rooms/${data.roomId}?roomUrl=${encodeURIComponent(data.roomUrl)}`);
      router.push(joinUrl);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function copyLink() {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    });
  }

  return (
    <main style={{ minHeight: '100vh', background: '#060410', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}>
        <p style={{ fontSize: 52, marginBottom: 16 }}>🎥</p>
        <h1 style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>
          {inviteName ? `Video call with ${inviteName}` : 'Start a Video Room'}
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 36 }}>
          Create a room and invite anyone with the link.
        </p>

        {error && (
          <div style={{
            marginBottom: 20, padding: '12px 16px', borderRadius: 8,
            background: 'rgba(255,80,80,0.1)', border: '1px solid rgba(255,80,80,0.3)',
            color: '#FF8080', fontSize: 12,
          }}>
            {error.includes('DAILY_API_KEY')
              ? '⚠️ Video rooms need setup. Marcel: add DAILY_API_KEY to Vercel dashboard → dashboard.daily.co'
              : error}
          </div>
        )}

        <button
          onClick={createRoom}
          disabled={loading}
          style={{
            width: '100%', padding: '16px', borderRadius: 28,
            background: loading ? 'rgba(0,255,255,0.06)' : 'linear-gradient(135deg, rgba(0,255,255,0.15), rgba(170,45,255,0.15))',
            border: '1px solid rgba(0,255,255,0.35)',
            color: loading ? 'rgba(255,255,255,0.3)' : '#00FFFF',
            fontWeight: 900, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
            letterSpacing: '0.05em', marginBottom: 16,
          }}
        >
          {loading ? 'Creating room…' : '🎙️ Create & Join Room'}
        </button>

        <Link
          href="/friends"
          style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
        >
          ← Back to Friends
        </Link>
      </div>
    </main>
  );
}
