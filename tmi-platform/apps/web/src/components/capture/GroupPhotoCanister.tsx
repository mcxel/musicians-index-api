'use client';

import { useState, useCallback, useRef } from 'react';
import { CAPTURE_TYPE_META, snapSelector, buildEventPosterDataUrl } from '@/lib/capture/CaptureEngine';
import type { CaptureType } from '@/lib/capture/CaptureEngine';
import { ActivityTimelineEngine } from '@/lib/timeline/ActivityTimelineEngine';

interface GroupPhotoCanisterProps {
  roomId?: string;
  eventId?: string;
  playlistId?: string;
  performerIds?: string[];
  performerName?: string;
  roomLabel?: string;
  userId?: string;
  accentColor?: string;
}

type Phase = 'idle' | 'selector' | 'flash' | 'developing' | 'preview' | 'saving' | 'saved';

const SELECTOR_MAP: Record<CaptureType, string> = {
  group_photo:  '#tmi-room-stage, .tmi-room-stage, main',
  selfie:       '#tmi-room-stage, .tmi-room-stage, main',
  stage_shot:   '.tmi-stage, #tmi-stage, #tmi-room-stage, main',
  trophy_shot:  '.tmi-trophy-area, #tmi-room-stage, main',
  event_poster: '',
};

export default function GroupPhotoCanister({
  roomId,
  eventId,
  playlistId,
  performerIds,
  performerName,
  roomLabel,
  userId = 'guest',
  accentColor = '#FF2DAA',
}: GroupPhotoCanisterProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [captureType, setCaptureType] = useState<CaptureType>('group_photo');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [savedConfirm, setSavedConfirm] = useState(false);
  const flashRef = useRef<HTMLDivElement>(null);

  const doCapture = useCallback(async (type: CaptureType) => {
    setCaptureType(type);
    setPhase('flash');

    // Flash animation — 380ms
    await new Promise(r => setTimeout(r, 380));
    setPhase('developing');

    let dataUrl: string | null = null;

    try {
      if (type === 'event_poster') {
        dataUrl = buildEventPosterDataUrl({
          eventName: roomLabel ?? roomId ?? 'TMI Live',
          roomId: roomId ?? 'room',
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          performerName,
          accentColor,
        });
      } else {
        const result = await snapSelector(SELECTOR_MAP[type], 'main');
        dataUrl = result?.dataUrl ?? null;
      }
    } catch {
      dataUrl = null;
    }

    // Developing animation — 1.4s for dramatic effect
    await new Promise(r => setTimeout(r, 1400));

    setPreviewUrl(dataUrl);
    setPhase('preview');
  }, [roomId, roomLabel, performerName, accentColor]);

  const handleSave = useCallback(async () => {
    if (!previewUrl) return;
    setPhase('saving');

    const res = await fetch('/api/memory/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        imageData: previewUrl,
        captureType,
        roomId,
        eventId,
        playlistId,
        performerIds,
        performerName,
        roomLabel,
      }),
    }).then(r => r.json()).catch(() => ({ success: false, xpEarned: 0 }));

    setXpEarned(res.xpEarned ?? CAPTURE_TYPE_META[captureType].xp);
    setPhase('saved');
    setSavedConfirm(true);
    setTimeout(() => { setSavedConfirm(false); setPhase('idle'); setPreviewUrl(null); }, 3200);
  }, [previewUrl, userId, captureType, roomId, eventId, playlistId, performerIds, performerName, roomLabel]);

  const handleShare = useCallback(() => {
    window.dispatchEvent(new CustomEvent('TMI_MEMORY_SHARED', { detail: { userId, memoryId: `mem_${Date.now()}`, userName: userId } }));
    ActivityTimelineEngine.addEvent({ userId, type: 'MEMORY_SHARED', label: '📤 Shared a memory to the room', xpEarned: 50 });
    setPhase('idle');
    setPreviewUrl(null);
  }, [userId]);

  const handleRetake = useCallback(() => {
    setPreviewUrl(null);
    setPhase('selector');
  }, []);

  return (
    <>
      {/* ── Flash overlay ── */}
      {phase === 'flash' && (
        <div
          ref={flashRef}
          aria-hidden
          style={{
            position: 'fixed', inset: 0, zIndex: 99998,
            background: 'rgba(255,255,255,0.92)',
            pointerEvents: 'none',
            animation: 'tmiFlashIn 0.38s ease-out forwards',
          }}
        />
      )}

      {/* ── Developing overlay ── */}
      {phase === 'developing' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99997,
          background: 'rgba(5,5,16,0.88)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 16,
        }}>
          <div style={{
            width: 160, height: 200, background: 'rgba(255,255,255,0.06)',
            border: `2px solid ${accentColor}55`, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 48,
            animation: 'tmiDevelopPulse 0.7s ease-in-out infinite alternate',
            boxShadow: `0 0 30px ${accentColor}44`,
          }}>
            {CAPTURE_TYPE_META[captureType].icon}
          </div>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.3em', color: accentColor }}>
            DEVELOPING…
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: accentColor,
                animation: `tmiDevDot 0.8s ease-in-out ${i * 0.2}s infinite alternate`,
              }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Type selector dropdown ── */}
      {phase === 'selector' && (
        <div style={{
          position: 'fixed', top: 56, right: 12, zIndex: 99996,
          background: 'rgba(5,5,16,0.96)', backdropFilter: 'blur(16px)',
          border: `1px solid ${accentColor}44`, borderRadius: 12,
          padding: '8px 0', minWidth: 200,
          boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${accentColor}22`,
          animation: 'tmiSelectorIn 0.18s ease-out',
        }}>
          <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.24em', color: 'rgba(255,255,255,0.3)', padding: '4px 14px 8px' }}>
            CAPTURE TYPE
          </div>
          {(Object.entries(CAPTURE_TYPE_META) as [CaptureType, typeof CAPTURE_TYPE_META[CaptureType]][]).map(([type, meta]) => (
            <button
              key={type}
              onClick={() => doCapture(type)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '9px 14px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#fff', textAlign: 'left',
                transition: 'background 0.14s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = `${accentColor}18`)}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>{meta.icon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em' }}>{meta.label}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)' }}>{meta.description}</div>
              </div>
              <span style={{
                marginLeft: 'auto', fontSize: 7, fontWeight: 900,
                color: '#FFD700', background: 'rgba(255,215,0,0.12)',
                border: '1px solid rgba(255,215,0,0.25)',
                padding: '2px 6px', borderRadius: 4, flexShrink: 0,
              }}>+{meta.xp} XP</span>
            </button>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: 4, padding: '6px 14px 2px' }}>
            <button
              onClick={() => setPhase('idle')}
              style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}
            >
              ✕ CANCEL
            </button>
          </div>
        </div>
      )}

      {/* ── Preview modal ── */}
      {phase === 'preview' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99995,
          background: 'rgba(5,5,16,0.92)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20,
        }}>
          <div style={{
            background: 'rgba(15,10,35,0.98)', border: `1px solid ${accentColor}44`,
            borderRadius: 16, overflow: 'hidden', maxWidth: 480, width: '100%',
            boxShadow: `0 20px 80px rgba(0,0,0,0.8), 0 0 0 1px ${accentColor}22`,
            animation: 'tmiPreviewIn 0.32s cubic-bezier(0.22,1,0.36,1)',
          }}>
            {/* Preview image */}
            <div style={{ position: 'relative', background: '#050510', minHeight: 200 }}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Captured memory"
                  style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 10,
                }}>
                  <span style={{ fontSize: 48 }}>{CAPTURE_TYPE_META[captureType].icon}</span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>
                    MEMORY CARD
                  </span>
                </div>
              )}
              {/* TMI watermark */}
              <div style={{
                position: 'absolute', bottom: 6, right: 8,
                fontSize: 7, fontWeight: 900, color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.1em', textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              }}>
                TMI
              </div>
            </div>

            {/* Memory context info */}
            <div style={{ padding: '12px 16px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16 }}>{CAPTURE_TYPE_META[captureType].icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>
                    {CAPTURE_TYPE_META[captureType].label}
                  </div>
                  <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                    {performerName ? `${performerName} · ` : ''}{roomLabel ?? roomId ?? 'Room'} · {new Date().toLocaleDateString()}
                  </div>
                </div>
                <div style={{
                  marginLeft: 'auto', fontSize: 8, fontWeight: 900,
                  color: '#FFD700', background: 'rgba(255,215,0,0.12)',
                  border: '1px solid rgba(255,215,0,0.3)',
                  padding: '3px 8px', borderRadius: 5,
                }}>
                  +{CAPTURE_TYPE_META[captureType].xp} XP
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ padding: '10px 16px 16px', display: 'flex', gap: 8 }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1, padding: '10px 0',
                  background: `linear-gradient(135deg, ${accentColor}, #AA2DFF)`,
                  color: '#fff', border: 'none', borderRadius: 8,
                  fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', cursor: 'pointer',
                  boxShadow: `0 4px 16px ${accentColor}44`,
                }}
              >
                💾 SAVE TO WALL
              </button>
              <button
                onClick={handleShare}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.8)', borderRadius: 8,
                  fontSize: 10, fontWeight: 800, cursor: 'pointer',
                }}
              >
                📤
              </button>
              <button
                onClick={handleRetake}
                style={{
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)', borderRadius: 8,
                  fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}
              >
                ↺
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Saving spinner overlay ── */}
      {phase === 'saving' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99994,
          background: 'rgba(5,5,16,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'rgba(15,10,35,0.97)', border: `1px solid ${accentColor}44`,
            borderRadius: 12, padding: '24px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10, animation: 'tmiSaveSpin 1s linear infinite' }}>⟳</div>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: accentColor }}>
              SAVING TO WALL…
            </div>
          </div>
        </div>
      )}

      {/* ── Saved confirmation toast ── */}
      {savedConfirm && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          zIndex: 99993,
          background: `linear-gradient(135deg, ${accentColor}, #AA2DFF)`,
          color: '#fff', borderRadius: 30, padding: '12px 24px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${accentColor}55`,
          animation: 'tmiToastSlide 0.35s ease',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 16 }}>📸</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.06em' }}>Saved to Memory Wall!</div>
            <div style={{ fontSize: 9, opacity: 0.8 }}>+{xpEarned} XP earned</div>
          </div>
        </div>
      )}

      {/* ── Floating shutter button ── */}
      {(phase === 'idle' || phase === 'selector') && (
        <button
          onClick={() => setPhase(phase === 'selector' ? 'idle' : 'selector')}
          title="Capture Memory"
          style={{
            position: 'fixed', top: 14, right: 60, zIndex: 99990,
            width: 36, height: 36, borderRadius: '50%',
            background: phase === 'selector'
              ? `linear-gradient(135deg, ${accentColor}, #AA2DFF)`
              : 'rgba(5,5,16,0.85)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${phase === 'selector' ? 'transparent' : `${accentColor}55`}`,
            color: '#fff', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
            boxShadow: phase === 'selector'
              ? `0 4px 20px ${accentColor}66`
              : `0 2px 8px rgba(0,0,0,0.5)`,
            transition: 'all 0.18s ease',
          }}
        >
          📷
        </button>
      )}

      <style>{`
        @keyframes tmiFlashIn {
          0%   { opacity: 1; }
          60%  { opacity: 0.6; }
          100% { opacity: 0; }
        }
        @keyframes tmiDevelopPulse {
          from { opacity: 0.4; transform: scale(0.97); }
          to   { opacity: 1;   transform: scale(1); }
        }
        @keyframes tmiDevDot {
          from { opacity: 0.2; transform: translateY(0); }
          to   { opacity: 1;   transform: translateY(-4px); }
        }
        @keyframes tmiSelectorIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes tmiPreviewIn {
          from { opacity: 0; transform: scale(0.92) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes tmiSaveSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes tmiToastSlide {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  );
}
