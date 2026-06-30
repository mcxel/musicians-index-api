'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MusicStudio from '@/components/studio/MusicStudio';

interface Session {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    displayName?: string;
  } | null;
}

const C = {
  bg: '#050815',
  panel: 'rgba(8,14,38,.95)',
  border: '#1a1a3a',
  cyan: '#00FFFF',
  text: '#FFFFFF',
  dim: '#666',
};

export default function MusicStudioPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json())
      .then((d: Session) => {
        setSession(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div
        style={{
          background: C.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.dim,
        }}
      >
        Loading…
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <div
        style={{
          background: C.bg,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: C.dim,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <p>Please sign in to access Music Studio</p>
          <Link href="/login" style={{ color: C.cyan, textDecoration: 'underline' }}>
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const performerId = session.user?.id || '';
  const performerName = session.user?.displayName || session.user?.email?.split('@')[0] || 'Performer';

  return (
    <div style={{ background: C.bg, minHeight: '100vh', color: C.text, fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #050815, #1a0d1a)',
          borderBottom: `1px solid ${C.border}`,
          padding: '24px 28px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 30% 50%, rgba(0,255,255,0.1) 0%, transparent 70%)',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link href="/profile/performer" style={{ color: C.cyan, textDecoration: 'none', fontSize: 12 }}>
            ← Back to Profile
          </Link>
          <h1 style={{ margin: '12px 0 0 0', fontSize: 28, fontWeight: 900 }}>
            🎵 Music Studio
          </h1>
          <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>
            Upload, manage, and submit your music to publishing platforms
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 28px' }}>
        <MusicStudio performerId={performerId} performerName={performerName} />
      </div>
    </div>
  );
}
