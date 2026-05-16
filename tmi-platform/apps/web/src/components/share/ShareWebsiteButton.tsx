'use client';

import {
  buildEmailShare,
  buildFacebookShare,
  buildInstagramCopyPrompt,
  buildShareUrl,
  buildSmsShare,
  buildTikTokCopyPrompt,
  buildTwitterShare,
  type ShareTarget,
} from '@/lib/share/ShareLinkEngine';
import { useMemo, useState, type CSSProperties } from 'react';

interface ShareWebsiteButtonProps {
  title?: string;
  text?: string;
  path?: string;
  className?: string;
}

export default function ShareWebsiteButton({
  title = "The Musician's Index",
  text = "Check out The Musician's Index",
  path,
  className,
}: ShareWebsiteButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const target = useMemo<ShareTarget>(() => {
    const resolvedPath =
      path || (typeof window !== 'undefined' ? window.location.pathname : '/home/1');
    return {
      title,
      text,
      path: resolvedPath,
      context: { source: 'share_button', medium: 'social', campaign: 'soft_launch' },
    };
  }, [path, text, title]);

  async function copyLink() {
    const url = buildShareUrl(target);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  async function nativeShare() {
    const url = buildShareUrl(target);
    if (!navigator.share) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title: target.title, text: target.text, url });
    } catch {
      // Ignore aborts.
    }
  }

  const baseButtonStyle: CSSProperties = {
    border: '1px solid #00ffff77',
    background: 'linear-gradient(120deg, #00ffff1f, #ff2daa26)',
    color: '#f8ffff',
    borderRadius: 999,
    padding: '8px 14px',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  };

  return (
    <div className={className} style={{ position: 'relative', display: 'inline-flex', gap: 8 }}>
      <button type="button" onClick={() => setOpen((s) => !s)} style={baseButtonStyle}>
        Share Website
      </button>
      <button type="button" onClick={nativeShare} style={baseButtonStyle}>
        Quick Share
      </button>
      {copied ? (
        <span style={{ color: '#00ffff', fontSize: 11, alignSelf: 'center' }}>Copied</span>
      ) : null}

      {open ? (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 220,
            border: '1px solid #00ffff55',
            background: '#050510ee',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            padding: 10,
            display: 'grid',
            gap: 8,
            zIndex: 1000,
          }}
        >
          <button type="button" onClick={copyLink} style={baseButtonStyle}>
            Copy Link
          </button>
          <a href={buildSmsShare(target)} style={baseButtonStyle}>
            SMS Share
          </a>
          <a href={buildEmailShare(target)} style={baseButtonStyle}>
            Email Share
          </a>
          <a
            href={buildFacebookShare(target)}
            target="_blank"
            rel="noreferrer"
            style={baseButtonStyle}
          >
            Facebook
          </a>
          <a
            href={buildTwitterShare(target)}
            target="_blank"
            rel="noreferrer"
            style={baseButtonStyle}
          >
            X / Twitter
          </a>
          <a
            href={`https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(
              buildShareUrl(target)
            )}`}
            target="_blank"
            rel="noreferrer"
            style={baseButtonStyle}
          >
            QR Share
          </a>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(buildInstagramCopyPrompt(target));
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              } catch {
                setCopied(false);
              }
            }}
            style={baseButtonStyle}
          >
            Instagram Copy Prompt
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(buildTikTokCopyPrompt(target));
                setCopied(true);
                setTimeout(() => setCopied(false), 1600);
              } catch {
                setCopied(false);
              }
            }}
            style={baseButtonStyle}
          >
            TikTok Copy Prompt
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ ...baseButtonStyle, borderColor: '#ffffff33', background: '#ffffff12' }}
          >
            Close
          </button>
        </div>
      ) : null}
    </div>
  );
}
