'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  openVoting,
  castVote,
  getTally,
  closeVoting,
  type BattleVoteTally,
  type VoteOption,
} from '@/lib/competition/BattleVoteClosureEngine';

export interface PerformanceVotePanelProps {
  battleId: string;
  artistALabel: string;
  artistBLabel: string;
  accentA?: string;
  accentB?: string;
  judgeMode?: boolean;
  onWinnerDeclared?: (winner: VoteOption, tally: BattleVoteTally) => void;
  autoOpenVoting?: boolean;
}

const DEMO_USER = 'viewer-' + Math.random().toString(36).slice(2, 8);

const EMOTES = ['🔥', '⚡', '👑', '💯', '🎤', '💥'];

interface EmoteParticle {
  id: string;
  emoji: string;
  x: number;
  side: 'a' | 'b';
}

export default function PerformanceVotePanel({
  battleId,
  artistALabel,
  artistBLabel,
  accentA = '#00FFFF',
  accentB = '#FF2DAA',
  judgeMode = false,
  onWinnerDeclared,
  autoOpenVoting = true,
}: PerformanceVotePanelProps) {
  const [tally, setTally] = useState<BattleVoteTally | null>(null);
  const [myVote, setMyVote] = useState<VoteOption | null>(null);
  const [emotes, setEmotes] = useState<EmoteParticle[]>([]);
  const [declared, setDeclared] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (autoOpenVoting) {
      const existing = getTally(battleId);
      const t = existing ?? openVoting(battleId);
      setTally(t);
    }
    pollRef.current = setInterval(() => {
      const t = getTally(battleId);
      if (t) setTally({ ...t });
    }, 1200);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [battleId, autoOpenVoting]);

  const vote = (side: VoteOption) => {
    if (myVote || tally?.isClosed) return;
    const result = castVote(battleId, DEMO_USER, side);
    if (result.ok && result.tally) {
      setMyVote(side);
      setTally({ ...result.tally });
      spawnEmotes(side === 'artist-a' ? 'a' : 'b');
    }
  };

  const declare = () => {
    if (!tally || declared) return;
    const closed = closeVoting(battleId);
    if (closed) {
      setTally({ ...closed });
      setDeclared(true);
      if (closed.winner) onWinnerDeclared?.(closed.winner, closed);
    }
  };

  const spawnEmotes = (side: 'a' | 'b') => {
    const burst: EmoteParticle[] = Array.from({ length: 5 }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      emoji: EMOTES[Math.floor(Math.random() * EMOTES.length)]!,
      x: 15 + Math.random() * 70,
      side,
    }));
    setEmotes(prev => [...prev, ...burst]);
    setTimeout(() => setEmotes(prev => prev.filter(e => !burst.find(b => b.id === e.id))), 1800);
  };

  const aPercent = tally?.artistAPercent ?? 50;
  const bPercent = tally?.artistBPercent ?? 50;
  const totalVotes = tally?.totalVotes ?? 0;
  const isClosed = tally?.isClosed ?? false;
  const winner = tally?.winner;

  return (
    <div style={{ position: 'relative', userSelect: 'none' }}>
      {/* Emote burst layer */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 10 }}>
        <AnimatePresence>
          {emotes.map(e => (
            <motion.div
              key={e.id}
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -80, scale: 1.6 }}
              exit={{}}
              transition={{ duration: 1.6, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${e.x}%`,
                fontSize: 22,
              }}
            >
              {e.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main panel */}
      <div style={{
        border: `1px solid rgba(255,255,255,0.08)`,
        borderRadius: 14,
        background: 'rgba(5,5,16,0.95)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <motion.span
              animate={{ opacity: isClosed ? 1 : [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: isClosed ? 0 : Infinity }}
              style={{
                width: 7, height: 7, borderRadius: '50%',
                background: isClosed ? '#FFD700' : '#FF3C3C',
                display: 'inline-block',
                boxShadow: isClosed ? 'none' : '0 0 7px #FF3C3C',
              }}
            />
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.5)' }}>
              {isClosed ? (declared ? 'WINNER DECLARED' : 'VOTING CLOSED') : 'LIVE VOTE'}
            </span>
          </div>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em' }}>
            {totalVotes} {totalVotes === 1 ? 'VOTE' : 'VOTES'}
          </span>
        </div>

        {/* VS row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '14px 16px 10px', gap: 10 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: accentA, letterSpacing: '0.12em', marginBottom: 3 }}>
              {artistALabel.toUpperCase()}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: accentA }}>{aPercent}%</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>VS</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: accentB, letterSpacing: '0.12em', marginBottom: 3 }}>
              {artistBLabel.toUpperCase()}
            </div>
            <div style={{ fontSize: 26, fontWeight: 900, color: accentB }}>{bPercent}%</div>
          </div>
        </div>

        {/* Vote bar */}
        <div style={{ margin: '0 16px 14px', borderRadius: 6, overflow: 'hidden', height: 10, background: 'rgba(255,255,255,0.06)', display: 'flex' }}>
          <motion.div
            animate={{ width: `${aPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: accentA, boxShadow: `0 0 8px ${accentA}80` }}
          />
          <motion.div
            animate={{ width: `${bPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: accentB, boxShadow: `0 0 8px ${accentB}80` }}
          />
        </div>

        {/* Winner banner */}
        <AnimatePresence>
          {declared && winner && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                margin: '0 16px 14px',
                borderRadius: 10,
                padding: '10px 14px',
                background: winner === 'artist-a'
                  ? `linear-gradient(135deg, ${accentA}20, rgba(5,5,16,0.95))`
                  : `linear-gradient(135deg, ${accentB}20, rgba(5,5,16,0.95))`,
                border: `1px solid ${winner === 'artist-a' ? accentA : accentB}50`,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>👑</span>
              <div>
                <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>WINNER</div>
                <div style={{ fontSize: 15, fontWeight: 900, color: winner === 'artist-a' ? accentA : accentB }}>
                  {winner === 'artist-a' ? artistALabel : artistBLabel}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: winner === 'artist-a' ? accentA : accentB }}>
                  {winner === 'artist-a' ? aPercent : bPercent}%
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{totalVotes} votes</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vote buttons */}
        {!isClosed && !declared && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '0 16px 14px' }}>
            {(['artist-a', 'artist-b'] as VoteOption[]).map((side) => {
              const isA = side === 'artist-a';
              const accent = isA ? accentA : accentB;
              const label = isA ? artistALabel : artistBLabel;
              const voted = myVote === side;
              return (
                <motion.button
                  key={side}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => vote(side)}
                  disabled={!!myVote}
                  style={{
                    padding: '11px 8px',
                    borderRadius: 9,
                    border: `1.5px solid ${voted ? accent : `${accent}44`}`,
                    background: voted ? `${accent}22` : 'rgba(255,255,255,0.03)',
                    color: voted ? accent : 'rgba(255,255,255,0.6)',
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    cursor: myVote ? 'default' : 'pointer',
                    boxShadow: voted ? `0 0 12px ${accent}40` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  {voted ? `✓ VOTED · ${label.toUpperCase()}` : `VOTE ${label.toUpperCase()}`}
                </motion.button>
              );
            })}
          </div>
        )}

        {/* Emote strip */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {EMOTES.map((emoji) => (
            <button
              key={emoji}
              onClick={() => spawnEmotes(myVote === 'artist-b' ? 'b' : 'a')}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8,
                padding: '5px 10px',
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* Judge controls */}
        {judgeMode && !declared && (
          <div style={{ padding: '0 16px 16px' }}>
            <div style={{ fontSize: 8, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)', fontWeight: 800, marginBottom: 8 }}>JUDGE CONTROLS</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={declare}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 8,
                  border: '1px solid rgba(255,215,0,0.4)',
                  background: 'rgba(255,215,0,0.1)',
                  color: '#FFD700',
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                }}
              >
                👑 DECLARE WINNER
              </button>
              <button
                onClick={() => {
                  spawnEmotes('a');
                  setTimeout(() => spawnEmotes('b'), 300);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(170,45,255,0.35)',
                  background: 'rgba(170,45,255,0.08)',
                  color: '#AA2DFF',
                  fontSize: 10,
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                🎆 BURST
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
