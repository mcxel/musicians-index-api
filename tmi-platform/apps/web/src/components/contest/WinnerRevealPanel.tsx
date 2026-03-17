/**
 * WinnerRevealPanel.tsx
 * Repo: apps/web/src/components/contest/WinnerRevealPanel.tsx
 * Action: CREATE
 * Wave: A3
 * Dependencies: WinnerLineupStrip, WinnerReactionBurst, WinnerCameraDirector
 *
 * Supports small games (1–5 winners) and big contests (5–10 winners).
 * Sequence: group lineup → group reaction hold → featured winner hero zoom.
 * August 8 contest season rule applies to any season-linked reveal.
 */
'use client';
import { useState, useEffect, useRef } from 'react';
import { Trophy, Volume2, VolumeX, X, Star, ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RevealMode = 'small_game' | 'big_contest' | 'single';

export interface RevealWinner {
  rank: number;
  artistId: string;
  artistName: string;
  artistAvatar?: string;
  category?: string;
  prize?: string;
  cashValue?: number;
  sponsors?: string[];
  reactionEmoji?: string;
}

export interface WinnerRevealConfig {
  revealMode: RevealMode;
  minWinnersToShow: number;   // 1 for single, 1–5 for small, 5–10 for big
  maxWinnersToShow: number;
  featuredWinnerRank: number; // usually 1
  groupHoldSeconds: number;   // 2–4 recommended
  allowVoiceChatter: boolean;
  hostControlled: boolean;    // if true, host must trigger each phase
  cameraPresetPool?: string[];
  fallbackSingleWinner?: boolean;
  seasonName?: string;
}

export type RevealPhase = 'idle' | 'lineup' | 'group_reaction' | 'hero_zoom' | 'complete';

interface WinnerRevealPanelProps {
  winners: RevealWinner[];
  config?: Partial<WinnerRevealConfig>;
  onComplete?: (winners: RevealWinner[]) => void;
  onClose?: () => void;
  muted?: boolean;
  onMuteToggle?: () => void;
}

const DEFAULT_CONFIG: WinnerRevealConfig = {
  revealMode: 'single',
  minWinnersToShow: 1,
  maxWinnersToShow: 1,
  featuredWinnerRank: 1,
  groupHoldSeconds: 3,
  allowVoiceChatter: false,
  hostControlled: false,
  fallbackSingleWinner: true,
};

const PHASE_LABELS: Record<RevealPhase, string> = {
  idle: 'Ready',
  lineup: 'Revealing…',
  group_reaction: '🎉 Celebrating!',
  hero_zoom: '🏆 Champion!',
  complete: '✓ Done',
};

function getConfig(winners: RevealWinner[], partial: Partial<WinnerRevealConfig>): WinnerRevealConfig {
  const count = winners.length;
  let revealMode: RevealMode = 'single';
  if (count > 5) revealMode = 'big_contest';
  else if (count > 1) revealMode = 'small_game';

  return {
    ...DEFAULT_CONFIG,
    revealMode,
    minWinnersToShow: 1,
    maxWinnersToShow: Math.min(count, revealMode === 'big_contest' ? 10 : 5),
    ...partial,
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function WinnerRevealPanel({
  winners,
  config: configProp,
  onComplete,
  onClose,
  muted = false,
  onMuteToggle,
}: WinnerRevealPanelProps) {
  const config = getConfig(winners, configProp ?? {});
  const [phase, setPhase] = useState<RevealPhase>('idle');
  const [visibleCount, setVisibleCount] = useState(0);
  const [featuredIndex, setFeaturedIndex] = useState(-1);
  const [holdTimer, setHoldTimer] = useState(config.groupHoldSeconds);
  const holdRef = useRef<NodeJS.Timeout | null>(null);

  const displayedWinners = winners.slice(0, config.maxWinnersToShow);
  const featuredWinner = winners.find(w => w.rank === config.featuredWinnerRank) ?? winners[0];

  // Start reveal sequence
  const startReveal = () => {
    if (config.hostControlled) return; // host triggers each phase via HostCuePanel
    setPhase('lineup');
  };

  // Auto-progress through phases
  useEffect(() => {
    if (phase === 'lineup') {
      // Stagger winner appearances
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleCount(count);
        if (count >= displayedWinners.length) {
          clearInterval(interval);
          setTimeout(() => setPhase('group_reaction'), 600);
        }
      }, 350);
      return () => clearInterval(interval);
    }

    if (phase === 'group_reaction') {
      // Hold group for groupHoldSeconds then zoom to hero
      setHoldTimer(config.groupHoldSeconds);
      const countdown = setInterval(() => {
        setHoldTimer(t => {
          if (t <= 1) {
            clearInterval(countdown);
            setTimeout(() => {
              setFeaturedIndex(displayedWinners.findIndex(w => w.rank === config.featuredWinnerRank));
              setPhase('hero_zoom');
            }, 500);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(countdown);
    }

    if (phase === 'hero_zoom') {
      setTimeout(() => {
        setPhase('complete');
        onComplete?.(displayedWinners);
      }, 3000);
    }
  }, [phase]);

  const rankColors: Record<number, string> = { 1: '#ffd700', 2: '#c0c0c0', 3: '#cd7f32' };
  const rankEmojis: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: phase === 'hero_zoom' || phase === 'complete' ? 'rgba(0,0,0,.95)' : 'rgba(0,0,0,.88)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, transition: 'background .8s',
    }}>
      {/* Controls */}
      <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 10 }}>
        <button onClick={onMuteToggle} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
        {onClose && (
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Phase indicator */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', fontSize: 12, fontWeight: 700, letterSpacing: '.12em', color: 'rgba(255,255,255,.4)', textTransform: 'uppercase' }}>
        {PHASE_LABELS[phase]}
      </div>

      {/* IDLE STATE */}
      {phase === 'idle' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🏆</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
            {config.revealMode === 'single' ? 'Winner Reveal' : `Top ${config.maxWinnersToShow} Reveal`}
          </h2>
          <p style={{ color: 'rgba(255,255,255,.4)', marginBottom: 32 }}>
            {config.seasonName && `${config.seasonName} · `}
            {config.revealMode === 'big_contest' ? 'Big Contest Mode' : config.revealMode === 'small_game' ? 'Small Game Mode' : 'Single Winner Mode'}
          </p>
          {!config.hostControlled && (
            <button onClick={startReveal} style={{ padding: '14px 40px', background: 'linear-gradient(135deg,#ff6b1a,#ff8c42)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 18, fontWeight: 800, cursor: 'pointer' }}>
              Start Reveal
            </button>
          )}
          {config.hostControlled && (
            <p style={{ color: 'rgba(255,255,255,.3)', fontSize: 13 }}>Waiting for host to begin…</p>
          )}
        </div>
      )}

      {/* LINEUP STATE — staggered winner cards appear */}
      {(phase === 'lineup' || phase === 'group_reaction') && (
        <div style={{ textAlign: 'center', width: '100%', maxWidth: 900, padding: '0 24px' }}>
          {config.revealMode !== 'single' && (
            <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.12em', color: '#ff6b1a', marginBottom: 24, textTransform: 'uppercase' }}>
              Top {config.maxWinnersToShow} — {config.revealMode === 'big_contest' ? 'Grand Contest' : 'Game Winners'}
            </p>
          )}

          {/* Group reaction hold countdown */}
          {phase === 'group_reaction' && holdTimer > 0 && (
            <div style={{ position: 'absolute', top: 60, right: 20, fontSize: 36, fontWeight: 900, color: '#ffd700', opacity: .6 }}>
              {holdTimer}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: displayedWinners.length <= 3 ? `repeat(${displayedWinners.length}, 1fr)` : 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 16, justifyContent: 'center',
          }}>
            {displayedWinners.map((winner, i) => {
              const visible = i < visibleCount || phase === 'group_reaction';
              const color = rankColors[winner.rank] || 'rgba(255,255,255,.6)';
              return (
                <div key={winner.artistId} style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(.9)',
                  transition: 'all .4s ease',
                  background: 'rgba(255,255,255,.05)', border: `1px solid ${color}44`,
                  borderRadius: 14, padding: '20px 16px', textAlign: 'center',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{rankEmojis[winner.rank] || `#${winner.rank}`}</div>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', border: `3px solid ${color}`, margin: '0 auto 10px', overflow: 'hidden', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color }}>
                    {winner.artistAvatar ? <img src={winner.artistAvatar} alt={winner.artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : winner.artistName[0]}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{winner.artistName}</div>
                  {winner.category && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>{winner.category}</div>}
                  {phase === 'group_reaction' && winner.reactionEmoji && (
                    <div style={{ fontSize: 24, marginTop: 8, animation: 'none' }}>{winner.reactionEmoji}</div>
                  )}
                  {/* Voice chatter indicator */}
                  {phase === 'group_reaction' && config.allowVoiceChatter && !muted && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 6 }}>
                      {[0, 1, 2].map(j => (
                        <div key={j} style={{ width: 3, height: 12, background: color, borderRadius: 2, opacity: .6, animation: `none`, animationDelay: `${j * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HERO ZOOM STATE — featured winner full focus */}
      {(phase === 'hero_zoom' || phase === 'complete') && featuredWinner && (
        <div style={{ textAlign: 'center', animation: 'none' }}>
          <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.15em', color: '#ffd700', margin: '0 0 16px', textTransform: 'uppercase' }}>
            {config.seasonName ? `${config.seasonName} Champion` : 'Grand Winner'}
          </p>
          <div style={{
            width: 140, height: 140, borderRadius: '50%',
            border: '5px solid #ffd700', margin: '0 auto 24px',
            overflow: 'hidden', background: 'rgba(255,215,0,.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 56, fontWeight: 700, color: '#ffd700',
            boxShadow: '0 0 60px rgba(255,215,0,.5), 0 0 120px rgba(255,215,0,.2)',
          }}>
            {featuredWinner.artistAvatar ? (
              <img src={featuredWinner.artistAvatar} alt={featuredWinner.artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              featuredWinner.artistName[0]
            )}
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            {featuredWinner.artistName}
          </h1>
          {featuredWinner.category && (
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,.5)', margin: '0 0 16px' }}>{featuredWinner.category}</p>
          )}
          {featuredWinner.prize && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'rgba(255,215,0,.1)', border: '1px solid rgba(255,215,0,.3)', borderRadius: 24, color: '#ffd700', fontSize: 16, fontWeight: 700 }}>
              <Trophy size={18} /> {featuredWinner.prize}
              {featuredWinner.cashValue && ` · $${featuredWinner.cashValue.toLocaleString()}`}
            </div>
          )}
          {featuredWinner.sponsors?.length ? (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', marginTop: 16 }}>
              Sponsored by {featuredWinner.sponsors.slice(0, 3).join(' · ')}
            </p>
          ) : null}

          {/* Visible ranking strip for other top winners */}
          {displayedWinners.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 28 }}>
              {displayedWinners.filter(w => w.rank !== config.featuredWinnerRank).slice(0, 4).map(w => (
                <div key={w.artistId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: .65 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', border: `2px solid ${rankColors[w.rank] || 'rgba(255,255,255,.3)'}`, overflow: 'hidden', background: 'rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>
                    {w.artistAvatar ? <img src={w.artistAvatar} alt={w.artistName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : w.artistName[0]}
                  </div>
                  <span style={{ fontSize: 9, color: rankColors[w.rank] || 'rgba(255,255,255,.4)', fontWeight: 700 }}>#{w.rank}</span>
                </div>
              ))}
            </div>
          )}

          {phase === 'complete' && onClose && (
            <button onClick={onClose} style={{ marginTop: 32, padding: '10px 24px', background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, color: 'rgba(255,255,255,.6)', fontSize: 14, cursor: 'pointer' }}>
              Close
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default WinnerRevealPanel;
