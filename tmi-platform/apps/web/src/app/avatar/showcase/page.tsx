'use client';

/**
 * AvatarShowcasePage.tsx
 * Canonical 24/7 Personal Avatar Showcase Room.
 *
 * Laws:
 * 1. 24/7 accessible outside of venues.
 * 2. Mounts the strongest existing 3D AvatarViewer turntable (orbit, zoom, camera focus).
 * 3. 📸 Snapshot Flow connected to Memory Wall (POST /api/memory/capture -> Prisma.MemoryCollectible).
 *    - DISCARD: Closes preview without saving any asset.
 *    - SAVE: Persists to MemoryCollectible and awards XP.
 *    - Non-intrusive: Never interrupts camera, audio playback, live session, or draft state.
 * 4. Bidirectional routing: Return to Avatar Center (/avatar), Edit in Studio (/avatar/studio), View Memory Wall (/profile?tab=memories).
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  getCanonicalAvatarDraft,
  hydrateCanonicalAvatarDraft,
  patchCanonicalAvatarDraft,
  subscribeCanonicalAvatarDraft,
  type CanonicalAvatarDraftState,
} from '@/lib/avatars/CanonicalAvatarDraft';
import { resolveAvatarPreview } from '@/lib/avatars/AvatarPreviewRuntime';
import type { AvatarCameraFocus } from '@/components/3d/AvatarLobbyCanvas';

// Dynamically import 3D AvatarViewer for WebGL safety
const AvatarViewer = dynamic(
  () => import('@/components/3d/AvatarLobbyCanvas').then((m) => m.AvatarViewer),
  { ssr: false }
);

interface ShowcaseLookPreset {
  id: string;
  title: string;
  subtitle: string;
  tags: string;
  accent: string;
  hairColorHex?: string;
  eyeColorHex?: string;
  outfitTintHex?: string;
}

const SHOWCASE_PRESETS: ShowcaseLookPreset[] = [
  {
    id: 'preset-1',
    title: 'Street Champion',
    subtitle: 'High energy arena gear with cyan edge lights',
    tags: 'Neon Mic | Arena Stage | Wave',
    accent: '#00FFFF',
    hairColorHex: '#B8860B',
    eyeColorHex: '#00FFFF',
    outfitTintHex: '#0a192f',
  },
  {
    id: 'preset-2',
    title: 'Studio Architect',
    subtitle: 'Midnight purple producer look with gold accents',
    tags: 'Laptop Rig | Studio Alley | Idle',
    accent: '#AA2DFF',
    hairColorHex: '#2C1810',
    eyeColorHex: '#1E3F5A',
    outfitTintHex: '#2a0845',
  },
  {
    id: 'preset-3',
    title: 'Royal Headliner',
    subtitle: 'Championship gold crown with deep velvet drape',
    tags: 'Crown + Chain | Night Pulse | Champion',
    accent: '#FFD700',
    hairColorHex: '#0d0d0d',
    eyeColorHex: '#FFD700',
    outfitTintHex: '#1a0528',
  },
];

export default function AvatarShowcasePage() {
  const [draft, setDraft] = useState<CanonicalAvatarDraftState>(() => getCanonicalAvatarDraft());
  const [cameraFocus, setCameraFocus] = useState<AvatarCameraFocus>('body');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-1');
  const [isCapturing, setIsCapturing] = useState(false);
  const [snapshotPreview, setSnapshotPreview] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [savedXp, setSavedXp] = useState<number | null>(null);
  const [turntableRotation, setTurntableRotation] = useState<number>(0);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Subscribe to shared canonical draft
  useEffect(() => {
    const hydrated = hydrateCanonicalAvatarDraft();
    setDraft(hydrated);
    const unsub = subscribeCanonicalAvatarDraft((next) => {
      setDraft(next);
    });
    return unsub;
  }, []);

  // Resolve preview runtime props
  const preview = useMemo(() => resolveAvatarPreview(draft), [draft]);

  // Handle Preset Audition
  const handleAuditionPreset = (preset: ShowcaseLookPreset) => {
    setSelectedPresetId(preset.id);
    patchCanonicalAvatarDraft({
      ...(preset.hairColorHex ? { hairColorHex: preset.hairColorHex } : {}),
      ...(preset.eyeColorHex ? { eyeColorHex: preset.eyeColorHex } : {}),
      ...(preset.outfitTintHex ? { outfitTintHex: preset.outfitTintHex } : {}),
    });
  };

  // 📸 Trigger Snapshot Capture
  const handleTriggerSnapshot = useCallback(() => {
    setIsCapturing(true);
    setSaveStatus('idle');

    // Attempt to extract live canvas image data
    let dataUrl = '';
    try {
      const canvas = canvasContainerRef.current?.querySelector('canvas');
      if (canvas) {
        dataUrl = canvas.toDataURL('image/png');
      }
    } catch (err) {
      console.warn('Canvas toDataURL inaccessible, using SVG snapshot vector fallback', err);
    }

    // Deterministic fallback snapshot if canvas buffer is protected
    if (!dataUrl || dataUrl.length < 50 || dataUrl === 'data:,') {
      const activePreset = SHOWCASE_PRESETS.find((p) => p.id === selectedPresetId) ?? SHOWCASE_PRESETS[0];
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <defs>
          <radialGradient id="bg" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#2a0845" />
            <stop offset="60%" stop-color="#0a0518" />
            <stop offset="100%" stop-color="#05030a" />
          </radialGradient>
        </defs>
        <rect width="600" height="600" fill="url(#bg)" />
        <circle cx="300" cy="240" r="90" fill="${draft.hairColorHex || '#B8860B'}" />
        <circle cx="300" cy="270" r="75" fill="#f0c090" />
        <ellipse cx="275" cy="265" rx="10" ry="14" fill="${draft.eyeColorHex || '#00FFFF'}" />
        <ellipse cx="325" cy="265" rx="10" ry="14" fill="${draft.eyeColorHex || '#00FFFF'}" />
        <path d="M 285 300 Q 300 315 315 300" stroke="#a05030" stroke-width="4" fill="none" stroke-linecap="round" />
        <path d="M 200 420 Q 300 370 400 420 L 420 600 L 180 600 Z" fill="${draft.outfitTintHex || '#0a192f'}" />
        <rect x="20" y="20" width="560" height="560" rx="18" fill="none" stroke="${activePreset.accent}" stroke-width="2" opacity="0.6" />
        <text x="40" y="60" fill="#00FFFF" font-family="sans-serif" font-size="14" font-weight="bold" letter-spacing="2">TMI AVATAR SHOWCASE · 24/7 STUDIO</text>
        <text x="40" y="540" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="bold">${activePreset.title}</text>
        <text x="40" y="565" fill="#aaaacc" font-family="sans-serif" font-size="14">${activePreset.tags}</text>
      </svg>`;
      dataUrl = 'data:image/svg+xml;base64,' + (typeof window !== 'undefined' ? window.btoa(svg) : '');
    }

    setSnapshotPreview(dataUrl);
  }, [draft, selectedPresetId]);

  // 💾 Save Snapshot to Memory Wall
  const handleSaveToMemoryWall = async () => {
    if (!snapshotPreview || saveStatus === 'saving') return;
    setSaveStatus('saving');

    try {
      const activePreset = SHOWCASE_PRESETS.find((p) => p.id === selectedPresetId) ?? SHOWCASE_PRESETS[0];
      const res = await fetch('/api/memory/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: snapshotPreview,
          captureType: 'selfie',
          performerName: 'My Avatar',
          roomLabel: `Avatar Showcase · ${activePreset.title}`,
        }),
      });

      const data = await res.json();
      if (res.ok && (data.success || data.artifact)) {
        setSaveStatus('saved');
        setSavedXp(data.xpEarned ?? 15);
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.error('Failed to save avatar snapshot to Memory Wall', err);
      setSaveStatus('error');
    }
  };

  // ✕ Discard Snapshot Preview
  const handleDiscardSnapshot = () => {
    setIsCapturing(false);
    setSnapshotPreview(null);
    setSaveStatus('idle');
    setSavedXp(null);
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(165deg, #090412 0%, #150a26 45%, #06040d 100%)',
        color: '#f0ecfc',
        padding: '24px 20px 80px',
        fontFamily: 'inherit',
      }}
      data-testid="avatar-showcase-page"
    >
      <div style={{ maxWidth: 1120, margin: '0 auto' }}>
        {/* Header Breadcrumbs & Actions */}
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 20,
            borderBottom: '1px solid rgba(170,45,255,0.2)',
            paddingBottom: 16,
          }}
        >
          <div>
            <div style={{ color: '#AA2DFF', fontSize: 11, fontWeight: 800, letterSpacing: 3 }}>
              24/7 PERSONAL STUDIO · CANONICAL SHOWCASE
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: '4px 0 0', color: '#fff' }}>
              Avatar Showcase Room
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link
              href="/avatar"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ddd',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              ← Avatar Center
            </Link>
            <Link
              href="/avatar/studio"
              style={{
                background: 'rgba(0,255,255,0.12)',
                border: '1px solid #00FFFF',
                color: '#00FFFF',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              🛠️ Open Creation Studio
            </Link>
            <Link
              href="/profile?tab=memories"
              style={{
                background: 'rgba(255,45,170,0.12)',
                border: '1px solid #FF2DAA',
                color: '#FF2DAA',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                textDecoration: 'none',
              }}
            >
              🖼️ Memory Wall
            </Link>
          </div>
        </header>

        {/* 3D Turntable & Camera Controls Surface */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) 340px',
            gap: 20,
            marginBottom: 28,
          }}
        >
          {/* 3D Turntable Stage */}
          <div
            ref={canvasContainerRef}
            style={{
              position: 'relative',
              height: 480,
              borderRadius: 18,
              border: '1px solid rgba(0,255,255,0.25)',
              background: 'radial-gradient(ellipse at 50% 35%, #2a0c48 0%, #0c0617 70%, #05030a 100%)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Stage HUD Top Bar */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 16,
                right: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 10,
                pointerEvents: 'none',
              }}
            >
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: 2, color: '#00FFFF' }}>
                3D TURNTABLE STAGE · DRAG TO ORBIT
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#FFD700' }}>
                Look: {SHOWCASE_PRESETS.find((p) => p.id === selectedPresetId)?.title ?? 'Equipped'}
              </span>
            </div>

            {/* 3D Avatar Viewer Mount */}
            <div
              style={{
                flex: 1,
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {preview.rigProps ? (
                <AvatarViewer
                  {...preview.rigProps}
                  size={420}
                  fill={false}
                  showroomMode
                  enableOrbit={true}
                  cameraFocus={cameraFocus}
                />
              ) : (
                <div style={{ color: '#888', fontSize: 13 }}>Initializing 3D Turntable…</div>
              )}
            </div>

            {/* Stage HUD Bottom Controls (Camera Presets + Snapshot Trigger) */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                left: 16,
                right: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 10,
                zIndex: 10,
              }}
            >
              {/* Camera Angle Presets */}
              <div style={{ display: 'flex', gap: 6, background: 'rgba(0,0,0,0.6)', padding: 4, borderRadius: 10 }}>
                {(['body', 'upper', 'face'] as const).map((focus) => (
                  <button
                    key={focus}
                    type="button"
                    onClick={() => setCameraFocus(focus)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: cameraFocus === focus ? '1px solid #00FFFF' : '1px solid transparent',
                      background: cameraFocus === focus ? 'rgba(0,255,255,0.2)' : 'transparent',
                      color: cameraFocus === focus ? '#00FFFF' : '#aaa',
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {focus === 'body' ? 'Full Body' : focus === 'upper' ? 'Upper' : 'Face'}
                  </button>
                ))}
              </div>

              {/* 📸 Picture Icon Snapshot Action Button */}
              <button
                type="button"
                onClick={handleTriggerSnapshot}
                data-testid="avatar-snapshot-trigger"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 18px',
                  borderRadius: 10,
                  border: '1px solid #FF2DAA',
                  background: 'rgba(255,45,170,0.2)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1,
                  cursor: 'pointer',
                  boxShadow: '0 0 16px rgba(255,45,170,0.3)',
                }}
              >
                📸 TAKE SNAPSHOT
              </button>
            </div>
          </div>

          {/* Right Rail: Equipped Look Details & Preset Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div
              style={{
                borderRadius: 14,
                border: '1px solid rgba(170,45,255,0.3)',
                background: '#120a1f',
                padding: 16,
              }}
            >
              <div style={{ color: '#AA2DFF', fontSize: 10, fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>
                CURRENT EQUIPPED IDENTITY
              </div>
              <h2 style={{ fontSize: 18, margin: '0 0 8px', color: '#fff' }}>
                Base: {draft.baseId}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11, color: '#bbb' }}>
                <div>Skin Tone: {(draft.skinT * 100).toFixed(0)}%</div>
                <div>Cosmetics: {draft.equippedCosmeticIds.length} items</div>
                <div>Action: {draft.previewAction}</div>
                <div>Fidelity: {preview.fidelity}</div>
              </div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#9f7dd6', marginTop: 4 }}>
              SHOWCASE PRESENTATION CARDS
            </div>
            {SHOWCASE_PRESETS.map((preset) => {
              const active = selectedPresetId === preset.id;
              return (
                <article
                  key={preset.id}
                  onClick={() => handleAuditionPreset(preset)}
                  style={{
                    borderRadius: 12,
                    border: active ? `2px solid ${preset.accent}` : '1px solid #332244',
                    background: active ? '#1a1029' : '#0d0716',
                    padding: 14,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: '0 0 4px', color: active ? preset.accent : '#eee', fontSize: 15 }}>
                      {preset.title}
                    </h3>
                    {active ? (
                      <span style={{ fontSize: 9, fontWeight: 800, color: preset.accent, letterSpacing: 1 }}>
                        ON STAGE
                      </span>
                    ) : null}
                  </div>
                  <p style={{ margin: '0 0 6px', color: '#aaa', fontSize: 11 }}>{preset.subtitle}</p>
                  <span style={{ color: '#776688', fontSize: 10 }}>{preset.tags}</span>
                </article>
              );
            })}
          </div>
        </section>

        {/* 📸 Snapshot Review & Memory Wall Persistence Modal */}
        {isCapturing && snapshotPreview && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(5, 2, 12, 0.85)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: 16,
            }}
            data-testid="avatar-snapshot-modal"
          >
            <div
              style={{
                width: '100%',
                maxWidth: 480,
                background: '#120a1f',
                border: '1px solid #FF2DAA',
                borderRadius: 20,
                padding: 24,
                boxShadow: '0 12px 48px rgba(255,45,170,0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: '#FF2DAA', fontSize: 11, fontWeight: 800, letterSpacing: 2 }}>
                  AVATAR SNAPSHOT REVIEW
                </div>
                <button
                  type="button"
                  onClick={handleDiscardSnapshot}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#888',
                    fontSize: 20,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Preview Image */}
              <div
                style={{
                  borderRadius: 14,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: '#07040d',
                  maxHeight: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={snapshotPreview}
                  alt="Avatar Showcase Snapshot"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>

              {/* Snapshot Info */}
              <div style={{ fontSize: 12, color: '#bbb' }}>
                <p style={{ margin: '0 0 4px', color: '#fff', fontWeight: 700 }}>
                  Destination: Memory Wall &amp; Personal Collectibles
                </p>
                <p style={{ margin: 0, color: '#888' }}>
                  Saves directly to your permanent Memory Wall ledger via <code>POST /api/memory/capture</code>.
                  Reusable in YoPho card compositor.
                </p>
              </div>

              {/* Status Banner */}
              {saveStatus === 'saved' ? (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(0,255,136,0.15)',
                    border: '1px solid #00FF88',
                    color: '#00FF88',
                    fontSize: 12,
                    fontWeight: 700,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>✅ Snapshot Saved! +{savedXp} XP</span>
                  <Link href="/profile?tab=memories" style={{ color: '#00FFFF', textDecoration: 'underline' }}>
                    View in Memory Wall →
                  </Link>
                </div>
              ) : saveStatus === 'error' ? (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    background: 'rgba(255,70,70,0.15)',
                    border: '1px solid #FF4444',
                    color: '#FF6B6B',
                    fontSize: 12,
                  }}
                >
                  ❌ Save failed — please try again
                </div>
              ) : null}

              {/* Action Buttons: Save vs Discard */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={handleDiscardSnapshot}
                  disabled={saveStatus === 'saving'}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'transparent',
                    color: '#ddd',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {saveStatus === 'saved' ? 'Close' : '✕ Discard'}
                </button>
                {saveStatus !== 'saved' ? (
                  <button
                    type="button"
                    onClick={handleSaveToMemoryWall}
                    disabled={saveStatus === 'saving'}
                    style={{
                      flex: 1.5,
                      padding: '12px',
                      borderRadius: 10,
                      border: '1px solid #00FF88',
                      background: 'rgba(0,255,136,0.2)',
                      color: '#00FF88',
                      fontSize: 13,
                      fontWeight: 800,
                      cursor: saveStatus === 'saving' ? 'wait' : 'pointer',
                    }}
                  >
                    {saveStatus === 'saving' ? 'Saving to Memory Wall…' : '💾 Save to Memory Wall'}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
