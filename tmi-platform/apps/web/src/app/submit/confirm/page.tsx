'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ── Static seed data ───────────────────────────────────────────────────────────
const REACTIONS = [
  '🔥 @djNova — "hard"',
  '💯 @WaveTek — "this slaps"',
  '🎤 @TrapFan99 — "first play 👀"',
  '⚔️ @CipherKing — "battle me"',
  '🙌 @BeatLover — "finally"',
  '🔴 @MelodyX — "live rn"',
  '💥 @FreqZero — "🔥🔥🔥"',
  '👑 @NovaCipher — "top 10 material"',
  '🎯 @AstraFlow — "added to queue"',
  '📡 @ZionFreq — "room is lit"',
  '🌊 @VibeCheck — "this is it"',
  '⚡ @BassDrop — "on repeat"',
];

const TOP_PROMOTERS = [
  { rank: 1, name: '@djNova',    xp: 320, shares: 28, color: '#FFD700' },
  { rank: 2, name: '@TrapFan99', xp: 280, shares: 23, color: '#00FFFF' },
  { rank: 3, name: '@WaveTek',   xp: 190, shares: 16, color: '#AA2DFF' },
  { rank: 4, name: '@MelodyX',   xp: 155, shares: 13, color: '#FF2DAA' },
  { rank: 5, name: '@FreqZero',  xp: 120, shares: 10, color: '#00FFCC' },
];

const ROOM_MAP: Record<string, { path: string; label: string; emoji: string; accent: string }> = {
  track:   { path: '/rooms/radio',       label: 'Stream & Win',  emoji: '🎧', accent: '#00FFFF' },
  beat:    { path: '/rooms/radio',       label: 'Radio Room',    emoji: '🎛️', accent: '#00FFFF' },
  battle:  { path: '/battles',           label: 'Battle Arena',  emoji: '⚔️', accent: '#FF2DAA' },
  cypher:  { path: '/cypher/lobby-wall', label: 'Cypher Circle', emoji: '🔁', accent: '#AA2DFF' },
  video:   { path: '/rooms/radio',       label: 'Visual Room',   emoji: '🎬', accent: '#FFD700' },
  comedy:  { path: '/rooms/radio',       label: 'Comedy Stage',  emoji: '😂', accent: '#FF2DAA' },
  dance:   { path: '/rooms/radio',       label: 'Dance Floor',   emoji: '💃', accent: '#AA2DFF' },
  show:    { path: '/go-live',           label: 'Live Stage',    emoji: '📡', accent: '#FFD700' },
};

export default function SubmitConfirmPage() {
  const router  = useRouter();
  const params  = useSearchParams();

  const id         = params?.get('id')    ?? '';
  const shareUrl   = params?.get('share') ?? '';
  const type       = params?.get('type')  ?? 'track';
  const titleParam = params?.get('title') ?? 'Your Track';

  const room = ROOM_MAP[type] ?? ROOM_MAP.track;

  const [copied,    setCopied]    = useState(false);
  const [countdown, setCountdown] = useState(8);
  const [viewers,   setViewers]   = useState(() => 142 + Math.floor(Math.random() * 340));
  const [xpShown,   setXpShown]   = useState(false);
  const [reactions, setReactions] = useState<string[]>([]);
  const [shareHint, setShareHint] = useState(false);
  const reactionIdx = useRef(0);

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

  // XP burst fires after 400ms
  useEffect(() => {
    const t = setTimeout(() => setXpShown(true), 400);
    return () => clearTimeout(t);
  }, []);

  // Countdown → auto-join
  useEffect(() => {
    if (countdown <= 0) { router.push(room.path); return; }
    const t = setTimeout(() => setCountdown(n => n - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, router, room.path]);

  // Viewer count drift
  useEffect(() => {
    const t = setInterval(() => {
      setViewers(v => Math.max(80, v + Math.floor(Math.random() * 7) - 3));
    }, 4000);
    return () => clearInterval(t);
  }, []);

  // Reaction ticker — one every 2.2s
  useEffect(() => {
    const t = setInterval(() => {
      const next = REACTIONS[reactionIdx.current % REACTIONS.length];
      reactionIdx.current++;
      setReactions(prev => [next, ...prev].slice(0, 5));
    }, 2200);
    return () => clearInterval(t);
  }, []);

  // Share hint pulse after 5s
  useEffect(() => {
    const t = setTimeout(() => setShareHint(true), 5000);
    return () => clearTimeout(t);
  }, []);

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
          title: `${titleParam} — now live on TMI`,
          text: '🔥 I just dropped something on The Musician\'s Index. Come hear it live.',
          url: link,
        });
      } catch { handleCopy(); }
    } else {
      handleCopy();
    }
  }

  const countdownPct = ((8 - countdown) / 8) * 100;
  const accent = room.accent;

  return (
    <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', overflowX: 'hidden' }}>
      <style>{`
        @keyframes xpBurst   { 0%{opacity:0;transform:translateY(20px) scale(0.6)} 30%{opacity:1;transform:translateY(-8px) scale(1.15)} 70%{opacity:1;transform:translateY(0) scale(1)} 100%{opacity:0;transform:translateY(-24px) scale(0.9)} }
        @keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        @keyframes slideIn   { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes countGlow { 0%,100%{text-shadow:0 0 20px ${accent}66} 50%{text-shadow:0 0 40px ${accent}cc,0 0 80px ${accent}44} }
        @keyframes btnGlow   { 0%,100%{box-shadow:0 0 18px ${accent}44} 50%{box-shadow:0 0 40px ${accent}99,0 0 80px ${accent}22} }
        @keyframes sharePulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.025)} }
      `}</style>

      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* XP burst */}
        <div style={{ textAlign: 'center', height: 52, position: 'relative', marginBottom: 4 }}>
          {xpShown && (
            <div style={{
              position: 'absolute', left: '50%', transform: 'translateX(-50%)',
              fontFamily: '"Bebas Neue","Impact",sans-serif',
              fontSize: 38, color: '#FFD700', letterSpacing: '0.05em',
              animation: 'xpBurst 2.4s ease forwards',
              textShadow: '0 0 20px #FFD70099', whiteSpace: 'nowrap',
            }}>
              + 50 XP EARNED 🏆
            </div>
          )}
        </div>

        {/* Live badge + viewers */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, alignItems: 'center', marginBottom: 22, animation: 'fadeUp 0.4s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(204,34,0,0.15)', border: '1px solid rgba(204,34,0,0.35)', padding: '4px 14px', fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: '#FF4422' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF4422', animation: 'livePulse 1.2s ease-in-out infinite' }} />
            LIVE NOW
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>
            <span style={{ color: accent, fontWeight: 900, fontSize: 16 }}>{viewers.toLocaleString()}</span> in the room
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 28, animation: 'fadeUp 0.5s 0.1s ease both' }}>
          <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', color: accent, textTransform: 'uppercase', marginBottom: 12 }}>
            {room.emoji} YOUR TRACK IS IN THE SYSTEM
          </div>
          <h1 style={{
            fontFamily: '"Bebas Neue","Impact",sans-serif',
            fontSize: 'clamp(52px,11vw,96px)', lineHeight: 0.86,
            letterSpacing: '0.02em', margin: '0 0 18px',
            background: `linear-gradient(135deg,#ffffff 0%,${accent} 100%)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            YOU&apos;RE<br />LIVE NOW
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.65, maxWidth: 380, margin: '0 auto' }}>
            People can hear you right now.<br />
            Share your link — every open earns you XP and spins.
          </p>
        </div>

        {/* Live reaction feed */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '14px 16px', marginBottom: 22, minHeight: 118, animation: 'fadeUp 0.5s 0.2s ease both' }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase' }}>
            💬 LIVE REACTIONS
          </div>
          {reactions.length === 0 ? (
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, textAlign: 'center', paddingTop: 10 }}>
              First reactions incoming…
            </div>
          ) : reactions.map((r, i) => (
            <div key={`${r}-${i}`} style={{
              fontSize: 12,
              color: i === 0 ? '#fff' : `rgba(255,255,255,${Math.max(0.2, 0.7 - i * 0.13)})`,
              padding: '5px 0',
              animation: i === 0 ? 'slideIn 0.3s ease' : 'none',
              borderBottom: i < reactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              {r}
            </div>
          ))}
        </div>

        {/* Viral power block */}
        <div style={{
          border: `2px solid ${shareHint ? accent : accent + '44'}`,
          background: `${accent}08`, padding: '20px',
          marginBottom: 20,
          animation: shareHint ? 'btnGlow 2.5s ease-in-out infinite, fadeUp 0.5s 0.3s ease both' : 'fadeUp 0.5s 0.3s ease both',
          transition: 'border-color 0.6s',
        }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: accent, textTransform: 'uppercase', marginBottom: 10 }}>
            🚀 YOUR VIRAL LINK IS READY
          </div>

          {/* Link display */}
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', padding: '9px 12px', marginBottom: 14, fontSize: 10, color: 'rgba(255,255,255,0.45)', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {shareUrl || `themusiciansindex.com/submit/ref?id=${id}`}
          </div>

          {/* Power stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 16 }}>
            {[
              { icon: '⚡', label: 'PER OPEN',    value: '+XP' },
              { icon: '📈', label: 'TRACK BOOST', value: '+SPIN' },
              { icon: '👥', label: 'PER FOLLOW',  value: '+5 XP' },
            ].map(stat => (
              <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${accent}22`, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{stat.icon}</div>
                <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 20, color: accent }}>{stat.value}</div>
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em', textTransform: 'uppercase', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleShare}
              style={{
                flex: 1, background: accent, color: '#050510', border: 'none',
                padding: '14px 0', fontWeight: 900, fontSize: 14,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                boxShadow: `0 0 22px ${accent}55`,
                animation: shareHint ? 'sharePulse 1.6s ease-in-out infinite' : 'none',
              }}
            >
              📣 SHARE NOW
            </button>
            <button
              onClick={handleCopy}
              style={{
                flex: 1, background: 'transparent', color: accent,
                border: `1.5px solid ${accent}66`,
                padding: '14px 0', fontWeight: 900, fontSize: 14,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              {copied ? '✅ COPIED!' : '🔗 COPY LINK'}
            </button>
          </div>
        </div>

        {/* Top Promoters */}
        <div style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.14)', padding: '16px 18px', marginBottom: 22, animation: 'fadeUp 0.5s 0.4s ease both' }}>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', color: '#FFD700', textTransform: 'uppercase', marginBottom: 12 }}>
            🔥 TOP PROMOTERS RIGHT NOW
          </div>
          {TOP_PROMOTERS.map(p => (
            <div key={p.rank} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: p.rank < 5 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <div style={{ width: 24, height: 24, background: p.rank === 1 ? '#FFD70020' : 'rgba(255,255,255,0.04)', border: `1px solid ${p.rank === 1 ? '#FFD700' : 'rgba(255,255,255,0.1)'}`, display: 'grid', placeItems: 'center', fontSize: p.rank === 1 ? 12 : 9, fontWeight: 900, color: p.rank === 1 ? '#FFD700' : 'rgba(255,255,255,0.4)', flexShrink: 0 }}>
                {p.rank === 1 ? '👑' : p.rank}
              </div>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 700, color: p.rank === 1 ? '#fff' : 'rgba(255,255,255,0.7)' }}>{p.name}</div>
              <div style={{ fontSize: 10, color: p.color, fontWeight: 900, letterSpacing: '0.08em' }}>+{p.xp} XP</div>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', width: 54, textAlign: 'right' }}>{p.shares} shares</div>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center', letterSpacing: '0.08em' }}>
            Share your link to climb this board →
          </div>
        </div>

        {/* Countdown + Enter Room CTA */}
        <div style={{ border: `1.5px solid ${accent}55`, background: `${accent}08`, padding: '20px', animation: 'fadeUp 0.5s 0.5s ease both' }}>
          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', marginBottom: 18, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${countdownPct}%`, background: `linear-gradient(90deg,${accent},${accent}cc)`, transition: 'width 1s linear', boxShadow: `0 0 8px ${accent}` }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 20, color: accent, letterSpacing: '0.06em', marginBottom: 4 }}>
                {room.emoji} {room.label}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
                Your track is already queued in the room.<br />
                Auto-joining in <span style={{ color: accent, fontWeight: 900 }}>{countdown}s</span> — or go now.
              </div>
            </div>
            <div style={{
              fontFamily: '"Bebas Neue","Impact",sans-serif',
              fontSize: 64, color: accent, lineHeight: 1,
              animation: countdown <= 3 ? 'countGlow 0.6s ease-in-out infinite' : 'countGlow 2s ease-in-out infinite',
            }}>
              {countdown}
            </div>
          </div>

          <button
            onClick={() => router.push(room.path)}
            style={{
              width: '100%', background: accent, color: '#050510', border: 'none',
              padding: '18px 0', fontFamily: '"Bebas Neue","Impact",sans-serif',
              fontSize: 24, letterSpacing: '0.06em', cursor: 'pointer',
              animation: 'btnGlow 2s ease-in-out infinite',
            }}
          >
            ENTER {room.label.toUpperCase()} NOW →
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
