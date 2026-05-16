'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const VideoRoom = dynamic(() => import('@/components/video/VideoRoom'), { ssr: false });

export default function VideoRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.roomId as string;

  // Room URL format: https://<subdomain>.daily.co/<roomName>
  // We reconstruct from roomId; the token is passed via query param on invite links
  const [roomUrl] = useState(() => {
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      return sp.get('roomUrl') ?? '';
    }
    return '';
  });
  const [token] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('token') ?? undefined;
    }
    return undefined;
  });

  if (!roomUrl) {
    return (
      <main style={{ minHeight: '100vh', background: '#060410', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>⚠️</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Room not found or link expired.</p>
          <button
            onClick={() => router.push('/video/rooms/new')}
            style={{
              padding: '12px 28px', borderRadius: 24,
              background: 'rgba(0,255,255,0.1)', border: '1px solid rgba(0,255,255,0.3)',
              color: '#00FFFF', fontWeight: 800, fontSize: 13, cursor: 'pointer',
            }}
          >
            Start a New Room
          </button>
        </div>
      </main>
    );
  }

  return (
    <VideoRoom
      roomUrl={roomUrl}
      token={token}
      onLeave={() => router.push('/friends')}
    />
  );
}
