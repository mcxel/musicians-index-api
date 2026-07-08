'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  getAccessibleRetroVisionBackdrops,
  getDefaultRetroVisionBackdrop,
  type FanTier,
  type RetroVisionBackdrop,
} from '@/lib/studio/retroVisionRegistry';
import type { CompositionJob } from '@/lib/studio/CompositorEngine';
import type { CreativeCollection } from '@/lib/studio/CreativeEngine';

type RetroVisionMode = 'still' | 'motion' | 'story' | 'poster';

interface FanRetroVisionStudioProps {
  fanSlug: string;
  fanName: string;
  fanTier: FanTier;
  avatarUrl?: string | null;
  accentColor: string;
}

const MODES: Array<{ id: RetroVisionMode; label: string; description: string }> = [
  { id: 'still', label: 'Still', description: 'Classic portrait keepsake' },
  { id: 'motion', label: 'Motion', description: 'Soft animated studio card' },
  { id: 'story', label: 'Story', description: 'Vertical share format' },
  { id: 'poster', label: 'Poster', description: 'Fan tribute poster' },
];

function buildShareUrl(path: string): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://themusiciansindex.com';
  return new URL(path, origin).toString();
}

export default function FanRetroVisionStudio({ fanSlug, fanName, fanTier, avatarUrl, accentColor }: FanRetroVisionStudioProps) {
  const [mode, setMode] = useState<RetroVisionMode>('still');
  const accessible = useMemo(() => getAccessibleRetroVisionBackdrops(fanTier), [fanTier]);
  const [selected, setSelected] = useState<RetroVisionBackdrop>(() => getDefaultRetroVisionBackdrop(fanTier));
  const [copied, setCopied] = useState(false);
  const [buildBusy, setBuildBusy] = useState(false);
  const [buildJob, setBuildJob] = useState<CompositionJob | null>(null);
  const [collection, setCollection] = useState<CreativeCollection | null>(null);
  const [memoryStatus, setMemoryStatus] = useState<string | null>(null);

  async function shareStudio() {
    const url = buildShareUrl(`/fan/${fanSlug}/studio?backdrop=${encodeURIComponent(selected.id)}&mode=${mode}`);
    const text = `${fanName}'s Retro-Vision Studio on TMI`;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        await navigator.share({ title: text, text, url });
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // User cancelled or clipboard blocked.
    }
  }

  async function buildKeepsake() {
    setBuildBusy(true);
    try {
      const response = await fetch('/api/studio/compose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: fanSlug,
          ownerName: fanName,
          ownerTier: fanTier,
          backdropId: selected.id,
          backdropName: selected.name,
          mode,
          accentColor,
          sourceImageUrl: avatarUrl,
          templateId: selected.id,
          title: `${fanName} · ${selected.name}`,
          description: `Retro-Vision keepsake in ${mode} mode`,
          studioIntent: 'fan-retro-keepsake',
        }),
      });

      const data = await response.json() as { ok: boolean; job?: CompositionJob; collection?: CreativeCollection; error?: string };
      if (!response.ok || !data.ok || !data.job) {
        throw new Error(data.error || 'compose_failed');
      }

      setBuildJob(data.job);
      setCollection(data.collection ?? null);
      setMemoryStatus(null);
    } catch {
      // Honest fallback: the live preview remains visible even if composition fails.
    } finally {
      setBuildBusy(false);
    }
  }

  async function saveToMemoryWall(asset: { previewDataUrl: string; title: string; description: string }) {
    try {
      const response = await fetch('/api/memory/wall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: fanSlug,
          entityType: 'fan',
          contentType: 'photo',
          contentUrl: asset.previewDataUrl,
          title: asset.title,
          description: asset.description,
          tags: ['retro-vision', 'creative-engine'],
          isPublic: true,
        }),
      });

      if (!response.ok) {
        setMemoryStatus('Sign in required to persist this keepsake to Memory Wall.');
        return;
      }

      setMemoryStatus('Saved to Memory Wall.');
    } catch {
      setMemoryStatus('Could not save to Memory Wall right now.');
    }
  }

  return (
    <section style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: '0.32em', color: accentColor, fontWeight: 900, textTransform: 'uppercase' }}>TMI STUDIO</div>
          <h1 style={{ margin: '6px 0 0', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 900 }}>Retro-Vision Studio</h1>
          <p style={{ margin: '8px 0 0', color: 'rgba(255,255,255,0.55)', maxWidth: 820, lineHeight: 1.6, fontSize: 13 }}>
            Turn fan moments into nostalgic keepsakes with curated backdrops, retro framing, and social-ready exports.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: accentColor, letterSpacing: '0.12em' }}>{accessible.length} ACCESSIBLE BACKDROPS</div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>Tier gated by membership</div>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,0.95fr)', gap: 16, alignItems: 'start' }}>
        <div style={{ borderRadius: 24, overflow: 'hidden', border: `1px solid ${selected.border}`, background: selected.gradient, minHeight: 500, position: 'relative', boxShadow: `0 0 40px ${selected.border}33` }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,5,16,0.08), rgba(5,5,16,0.75))' }} />
          <div style={{ position: 'relative', zIndex: 1, padding: 24, display: 'grid', gap: 16, minHeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
              <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: selected.accent }}>SELECTED: {selected.name.toUpperCase()}</div>
              <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>One Second Photo</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '140px minmax(0,1fr)', gap: 18, alignItems: 'center' }}>
              <div style={{ width: 140, height: 140, borderRadius: '50%', overflow: 'hidden', border: `4px solid ${selected.accent}`, boxShadow: `0 0 24px ${selected.accent}66`, background: 'rgba(255,255,255,0.08)' }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={fanName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', fontSize: 42, fontWeight: 900, color: 'rgba(255,255,255,0.7)' }}>{fanName.charAt(0).toUpperCase()}</div>
                )}
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 900, lineHeight: 1.05 }}>{fanName}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', maxWidth: 540, lineHeight: 1.6 }}>
                  Dreamy portrait-studio backdrops for concert memories, fan keepsakes, and collectible social cards.
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 8, fontWeight: 900, color: selected.accent, border: `1px solid ${selected.accent}55`, padding: '4px 10px', borderRadius: 999, background: `${selected.accent}14` }}>{selected.category.toUpperCase()}</span>
                  {selected.motion && (
                    <span style={{ fontSize: 8, fontWeight: 900, color: '#00FFFF', border: '1px solid rgba(0,255,255,0.4)', padding: '4px 10px', borderRadius: 999, background: 'rgba(0,255,255,0.08)' }}>MOTION READY</span>
                  )}
                  <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.14)', padding: '4px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)' }}>{mode.toUpperCase()} MODE</span>
                </div>
              </div>
            </div>

            <div style={{ alignSelf: 'end', display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>Live studio path uses the same memory and profile surfaces for saving and sharing.</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" onClick={buildKeepsake} disabled={buildBusy} style={{ border: `1px solid ${selected.accent}66`, background: `${selected.accent}14`, color: '#fff', borderRadius: 999, padding: '9px 14px', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', cursor: buildBusy ? 'default' : 'pointer', opacity: buildBusy ? 0.7 : 1 }}>
                  {buildBusy ? 'BUILDING...' : 'BUILD KEEPSAKE'}
                </button>
                <button type="button" onClick={shareStudio} style={{ border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)', color: '#fff', borderRadius: 999, padding: '9px 14px', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em', cursor: 'pointer' }}>
                  SHARE STUDIO
                </button>
              </div>
            </div>
            {copied ? <div style={{ fontSize: 9, color: '#00FF88', fontWeight: 700 }}>Copied studio link.</div> : null}
            {buildJob?.asset ? (
              <div style={{ marginTop: 10, borderRadius: 16, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(5,5,16,0.55)', padding: 12, display: 'grid', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.16em', color: '#00FF88' }}>COMPOSITE COMPLETE</div>
                    <div style={{ fontSize: 12, fontWeight: 800, marginTop: 3 }}>{buildJob.asset.title}</div>
                  </div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)' }}>{buildJob.asset.createdAt}</div>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={buildJob.asset.previewDataUrl} alt={buildJob.asset.title} style={{ width: '100%', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>Asset {buildJob.asset.assetId}</div>
                  <button
                    type="button"
                    onClick={() => void saveToMemoryWall(buildJob.asset!)}
                    style={{ border: '1px solid rgba(0,255,255,0.4)', background: 'rgba(0,255,255,0.08)', color: '#00FFFF', borderRadius: 8, padding: '6px 10px', fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', cursor: 'pointer' }}
                  >
                    SAVE TO MEMORY WALL
                  </button>
                </div>
                {memoryStatus ? <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)' }}>{memoryStatus}</div> : null}
              </div>
            ) : null}

            {collection && collection.jobs.length > 1 ? (
              <div style={{ marginTop: 10, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', padding: 10, display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', color: '#FFD700' }}>CREATIVE COLLECTION</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{collection.name} · {collection.outputs.length} outputs</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 8 }}>
                  {collection.jobs.filter((job) => !!job.asset).map((job) => (
                    <div key={job.jobId} style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(5,5,16,0.45)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={job.asset!.previewDataUrl} alt={job.asset!.title} style={{ width: '100%', display: 'block' }} />
                      <div style={{ padding: 6, fontSize: 8, color: 'rgba(255,255,255,0.55)' }}>{job.asset!.mode.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700', marginBottom: 10 }}>SHARE MODES</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {MODES.map((item) => (
                <button key={item.id} type="button" onClick={() => setMode(item.id)} style={{ borderRadius: 12, padding: '10px 12px', textAlign: 'left', border: mode === item.id ? `1px solid ${accentColor}88` : '1px solid rgba(255,255,255,0.1)', background: mode === item.id ? `${accentColor}14` : 'rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer' }}>
                  <div style={{ fontSize: 12, fontWeight: 900 }}>{item.label}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{item.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FF2DAA', marginBottom: 10 }}>BACKDROP LIBRARY</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {accessible.map((backdrop) => {
                const active = backdrop.id === selected.id;
                return (
                  <button key={backdrop.id} type="button" onClick={() => setSelected(backdrop)} style={{ borderRadius: 14, padding: 12, border: active ? `1px solid ${backdrop.border}` : '1px solid rgba(255,255,255,0.1)', background: active ? `${backdrop.accent}14` : 'rgba(255,255,255,0.03)', color: '#fff', textAlign: 'left', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 900 }}>{backdrop.name}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{backdrop.description}</div>
                      </div>
                      <div style={{ display: 'grid', gap: 4, justifyItems: 'end' }}>
                        <span style={{ fontSize: 8, fontWeight: 900, color: backdrop.accent }}>{backdrop.tier.toUpperCase()}</span>
                        <span style={{ width: 34, height: 12, borderRadius: 999, background: backdrop.gradient, border: `1px solid ${backdrop.border}` }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', padding: 16 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#00FFFF', marginBottom: 10 }}>NEXT ACTIONS</div>
            <div style={{ display: 'grid', gap: 8 }}>
              <Link href={`/fan/${fanSlug}/memory`} style={{ color: '#00FFFF', textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>Save to Memory Wall →</Link>
              <Link href={`/profile/fan/${fanSlug}`} style={{ color: '#FFD700', textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>Open Fan Profile →</Link>
              <Link href={`/profile/fan/${fanSlug}/avatar`} style={{ color: '#FF2DAA', textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>Open Avatar Creator →</Link>
              <Link href={`/fan/${fanSlug}/tickets`} style={{ color: '#AA2DFF', textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>Ticket Wallet Keepsake →</Link>
              <Link href="/vault" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: 11, fontWeight: 700 }}>Open Memory Vault →</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}