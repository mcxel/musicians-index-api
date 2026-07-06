'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { NotificationEngine } from '@/lib/notifications/NotificationEngine';

const RADIO_TYPES = new Set(['track', 'beat', 'video', 'comedy', 'dance']);

interface LastSubmission {
  id: string;
  title: string;
  type: string;
  submitterId: string;
  createdAt: number;
}

type SubmissionStatus = 'pending' | 'approved' | 'rejected' | 'live' | 'expired' | 'unknown';

interface SessionInfo {
  status: 'waiting' | 'live' | 'ended';
  artistsJoined: number;
  launchThreshold: number;
}

function statusLine(status: SubmissionStatus, session: SessionInfo | null): string {
  if (status === 'rejected' || status === 'expired') return 'Not approved — revise and resubmit';
  if (status === 'live') return 'In Rotation';
  if (session?.status === 'live') return 'Session Live';
  if (session?.status === 'waiting') return 'Waiting for Session';
  if (status === 'approved') return 'Ready — waiting for session';
  return 'In Review';
}

export default function RadioJourneyCard() {
  const router = useRouter();
  const [sub, setSub] = useState<LastSubmission | null>(null);
  const [status, setStatus] = useState<SubmissionStatus>('unknown');
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [joined, setJoined] = useState(false);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('tmi_last_submission');
      if (!raw) return;
      const parsed = JSON.parse(raw) as LastSubmission;
      if (parsed?.id && RADIO_TYPES.has(parsed.type)) setSub(parsed);
    } catch { /* no card without real submission data */ }
  }, []);

  useEffect(() => {
    if (!sub) return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/submissions?id=${encodeURIComponent(sub!.id)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { submission?: { status: SubmissionStatus } };
        if (!cancelled && data.submission) setStatus(data.submission.status);
      } catch { /* keep last known state */ }
    }
    poll();
    const t = setInterval(poll, 15_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [sub]);

  const pollSession = useCallback(async () => {
    if (!sub) return;
    try {
      const res = await fetch(`/api/radio/session?submitterId=${encodeURIComponent(sub.submitterId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { session: SessionInfo | null; joined: boolean };
      setSession(data.session);
      setJoined(data.joined);
    } catch { /* keep last known state */ }
  }, [sub]);

  useEffect(() => {
    if (!sub) return;
    pollSession();
    const t = setInterval(pollSession, 10_000);
    return () => clearInterval(t);
  }, [sub, pollSession]);

  async function handleJoinLobby() {
    if (!sub) return;
    setJoining(true);
    try {
      const res = await fetch('/api/radio/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submitterId: sub.submitterId, submissionId: sub.id, title: sub.title }),
      });
      if (res.ok) {
        const data = (await res.json()) as { session: SessionInfo | null };
        if (data.session) {
          NotificationEngine.radioWaitingRoom(data.session.artistsJoined, data.session.launchThreshold);
        }
      }
    } catch { /* lobby page shows real state */ }
    setJoining(false);
    router.push('/radio');
  }

  async function handleInvite() {
    if (!sub) return;
    const link = `https://themusiciansindex.com/submit/ref?id=${sub.id}`;
    const text = `I just submitted "${sub.title}" on The Musician's Index. Submit yours and join the next Stream & Win session.`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      try { await navigator.share({ title: `${sub.title} — TMI`, text, url: link }); return; } catch { /* fall through to copy */ }
    }
    try { await navigator.clipboard.writeText(link); } catch { /* no-op */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }

  if (!sub) return null;

  const waiting = session?.status === 'waiting' ? session : null;
  const remaining = waiting ? Math.max(0, waiting.launchThreshold - waiting.artistsJoined) : 0;

  return (
    <div style={{ border: '1.5px solid #00FFFF44', background: 'linear-gradient(135deg, rgba(0,255,255,.06), rgba(5,5,16,.4))', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', color: '#00FFFF', textTransform: 'uppercase' }}>
          🎵 STREAM &amp; WIN RADIO
        </div>
        {session?.status === 'live' && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 9, fontWeight: 900, color: '#FF3355', letterSpacing: '0.12em' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF3355' }} />
            SESSION LIVE
          </span>
        )}
      </div>

      <div style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', marginBottom: 4 }}>
        &ldquo;{sub.title}&rdquo;
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 12 }}>
        Status: <span style={{ color: '#FFD700' }}>{statusLine(status, session)}</span>
      </div>

      {waiting && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
            <span style={{ fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 26, color: '#FFD700', lineHeight: 1 }}>
              {waiting.artistsJoined} <span style={{ fontSize: 16, color: 'rgba(255,255,255,.4)' }}>/ {waiting.launchThreshold}</span>
            </span>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase' }}>
              Artists Joined
            </span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,.08)', borderRadius: 3, marginBottom: 6 }}>
            <div style={{ height: '100%', width: `${Math.min(100, (waiting.artistsJoined / waiting.launchThreshold) * 100)}%`, background: '#FFD700', borderRadius: 3, transition: 'width 0.4s ease' }} />
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>
            Estimated start: waiting for {remaining} more artist{remaining === 1 ? '' : 's'}
          </div>
        </div>
      )}

      {!waiting && session?.status === 'live' && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginBottom: 14, lineHeight: 1.5 }}>
          A listening session is live with {session.artistsJoined} artist{session.artistsJoined === 1 ? '' : 's'}.
          {joined ? ' Your playlist is in rotation — jump in.' : ' Join the lobby to participate.'}
        </div>
      )}

      {!waiting && session === null && (
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 14, lineHeight: 1.5 }}>
          No session lobby open yet. Join the Radio Lobby to start the next one.
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={handleJoinLobby}
          disabled={joining}
          style={{ flex: 1, minWidth: 130, background: '#00FFFF', color: '#050510', border: 'none', padding: '11px 0', fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 16, letterSpacing: '0.06em', cursor: joining ? 'wait' : 'pointer', opacity: joining ? 0.7 : 1, borderRadius: 6 }}
        >
          {joining ? 'JOINING…' : joined ? '▶ OPEN RADIO LOBBY' : '▶ JOIN LOBBY'}
        </button>
        <button
          onClick={handleInvite}
          style={{ flex: 1, minWidth: 130, background: 'transparent', color: '#FF2DAA', border: '1.5px solid #FF2DAA66', padding: '11px 0', fontFamily: '"Bebas Neue","Impact",sans-serif', fontSize: 16, letterSpacing: '0.06em', cursor: 'pointer', borderRadius: 6 }}
        >
          {copied ? '✅ LINK COPIED' : '👥 INVITE FRIENDS'}
        </button>
      </div>
    </div>
  );
}
