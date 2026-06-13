'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ACCENT = '#00FF88';
const GENRES = ['Hip-Hop', 'R&B', 'Rap', 'EDM', 'Gospel', 'Jazz', 'Pop', 'Soul'];
const FORMATS = [
  { id: 'freestyle', label: 'Freestyle Bars',   emoji: '🎤', desc: '60-second open freestyle round', xp: 80 },
  { id: 'written',   label: 'Written Battle',    emoji: '📝', desc: 'Pre-written bars, 3 rounds',    xp: 100 },
  { id: 'live-dj',   label: 'Live DJ Battle',    emoji: '🎧', desc: 'DJ set headspace, 2 rounds',    xp: 90 },
  { id: 'vocal',     label: 'Vocal Showcase',    emoji: '🎵', desc: 'Full performance, crowd votes',  xp: 120 },
];

interface User { id: string; email: string; name?: string; role: string; tier?: string; }

export default function DirectChallengePage({ params }: { params: { targetId: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [format, setFormat] = useState('freestyle');
  const [genre, setGenre] = useState('Hip-Hop');
  const [message, setMessage] = useState('');
  const [wagerXp, setWagerXp] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const targetName = params.targetId
    .split('-')
    .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  useEffect(() => {
    fetch('/api/auth/session', { credentials: 'include' })
      .then(r => r.json())
      .then((d: { authenticated?: boolean; user?: User }) => {
        if (!d.authenticated) { router.replace('/login'); return; }
        setUser(d.user ?? null);
      })
      .catch(() => router.replace('/login'));
  }, [router]);

  const chosenFormat = FORMATS.find(f => f.id === format)!;

  async function handleChallenge(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await fetch('/api/battles/challenge', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          challengerId: user?.id,
          targetId: params.targetId,
          format,
          genre,
          message: message.trim(),
          wagerXp,
        }),
      });
      setSent(true);
    } catch {
      setError('Challenge failed — try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif" }}>
        <div style={{ textAlign: 'center', maxWidth: 400, padding: '0 24px' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>⚔️</div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: ACCENT, margin: '0 0 8px' }}>Challenge Sent!</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>
            Your direct challenge to <strong style={{ color: '#fff' }}>{targetName}</strong> has been sent. They have 24 hours to accept.
          </p>
          <div style={{ background: `${ACCENT}10`, border: `1px solid ${ACCENT}33`, borderRadius: 10, padding: '12px 16px', marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontSize: 10, color: ACCENT, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 8 }}>CHALLENGE DETAILS</div>
            {[
              { label: 'Format', val: chosenFormat.label },
              { label: 'Genre', val: genre },
              { label: 'XP Wager', val: `${wagerXp} XP` },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>{r.label}</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{r.val}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/battles" style={{ padding: '10px 20px', borderRadius: 8, background: ACCENT, color: '#050510', fontSize: 11, fontWeight: 900, textDecoration: 'none', letterSpacing: '0.08em' }}>VIEW BATTLES</Link>
            <Link href="/home/1" style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: 900, textDecoration: 'none' }}>HOME</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: 80 }}>
      <nav style={{ background: 'rgba(0,0,0,0.8)', borderBottom: `1px solid ${ACCENT}22`, padding: '12px 24px', display: 'flex', gap: 16, alignItems: 'center', backdropFilter: 'blur(12px)' }}>
        <Link href="/home/1" style={{ fontSize: 11, fontWeight: 900, color: ACCENT, textDecoration: 'none', letterSpacing: '0.12em' }}>TMI</Link>
        <Link href="/battles" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>Battles</Link>
        <span style={{ fontSize: 11, color: ACCENT, fontWeight: 700 }}>Direct Challenge</span>
      </nav>

      <div style={{ maxWidth: 620, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28, padding: '22px', background: `${ACCENT}0C`, border: `1px solid ${ACCENT}28`, borderRadius: 16 }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: ACCENT, letterSpacing: '0.2em', marginBottom: 6 }}>⚔️ DIRECT CHALLENGE</div>
          <h1 style={{ margin: '0 0 4px', fontSize: 'clamp(18px,3.5vw,26px)', fontWeight: 900 }}>Challenge {targetName}</h1>
          <p style={{ margin: 0, fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Gold+ members can issue direct challenges. The opponent has 24h to accept. Battle streams live on the billboard wall.
          </p>
        </div>

        <form onSubmit={handleChallenge} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Format */}
          <div>
            <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', marginBottom: 10 }}>BATTLE FORMAT</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {FORMATS.map(f => (
                <button key={f.id} type="button" onClick={() => setFormat(f.id)} style={{
                  padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left',
                  background: format === f.id ? `${ACCENT}14` : 'rgba(255,255,255,0.03)',
                  outline: format === f.id ? `1.5px solid ${ACCENT}55` : '1px solid rgba(255,255,255,0.07)',
                  color: '#fff',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{f.emoji}</div>
                  <div style={{ fontSize: 11, fontWeight: 800, marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{f.desc}</div>
                  <div style={{ fontSize: 9, color: ACCENT, fontWeight: 700 }}>+{f.xp} XP win bonus</div>
                </button>
              ))}
            </div>
          </div>

          {/* Genre */}
          <div>
            <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', marginBottom: 10 }}>GENRE</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {GENRES.map(g => (
                <button key={g} type="button" onClick={() => setGenre(g)} style={{
                  padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                  background: genre === g ? ACCENT : 'rgba(255,255,255,0.05)',
                  color: genre === g ? '#050510' : 'rgba(255,255,255,0.6)',
                  outline: genre === g ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>{g}</button>
              ))}
            </div>
          </div>

          {/* XP Wager */}
          <div>
            <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', marginBottom: 10 }}>
              XP WAGER — <span style={{ color: ACCENT }}>{wagerXp} XP</span>
            </label>
            <input
              type="range" min={25} max={500} step={25} value={wagerXp}
              onChange={e => setWagerXp(Number(e.target.value))}
              style={{ width: '100%', accentColor: ACCENT }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>
              <span>25 XP (casual)</span><span>500 XP (high stakes)</span>
            </div>
          </div>

          {/* Trash talk message */}
          <div>
            <label style={{ display: 'block', fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', marginBottom: 10 }}>CHALLENGE MESSAGE (optional)</label>
            <textarea
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={`Say something to ${targetName}...`}
              maxLength={200}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', marginTop: 4, textAlign: 'right' }}>{message.length}/200</div>
          </div>

          {/* Summary */}
          <div style={{ padding: '14px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            {[
              { label: 'Opponent', val: targetName },
              { label: 'Format', val: chosenFormat.label },
              { label: 'Genre', val: genre },
              { label: 'Wager', val: `${wagerXp} XP` },
            ].map(r => (
              <div key={r.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{r.val}</div>
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginTop: 2 }}>{r.label.toUpperCase()}</div>
              </div>
            ))}
          </div>

          {error && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.3)', color: '#FF4444', fontSize: 12 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%', padding: '15px', borderRadius: 12, fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', border: 'none',
              background: submitting ? 'rgba(255,255,255,0.06)' : `linear-gradient(135deg, ${ACCENT}, #00FFAA)`,
              color: submitting ? 'rgba(255,255,255,0.3)' : '#050510',
              cursor: submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting ? '⚔️ SENDING...' : `⚔️ CHALLENGE ${targetName.split(' ')[0]?.toUpperCase()}`}
          </button>

          <Link href="/battles" style={{ display: 'block', textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontWeight: 700 }}>← Back to Battles</Link>
        </form>
      </div>
    </main>
  );
}
