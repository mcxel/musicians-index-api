'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageShell from '@/components/layout/PageShell';
import HUDFrame from '@/components/hud/HUDFrame';
import FooterHUD from '@/components/hud/FooterHUD';
import StageCurtain, { type StageState } from '@/components/stage/StageCurtain';
import ArenaEventShell from "@/components/live/ArenaEventShell";
import { MondayNightStageEngine } from '@/lib/shows/MondayNightStageEngine';
import type { MondayNightStageState } from '@/lib/shows/MondayNightStageEngine';
import { MondayNightStagePanel } from '@/components/shows/MondayNightStagePanel';

const SHOW_TITLE  = "MARCEL'S MONDAY NIGHT STAGE";
const ROOM_ID     = 'monday-stage';
// If a called performer doesn't confirm they're here within this window,
// auto-skip to the next person in queue so the show never stalls on a
// no-show. Marcel's original ask was "a couple seconds" - 20s is the floor
// for a real person to notice a stage call and click a button; tune down
// if that's still too generous once this is tested live.
const JOIN_TIMEOUT_SEC = 20;

interface StageSubmission {
  id: string;
  title: string;
  genre: string | null;
  createdAt: string;
  user: { name: string | null; displayName: string | null };
}

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  DONE:     { color: '#444',   label: 'DONE'    },
  LIVE:     { color: '#FF2DAA', label: '● LIVE' },
  NEXT:     { color: '#FFD700', label: 'NEXT'   },
  UPCOMING: { color: '#555',   label: 'SOON'   },
};

const CHAT_STUBS = [
  { user: 'jaylen_fan99', msg: 'JAYLEN IS GOING CRAZY TONIGHT 🔥' },
  { user: 'r_n_b_queen',  msg: 'Amirah set was perfect 😭💕' },
  { user: 'marcels_boy',  msg: 'Monday Night never misses!' },
  { user: 'traxx_stan',   msg: 'Can\'t wait for Traxx at 11 🎹' },
  { user: 'nova_tribe',   msg: 'Nova is about to eat 🙌' },
];

type ChatMsg = { user: string; msg: string };

export default function MondayStagePage() {
  const router = useRouter();
  const [stageState, setStageState]   = useState<StageState>('CURTAIN_CLOSED');
  const [chatMsgs, setChatMsgs]       = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput]     = useState('');
  const [viewers, setViewers]         = useState(0);
  const [tipping, setTipping]         = useState(false);

  // Real, cross-user submissions — replaces the old hardcoded lineup.
  // Empty is a real, honest state (Rule 20): a Monday with no submissions
  // yet just says so, it doesn't fake a lineup.
  const [submissions, setSubmissions] = useState<StageSubmission[] | null>(null);
  const [submissionWindow, setSubmissionWindow] = useState<{ showtime: string; opensAt: string; isOpen: boolean } | null>(null);
  const [subTitle, setSubTitle] = useState('');
  const [subGenre, setSubGenre] = useState('');
  const [subRights, setSubRights] = useState(false);
  const [subSubmitting, setSubSubmitting] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);

  const loadSubmissions = useCallback(async () => {
    try {
      const r = await fetch('/api/events/submissions?category=MONDAY_NIGHT_STAGE');
      if (r.ok) {
        const data = await r.json();
        setSubmissions(data.submissions as StageSubmission[]);
        if (data.submissionWindow) setSubmissionWindow(data.submissionWindow);
      } else {
        setSubmissions([]);
      }
    } catch {
      setSubmissions([]);
    }
  }, []);

  useEffect(() => { loadSubmissions(); }, [loadSubmissions]);

  const submitEntry = useCallback(async () => {
    setSubError(null);
    if (!subTitle.trim()) { setSubError('Enter a title for your set.'); return; }
    if (!subRights) { setSubError('You must attest you have rights to perform this.'); return; }
    setSubSubmitting(true);
    try {
      const r = await fetch('/api/events/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ category: 'MONDAY_NIGHT_STAGE', title: subTitle.trim(), genre: subGenre.trim() || undefined, rightsAttested: true }),
      });
      if (r.ok) {
        setSubTitle(''); setSubGenre('');
        await loadSubmissions();
      } else {
        const data = await r.json().catch(() => ({}));
        setSubError(data.error ?? 'Failed to submit entry.');
      }
    } catch {
      setSubError('Network error while submitting.');
    } finally {
      setSubSubmitting(false);
    }
  }, [subTitle, subGenre, subRights, loadSubmissions]);

  // Queue-call state machine: host calls the next submitted performer, they
  // have JOIN_TIMEOUT_SEC to confirm they're here, or the show auto-advances
  // to the next person so it never stalls waiting on one no-show.
  const [queueIndex, setQueueIndex] = useState(0);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'confirmed'>('idle');
  const [callDeadline, setCallDeadline] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  const rawLineup = submissions ?? [];
  const lineup = useMemo(
    () => rawLineup.map((s, i) => ({
      id: s.id,
      artist: s.user.displayName || s.user.name || 'Performer',
      genre: s.genre || 'Unspecified',
      status:
        i < queueIndex ? 'DONE' :
        i === queueIndex && callState === 'confirmed' ? 'LIVE' :
        i === queueIndex ? 'NEXT' :
        'UPCOMING',
    })),
    [rawLineup, queueIndex, callState],
  );
  const currentArtist = lineup.find((l) => l.status === 'LIVE');
  const calledArtist = callState === 'calling' ? lineup[queueIndex] : undefined;
  const secondsLeft = callDeadline ? Math.max(0, Math.ceil((callDeadline - nowTick) / 1000)) : 0;

  const callNext = useCallback(() => {
    if (queueIndex >= rawLineup.length) return; // queue exhausted - honest, not faked
    setCallState('calling');
    setCallDeadline(Date.now() + JOIN_TIMEOUT_SEC * 1000);
  }, [queueIndex, rawLineup.length]);

  const confirmJoin = useCallback(() => {
    setCallState('confirmed');
    setCallDeadline(null);
  }, []);

  // Countdown tick + auto-advance on no-show
  useEffect(() => {
    if (callState !== 'calling' || !callDeadline) return;
    const id = setInterval(() => {
      const now = Date.now();
      setNowTick(now);
      if (now >= callDeadline) {
        // No-show: skip this slot and immediately call the next one so the
        // show keeps moving without waiting for the host to click again.
        setQueueIndex((q) => q + 1);
        setCallState('idle');
        setCallDeadline(null);
      }
    }, 250);
    return () => clearInterval(id);
  }, [callState, callDeadline]);

  // Bebo hook/cane game-show layer — real crowd boo/yay mechanic, ported in
  // from the /shows/monday-night-stage prototype (now a redirect to here).
  const stageEngine = useMemo(() => {
    const e = new MondayNightStageEngine();
    lineup.forEach((act) => e.show.addContestant(act.id, act.artist));
    return e;
  }, [lineup]);
  const [gameState, setGameState] = useState<MondayNightStageState>(() => stageEngine.getFullState());
  const [gameStarted, setGameStarted] = useState(false);
  const refreshGame = useCallback(() => setGameState(stageEngine.getFullState()), [stageEngine]);
  // Re-sync when real submissions load and rebuild the engine's contestant list.
  useEffect(() => { setGameState(stageEngine.getFullState()); }, [stageEngine]);
  const handlePresentContestant = useCallback((id: string) => { stageEngine.presentContestant(id); refreshGame(); }, [stageEngine, refreshGame]);

  // Auto-chain: once a no-show skip resets the call state to idle mid-show,
  // immediately call whoever's next so the show never sits waiting.
  useEffect(() => {
    if (gameStarted && callState === 'idle' && queueIndex > 0 && queueIndex < rawLineup.length) {
      callNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queueIndex, gameStarted]);

  // A confirmed join hands the performer to the existing Bebo/crowd-vote engine.
  useEffect(() => {
    if (callState !== 'confirmed') return;
    const confirmedArtist = lineup[queueIndex];
    if (confirmedArtist) handlePresentContestant(confirmedArtist.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callState]);

  // After a performance concludes (Bebo hooks them off, or the host wraps
  // them up), advance the queue and call the next performer.
  const advanceQueueAfterPerformance = useCallback(() => {
    setQueueIndex((q) => q + 1);
    setCallState('idle');
  }, []);
  const handleProcessVote = useCallback(() => { stageEngine.processCrowdVote(); refreshGame(); }, [stageEngine, refreshGame]);
  const handleCrowdVote = useCallback((type: 'yay' | 'boo') => { stageEngine.show.recordCrowdVote(type); refreshGame(); }, [stageEngine, refreshGame]);
  const handleHook = useCallback((id: string) => {
    const s = stageEngine.show.getState();
    const total = s.crowdYayCount + s.crowdBooCount;
    stageEngine.bebo.hookPerformer(id, total > 0 ? s.crowdBooCount / total : 0.9);
    stageEngine.show.eliminateContestant(id);
    refreshGame();
  }, [stageEngine, refreshGame]);
  const handleReturn = useCallback((id: string) => {
    const s = stageEngine.show.getState();
    const total = s.crowdYayCount + s.crowdBooCount;
    stageEngine.bebo.returnPerformer(id, total > 0 ? s.crowdYayCount / total : 0.8);
    refreshGame();
  }, [stageEngine, refreshGame]);

  // Poll stage status
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch(`/api/stage/status?roomId=${ROOM_ID}`);
        if (r.ok) {
          const data = await r.json();
          setStageState(data.state as StageState);
        }
      } catch {}
    };
    poll();
    const id = setInterval(poll, 8000);
    return () => clearInterval(id);
  }, []);


  const openCurtain = useCallback(async () => {
    setStageState('CURTAIN_OPENING');
    await fetch('/api/stage/start', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ roomId: ROOM_ID, showTitle: SHOW_TITLE, artistName: currentArtist?.artist }),
    });
    stageEngine.startShow();
    setGameStarted(true);
    refreshGame();
    setTimeout(() => { setStageState('LIVE'); callNext(); }, 2000);
  }, [currentArtist, stageEngine, refreshGame, callNext]);

  const closeCurtain = useCallback(async () => {
    setStageState('CURTAIN_CLOSING');
    await fetch('/api/stage/end', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ roomId: ROOM_ID }),
    });
    setTimeout(() => setStageState('ENDED'), 2000);
  }, []);

  const sendTip = (amt: number) => {
    setTipping(false);
    router.push(`/api/stripe/checkout?priceId=price_tip_${amt * 100}&mode=payment&type=tip&roomId=${ROOM_ID}`);
  };

  const sendChat = () => {
    const msg = chatInput.trim();
    if (!msg) return;
    setChatMsgs((m) => [...m.slice(-19), { user: 'You', msg }]);
    setChatInput('');
  };

  return (
    <PageShell>
      <HUDFrame>
        <div style={{ minHeight: '100vh', background: '#050510', color: '#fff', padding: '0 0 80px' }}>

          {/* ── HEADER ── */}
          <div style={{ padding: '32px 32px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 4, color: '#AA2DFF', fontWeight: 800, marginBottom: 6 }}>
                LIVE ROOM
              </div>
              <h1 style={{ fontSize: 'clamp(18px, 3vw, 28px)', fontWeight: 900, letterSpacing: 3, color: '#fff', margin: 0 }}>
                {SHOW_TITLE}
              </h1>
              <div style={{ fontSize: 11, color: '#555', marginTop: 4, letterSpacing: 1 }}>
                Hosted by Marcel · Every Monday 8PM EST
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                style={{ fontSize: 9, fontWeight: 900, letterSpacing: 3, color: stageState === 'LIVE' ? '#FF2DAA' : '#555',
                  background: stageState === 'LIVE' ? '#FF2DAA18' : '#111',
                  border: `1px solid ${stageState === 'LIVE' ? '#FF2DAA44' : '#222'}`,
                  padding: '6px 14px', borderRadius: 20 }}
              >
                {stageState === 'LIVE' ? '● LIVE' : stageState === 'CURTAIN_CLOSED' ? 'AWAITING SHOW' : stageState.replace('_', ' ')}
              </motion.div>
              <div style={{ fontSize: 11, color: '#888' }}>
                👁 {viewers.toLocaleString()} watching
              </div>
            </div>
          </div>

          {/* ── MAIN GRID ── */}
          <ArenaEventShell roomId="monday-stage" eventType="monday-stage" mode="audience" />
          <div style={{ padding: '24px 32px 0', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24 }}>

            {/* LEFT — Stage + Controls */}
            <div>
              {/* Stage Curtain */}
              <StageCurtain
                state={stageState}
                showTitle={SHOW_TITLE}
                artistName={currentArtist?.artist}
              />

              {/* Host Controls (demo — in prod gated by role) */}
              <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={openCurtain}
                  disabled={stageState === 'LIVE' || stageState === 'CURTAIN_OPENING'}
                  style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid #AA2DFF44', background: '#AA2DFF22', color: '#AA2DFF', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', opacity: stageState === 'LIVE' ? 0.4 : 1 }}
                >
                  OPEN CURTAIN
                </button>
                <button
                  onClick={closeCurtain}
                  disabled={stageState !== 'LIVE'}
                  style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid #FF2DAA44', background: '#FF2DAA22', color: '#FF2DAA', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer', opacity: stageState !== 'LIVE' ? 0.4 : 1 }}
                >
                  CLOSE CURTAIN
                </button>
              </div>

              {/* Reaction + Tip row */}
              <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {['🔥', '🎤', '👑', '💜', '🎶'].map((emoji) => (
                  <motion.button key={emoji} whileTap={{ scale: 1.3 }}
                    style={{ fontSize: 22, background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
                  >
                    {emoji}
                  </motion.button>
                ))}
                <div style={{ flex: 1 }} />
                <button onClick={() => setTipping((t) => !t)}
                  style={{ padding: '7px 18px', borderRadius: 20, border: '1px solid #FFD70044', background: '#FFD70018', color: '#FFD700', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: 'pointer' }}>
                  TIP 💰
                </button>
              </div>

              {/* Tip modal */}
              <AnimatePresence>
                {tipping && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ marginTop: 12, background: '#0d0019', border: '1px solid #FFD70033', borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ fontSize: 11, color: '#FFD700', fontWeight: 700, marginRight: 4 }}>Send tip:</div>
                    {[1, 5, 10, 25].map((amt) => (
                      <button key={amt} onClick={() => sendTip(amt)}
                        style={{ padding: '6px 16px', borderRadius: 12, border: '1px solid #FFD70044', background: '#FFD70018', color: '#FFD700', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                        ${amt}
                      </button>
                    ))}
                    <span style={{ fontSize: 10, color: '#555', marginLeft: 8 }}>You&apos;ll be taken to checkout</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Queue call — performer has JOIN_TIMEOUT_SEC to confirm
                  they're here or the show auto-advances to the next entry. */}
              {gameStarted && callState === 'calling' && calledArtist && (
                <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 10, background: '#FFD70010', border: '1px solid #FFD70044', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 9, letterSpacing: 2, color: '#FFD700', fontWeight: 800, marginBottom: 4 }}>YOU'RE UP — CONFIRM YOU'RE HERE</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{calledArtist.artist}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 900, color: secondsLeft <= 5 ? '#FF4444' : '#FFD700' }}>{secondsLeft}s</div>
                    <button onClick={confirmJoin} style={{ padding: '10px 22px', borderRadius: 20, border: '1px solid #00FF88', background: '#00FF8822', color: '#00FF88', fontSize: 11, fontWeight: 900, letterSpacing: 2, cursor: 'pointer' }}>
                      JOIN NOW
                    </button>
                  </div>
                </div>
              )}
              {gameStarted && callState === 'idle' && queueIndex >= rawLineup.length && rawLineup.length > 0 && (
                <div style={{ marginTop: 24, padding: '16px 18px', borderRadius: 10, background: '#0a0a14', border: '1px solid #1a1a2e', fontSize: 12, color: '#888' }}>
                  Everyone in tonight's queue has performed. Waiting for more submissions.
                </div>
              )}

              {/* Bebo hook/cane game panel — crowd boos hook a performer off,
                  crowd yays bring them back. Live once the curtain opens. */}
              {gameStarted && callState === 'confirmed' && (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 9, letterSpacing: 4, color: '#FFD700', fontWeight: 800, marginBottom: 16 }}>
                    CROWD CONTROL — BOO = HOOK, YAY = RECOVER
                  </div>
                  <MondayNightStagePanel
                    stageState={gameState}
                    onPresentContestant={handlePresentContestant}
                    onProcessVote={handleProcessVote}
                    onCrowdVote={handleCrowdVote}
                    onHook={handleHook}
                    onReturn={handleReturn}
                  />
                  <button onClick={advanceQueueAfterPerformance}
                    style={{ marginTop: 10, padding: '8px 20px', borderRadius: 20, border: '1px solid #AA2DFF44', background: '#AA2DFF18', color: '#AA2DFF', fontSize: 10, fontWeight: 800, letterSpacing: 2, cursor: 'pointer' }}>
                    NEXT PERFORMER →
                  </button>
                </div>
              )}

              {/* Tonight's Lineup — real submissions only, honest empty state */}
              <div style={{ marginTop: 32 }}>
                <div style={{ fontSize: 9, letterSpacing: 4, color: '#AA2DFF', fontWeight: 800, marginBottom: 16 }}>TONIGHT'S LINEUP</div>

                {submissions === null ? (
                  <div style={{ fontSize: 12, color: '#555' }}>Loading lineup…</div>
                ) : lineup.length === 0 ? (
                  <div style={{ padding: '16px 18px', borderRadius: 10, background: '#0a0a14', border: '1px solid #1a1a2e', fontSize: 12, color: '#888' }}>
                    No performers have submitted for this Monday yet. Be the first — submit your entry below.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {lineup.map((act) => {
                      const s = STATUS_STYLES[act.status];
                      return (
                        <motion.div key={act.id}
                          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderRadius: 10, background: act.status === 'LIVE' ? '#FF2DAA0A' : '#0a0a14', border: `1px solid ${act.status === 'LIVE' ? '#FF2DAA33' : '#1a1a2e'}` }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: act.status === 'LIVE' ? '#fff' : '#888' }}>{act.artist}</div>
                            <div style={{ fontSize: 10, color: '#444' }}>{act.genre}</div>
                          </div>
                          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: s.color }}>{s.label}</div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Submit an entry */}
                <div style={{ marginTop: 16, padding: '16px 18px', borderRadius: 10, background: '#0a0a14', border: '1px solid #1a1a2e' }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: '#00FFFF', fontWeight: 800, marginBottom: 10 }}>SUBMIT YOUR ENTRY</div>
                  {submissionWindow && !submissionWindow.isOpen && (
                    <div style={{ fontSize: 11, color: '#FFD700', marginBottom: 10 }}>
                      Submissions open 2 hours before showtime — next window opens {new Date(submissionWindow.opensAt).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' })}.
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} placeholder="Set / performance title" style={{ flex: '1 1 200px', padding: '8px 12px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none' }} />
                    <input value={subGenre} onChange={(e) => setSubGenre(e.target.value)} placeholder="Genre (optional)" style={{ flex: '1 1 140px', padding: '8px 12px', background: '#111', border: '1px solid #222', borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none' }} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#888', marginBottom: 10 }}>
                    <input type="checkbox" checked={subRights} onChange={(e) => setSubRights(e.target.checked)} />
                    I attest I have the rights to perform this content.
                  </label>
                  {subError && <div style={{ fontSize: 11, color: '#FF4444', marginBottom: 8 }}>{subError}</div>}
                  <button onClick={submitEntry} disabled={subSubmitting || (submissionWindow ? !submissionWindow.isOpen : false)}
                    style={{ padding: '8px 20px', borderRadius: 20, border: '1px solid #00FFFF44', background: '#00FFFF18', color: '#00FFFF', fontSize: 10, fontWeight: 700, letterSpacing: 2, cursor: subSubmitting ? 'not-allowed' : 'pointer', opacity: subSubmitting || (submissionWindow && !submissionWindow.isOpen) ? 0.4 : 1 }}>
                    {subSubmitting ? 'SUBMITTING…' : 'SUBMIT'}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT — Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', height: 'fit-content', position: 'sticky', top: 24 }}>
              <div style={{ background: '#0a0a14', border: '1px solid #1a1a2e', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #1a1a2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 9, letterSpacing: 3, color: '#00FFFF', fontWeight: 800 }}>LIVE CHAT</div>
                  <div style={{ fontSize: 9, color: '#555' }}>{viewers.toLocaleString()} viewers</div>
                </div>
                <div style={{ height: 340, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {chatMsgs.map((m, i) => (
                    <div key={i} style={{ fontSize: 12 }}>
                      <span style={{ color: '#AA2DFF', fontWeight: 700, marginRight: 6 }}>{m.user}</span>
                      <span style={{ color: 'rgba(255,255,255,0.7)' }}>{m.msg}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', borderTop: '1px solid #1a1a2e', display: 'flex', gap: 8 }}>
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChat()}
                    placeholder="Say something…"
                    style={{ flex: 1, background: '#111', border: '1px solid #222', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 12, outline: 'none' }}
                  />
                  <button onClick={sendChat} style={{ padding: '8px 14px', borderRadius: 8, background: '#AA2DFF22', border: '1px solid #AA2DFF44', color: '#AA2DFF', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    SEND
                  </button>
                </div>
              </div>

              {/* Back to rooms */}
              <Link href="/rooms" style={{ display: 'block', marginTop: 12, textAlign: 'center', fontSize: 10, color: '#555', textDecoration: 'none', letterSpacing: 2 }}>
                ← ALL LIVE ROOMS
              </Link>
            </div>
          </div>
        </div>
      </HUDFrame>
      <FooterHUD />
    </PageShell>
  );
}
