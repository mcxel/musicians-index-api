'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { AvatarSnapshot } from '@/hooks/useOverseerDeck';

const AVATAR_KEY  = 'tmi_avatar_snapshot';
const AVATAR_EVENT = 'tmi:avatar-changed';

const DEFAULT: AvatarSnapshot = {
  displayName: 'Your Avatar',
  skin: '#c07848',
  hair: 'Fade',
  outfit: 'Street Fit',
  bodyHeight: 50,
  bodyMass: 50,
};

type Variant = 'card' | 'mini' | 'seat';

interface AvatarMiniPreviewProps {
  variant?: Variant;
  role?: string;
  accentColor?: string;
}

function readSnapshot(): AvatarSnapshot {
  if (typeof window === 'undefined') return DEFAULT;
  try {
    const raw = localStorage.getItem(AVATAR_KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : DEFAULT;
  } catch { return DEFAULT; }
}

export default function AvatarMiniPreview({
  variant = 'card',
  role,
  accentColor = '#00FFFF',
}: AvatarMiniPreviewProps) {
  const [avatar, setAvatar] = useState<AvatarSnapshot>(DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAvatar(readSnapshot());
    setMounted(true);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Partial<AvatarSnapshot>>).detail;
      setAvatar((prev) => ({ ...prev, ...detail }));
    };
    window.addEventListener(AVATAR_EVENT, handler);
    return () => window.removeEventListener(AVATAR_EVENT, handler);
  }, []);

  if (!mounted) return null;

  const heightScale = 0.7  + (avatar.bodyHeight / 100) * 0.6;
  const massScale   = 0.75 + (avatar.bodyMass   / 100) * 0.55;

  if (variant === 'mini') {
    // Tiny inline badge — just the circle + name
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: avatar.skin,
          border: `2px solid ${accentColor}66`,
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', lineHeight: 1 }}>
            {avatar.displayName}
          </div>
          {role && <div style={{ fontSize: 9, color: accentColor, letterSpacing: '0.08em' }}>{role}</div>}
        </div>
      </div>
    );
  }

  if (variant === 'seat') {
    // Audience seat style — like AudienceField seat tiles
    return (
      <div style={{
        aspectRatio: '1/1',
        borderRadius: 8,
        border: `1px solid ${accentColor}66`,
        background: `${accentColor}10`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 4, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          width: 20, height: 20, borderRadius: '50%',
          background: avatar.skin, border: `1px solid ${accentColor}88`,
          marginBottom: 2,
        }} />
        <div style={{ fontSize: 7, color: accentColor, fontWeight: 900, letterSpacing: '0.04em', lineHeight: 1 }}>
          YOU
        </div>
        <span style={{
          position: 'absolute', bottom: 1, left: 2,
          fontSize: 6, color: 'rgba(255,255,255,0.45)',
          whiteSpace: 'nowrap', overflow: 'hidden',
          maxWidth: '90%', textOverflow: 'ellipsis',
        }}>
          {avatar.displayName}
        </span>
      </div>
    );
  }

  // Default: 'card' variant
  return (
    <section style={{
      borderRadius: 14,
      border: `1px solid ${accentColor}33`,
      background: `${accentColor}08`,
      padding: '16px 18px',
    }}>
      <div style={{ fontSize: 9, color: accentColor, letterSpacing: '0.2em', fontWeight: 800, marginBottom: 12 }}>
        YOUR AVATAR
      </div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {/* Figure */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          {/* Head */}
          <div style={{
            width: Math.round(48 + (avatar.bodyHeight / 100) * 16),
            height: Math.round(48 + (avatar.bodyHeight / 100) * 16),
            borderRadius: '50%',
            background: avatar.skin,
            border: `2px solid ${accentColor}66`,
          }} />
          {/* Body */}
          <div style={{
            width:  Math.round(30 * massScale),
            height: Math.round(40 * heightScale),
            borderRadius: 6,
            background: `${avatar.skin}88`,
            border: `1px solid ${accentColor}44`,
          }} />
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', letterSpacing: '0.01em', marginBottom: 4 }}>
            {avatar.displayName}
          </div>
          {role && (
            <div style={{ fontSize: 9, color: accentColor, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 8 }}>
              {role}
            </div>
          )}
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            <div>Hair: {avatar.hair}</div>
            <div>Outfit: {avatar.outfit}</div>
          </div>
          <Link
            href="/avatar-center"
            style={{
              display: 'inline-block', marginTop: 10, fontSize: 9, fontWeight: 900,
              color: accentColor, border: `1px solid ${accentColor}44`,
              padding: '4px 12px', borderRadius: 6, textDecoration: 'none',
              letterSpacing: '0.1em',
            }}
          >
            EDIT AVATAR →
          </Link>
        </div>
      </div>
    </section>
  );
}
