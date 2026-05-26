'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function SubmitConfirmPage() {
  const router = useRouter();
  const params = useSearchParams();

  const id = params?.get('id') ?? '';
  const shareUrl = params?.get('share') ?? '';
  const type = params?.get('type') ?? 'track';

  const [copied, setCopied] = useState(false);
  const [autoJoinCountdown, setAutoJoinCountdown] = useState(8);

  // Auto-redirect to radio room after countdown
  useEffect(() => {
    if (autoJoinCountdown <= 0) {
      router.push('/rooms/radio');
      return;
    }
    const t = setTimeout(() => setAutoJoinCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [autoJoinCountdown, router]);

  async function handleCopy() {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // clipboard unavailable — silently ignore
    }
  }

  async function handleNativeShare() {
    if (!shareUrl) return;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Check out my submission on TMI', url: shareUrl });
      } catch {
        // user cancelled or not supported
      }
    } else {
      handleCopy();
    }
  }

  const ROOM_MAP: Record<string, string> = {
    track: '/rooms/radio',
    beat: '/rooms/radio',
    battle: '/battles',
    cypher: '/cypher/lobby-wall',
    video: '/rooms/radio',
    comedy: '/rooms/radio',
    dance: '/rooms/radio',
    show: '/go-live',
  };

  const destinationRoom = ROOM_MAP[type] ?? '/rooms/radio';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050510',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 20px',
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
        }}
      >
        {/* Glow ring */}
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            border: '2px solid #00FFFF',
            boxShadow: '0 0 30px #00FFFF44',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            margin: '0 auto 24px',
          }}
        >
          🚀
        </div>

        <p
          style={{
            fontSize: 11,
            letterSpacing: '0.25em',
            color: '#FF2DAA',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Submission Received
        </p>
        <h1
          style={{
            fontFamily: '"Bebas Neue","Impact",sans-serif',
            fontSize: 'clamp(36px,8vw,72px)',
            lineHeight: 0.9,
            letterSpacing: '0.04em',
            background: 'linear-gradient(135deg,#00FFFF 0%,#AA2DFF 60%,#FF2DAA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 14,
          }}
        >
          YOU&apos;RE IN THE MACHINE
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.55)',
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          Your track is pending review. While you wait — share your link and
          start building your audience. Every click earns you XP.
        </p>

        {id && (
          <p
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.25)',
              marginBottom: 24,
              fontFamily: 'monospace',
            }}
          >
            ID: {id}
          </p>
        )}

        {/* CTA buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginBottom: 32,
          }}
        >
          {/* Share Now */}
          <button
            onClick={handleNativeShare}
            style={{
              background: '#FF2DAA',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '14px 0',
              fontWeight: 900,
              fontSize: 14,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            📣 Share Now — Build Your Audience
          </button>

          {/* Copy Link */}
          <button
            onClick={handleCopy}
            style={{
              background: 'transparent',
              color: '#00FFFF',
              border: '1.5px solid #00FFFF44',
              borderRadius: 10,
              padding: '12px 0',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            {copied ? '✅ Copied!' : '🔗 Copy Viral Link'}
          </button>

          {/* Enter Room */}
          <button
            onClick={() => router.push(destinationRoom)}
            style={{
              background: 'rgba(0,255,255,0.08)',
              color: '#00FFFF',
              border: '1.5px solid #00FFFF33',
              borderRadius: 10,
              padding: '12px 0',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              cursor: 'pointer',
            }}
          >
            🎙 Enter Room Now
          </button>
        </div>

        {/* Auto-redirect notice */}
        <p
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          Auto-joining the room in{' '}
          <span style={{ color: '#00FFFF', fontWeight: 700 }}>
            {autoJoinCountdown}s
          </span>
          …
        </p>
      </div>
    </div>
  );
}
