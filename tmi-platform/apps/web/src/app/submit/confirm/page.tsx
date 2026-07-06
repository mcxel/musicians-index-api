'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const ROOM_MAP: Record<string, { path: string; label: string; emoji: string; accent: string }> = {
  track:   { path: '/radio',             label: 'Stream & Win Radio', emoji: '🎧', accent: '#00FFFF' },
  beat:    { path: '/radio',             label: 'Stream & Win Radio', emoji: '🎛️', accent: '#00FFFF' },
  battle:  { path: '/battles',           label: 'Battle Arena',       emoji: '⚔️', accent: '#FF2DAA' },
  cypher:  { path: '/cypher/lobby-wall', label: 'Cypher Circle',      emoji: '🔁', accent: '#AA2DFF' },
  video:   { path: '/radio',             label: 'Stream & Win Radio', emoji: '🎬', accent: '#FFD700' },
  comedy:  { path: '/radio',             label: 'Stream & Win Radio', emoji: '😂', accent: '#FF2DAA' },
  dance:   { path: '/radio',             label: 'Stream & Win Radio', emoji: '💃', accent: '#AA2DFF' },
  show:    { path: '/go-live',           label: 'Live Stage',         emoji: '📡', accent: '#FFD700' },
};

const CHAIN_STEPS = [
  { key: 'submitted', label: 'Submitted', icon: '✅' },
  { key: 'review',    label: 'In Review', icon: '🟡' },
  { key: 'ready',     label: 'Ready',     icon: '🟢' },
  { key: 'rotation',  label: 'In Rotation', icon: '📡' },
];

export default function SubmitConfirmPage() {
  const router = useRouter();
  const params = useSearchParams();

  const id         = params?.get('id')    ?? '';
  const shareUrl   = params?.get('share') ?? '';
  const type       = params?.get('type')  ?? 'track';
  const titleParam = params?.get('title') ?? 'Your Track';

  const room = ROOM_MAP[type] ?? ROOM_MAP.track;
  const accent = room.accent;

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !id) return;
    const activity = {
      id,
      title: titleParam,
      type,
      submitterId: (sessionStorage.getItem('tmi_user_id') ?? 'guest-user'),
      createdAt: Date.now(),
    };
    localStorage.setItem('tmi_last_submission', JSON.stringify(activity));
    const existing = JSON.parse(localStorage.getItem('tmi_submission_feed') ?? '[]') as Array<typeof activity>;
    const merged = [activity, ...existing.filter((entry) => entry.id !== activity.id)].slice(0, 12);
    localStorage.setItem('tmi_submission_feed', JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('tmi:submission-created', { detail: activity }));
  }, [id, titleParam, type]);

  async function handleCopy() {
    const link = shareUrl || `https://themusiciansindex.com/submit/ref?id=${id}`;
    try { await navigator.clipboard.writeText(link); } catch { /* no-op */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  async function handleShare() {
    const link = shareUrl || `https://themusiciansindex.com/submit/ref?id=${id}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${titleParam} — submitted on TMI`,
          text: `I just submitted "${titleParam}" on The Musician's Index.`,
          url: link,
        });
      } catch { handleCopy(); }
    } else {
      handleCopy();
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp     { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stepPulse  { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 30, animation: 'fadeUp 0.5s ease both' }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', color: accent, textTransform: 'uppercase', marginBottom: 12 }}>
            {room.emoji} SUBMISSION RECEIVED
          </div>
          <h1 style={{
            fontFamily: '"Bebas Neue","Impact",sans-serif',
            fontSize: 'clamp(48px,10vw,88px)', lineHeight: 0.88,
            letterSpacing: '0.02em', margin: '0 0 18px',
            background: `linear-gradient(135deg,#ffffff 0%,${accent} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            YOU&apos;RE<br />IN THE QUEUE
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, maxWidth: 400, margin: '0 auto' }}>
            &ldquo;{titleParam}&rdquo; is being prepared for Stream &amp; Win Radio rotation.
            You&apos;ll be notified when it goes active.
          </p>
        </div>

        {/* Status chain */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '18px 16px', marginBottom: 22, animation: 'fadeUp 0.5s 0.1s ease both' }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 14, textTransform: 'uppercase' }}>
            SUBMISSION STATUS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
            {CHAIN_STEPS.map((step, i) => {
              const done = i === 0;
              const current = i === 1;
              return (
                <div key={step.key} style={{ textAlign: 'center', opacity: done || current ? 1 : 0.3 }}>
                  <div style={{
                    fontSize: 18, marginBottom: 6,
                    animation: current ? 'stepPulse 1.6s ease-in-out infinite' : 'none',
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', color: done ? accent : current ? '#FFD700' : 'rgba(255,255,255,0.5)' }}>
                    {step.label}
                  </div>
                  <div style={{ height: 3, marginTop: 8, background: done ? accent : current ? '#FFD70066' : 'rgba(255,255,255,0.08)' }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* What happens next */}
        <div style={{ border: `1.5px solid ${accent}33`, background: `${accent}06`, padding: '20px', marginBottom: 22, animation: 'fadeUp 0.5s 0.2s ease both' }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: accent, textTransform: 'uppercase', marginBottom: 14 }}>
            WHAT HAPPENS NEXT
          </div>
          {[
            { n: '1', title: 'Review', body: 'Your submission is verified — source, metadata, and ownership rules.' },
            { n: '2', title: 'Session opens', body: 'A Stream & Win listening session launches once enough artists have joined. You\u2019ll get a notification the moment your playlist goes active.' },
            { n: '3', title: 'Participate & earn', body: 'Join any radio room to earn Rotation Credits — listen, vote, chat, and share. Listening to your own music never counts.' },
          ].map((step, i, arr) => (
            <div key={step.n} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ width: 26, height: 26, flexShrink: 0, border: `1px solid ${accent}55`, display: 'grid', placeItems: 'center', fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 15, color: accent }}>
                {step.n}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>{step.title}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{step.body}</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', lineHeight: 1.6 }}>
            Your playlist will be available soon — once active, fans can stream it in the room or save it to their own profile.
          </div>
        </div>

        {/* Share block */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '18px', marginBottom: 22, animation: 'fadeUp 0.5s 0.3s ease both' }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 10 }}>
            SHARE YOUR SUBMISSION
          </div>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', padding: '9px 12px', marginBottom: 12, fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shareUrl || `themusiciansindex.com/submit/ref?id=${id}`}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleShare}
              style={{ flex: 1, background: accent, color: '#050510', border: 'none', padding: '13px 0', fontWeight: 900, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              📣 SHARE
            </button>
            <button
              onClick={handleCopy}
              style={{ flex: 1, background: 'transparent', color: accent, border: `1.5px solid ${accent}66`, padding: '13px 0', fontWeight: 900, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer' }}
            >
              {copied ? '✅ COPIED!' : '🔗 COPY LINK'}
            </button>
          </div>
        </div>

        {/* Room CTA — manual, no countdown */}
        <div style={{ border: `1.5px solid ${accent}55`, background: `${accent}08`, padding: '20px', animation: 'fadeUp 0.5s 0.4s ease both' }}>
          <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 20, color: accent, letterSpacing: '0.06em', marginBottom: 6 }}>
            {room.emoji} {room.label}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, marginBottom: 16 }}>
            Start earning Rotation Credits now — join a room and support other artists while your submission is reviewed.
          </div>
          <button
            onClick={() => router.push(room.path)}
            style={{ width: '100%', background: accent, color: '#050510', border: 'none', padding: '16px 0', fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 22, letterSpacing: '0.06em', cursor: 'pointer' }}
          >
            GO TO {room.label.toUpperCase()} →
          </button>
        </div>

        {id && (
          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 9, color: 'rgba(255,255,255,0.12)', fontFamily: 'monospace' }}>
            ID: {id}
          </div>
        )}
      </div>
    </div>
  );
}
