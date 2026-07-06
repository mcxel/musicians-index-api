'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import StreamAndWinRadioPlayer from '@/components/radio/StreamAndWinRadioPlayer';
import { NotificationEngine } from '@/lib/notifications/NotificationEngine';

interface SessionState {
  session: {
    id: string;
    status: 'waiting' | 'live' | 'ended';
    artistsJoined: number;
    launchThreshold: number;
    participants: Array<{ submitterId: string; title: string }>;
    createdAt: number;
    launchedAt: number | null;
  } | null;
  joined: boolean;
}

interface QueueTrack {
  id: string;
  title: string;
  genre: string;
  submitterId: string;
}

const ACCENT = '#00FFFF';

export default function RadioPage() {
  const [session, setSession] = useState<SessionState | null>(null);
  const [sessionError, setSessionError] = useState(false);
  const [queue, setQueue] = useState<QueueTrack[] | null>(null);
  const [queueError, setQueueError] = useState(false);
  const prevStatusRef = useRef<string | null>(null);

  const userId =
    typeof window !== 'undefined'
      ? sessionStorage.getItem('tmi_user_id') ?? ''
      : '';

  const pollSession = useCallback(async () => {
    try {
      const res = await fetch(`/api/radio/session?submitterId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('bad response');
      const data = (await res.json()) as SessionState;
      setSession(data);
      setSessionError(false);
      const status = data.session?.status ?? 'none';
      if (prevStatusRef.current === 'waiting' && status === 'live' && data.joined) {
        NotificationEngine.radioSessionLive('Your playlist');
      }
      prevStatusRef.current = status;
    } catch {
      setSessionError(true);
    }
  }, [userId]);

  useEffect(() => {
    pollSession();
    const id = setInterval(pollSession, 10_000);
    return () => clearInterval(id);
  }, [pollSession]);

  useEffect(() => {
    fetch('/api/submissions?type=track&status=live&public=1&limit=50')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { submissions?: QueueTrack[] }) => setQueue(data.submissions ?? []))
      .catch(() => setQueueError(true));
  }, []);

  const s = session?.session ?? null;

  return (
    <main style={{ minHeight: '100vh', background: '#050510', color: '#fff', fontFamily: "'Inter', sans-serif", paddingBottom: 120 }}>

      {/* Header */}
      <div style={{
        background: `linear-gradient(135deg, ${ACCENT}18, #0a0510)`,
        borderBottom: `2px solid ${ACCENT}44`,
        padding: '20px 24px',
      }}>
        <div style={{ fontSize: 9, fontWeight: 800, color: ACCENT, letterSpacing: '0.25em', marginBottom: 4 }}>TMI RADIO NETWORK</div>
        <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 'clamp(26px,5vw,42px)', letterSpacing: '0.03em', lineHeight: 1 }}>
          STREAM &amp; WIN RADIO
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', marginTop: 6, maxWidth: 560, lineHeight: 1.5 }}>
          Real member-submitted music only. Listen, vote, chat, and share to earn Rotation Credits —
          listening to your own music never counts.
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Session waiting room — real registry counts only */}
        <div style={{ border: `1.5px solid ${ACCENT}33`, background: `${ACCENT}06`, borderRadius: 12, padding: '18px 20px' }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', color: ACCENT, textTransform: 'uppercase', marginBottom: 12 }}>
            🎧 LISTENING SESSION
          </div>

          {sessionError && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>
              Unable to load session status. <button onClick={pollSession} style={{ background: 'none', border: 'none', color: ACCENT, cursor: 'pointer', fontSize: 12, textDecoration: 'underline', padding: 0 }}>Retry</button>
            </div>
          )}

          {!sessionError && session === null && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)' }}>Loading session status…</div>
          )}

          {!sessionError && session !== null && s === null && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 6 }}>No session waiting yet</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.55 }}>
                The next Stream &amp; Win session opens when artists submit and join.
                Submit a track to start the next waiting room.
              </div>
            </div>
          )}

          {!sessionError && s !== null && s.status === 'waiting' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                <div style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 34, color: '#FFD700', lineHeight: 1 }}>
                  {s.artistsJoined} <span style={{ fontSize: 20, color: 'rgba(255,255,255,.4)' }}>of {s.launchThreshold}</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase' }}>
                  Artists Joined
                </div>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,.08)', borderRadius: 3, marginBottom: 12 }}>
                <div style={{ height: '100%', width: `${Math.min(100, (s.artistsJoined / s.launchThreshold) * 100)}%`, background: '#FFD700', borderRadius: 3, transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.55 }}>
                {session?.joined
                  ? 'You\u2019re in the waiting room. The session launches the moment the room fills — you\u2019ll be notified.'
                  : 'Submit a track to join this waiting room. The session launches when the room fills.'}
              </div>
              {s.participants.length > 0 && (
                <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {s.participants.map((p, i) => (
                    <span key={i} style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 20, padding: '3px 10px' }}>
                      🎵 {p.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {!sessionError && s !== null && s.status === 'live' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF3355', display: 'inline-block' }} />
                <span style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 22, color: '#FF3355', letterSpacing: '0.05em' }}>SESSION LIVE</span>
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', lineHeight: 1.55 }}>
                {s.artistsJoined} artist{s.artistsJoined === 1 ? '' : 's'} in this session.
                {session?.joined ? ' Your playlist is available in rotation.' : ' Join by submitting a track — participation is always open.'}
              </div>
            </div>
          )}
        </div>

        {/* Player — real live submissions only */}
        <StreamAndWinRadioPlayer />

        {/* Rotation queue — real or honestly empty */}
        <div style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,.3)', letterSpacing: '0.2em', marginBottom: 12 }}>IN ROTATION</div>
          {queueError && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Unable to load rotation. Refresh to retry.</div>
          )}
          {!queueError && queue === null && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Loading rotation…</div>
          )}
          {!queueError && queue !== null && queue.length === 0 && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', lineHeight: 1.6 }}>
              Waiting for approved songs. Submit music to enter this station.
            </div>
          )}
          {!queueError && queue !== null && queue.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', width: 16, textAlign: 'center' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)' }}>{t.genre || 'General'}</div>
              </div>
            </div>
          ))}
        </div>

        {/* How Rotation Credits work */}
        <div style={{ background: 'rgba(255,215,0,.04)', border: '1px solid rgba(255,215,0,.15)', borderRadius: 12, padding: '16px 18px' }}>
          <div style={{ fontSize: 8, fontWeight: 800, color: '#FFD700', letterSpacing: '0.2em', marginBottom: 12 }}>🌟 HOW ROTATION CREDITS WORK</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {[
              'Listen to other artists\u2019 music in any radio room',
              'Vote, chat, and react during sessions',
              'Share songs and invite new artists',
              'Listening to your own music never earns credits',
            ].map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 11, color: 'rgba(255,255,255,.6)', lineHeight: 1.5 }}>
                <span style={{ color: '#FFD700' }}>{i === 3 ? '✕' : '✓'}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/submit" style={{ flex: 1, minWidth: 200, textAlign: 'center', background: ACCENT, color: '#050510', padding: '15px 0', fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 20, letterSpacing: '0.06em', textDecoration: 'none' }}>
            🎤 SUBMIT YOUR MUSIC
          </Link>
          <Link href="/submit" style={{ flex: 1, minWidth: 200, textAlign: 'center', background: 'transparent', color: '#FF2DAA', border: '1.5px solid #FF2DAA66', padding: '15px 0', fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 20, letterSpacing: '0.06em', textDecoration: 'none' }}>
            📣 INVITE ANOTHER ARTIST
          </Link>
        </div>

        {/* Nav links */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { href: '/battles',  label: '⚔️ Battles',   color: '#FF2DAA' },
            { href: '/cypher',   label: '🎤 Cypher',    color: '#00FFFF' },
            { href: '/playlist', label: '🎵 Playlists', color: '#AA2DFF' },
            { href: '/magazine', label: '📰 Magazine',  color: '#FFD700' },
          ].map(l => (
            <Link key={l.href} href={l.href} style={{ fontSize: 9, fontWeight: 800, color: l.color, border: `1px solid ${l.color}44`, borderRadius: 6, padding: '5px 12px', textDecoration: 'none', letterSpacing: '0.08em' }}>
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
