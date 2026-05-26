'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildPlaylistOGUrl,
  buildPlaylistReferralUrl,
} from '@/lib/share/ShareTrackingEngine';

interface ViralShareButtonProps {
  playlistId: string;
  curatorId: string;
  playlistTitle?: string;
  sharePath: string;
  className?: string;
}

type SharePlatform = 'native' | 'copy' | 'twitter' | 'sms';

function buildTwitterIntent(text: string, url: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
}

function buildSmsIntent(text: string): string {
  return `sms:?&body=${encodeURIComponent(text)}`;
}

export default function ViralShareButton({
  playlistId,
  curatorId,
  playlistTitle,
  sharePath,
  className,
}: ViralShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const shareUrl = useMemo(
    () =>
      buildPlaylistReferralUrl({
        playlistId,
        curatorId,
        playlistTitle,
        path: sharePath,
        referrerId: curatorId,
      }),
    [playlistId, curatorId, playlistTitle, sharePath],
  );

  const ogImage = useMemo(
    () => buildPlaylistOGUrl({ playlistId, curatorId, playlistTitle }),
    [playlistId, curatorId, playlistTitle],
  );

  async function sendEvent(event: 'share' | 'copy' | 'open' | 'click', platform: SharePlatform) {
    try {
      await fetch('/api/referral/playlist-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          playlistId,
          curatorId,
          referrerId: curatorId,
          source: 'viral_share_button',
          platform,
        }),
      });
    } catch {
      // Non-blocking telemetry.
    }
  }

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const playlist = params.get('playlist');
    if (!ref || !playlist) return;

    const token = `tmi:viral:click:${playlist}:${ref}`;
    if (window.sessionStorage.getItem(token)) return;

    window.sessionStorage.setItem(token, '1');
    void fetch('/api/referral/playlist-share', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'click',
        playlistId,
        curatorId,
        referrerId: ref,
        source: 'viral_share_referral_visit',
        platform: 'native',
      }),
    }).catch(() => undefined);
  }, [playlistId, curatorId]);

  async function oneTapShare() {
    const text = `${playlistTitle || 'My TMI playlist'} is live. Tap in and run it up.`;
    setBusy(true);
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: playlistTitle || 'TMI Playlist', text, url: shareUrl });
        await sendEvent('share', 'native');
        return;
      }
      await navigator.clipboard.writeText(`${text} ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      await sendEvent('copy', 'copy');
    } catch {
      // Ignore share aborts.
    } finally {
      setBusy(false);
    }
  }

  const shareText = `${playlistTitle || 'TMI playlist'} ${shareUrl}`;

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={oneTapShare}
        disabled={busy}
        style={{
          border: '1px solid #00ffff88',
          background: 'linear-gradient(120deg, #00ffff1f, #ff2daa26)',
          color: '#f8ffff',
          borderRadius: 999,
          padding: '8px 14px',
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: busy ? 'default' : 'pointer',
          opacity: busy ? 0.75 : 1,
        }}
        title="One tap share with referral tracking"
      >
        {busy ? 'Sharing...' : 'One Tap Viral Share'}
      </button>

      <a
        href={buildTwitterIntent('Run this playlist up on TMI.', shareUrl)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          void sendEvent('open', 'twitter');
        }}
        style={{ color: '#00ffff', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        X Share
      </a>

      <a
        href={buildSmsIntent(shareText)}
        onClick={() => {
          void sendEvent('open', 'sms');
        }}
        style={{ color: '#ffd700', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        SMS
      </a>

      <a
        href={ogImage}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#ff2daa', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}
      >
        OG Card
      </a>

      {copied ? <span style={{ color: '#00ffff', fontSize: 10 }}>Copied</span> : null}
    </div>
  );
}
