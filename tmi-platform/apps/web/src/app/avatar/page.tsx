'use client';

/**
 * AvatarHubPage.tsx
 * Canonical Surface: /avatar = AVATAR CENTER / 24-7 PERSONAL HOME
 *
 * Laws:
 * 1. 24/7 personal avatar home & module navigation launcher.
 * 2. Displays Current Equipped Avatar preview & status tags.
 * 3. Provides clean entry routes to Creation Studio (/avatar/studio) and 3D Showcase (/avatar/showcase).
 * 4. Subscribes to shared CanonicalAvatarDraft state.
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import SectionTitle from '@/components/ui/SectionTitle';
import {
  getCanonicalAvatarDraft,
  hydrateCanonicalAvatarDraft,
  subscribeCanonicalAvatarDraft,
  type CanonicalAvatarDraftState,
} from '@/lib/avatars/CanonicalAvatarDraft';

const AVATAR_MODULES = [
  { href: '/avatar/studio', emoji: '🧬', label: 'CREATE', sub: '3D Avatar Runtime v0 — evolving', accent: '#FF2DAA' },
  { href: '/avatar/scan', emoji: '📷', label: 'FACE SCAN', sub: 'Scan your face for a likeness', accent: '#00FFFF' },
  { href: '/avatar/studio', emoji: '🛠️', label: 'FORGE', sub: 'Build from scratch', accent: '#AA2DFF' },
  { href: '/avatar/studio', emoji: '✏️', label: 'CUSTOMIZE', sub: 'Fine-tune your look', accent: '#00FFFF' },
  { href: '/avatar/inventory', emoji: '🎒', label: 'INVENTORY', sub: 'Your owned items', accent: '#AA2DFF' },
  { href: '/avatar/shop', emoji: '🛍️', label: 'SHOP', sub: 'Buy props & clothing', accent: '#FFD700' },
  { href: '/avatar/nft', emoji: '🖼️', label: 'NFT STORE', sub: 'Mint & collect', accent: '#FF2DAA' },
  { href: '/avatar/showcase', emoji: '🌟', label: 'SHOWCASE', sub: '24/7 3D Studio & Snapshots', accent: '#FFD700' },
];

export default function AvatarHubPage() {
  const [draft, setDraft] = useState<CanonicalAvatarDraftState>(() => getCanonicalAvatarDraft());

  useEffect(() => {
    const hydrated = hydrateCanonicalAvatarDraft();
    setDraft(hydrated);
    const unsub = subscribeCanonicalAvatarDraft((next) => {
      setDraft(next);
    });
    return unsub;
  }, []);

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', paddingBottom: 80 }} data-testid="avatar-center-page">
          {/* Hero Surface with Current Equipped Avatar Card */}
          <div
            style={{
              background: 'linear-gradient(160deg, #1a0528 0%, #080414 55%, #050510 100%)',
              padding: '48px 32px 36px',
              borderBottom: '1px solid #AA2DFF33',
            }}
          >
            <div style={{ maxWidth: 1120, margin: '0 auto' }}>
              {/* Back to Fan Hub Link */}
              <div style={{ marginBottom: 16 }}>
                <Link
                  href="/hub"
                  style={{
                    color: '#888',
                    fontSize: 12,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ← Fan Hub / Home
                </Link>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(300px, 1fr) 380px',
                  gap: 32,
                  alignItems: 'center',
                }}
              >
                {/* Hero Description */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <div style={{ fontSize: 11, letterSpacing: 4, color: '#AA2DFF', textTransform: 'uppercase', marginBottom: 8 }}>
                    3D AVATAR RUNTIME v0 — 24/7 PERSONAL HOME
                  </div>
                  <h1 style={{ fontSize: 44, fontWeight: 900, color: '#fff', margin: '0 0 12px', lineHeight: 1.1 }}>
                    AVATAR CENTER
                  </h1>
                  <p style={{ color: '#bbaacc', fontSize: 15, maxWidth: 520, lineHeight: 1.6, margin: '0 0 24px' }}>
                    Your central command for 3D identity, wardrobe customization, and live room representation.
                    Equip your persona, preview on the 3D turntable, and capture moments directly to your permanent Memory Wall.
                  </p>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link
                      href="/avatar/studio"
                      style={{
                        background: '#AA2DFF',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: 1.5,
                        padding: '12px 26px',
                        borderRadius: 8,
                        textDecoration: 'none',
                        boxShadow: '0 4px 20px rgba(170,45,255,0.3)',
                      }}
                    >
                      🛠️ OPEN CREATION STUDIO →
                    </Link>
                    <Link
                      href="/avatar/showcase"
                      style={{
                        background: 'rgba(255,215,0,0.12)',
                        color: '#FFD700',
                        fontWeight: 800,
                        fontSize: 13,
                        letterSpacing: 1.5,
                        padding: '12px 26px',
                        borderRadius: 8,
                        border: '1px solid #FFD700',
                        textDecoration: 'none',
                      }}
                    >
                      🌟 3D SHOWCASE &amp; SNAPSHOT
                    </Link>
                  </div>
                </motion.div>

                {/* Current Equipped Avatar Presentation Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  style={{
                    background: 'radial-gradient(ellipse at 50% 25%, #230d3d 0%, #0f071e 65%, #080412 100%)',
                    border: '1px solid rgba(0,255,255,0.3)',
                    borderRadius: 18,
                    padding: 20,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  }}
                  data-testid="current-equipped-avatar-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#00FFFF' }}>
                      CURRENT EQUIPPED AVATAR
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 800,
                        background: 'rgba(0,255,136,0.18)',
                        color: '#00FF88',
                        padding: '3px 8px',
                        borderRadius: 6,
                        border: '1px solid rgba(0,255,136,0.4)',
                      }}
                    >
                      ACTIVE &amp; SYNCED
                    </span>
                  </div>

                  {/* Visual Identity Preview Box */}
                  <div
                    style={{
                      height: 140,
                      borderRadius: 12,
                      background: '#090514',
                      border: '1px solid rgba(170,45,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      marginBottom: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        background: draft.hairColorHex || '#B8860B',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 0 24px ${draft.outfitTintHex || '#AA2DFF'}66`,
                      }}
                    >
                      <div
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          background: '#f0c090',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <div style={{ width: 8, height: 10, borderRadius: '50%', background: draft.eyeColorHex || '#00FFFF' }} />
                        <div style={{ width: 8, height: 10, borderRadius: '50%', background: draft.eyeColorHex || '#00FFFF' }} />
                      </div>
                    </div>
                  </div>

                  {/* Metadata Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, marginBottom: 14 }}>
                    <div style={{ color: '#888' }}>
                      Base: <span style={{ color: '#fff', fontWeight: 700 }}>{draft.baseId}</span>
                    </div>
                    <div style={{ color: '#888' }}>
                      Skin Tone: <span style={{ color: '#fff', fontWeight: 700 }}>{(draft.skinT * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{ color: '#888' }}>
                      Cosmetics: <span style={{ color: '#fff', fontWeight: 700 }}>{draft.equippedCosmeticIds.length} equipped</span>
                    </div>
                    <div style={{ color: '#888' }}>
                      State: <span style={{ color: '#00FFFF', fontWeight: 700 }}>{draft.previewAction}</span>
                    </div>
                  </div>

                  {/* Card Quick Actions */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link
                      href="/avatar/studio"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        background: 'rgba(170,45,255,0.15)',
                        border: '1px solid #AA2DFF',
                        color: '#AA2DFF',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '8px 0',
                        borderRadius: 6,
                        textDecoration: 'none',
                      }}
                    >
                      EDIT LOOK
                    </Link>
                    <Link
                      href="/avatar/showcase"
                      style={{
                        flex: 1,
                        textAlign: 'center',
                        background: 'rgba(0,255,255,0.15)',
                        border: '1px solid #00FFFF',
                        color: '#00FFFF',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '8px 0',
                        borderRadius: 6,
                        textDecoration: 'none',
                      }}
                    >
                      3D SHOWCASE
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Avatar Modules Grid */}
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 32px 0' }}>
            <SectionTitle title="AVATAR MODULES" accent="purple" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18, marginTop: 24 }}>
              {AVATAR_MODULES.map((mod, i) => (
                <motion.div key={mod.href + mod.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={mod.href} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        background: '#0a0a1a',
                        border: '1px solid #1a1a2e',
                        borderTop: `2px solid ${mod.accent}`,
                        borderRadius: 14,
                        padding: '28px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                      }}
                    >
                      <div style={{ fontSize: 40, marginBottom: 12 }}>{mod.emoji}</div>
                      <div style={{ color: mod.accent, fontWeight: 800, fontSize: 13, letterSpacing: 2, marginBottom: 6 }}>
                        {mod.label}
                      </div>
                      <div style={{ color: '#666', fontSize: 12 }}>{mod.sub}</div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        <FooterHUD />
      </HUDFrame>
    </PageShell>
  );
}
