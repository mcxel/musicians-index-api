'use client';

import { useMemo, useState } from 'react';
import {
  buildArticleReferralUrl,
  type ArticleShareEventType,
  type ArticleShareMode,
} from '@/lib/share/ArticleShareTrackingEngine';

interface Props {
  articleSlug: string;
  performerSlug: string;
  performerName: string;
  headline: string;
  sharePath: string;
  isLive: boolean;
}

type SharePlatform =
  | 'x'
  | 'facebook'
  | 'linkedin'
  | 'reddit'
  | 'discord'
  | 'whatsapp'
  | 'telegram'
  | 'email'
  | 'sms'
  | 'copy'
  | 'qr';

function buildIntent(platform: Exclude<SharePlatform, 'copy' | 'qr'>, text: string, url: string): string {
  if (platform === 'x') return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  if (platform === 'facebook') return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  if (platform === 'linkedin') return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  if (platform === 'reddit') return `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
  if (platform === 'whatsapp') return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  if (platform === 'telegram') return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
  if (platform === 'email') return `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
  if (platform === 'sms') return `sms:?&body=${encodeURIComponent(`${text} ${url}`)}`;
  return url;
}

export default function PerformerArticleShareBar({
  articleSlug,
  performerSlug,
  performerName,
  headline,
  sharePath,
  isLive,
}: Props) {
  const [mode, setMode] = useState<ArticleShareMode>(isLive ? 'live' : 'still');
  const [copied, setCopied] = useState(false);

  const modes: Array<{ id: ArticleShareMode; label: string; disabled?: boolean }> = [
    { id: 'still', label: 'Still' },
    { id: 'motion', label: 'Motion' },
    { id: 'live', label: 'Live', disabled: !isLive },
    { id: 'premiere', label: 'Premiere' },
  ];

  const platformRows: Array<{ id: SharePlatform; label: string }> = [
    { id: 'x', label: 'X' },
    { id: 'facebook', label: 'Facebook' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'reddit', label: 'Reddit' },
    { id: 'discord', label: 'Discord' },
    { id: 'whatsapp', label: 'WhatsApp' },
    { id: 'telegram', label: 'Telegram' },
    { id: 'email', label: 'Email' },
    { id: 'sms', label: 'SMS' },
    { id: 'copy', label: 'Copy Link' },
    { id: 'qr', label: 'QR' },
  ];

  const shareText = useMemo(() => {
    if (mode === 'live') return `LIVE NOW on TMI: ${performerName} — ${headline}`;
    if (mode === 'motion') return `${performerName} motion cover in TMI Magazine — ${headline}`;
    if (mode === 'premiere') return `${performerName} goes live soon on TMI — ${headline}`;
    return `${performerName} featured in TMI Magazine — ${headline}`;
  }, [mode, performerName, headline]);

  async function sendEvent(event: ArticleShareEventType, platform: SharePlatform) {
    try {
      await fetch('/api/referral/article-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          articleSlug,
          performerSlug,
          referrerId: performerSlug,
          mode,
          source: `article_share_${platform}`,
          platform,
        }),
      });
    } catch {
      // Non-blocking telemetry.
    }
  }

  async function onShare(platform: SharePlatform) {
    const url = buildArticleReferralUrl({
      articleSlug,
      performerSlug,
      performerName,
      headline,
      path: sharePath,
      referrerId: performerSlug,
      mode,
      platform,
    });

    if (platform === 'copy') {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
      await sendEvent('copy', platform);
      return;
    }

    if (platform === 'qr') {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(url)}`;
      window.open(qrUrl, '_blank', 'noopener,noreferrer');
      await sendEvent('open', platform);
      return;
    }

    if (platform === 'discord') {
      await navigator.clipboard.writeText(`${shareText} ${url}`);
      window.open('https://discord.com/app', '_blank', 'noopener,noreferrer');
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
      await sendEvent('copy', platform);
      return;
    }

    const intent = buildIntent(platform as Exclude<SharePlatform, 'copy' | 'qr'>, shareText, url);
    await sendEvent('open', platform);
    window.open(intent, '_blank', 'noopener,noreferrer');
  }

  return (
    <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 12, padding: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 900, color: '#00FFFF', letterSpacing: '0.12em' }}>LIVING MAGAZINE SHARE</div>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Modes: LIVE → MOTION → STILL fallback</div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        {modes.map((entry) => (
          <button
            key={entry.id}
            type="button"
            disabled={entry.disabled}
            onClick={() => setMode(entry.id)}
            style={{
              borderRadius: 999,
              border: `1px solid ${mode === entry.id ? '#00FFFF66' : 'rgba(255,255,255,0.2)'}`,
              background: mode === entry.id ? 'rgba(0,255,255,0.14)' : 'rgba(255,255,255,0.04)',
              color: entry.disabled ? 'rgba(255,255,255,0.3)' : '#fff',
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: '0.08em',
              padding: '6px 12px',
              cursor: entry.disabled ? 'default' : 'pointer',
            }}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {platformRows.map((platform) => (
          <button
            key={platform.id}
            type="button"
            onClick={() => {
              void sendEvent('share', platform.id);
              void onShare(platform.id);
            }}
            style={{
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.16)',
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '0.06em',
              padding: '7px 10px',
              cursor: 'pointer',
            }}
          >
            {platform.label}
          </button>
        ))}
      </div>

      {copied ? <div style={{ marginTop: 8, fontSize: 9, color: '#00FF88', fontWeight: 700 }}>Copied with attribution params.</div> : null}
      <div style={{ marginTop: 8, fontSize: 8, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
        Social impressions are tracked separately and are not counted as full magazine reads. Engaged reads require in-article interaction.
      </div>
    </div>
  );
}
