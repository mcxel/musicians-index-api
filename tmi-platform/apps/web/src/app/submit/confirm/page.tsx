'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { NotificationEngine } from '@/lib/notifications/NotificationEngine';

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
  { key: 'submitted', label: 'Submitted',   icon: '✅' },
  { key: 'review',    label: 'In Review',   icon: '🟡' },
  { key: 'ready',     label: 'Ready',       icon: '🟢' },
  { key: 'rotation',  label: 'In Rotation', icon: '📡' },
];

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'live' | 'expired' | 'unknown';

interface SessionInfo {
  status: 'waiting' | 'live' | 'ended';
  artistsJoined: number;
  launchThreshold: number;
}

// Maps real SubmissionEngine status onto the visible chain.
// Returns index of the current (pulsing) step; steps below it are done.
function chainPosition(status: SubmissionStatus): { done: number; current: number } {
  switch (status) {
    case 'pending':  return { done: 1, current: 1 };
    case 'approved': return { done: 2, current: 2 };
    case 'live':     return { done: 4, current: -1 };
    default:         return { done: 1, current: 1 };
  }
}

export default function SubmitConfirmPage() {
  const router = useRouter();
  const params = useSearchParams();

  const id         = params?.get('id')    ?? '';
  const shareUrl   = params?.get('share') ?? '';
  const type       = params?.get('type')  ?? 'track';
  const titleParam = params?.get('title') ?? 'Your Track';

  const room = ROOM_MAP[type] ?? ROOM_MAP.track!;
  const accent = room.accent;
  const isRadioType = room.path === '/radio';

  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<SubmissionStatus>('unknown');
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);

  const userId =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('tmi_user_id') ?? 'guest-user'
      : 'guest-user';

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

  // Real submission status — polled from SubmissionEngine, never simulated
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/submissions?id=${encodeURIComponent(id)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { submission?: { status: SubmissionStatus } };
        if (!cancelled && data.submission) setStatus(data.submission.status);
      } catch { /* keep last known state */ }
    }
    poll();
    const t = setInterval(poll, 15_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [id]);

  // Real session waiting-room state (radio types only)
  const pollSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/radio/session?submitterId=${encodeURIComponent(userId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { session: SessionInfo | null; joined: boolean };
      setSessionInfo(data.session);
      setJoined(data.joined);
    } catch { /* keep last known state */ }
  }, [userId]);

  useEffect(() => {
    if (!isRadioType) return;
    pollSession();
    const t = setInterval(pollSession, 10_000);
    return () => clearInterval(t);
  }, [isRadioType, pollSession]);

  async function handleJoinRadio() {
    if (!isRadioType || !id) { router.push(room.path); return; }
    setJoining(true);
    try {
      const res = await fetch('/api/radio/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submitterId: userId, submissionId: id, title: titleParam }),
      });
      if (res.ok) {
        const data = (await res.json()) as { session: SessionInfo | null };
        if (data.session) {
          NotificationEngine.radioWaitingRoom(data.session.artistsJoined, data.session.launchThreshold);
        }
      }
    } catch { /* join is best-effort; room page shows real state */ }
    setJoining(false);
    router.push(room.path);
  }

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
          text: `I just submitted "${titleParam}" on The Musician's Index. Submit yours and join the next Stream & Win session.`,
          url: link,
        });
      } catch { handleCopy(); }
    } else {
      handleCopy();
    }
  }

  const pos = chainPosition(status);
  const rejected = status === 'rejected' || status === 'expired';

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
            YOU&apos;RE IN<br />THE RADIO LOBBY
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, maxWidth: 400, margin: '0 auto' }}>
            &ldquo;{titleParam}&rdquo; is being prepared for Stream &amp; Win Radio rotation.
            You&apos;ll be notified when it goes active.
          </p>
        </div>

        {/* Status chain — driven by real submission status */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '18px 16px', marginBottom: 22, animation: 'fadeUp 0.5s 0.1s ease both' }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 14, textTransform: 'uppercase' }}>
            SUBMISSION STATUS
          </div>
          {rejected ? (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              This submission was not approved for rotation. You can revise and resubmit anytime from the{' '}
              <a href="/submit" style={{ color: accent }}>submit page</a>.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
              {CHAIN_STEPS.map((step, i) => {
                const done = i < pos.done && i !== pos.current;
                const current = i === pos.current;
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
          )}
        </div>

        {/* Session waiting room — real registry counts only */}
        {isRadioType && sessionInfo && (
          <div style={{ border: '1.5px solid rgba(255,215,0,0.3)', background: 'rgba(255,215,0,0.05)', padding: '18px 20px', marginBottom: 22, animation: 'fadeUp 0.5s 0.15s ease both' }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700', textTransform: 'uppercase', marginBottom: 10 }}>
              🎧 {sessionInfo.status === 'live' ? 'SESSION LIVE NOW' : 'SESSION WAITING ROOM'}
            </div>
            {sessionInfo.status === 'waiting' ? (
              <>
                <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 30, color: '#FFD700', lineHeight: 1, marginBottom: 8 }}>
                  {sessionInfo.artistsJoined} <span style={{ fontSize: 18, color: 'rgba(255,255,255,0.4)' }}>of {sessionInfo.launchThreshold} artists</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', marginBottom: 10 }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (sessionInfo.artistsJoined / sessionInfo.launchThreshold) * 100)}%`, background: '#FFD700', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
                  {joined
                    ? 'You\u2019re in. The session launches when the room fills — you\u2019ll be notified the moment it goes live.'
                    : 'Join below — the session launches when the room fills.'}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
                A listening session is live right now with {sessionInfo.artistsJoined} artist{sessionInfo.artistsJoined === 1 ? '' : 's'}. Jump in below.
              </div>
            )}
          </div>
        )}

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

        {/* Invite Another Artist — biggest button on the page */}
        <div style={{ border: '2px solid #FF2DAA', background: 'rgba(255,45,170,0.07)', padding: '22px 20px', marginBottom: 22, animation: 'fadeUp 0.5s 0.25s ease both' }}>
          <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 26, color: '#FF2DAA', letterSpacing: '0.05em', marginBottom: 6 }}>
            📣 INVITE ANOTHER ARTIST
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 16 }}>
            Invite another performer. When they join your session through your invite, you earn an
            additional <strong style={{ color: '#FF2DAA' }}>3-Day Rotation Boost</strong> after they
            become active. Your invite link is tracked automatically.
          </div>
          <button
            onClick={handleShare}
            style={{ width: '100%', background: '#FF2DAA', color: '#050510', border: 'none', padding: '18px 0', fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 24, letterSpacing: '0.06em', cursor: 'pointer' }}
          >
            INVITE AN ARTIST →
          </button>
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', padding: '9px 12px', fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {shareUrl || `themusiciansindex.com/submit/ref?id=${id}`}
            </div>
            <button
              onClick={handleCopy}
              style={{ background: 'transparent', color: '#FF2DAA', border: '1.5px solid #FF2DAA66', padding: '9px 14px', fontWeight: 900, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {copied ? '✅ COPIED' : '🔗 COPY'}
            </button>
          </div>
        </div>

        {/* Room CTA — joins the real waiting room, then routes */}
        <div style={{ border: `1.5px solid ${accent}55`, background: `${accent}08`, padding: '20px', animation: 'fadeUp 0.5s 0.35s ease both' }}>
          <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 20, color: accent, letterSpacing: '0.06em', marginBottom: 6 }}>
            {room.emoji} {room.label}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.55, marginBottom: 16 }}>
            Start earning Rotation Credits now — join the room and support other artists while your submission is reviewed.
          </div>
          <button
            onClick={handleJoinRadio}
            disabled={joining}
            style={{ width: '100%', background: accent, color: '#050510', border: 'none', padding: '16px 0', fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 22, letterSpacing: '0.06em', cursor: joining ? 'wait' : 'pointer', opacity: joining ? 0.7 : 1 }}
          >
            {joining ? 'JOINING…' : `JOIN ${room.label.toUpperCase()} →`}
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
