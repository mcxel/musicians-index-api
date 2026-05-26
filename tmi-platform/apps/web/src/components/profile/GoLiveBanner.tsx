'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface GoLiveBannerProps {
  /** The profile slug being viewed */
  profileSlug: string;
  /** Whether this profile has ever streamed (drives message variant) */
  hasStreamed?: boolean;
}

export default function GoLiveBanner({ profileSlug, hasStreamed = false }: GoLiveBannerProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Detect if the logged-in user owns this profile
    fetch('/api/auth/session', { credentials: 'include', cache: 'no-store' })
      .then(r => r.json())
      .then((data: { authenticated?: boolean; user?: { id?: string } }) => {
        if (data.authenticated && data.user?.id) {
          setIsOwner(
            data.user.id === profileSlug ||
            data.user.id.toLowerCase() === profileSlug.toLowerCase()
          );
        }
        setChecked(true);
      })
      .catch(() => setChecked(true));

    // Check localStorage for live state set by HUD
    const liveCookie = typeof window !== 'undefined' ? localStorage.getItem('tmi_is_live') : null;
    if (liveCookie === 'true') setIsLive(true);

    function onGoLive() { setIsLive(true); localStorage.setItem('tmi_is_live', 'true'); }
    function onEndBroadcast() { setIsLive(false); localStorage.removeItem('tmi_is_live'); }
    window.addEventListener('tmi:golive', onGoLive);
    window.addEventListener('tmi:endbroadcast', onEndBroadcast);
    return () => {
      window.removeEventListener('tmi:golive', onGoLive);
      window.removeEventListener('tmi:endbroadcast', onEndBroadcast);
    };
  }, [profileSlug]);

  // Only show for profile owner when not currently live
  if (!checked || !isOwner || isLive) return null;

  const headline = hasStreamed
    ? 'Your audience is ready. Go public.'
    : 'Go public — get seen on the Lobby Wall.';
  const sub = hasStreamed
    ? 'Go live now and your profile reappears on the Lobby Wall for all active fans to see.'
    : 'Start broadcasting and your profile goes live on the Lobby Wall. Real fans find you instantly.';

  return (
    <>
      <style>{`
        @keyframes tmiGoLivePulse {
          0%, 100% { border-color: rgba(255,45,170,0.35); box-shadow: 0 0 0 0 rgba(255,45,170,0.2); }
          50% { border-color: rgba(255,45,170,0.7); box-shadow: 0 0 0 8px rgba(255,45,170,0); }
        }
      `}</style>
      <div style={{
        background: 'rgba(255,45,170,0.06)',
        border: '1.5px solid rgba(255,45,170,0.35)',
        borderRadius: 12,
        padding: '20px 24px',
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        animation: 'tmiGoLivePulse 2.4s ease-in-out infinite',
      }}>
        <div>
          <div style={{
            fontSize: 14, fontWeight: 900, color: '#FF2DAA',
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#FF2DAA', display: 'inline-block',
              boxShadow: '0 0 8px #FF2DAA',
            }} />
            🎤 {headline}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>
            {sub}
          </p>
        </div>
        <Link
          href="/live/lobby"
          style={{
            padding: '12px 24px',
            background: '#FF2DAA',
            color: '#050510',
            fontWeight: 900,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            textDecoration: 'none',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          🔴 GO LIVE NOW
        </Link>
      </div>
    </>
  );
}
